export default function HistoryPanel({ history }) {
  if (!history?.length) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <h3 className="font-semibold">Quiz History</h3>
        <p className="mt-2 text-sm text-slate-600">
          No quizzes yet. Finish one and you’ll see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6">
      <h3 className="font-semibold">Quiz History</h3>
      <div className="mt-4 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Date</th>
              <th className="py-2">Topic</th>
              <th className="py-2">Difficulty</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, 8).map((h, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2">{h.date}</td>
                <td className="py-2">{h.topic || "Any"}</td>
                <td className="py-2 capitalize">{h.difficulty}</td>
                <td className="py-2 font-semibold">
                  {h.score}/{h.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {history.length > 8 && (
        <p className="mt-3 text-xs text-slate-500">
          Showing latest 8 results.
        </p>
      )}
    </div>
  );
}
