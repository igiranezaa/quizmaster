import { decodeHtml } from "../lib/opentdb";

export default function QuestionCard({
  question,
  answers,
  selectedValue,
  onSelect,
  locked,
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border">
      <h2 className="text-lg font-semibold">
        {decodeHtml(question)}
      </h2>

      <div className="mt-5 grid gap-3">
        {answers.map((a) => {
          const isSelected = selectedValue === a.value;

          let cls =
            "w-full rounded-xl border px-4 py-3 text-left transition";
          if (!locked) {
            cls += " hover:bg-slate-50";
          }

          if (isSelected) {
            cls += " border-slate-900 bg-slate-900 text-white";
          } else {
            cls += " border-slate-200 bg-white text-slate-900";
          }

          return (
            <button
              key={a.value}
              type="button"
              className={cls}
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
