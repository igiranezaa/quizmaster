import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const QuizContext = createContext(null);

const HISTORY_KEY = "quizmaster_history_v1";

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function QuizProvider({ children }) {
  const [settings, setSettings] = useState({
    category: "",
    difficulty: "medium",
    amount: 10,
  });

  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // selectedAnswer: { value: string, isCorrect: boolean } | null
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answersLog, setAnswersLog] = useState([]); // each: { q, correct, selected, isCorrect }

  const [score, setScore] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState(loadHistory);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const value = useMemo(
    () => ({
      settings,
      setSettings,
      categories,
      setCategories,
      questions,
      setQuestions,
      currentIndex,
      setCurrentIndex,
      selectedAnswer,
      setSelectedAnswer,
      answersLog,
      setAnswersLog,
      score,
      setScore,
      loading,
      setLoading,
      error,
      setError,
      history,
      setHistory,
    }),
    [
      settings,
      categories,
      questions,
      currentIndex,
      selectedAnswer,
      answersLog,
      score,
      loading,
      error,
      history,
    ]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used inside QuizProvider");
  return ctx;
}
