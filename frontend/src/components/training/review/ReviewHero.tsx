import { BookOpen, CheckCircle2, MonitorPlay } from "lucide-react";

export default function ReviewHero({
  alreadySaved,
}: {
  alreadySaved: boolean;
}) {
  return (
    <div className="px-6 pt-6 text-center">
      {/* illustration */}
      <div className="relative mx-auto flex h-24 w-44 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-sky-100/80 blur-xl" />
        <BookOpen
          size={34}
          className="absolute bottom-2 left-3 text-orange-500"
        />
        <MonitorPlay size={68} className="relative text-blue-800" />
        <CheckCircle2
          size={38}
          className="absolute bottom-0 right-3 rounded-full bg-white text-green-600"
        />
      </div>

      <h3 className="mt-2 text-2xl font-extrabold text-blue-950">
        Training Completed Successfully!
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Aapka feedback hume training behtar banane me madad karta hai.
      </p>

      {alreadySaved && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-green-700 ring-1 ring-emerald-200">
          <CheckCircle2 size={18} />
          Your progress has been recorded.
        </div>
      )}
    </div>
  );
}
