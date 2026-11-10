import { Router } from "express";
import crypto from "node:crypto";
import os from "node:os";
import { monitorEventLoopDelay } from "node:perf_hooks";

const router = Router();

const CHECK_TIMEOUT_MS = Number(process.env.HEALTH_CHECK_TIMEOUT_MS) || 3000;
const CACHE_TTL_MS = Number(process.env.HEALTH_CACHE_TTL_MS) || 5000;

// name -> { fn, critical }
const checks = new Map();
let shuttingDown = false;
let cache = { at: 0, value: null, inflight: null };

const loopDelay = monitorEventLoopDelay({ resolution: 20 });
loopDelay.enable();

/** Register a dependency check. Call from server.js once pools exist. */
export const registerHealthCheck = (name, fn, { critical = true } = {}) => {
  checks.set(name, { fn, critical });
  cache = { at: 0, value: null, inflight: null }; // invalidate
};

/** Call on SIGTERM so the load balancer drains traffic before exit. */
export const setShuttingDown = () => {
  shuttingDown = true;
};

const withTimeout = (promise, ms, name) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`${name} timed out after ${ms}ms`)),
        ms,
      ).unref(),
    ),
  ]);

const runCheck = async (name, { fn, critical }) => {
  const start = process.hrtime.bigint();
  try {
    await withTimeout(Promise.resolve().then(fn), CHECK_TIMEOUT_MS, name);
    return {
      name,
      critical,
      status: "up",
      latencyMs: Number(process.hrtime.bigint() - start) / 1e6,
    };
  } catch (err) {
    return {
      name,
      critical,
      status: "down",
      latencyMs: Number(process.hrtime.bigint() - start) / 1e6,
      error: err.message,
    };
  }
};

// Cached + de-duplicated so probes/monitors can't hammer the DB
const getDependencyReport = async () => {
  const now = Date.now();
  if (cache.value && now - cache.at < CACHE_TTL_MS) return cache.value;
  if (cache.inflight) return cache.inflight;

  cache.inflight = (async () => {
    const results = await Promise.all(
      [...checks.entries()].map(([name, c]) => runCheck(name, c)),
    );
    const criticalDown = results.some((r) => r.critical && r.status === "down");
    const anyDown = results.some((r) => r.status === "down");
    const value = {
      status: criticalDown ? "unhealthy" : anyDown ? "degraded" : "healthy",
      results,
    };
    cache = { at: Date.now(), value, inflight: null };
    return value;
  })().finally(() => {
    cache.inflight = null;
  });

  return cache.inflight;
};

const hasValidToken = (req) => {
  const expected = process.env.HEALTH_TOKEN;
  if (!expected) return false;
  const given = req.get("x-health-token") || "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const noStore = (res) => {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
};

// Liveness: process is running. No dependencies.
router.get("/live", (req, res) => {
  noStore(res);
  res
    .status(200)
    .json({ status: "alive", uptimeSec: Math.round(process.uptime()) });
});

// Readiness: can we serve traffic?
router.get("/ready", async (req, res) => {
  noStore(res);
  if (shuttingDown) {
    return res.status(503).json({ status: "shutting_down" });
  }
  const report = await getDependencyReport();
  const code = report.status === "unhealthy" ? 503 : 200;
  res.status(code).json({ status: report.status });
});

// Detailed report
router.get("/", async (req, res) => {
  noStore(res);
  const report = await getDependencyReport();
  const status = shuttingDown ? "shutting_down" : report.status;
  const code = status === "unhealthy" || status === "shutting_down" ? 503 : 200;

  const base = {
    status,
    timestamp: new Date().toISOString(),
    uptimeSec: Math.round(process.uptime()),
  };

  if (!hasValidToken(req)) {
    // Public view: no internals, no error messages
    return res.status(code).json({
      ...base,
      checks: Object.fromEntries(report.results.map((r) => [r.name, r.status])),
    });
  }

  const mem = process.memoryUsage();
  const mb = (n) => Math.round((n / 1024 / 1024) * 10) / 10;
  res.status(code).json({
    ...base,
    version: process.env.npm_package_version || null,
    env: process.env.NODE_ENV || "development",
    node: process.version,
    pid: process.pid,
    checks: Object.fromEntries(
      report.results.map(({ name, ...rest }) => [name, rest]),
    ),
    system: {
      memoryMB: {
        rss: mb(mem.rss),
        heapUsed: mb(mem.heapUsed),
        heapTotal: mb(mem.heapTotal),
      },
      loadAvg: os.loadavg(),
      cpus: os.cpus().length,
      eventLoopLagMs: {
        mean: Math.round((loopDelay.mean / 1e6) * 100) / 100,
        p99: Math.round((loopDelay.percentile(99) / 1e6) * 100) / 100,
      },
    },
  });
});

export default router;