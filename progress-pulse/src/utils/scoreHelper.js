export const getScoreColor = (s) => s >= 80 ? "var(--pp-success)" : s >= 50 ? "var(--pp-warning)" : "var(--pp-danger)";
export const getScoreLabel = (s) => s >= 80 ? "High" : s >= 50 ? "Medium" : "Low";
