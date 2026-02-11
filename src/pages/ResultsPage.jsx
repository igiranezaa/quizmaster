import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuiz } from "../state/quizContext";

export default function ResultsPage() {
  const navigate = useNavigate();

  const {
    settings,
    categories,
    questions,
    score,
    setCurrentIndex,
    setSelectedAnswer,
    setAnswersLog,
    setScore,
    answersLog,
    history,
    setHistory,
  } = useQuiz();

  const total = questions.length;

  const topicName = useMemo(() => {
    if (!settings.category) return "Any";
    const c = categories.find((x) => String(x.id) === String(settings.category));
    return c?.name ?? "Selected Topic";
  }, [categories, settings.category]);

  function restartSameSettings() {
    // go back to quiz start
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswersLog([]);
    setScore(0);
    navigate("/"); // easiest (forces refetch when start pressed)
  }

  function saveToHistory() {
    const now = new Date();
    const date = now.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

    const entry = {
      date,
      topic: topicName,
      difficulty: settings.difficulty,
      score,
      total,
    };

    setHistory([entry, ...history]);
  }

  // Save once per results visit (simple guard: only save if not already saved by exact match)
  const alreadySaved = history.some(
    (h) =>
      h.topic === topicName &&
      h.difficulty === settings.difficulty &&
      h.score === score &&
      h.total === total
  );
  if (total > 0 && !alreadySaved) {
    // eslint-disable-next-line no-undef
    queueMicrotask(saveToHistory);
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Your Results</h1>
        <p className="mt-2 text-slate-600">
          Topic: <span className="font-medium text-slate-900">{topicName}</span>{" "}
          • Difficulty:{" "}
          <span className="font-medium text-slate-900 capitalize">
            {settings.difficulty}
          </span>
        </p>

        <div className="mt-5 rounded-2xl bg-slate-900 p-6 text-white">
          <div className="text-sm opacity-80">Final Score</div>
          <div className="mt-1 text-4xl font-extrabold">
            {score} / {total}
          </div>
          <div className="mt-2 text-sm opacity-80">
            Correct: {score} • Wrong: {total - score}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-slate-50 text-center"
          >
            New Quiz
          </Link>
          <button
            type="button"
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            onClick={restartSameSettings}
          >
            Restart (same settings)
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Review</h2>
        <p className="mt-1 text-sm text-slate-600">
          Your answers with the correct ones.
        </p>

        {!answersLog.length ? (
          <p className="mt-4 text-sm text-slate-600">
            No review data available.
          </p>
        ) : (
          <div className="mt-4 grid gap-4">
            {answersLog.map((a, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-semibold">{idx + 1}. {a.q}</div>
                <div className="mt-2 text-sm">
                  <div>
                    Your answer:{" "}
                    <span className={a.isCorrect ? "text-emerald-700 font-medium" : "text-red-700 font-medium"}>
                      {a.selected}
                    </span>
                  </div>
                  {!a.isCorrect && (
                    <div className="mt-1">
                      Correct answer:{" "}
                      <span className="font-medium text-slate-900">{a.correct}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
