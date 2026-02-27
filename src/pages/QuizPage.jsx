// src/pages/QuizPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../state/quizContext";
import ErrorMessage from "../components/ErrorMessage";
import QuestionCard from "../components/QuestionCard";
import { decodeHtml, shuffle } from "../lib/opentdb";

export default function QuizPage() {
  const navigate = useNavigate();

  const {
    settings,
    questions,
    currentIndex,
    setCurrentIndex,
    selectedAnswer,
    setSelectedAnswer,
    score,
    setScore,
    setAnswersLog,
  } = useQuiz();

  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.timerSeconds || 20);

  const current = questions[currentIndex];

  // Redirect if user refreshes /quiz without data
  useEffect(() => {
    if (!questions.length) navigate("/", { replace: true });
  }, [questions.length, navigate]);

  const answers = useMemo(() => {
    if (!current) return [];
    const correct = { value: current.correct_answer, isCorrect: true };
    const incorrect = current.incorrect_answers.map((x) => ({
      value: x,
      isCorrect: false,
    }));
    return shuffle([correct, ...incorrect]);
  }, [current]);

  // Reset UI state when question changes
  useEffect(() => {
    setLocked(false);
    setSelectedAnswer(null);

    if (settings.timerEnabled) {
      setTimeLeft(settings.timerSeconds || 20);
    }
  }, [currentIndex, setSelectedAnswer, settings.timerEnabled, settings.timerSeconds]);

  // Timer countdown
  useEffect(() => {
    if (!settings.timerEnabled) return;
    if (!current) return;
    if (locked) return;

    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const t = setTimeout(() => setTimeLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, locked, settings.timerEnabled, current]);

  function selectAnswer(a) {
    if (locked) return;

    setSelectedAnswer(a);
    setLocked(true);

    const isCorrect = !!a.isCorrect;
    if (isCorrect) setScore((s) => s + 1);

    setAnswersLog((log) => [
      ...log,
      {
        q: decodeHtml(current.question),
        correct: decodeHtml(current.correct_answer),
        selected: decodeHtml(a.value),
        isCorrect,
      },
    ]);
  }

  function handleTimeUp() {
    // IMPORTANT FIX:
    // Clear selectedAnswer so the next question doesn't inherit a selection
    setSelectedAnswer(null);
    setLocked(true);

    setAnswersLog((log) => [
      ...log,
      {
        q: decodeHtml(current.question),
        correct: decodeHtml(current.correct_answer),
        selected: "No answer",
        isCorrect: false,
      },
    ]);
  }

  function next() {
    // Move forward cleanly
    const nextIndex = currentIndex + 1;

    // Reset local UI state
    setLocked(false);
    setSelectedAnswer(null);

    if (settings.timerEnabled) {
      setTimeLeft(settings.timerSeconds || 20);
    }

    if (nextIndex >= questions.length) {
      navigate("/results");
      return;
    }

    setCurrentIndex(nextIndex);
  }

  if (!current) return null;

  const isLast = currentIndex + 1 === questions.length;

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Question {currentIndex + 1} / {questions.length}
          </div>

          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Topic:{" "}
            <span className="font-medium text-slate-800 dark:text-white">
              {decodeHtml(current.category)}
            </span>{" "}
            • Difficulty:{" "}
            <span className="font-medium capitalize text-slate-800 dark:text-white">
              {settings.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {settings.timerEnabled && (
            <div className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold dark:border-slate-800 dark:bg-slate-900 dark:text-white">
              ⏳ {timeLeft}s
            </div>
          )}

          <div className="rounded-xl border bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            Score: <span className="font-semibold">{score}</span>
          </div>
        </div>
      </div>

      <ErrorMessage message={""} />

      {/* Question */}
      <QuestionCard
        question={current.question}
        answers={answers}
        selectedValue={selectedAnswer?.value ?? ""}
        onSelect={selectAnswer}
        locked={locked}
      />

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {locked && selectedAnswer ? (
            selectedAnswer.isCorrect ? (
              <span className="font-medium text-emerald-600">Correct ✅</span>
            ) : (
              <span className="font-medium text-red-600">
                Wrong ❌ Correct answer:{" "}
                <span className="underline">
                  {decodeHtml(current.correct_answer)}
                </span>
              </span>
            )
          ) : locked && !selectedAnswer ? (
            <span className="font-medium text-red-600">
              Time’s up! ⏰ Correct answer:{" "}
              <span className="underline">
                {decodeHtml(current.correct_answer)}
              </span>
            </span>
          ) : (
            <span>Select an answer to continue.</span>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          onClick={next}
          disabled={!locked}
        >
          {isLast ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}