// src/components/QuestionCard.jsx
import { decodeHtml } from "../lib/opentdb";

export default function QuestionCard({
  question,
  answers,
  selectedValue,
  onSelect,
  locked,
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        {decodeHtml(question)}
      </h2>

      <div className="mt-6 grid gap-3">
        {answers.map((a) => {
          const isSelected = selectedValue === a.value;

          let base =
            "w-full rounded-xl border px-4 py-3 text-left font-medium transition-all duration-200";

          let stateStyles =
            "border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800";

          if (locked) {
            // After selection / time up
            if (a.isCorrect) {
              stateStyles =
                "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
            } else if (isSelected && !a.isCorrect) {
              stateStyles =
                "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
            } else {
              stateStyles =
                "border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500";
            }
          } else if (isSelected) {
            stateStyles =
              "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900";
          }

          return (
            <button
              key={a.value}
              type="button"
              className={`${base} ${stateStyles}`}
              onClick={() => !locked && onSelect(a)}
              disabled={locked}
            >
              {decodeHtml(a.value)}
            </button>
          );
        })}
      </div>
    </div>
  );
}