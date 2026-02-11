import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import SetupPage from "./pages/SetupPage";
import QuizPage from "./pages/QuizPage";
import ResultsPage from "./pages/ResultsPage";
import { QuizProvider } from "./state/quizContext";

export default function App() {
  return (
    <QuizProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<SetupPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </QuizProvider>
  );
}
