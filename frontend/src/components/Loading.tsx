import { cn } from "@/lib/utils";
import {
  Sparkles,
  Coffee,
  Loader2,
  Briefcase,
  Clock,
  Users,
  Sun,
  Layers,
} from "lucide-react";

// ==============================================
// OPTION 1: MAIN LOADING COMPONENT (Full Screen)
// ==============================================
export function FullScreenLoader({
  message = "Loading your workspace...",
  variant = "default",
}) {
  const variants = {
    default: {
      outerBg: "bg-gradient-to-br from-primary/5 via-background to-primary/5",
      blobs: [],
      spinnerBorder: "border-primary/20 border-t-primary",
      iconColor: "text-primary",
      titleColor: "text-foreground",
      icon: <Briefcase className="h-7 w-7" />,
      dotColors: ["bg-primary", "bg-primary/70", "bg-primary/40"],
    },
    minimal: {
      outerBg: "bg-background",
      blobs: [],
      spinnerBorder: "border-muted-foreground/20 border-t-muted-foreground",
      iconColor: "text-muted-foreground",
      titleColor: "text-muted-foreground",
      icon: <Loader2 className="h-7 w-7 animate-spin" />,
      dotColors: [
        "bg-muted-foreground",
        "bg-muted-foreground/70",
        "bg-muted-foreground/40",
      ],
    },
    colorful: {
      outerBg:
        "bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 dark:from-green-950/30 dark:via-orange-950/30 dark:to-yellow-950/30",
      blobs: [
        {
          color: "bg-green-400/20",
          size: "w-56 h-56",
          pos: "-top-16 -left-16",
          delay: "0s",
        },
        {
          color: "bg-orange-400/15",
          size: "w-44 h-44",
          pos: "-bottom-10 -right-10",
          delay: "2.5s",
        },
        {
          color: "bg-yellow-400/15",
          size: "w-36 h-36",
          pos: "top-1/2 left-1/2",
          delay: "1.2s",
        },
      ],
      spinnerBorder: "border-green-500/20 border-t-green-600",
      iconColor: "text-green-600",
      titleColor: "text-green-700 dark:text-green-300",
      icon: <Layers className="h-7 w-7" />,
      dotColors: ["bg-green-500", "bg-orange-500", "bg-yellow-500"],
    },
    brand: {
      outerBg: "bg-gradient-to-br from-primary via-primary/90 to-purple-700",
      blobs: [
        {
          color: "bg-white/10",
          size: "w-56 h-56",
          pos: "-top-16 -left-16",
          delay: "0s",
        },
        {
          color: "bg-white/5",
          size: "w-44 h-44",
          pos: "-bottom-10 -right-10",
          delay: "1.5s",
        },
      ],
      spinnerBorder: "border-white/20 border-t-white",
      iconColor: "text-white",
      titleColor: "text-white",
      icon: <Coffee className="h-7 w-7" />,
      dotColors: ["bg-white", "bg-white/70", "bg-white/40"],
    },
    warm: {
      outerBg:
        "bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-red-950/30",
      blobs: [
        {
          color: "bg-amber-400/20",
          size: "w-56 h-56",
          pos: "-top-16 -left-16",
          delay: "0s",
        },
        {
          color: "bg-orange-400/15",
          size: "w-44 h-44",
          pos: "-bottom-10 -right-10",
          delay: "2s",
        },
      ],
      spinnerBorder: "border-orange-500/20 border-t-orange-500",
      iconColor: "text-orange-500",
      titleColor: "text-orange-700 dark:text-orange-300",
      icon: <Sparkles className="h-7 w-7" />,
      dotColors: ["bg-amber-500", "bg-orange-500", "bg-red-500"],
    },
  };

  const v = variants[variant] || variants.default;
  const dotDelays = ["0ms", "200ms", "400ms"];

  return (
    <div
      className={cn(
        "min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500",
        v.outerBg,
      )}
    >
      {/* Floating blobs */}
      {v.blobs?.map((blob, i) => (
        <div
          key={i}
          className={cn(
            "absolute rounded-full blur-3xl",
            blob.color,
            blob.size,
            blob.pos,
          )}
          style={{
            animation: "floatBlob 7s ease-in-out infinite",
            animationDelay: blob.delay,
          }}
        />
      ))}

      {/* Center content — no card box */}
      <div
        className="relative z-10 flex flex-col items-center gap-6"
        style={{ animation: "fadeUp 0.45s ease both" }}
      >
        {/* Spinner + icon */}
        <div className="relative w-[72px] h-[72px]">
          <div
            className={cn(
              "absolute inset-[-6px] rounded-full border-2",
              variant === "colorful"
                ? "border-green-400/40"
                : variant === "warm"
                  ? "border-orange-400/40"
                  : variant === "brand"
                    ? "border-white/30"
                    : "border-primary/30",
            )}
            style={{ animation: "pulseRing 1.8s ease-out infinite" }}
          />
          <div
            className={cn(
              "absolute inset-[-6px] rounded-full border-2",
              variant === "colorful"
                ? "border-green-400/40"
                : variant === "warm"
                  ? "border-orange-400/40"
                  : variant === "brand"
                    ? "border-white/30"
                    : "border-primary/30",
            )}
            style={{
              animation: "pulseRing 1.8s ease-out infinite",
              animationDelay: "0.9s",
            }}
          />
          <div
            className={cn(
              "w-full h-full rounded-full border-[3px] animate-spin",
              v.spinnerBorder,
            )}
          />
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              v.iconColor,
            )}
          >
            {v.icon}
          </div>
        </div>

        {/* Message only */}
        <p
          className={cn("text-[15px] font-medium tracking-tight", v.titleColor)}
        >
          {message}
        </p>

        {/* Dots */}
        <div className="flex gap-[6px]">
          {v.dotColors.map((color, i) => (
            <div
              key={i}
              className={cn("w-[7px] h-[7px] rounded-full", color)}
              style={{
                animation: "bounceDot 1.4s ease-in-out infinite",
                animationDelay: dotDelays[i],
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes floatBlob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(14px, -20px) scale(1.06); }
          66% { transform: translate(-10px, 12px) scale(0.94); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes bounceDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
// ==============================================
// OPTION 2: INLINE LOADER (For buttons, sections)
// ==============================================
export function InlineLoader({
  size = "md",
  color = "primary",
  className, // optional
}: {
  size?: string;
  color?: string;
  className?: string; // ✅ optional
}) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
    xl: "h-12 w-12 border-4",
  };

  const colors = {
    primary: "border-primary/30 border-t-primary",
    green: "border-green-500/30 border-t-green-500",
    orange: "border-orange-500/30 border-t-orange-500",
    yellow: "border-yellow-500/30 border-t-yellow-500",
    white: "border-white/30 border-t-white",
    muted: "border-muted-foreground/30 border-t-muted-foreground",
    destructive: "border-destructive/30 border-t-destructive",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "rounded-full animate-spin",
          sizes[size],
          colors[color] || colors.primary,
        )}
      />
    </div>
  );
}

// ==============================================
// OPTION 3: SKELETON LOADER (With warm colors)
// ==============================================
export function SkeletonLoader({
  type = "card", // "card", "list", "profile", "table"
  count = 1,
  theme = "default", // "default", "warm"
}) {
  const getBgColor = () => {
    return theme === "warm"
      ? "bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-green-500/20"
      : "bg-muted";
  };

  const skeletons = {
    card: (
      <div className="space-y-3">
        <div className={cn("h-48 rounded-lg animate-pulse", getBgColor())} />
        <div className="space-y-2">
          <div
            className={cn("h-4 rounded w-3/4 animate-pulse", getBgColor())}
          />
          <div
            className={cn("h-4 rounded w-1/2 animate-pulse", getBgColor())}
          />
        </div>
      </div>
    ),
    list: (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={cn(
                "h-10 w-10 rounded-full animate-pulse",
                getBgColor(),
              )}
            />
            <div className="flex-1 space-y-2">
              <div
                className={cn("h-4 rounded w-3/4 animate-pulse", getBgColor())}
              />
              <div
                className={cn("h-3 rounded w-1/2 animate-pulse", getBgColor())}
              />
            </div>
          </div>
        ))}
      </div>
    ),
    profile: (
      <div className="flex items-center gap-4">
        <div
          className={cn("h-16 w-16 rounded-full animate-pulse", getBgColor())}
        />
        <div className="space-y-2 flex-1">
          <div
            className={cn("h-5 rounded w-1/2 animate-pulse", getBgColor())}
          />
          <div
            className={cn("h-4 rounded w-1/3 animate-pulse", getBgColor())}
          />
          <div
            className={cn("h-4 rounded w-1/4 animate-pulse", getBgColor())}
          />
        </div>
      </div>
    ),
    table: (
      <div className="space-y-3">
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={cn("h-8 rounded flex-1 animate-pulse", getBgColor())}
            />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            {[...Array(4)].map((_, j) => (
              <div
                key={j}
                className={cn(
                  "h-6 rounded flex-1 animate-pulse",
                  getBgColor() + "/50",
                )}
              />
            ))}
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-fade-in">
          {skeletons[type] || skeletons.card}
        </div>
      ))}
    </div>
  );
}

// ==============================================
// OPTION 4: PROGRESS LOADER (With warm colors)
// ==============================================
export function ProgressLoader({
  progress = 0,
  message = "Loading...",
  showPercentage = true,
  variant = "default", // "default", "success", "warm"
}) {
  const getProgressColor = () => {
    switch (variant) {
      case "success":
        return "bg-green-500";
      case "warm":
        return "bg-gradient-to-r from-green-500 via-orange-500 to-yellow-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{message}</span>
        {showPercentage && (
          <span
            className={cn(
              "font-semibold",
              variant === "warm" ? "text-orange-500" : "text-primary",
            )}
          >
            {progress}%
          </span>
        )}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 relative",
            getProgressColor(),
          )}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

// Add these animations to your global CSS or tailwind.config.js
/*
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
.animate-shimmer {
  animation: shimmer 2s infinite;
}
*/
