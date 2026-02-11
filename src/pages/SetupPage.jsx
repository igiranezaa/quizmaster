import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../state/quizContext";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";
import HistoryPanel from "../components/HistoryPanel";
import { fetchCategories, fetchQuestions } from "../lib/opentdb";

export default function SetupPage() {
  const navigate = useNavigate();

  const {
    settings,
    setSettings,
    categories,
    setCategories,
    setQuestions,
    setCurrentIndex,
    setSelectedAnswer,
    setAnswersLog,
    setScore,
    loading,
    setLoading,
    error,
    setError,
    history,
  } = useQuiz();

  useEffect(() => {
    let mounted = true;

    async function loadCats() {
      try {
        setError("");
        setLoading(true);
        const cats = await fetchCategories();
        if (mounted) setCategories(cats);
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load categories.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (!categories.length) loadCats();
    return () => {
      mounted = false;
    };
  }, [categories.length, setCategories, setError, setLoading]);

  async function startQuiz(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);

      // reset quiz state
      setQuestions([]);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setAnswersLog([]);
      setScore(0);

      const qs = await fetchQuestions(settings);
      setQuestions(qs);

      navigate("/quiz");
    } catch (e2) {
      setError(e2.message || "Failed to start quiz.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Start a Quiz</h1>
        <p className="mt-2 text-slate-600">
          Choose a topic, difficulty, and number of questions.
        </p>

        <div className="mt-5">
          <ErrorMessage message={error} />
        </div>

        <form className="mt-5 grid gap-4" onSubmit={startQuiz}>
          <label className="grid gap-2">
            <span className="text-sm font-medium">Topic</span>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-3"
              value={settings.category}
              onChange={(e) =>
                setSettings((s) => ({ ...s, category: e.target.value }))
              }
              disabled={loading}
            >
              <option value="">Any Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Difficulty</span>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                value={settings.difficulty}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, difficulty: e.target.value }))
                }
                disabled={loading}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Questions</span>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                value={settings.amount}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, amount: Number(e.target.value) }))
                }
                disabled={loading}
              >
                {[5, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="mt-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Quiz"}
          </button>

          {loading && (
            <div className="pt-2">
              <Loader label="Preparing quiz..." />
            </div>
          )}
        </form>
      </div>

      <HistoryPanel history={history} />
    </div>
  );
}
