import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { loginEmployeeThunk } from "@/redux/features/userSlice";
import { toast } from "sonner";
import logo from "@/assets/sarthia.png";
import companylogo from "@/assets/urbanlogo1.png";
import { ChangePasswordModal } from "@/components/Changepasswordmodal";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [pwModalOpen, setPwModalOpen] = useState(false);

  const { loading, error, isAuthenticated, initialized } = useAppSelector(
    (state) => state.user,
  );

  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, initialized, navigate]);

  if (!initialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary" />
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-pulse" />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(loginEmployeeThunk({ username, password })).unwrap();
      toast.success("Welcome back! Login successful", { icon: "🎉" });
      navigate("/");
    } catch (err: any) {
      toast.error(err || "Login failed", { icon: "❌" });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-green-500/5 to-emerald-500/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-6xl relative z-10 mt-12">
        <div className="relative w-full h-[70vh] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl flex border border-white/20 dark:border-gray-800/50 overflow-visible">
          {/* LEFT SECTION */}
          <section className="w-1/2 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 text-white flex flex-col justify-between relative overflow-hidden p-8 rounded-l-3xl">
            {/* Geometric grid pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <pattern
                    id="grid"
                    patternUnits="userSpaceOnUse"
                    width="20"
                    height="20"
                  >
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="white"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>

            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob" />
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-green-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 flex flex-col h-full gap-4">
              {/* Logo Box */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                  <div
                    className="relative w-64 md:w-80 lg:w-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 bg-white transform group-hover:scale-105 transition-all duration-500 animate-float"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <img
                      src={logo}
                      alt="SHARTHI HRMS"
                      className="w-full h-full object-contain p-4 drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-center">
                  <div className="inline-flex flex-col items-center gap-1 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} />
                      <p className="text-white text-sm text-center font-medium">
                        HR Management System
                      </p>
                    </div>
                    <p className="text-white text-xs font-medium">
                      By Urban Cruise
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-5 justify-center">
                  {[
                    "Employee Management",
                    "Payroll",
                    "Attendance",
                    "Leave",
                    "Performance",
                    "HR Policy",
                  ].map((tag, index) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-center pt-6">
                  <p className="text-xs text-white font-light tracking-wide">
                    © 2026 SARTHI HRMS. All rights reserved.
                  </p>
                  <p className="text-xs text-white mt-0.5">
                    Powered by{" "}
                    <span className="font-semibold">Urban Cruise</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT SECTION */}
          <section className="w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-r-3xl relative overflow-visible">
            {/* Company Logo — floats above the card */}
            <div className="absolute -top-14 left-1/2 -translate-x-1/2  md:w-80 lg:w-96">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0px_0px_20px_8px_rgba(0,0,0,0.08)] p-3">
                <img
                  src={companylogo}
                  alt="Urban Cruise"
                  className=" h-48 lg:h-56 w-full object-contain drop-shadow-xl"
                />
              </div>
            </div>

            <div className="w-full max-w-md space-y-3 px-6 pt-24">
              {/* Header */}
              <div className="space-y-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                  Welcome to Saarthi
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                  <span>Sign in to your workspace</span>
                  <ArrowRight
                    size={14}
                    className="text-green-600 animate-bounce-x"
                  />
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur-xl transition-all group-hover:blur-2xl" />
                  <div className="relative flex items-center gap-3 rounded-xl px-4 py-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-red-200 dark:border-red-900/50 shadow-lg">
                    <AlertCircle
                      size={16}
                      className="text-red-500 flex-shrink-0"
                    />
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    Username
                  </label>
                  <div className="relative group">
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-500/20 rounded-xl blur-xl transition-all duration-500",
                        focusedField === "username"
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-50",
                      )}
                    />
                    <div className="relative flex items-center">
                      <User
                        size={16}
                        className={cn(
                          "absolute left-3 transition-all duration-300",
                          focusedField === "username"
                            ? "text-green-600"
                            : "text-gray-400",
                        )}
                      />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUserName(e.target.value)}
                        onFocus={() => setFocusedField("username")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter your username"
                        required
                        disabled={loading}
                        className="w-full pl-9 pr-4 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-500/20 rounded-xl blur-xl transition-all duration-500",
                        focusedField === "password"
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-50",
                      )}
                    />
                    <div className="relative flex items-center">
                      <Lock
                        size={16}
                        className={cn(
                          "absolute left-3 transition-all duration-300",
                          focusedField === "password"
                            ? "text-green-600"
                            : "text-gray-400",
                        )}
                      />
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="w-full pl-9 pr-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        disabled={loading}
                        className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex items-center justify-center">
                  <p className="text-xs text-green-600 font-medium">
                    Please contact HR to reset your password.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full group"
                >
                  <div className="relative h-10 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold text-sm overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex items-center justify-center gap-2 h-full">
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight
                            size={14}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </>
                      )}
                    </span>
                  </div>
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-blob { animation: blob 7s infinite; }
        .animate-bounce-x { animation: bounce-x 1.5s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </main>
  );
}
