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
    answersLog,
    setAnswersLog,
  } = useQuiz();

  const [locked, setLocked] = useState(false);

  const current = questions[currentIndex];

  useEffect(() => {
    // If user refreshed /quiz without data
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

  function selectAnswer(a) {
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

  function next() {
    setSelectedAnswer(null);
    setLocked(false);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      navigate("/results");
      return;
    }
    setCurrentIndex(nextIndex);
  }

  if (!current) return null;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm text-slate-500">
            Question {currentIndex + 1} / {questions.length}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            Topic:{" "}
            <span className="text-slate-800 font-medium">
              {decodeHtml(current.category)}
            </span>{" "}
            • Difficulty:{" "}
            <span className="text-slate-800 font-medium capitalize">
              {settings.difficulty}
            </span>
          </div>
        </div>

        <div className="rounded-xl border bg-white px-4 py-3 text-sm">
          Score: <span className="font-semibold">{score}</span>
        </div>
      </div>

      <ErrorMessage message={""} />

      <QuestionCard
        question={current.question}
        answers={answers}
        selectedValue={selectedAnswer?.value ?? ""}
        onSelect={selectAnswer}
        locked={locked}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          {locked && selectedAnswer ? (
            selectedAnswer.isCorrect ? (
              <span className="font-medium text-emerald-700">Correct ✅</span>
            ) : (
              <span className="font-medium text-red-700">
                Wrong ❌ Correct answer:{" "}
                <span className="underline">
                  {decodeHtml(current.correct_answer)}
                </span>
              </span>
            )
          ) : (
            <span>Select an answer to continue.</span>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          onClick={next}
          disabled={!locked}
        >
          {currentIndex + 1 === questions.length ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
