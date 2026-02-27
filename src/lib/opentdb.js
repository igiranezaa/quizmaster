// src/lib/opentdb.js
export function decodeHtml(str) {
  if (!str) return "";
  try {
    const txt = document.createElement("textarea");
    txt.innerHTML = String(str);
    return txt.value;
  } catch {
    return String(str);
  }
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (e) {
    if (e?.name === "AbortError") {
      throw new Error("Request timed out. Please check your connection and try again.");
    }
    throw e;
  } finally {
    clearTimeout(id);
  }
}

export async function fetchCategories() {
  const res = await fetchWithTimeout("https://opentdb.com/api_category.php");
  if (!res.ok) throw new Error("Failed to fetch categories.");
  const data = await res.json();
  return data?.trivia_categories ?? [];
}

export async function fetchQuestions({ amount, category, difficulty }) {
  const params = new URLSearchParams();
  params.set("amount", String(amount));
  params.set("type", "multiple");
  if (category) params.set("category", String(category));
  if (difficulty) params.set("difficulty", difficulty);

  const url = `https://opentdb.com/api.php?${params.toString()}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error("Failed to fetch quiz questions.");

  const data = await res.json();

  // OpenTDB response_code meanings: 0 success, 1 no results, others indicate issues
  if (data?.response_code === 1) {
    throw new Error("No questions found for your selection. Try different settings.");
  }
  if (data?.response_code !== 0) {
    throw new Error("OpenTDB returned an invalid response. Try again.");
  }

  return data?.results ?? [];
}