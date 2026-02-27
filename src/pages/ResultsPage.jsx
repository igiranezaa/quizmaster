// src/pages/ResultsPage.jsx
import { useEffect, useMemo } from "react";
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
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  // Guard: if someone opens /results without having played
  useEffect(() => {
    if (!total) navigate("/", { replace: true });
  }, [total, navigate]);

  const topicName = useMemo(() => {
    if (!settings.category) return "Any";
    const c = categories.find((x) => String(x.id) === String(settings.category));
    return c?.name ?? "Selected Topic";
  }, [categories, settings.category]);

  // Save to history ONCE, safely (useEffect instead of queueMicrotask)
  useEffect(() => {
    if (total <= 0) return;

    const alreadySaved = history.some(
      (h) =>
        h.topic === topicName &&
        h.difficulty === settings.difficulty &&
        h.score === score &&
        h.total === total
    );

    if (alreadySaved) return;

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
      percent,
    };

    setHistory([entry, ...history]);
  }, [total, history, setHistory, topicName, settings.difficulty, score, percent]);

  function restartSameSettings() {
    // restart the current quiz (same questions already fetched)
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswersLog([]);
    setScore(0);
    navigate("/quiz");
  }

  function startNewQuiz() {
    // clean slate and go back to setup
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswersLog([]);
    setScore(0);
    navigate("/");
  }

  // Simple message based on performance (nice for demo video)
  const performanceLabel =
    percent >= 80 ? "Excellent 🎉" : percent >= 50 ? "Good job 👏" : "Keep practicing 💪";

  return (
    <div className="grid gap-6">
      {/* Summary */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Your Results
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Topic:{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {topicName}
          </span>{" "}
          • Difficulty:{" "}
          <span className="font-medium capitalize text-slate-900 dark:text-white">
            {settings.difficulty}
          </span>
        </p>

        <div className="mt-5 rounded-2xl bg-slate-900 p-6 text-white dark:bg-slate-950">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm opacity-80">Final Score</div>
              <div className="mt-1 text-4xl font-extrabold">
                {score} / {total}
              </div>
              <div className="mt-2 text-sm opacity-80">
                Correct: {score} • Wrong: {total - score}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm opacity-80">Percentage</div>
              <div className="mt-1 text-3xl font-bold">{percent}%</div>
              <div className="mt-2 text-sm opacity-80">{performanceLabel}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            onClick={restartSameSettings}
          >
            Play Again
          </button>

          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
            onClick={startNewQuiz}
          >
            New Quiz
          </button>

          <Link
            to="/"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-slate-50 text-center dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
          >
            Back to Setup
          </Link>
        </div>
      </div>

      {/* Review */}
      <div className="rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Review
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Your answers with the correct ones.
        </p>

        {!answersLog.length ? (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            No review data available.
          </p>
        ) : (
          <div className="mt-4 grid gap-4">
            {answersLog.map((a, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {idx + 1}. {a.q}
                </div>

                <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                  <div>
                    Your answer:{" "}
                    <span
                      className={
                        a.isCorrect
                          ? "font-medium text-emerald-600"
                          : "font-medium text-red-500"
                      }
                    >
                      {a.selected}
                    </span>
                  </div>

                  {!a.isCorrect && (
                    <div className="mt-1">
                      Correct answer:{" "}
                      <span className="font-medium text-slate-900 dark:text-white">
                        {a.correct}
                      </span>
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