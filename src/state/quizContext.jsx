// src/state/quizContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const QuizContext = createContext(null);

const HISTORY_KEY = "quizmaster_history_v1";
const SETTINGS_KEY = "quizmaster_settings_v1";

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function getInitialSettings() {
  const saved = loadJSON(SETTINGS_KEY, null);

  // default settings
  const defaults = {
    category: "",
    difficulty: "medium",
    amount: 10,

    // NEW features
    darkMode: false,
    timerEnabled: false,
    timerSeconds: 20,
  };

  // merge saved settings safely
  return saved ? { ...defaults, ...saved } : defaults;
}

export function QuizProvider({ children }) {
  const [settings, setSettings] = useState(getInitialSettings);

  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // selectedAnswer: { value: string, isCorrect: boolean } | null
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answersLog, setAnswersLog] = useState([]); // each: { q, correct, selected, isCorrect }

  const [score, setScore] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState(() => loadJSON(HISTORY_KEY, []));

  // persist history
  useEffect(() => {
    saveJSON(HISTORY_KEY, history);
  }, [history]);

  // persist settings (dark mode / timer / selections)
  useEffect(() => {
    saveJSON(SETTINGS_KEY, settings);
  }, [settings]);

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