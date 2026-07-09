const inputText = document.getElementById("input-text");
const charCount = document.getElementById("char-count");
const simplifyBtn = document.getElementById("simplify-btn");
const btnLabel = simplifyBtn.querySelector(".btn-label");
const btnSpinner = simplifyBtn.querySelector(".btn-spinner");
const errorMsg = document.getElementById("error-msg");
const results = document.getElementById("results");

const textOriginal = document.getElementById("text-original");
const textSimplified = document.getElementById("text-simplified");
const gradeOriginal = document.getElementById("grade-original");
const gradeSimplified = document.getElementById("grade-simplified");
const markerOriginal = document.getElementById("marker-original");
const markerSimplified = document.getElementById("marker-simplified");
const gaugeSummary = document.getElementById("gauge-summary");

const GAUGE_MIN = 0;
const GAUGE_MAX = 16;

inputText.addEventListener("input", () => {
  charCount.textContent = `${inputText.value.length} / 2000`;
});

simplifyBtn.addEventListener("click", async () => {
  const text = inputText.value.trim();
  errorMsg.hidden = true;

  if (!text) {
    showError("Please enter some text to simplify.");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/simplify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Something went wrong. Please try again.");
      return;
    }

    renderResults(data);
  } catch (err) {
    showError("Couldn't reach the server. Is the Flask app running?");
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  simplifyBtn.disabled = isLoading;
  btnSpinner.hidden = !isLoading;
  btnLabel.textContent = isLoading ? "Simplifying…" : "Simplify";
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.hidden = false;
}

function gradeToPercent(grade) {
  const clamped = Math.max(GAUGE_MIN, Math.min(GAUGE_MAX, grade));
  return (clamped / GAUGE_MAX) * 100;
}

function renderResults(data) {
  const { original, simplified, scores } = data;
  const origGrade = scores.original_grade_level;
  const simpGrade = scores.simplified_grade_level;

  textOriginal.textContent = original;
  textSimplified.textContent = simplified;

  gradeOriginal.textContent = `Grade ${origGrade.toFixed(1)}`;
  gradeSimplified.textContent = `Grade ${simpGrade.toFixed(1)}`;

  markerOriginal.style.left = `${gradeToPercent(origGrade)}%`;
  markerSimplified.style.left = `${gradeToPercent(simpGrade)}%`;

  const drop = origGrade - simpGrade;
  if (drop > 0.3) {
    gaugeSummary.innerHTML = `Dropped <strong>${drop.toFixed(1)} grade levels</strong> — noticeably easier to read.`;
  } else if (drop < -0.3) {
    gaugeSummary.innerHTML = `Reading level went <strong>up</strong> by ${Math.abs(drop).toFixed(1)} — try shorter input text for better results.`;
  } else {
    gaugeSummary.innerHTML = `Reading level stayed about the same.`;
  }

  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}
