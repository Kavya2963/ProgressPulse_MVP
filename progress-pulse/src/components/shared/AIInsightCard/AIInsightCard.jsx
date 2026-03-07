import { useState } from "react";
import "./AIInsightCard.css";

export default function AIInsightCard({ onFetch, title = "AI Insight" }) {
  const [text, setText]       = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const result = await onFetch();
      setText(Object.values(result)[0]); // picks summary/digest/insight
      setFetched(true);
    } catch {
      setText("Failed to load AI insight. Please try again.");
      setFetched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-card">
      <div className="ai-card-header">
        <div className="ai-card-title">
          <i className="bi bi-stars me-2"></i>
          {title}
        </div>
        {!fetched && !loading && (
          <button className="ai-fetch-btn" onClick={handleFetch}>
            <i className="bi bi-magic me-1"></i>
            Generate
          </button>
        )}
        {fetched && !loading && (
          <button className="ai-fetch-btn ai-fetch-btn--refresh" onClick={handleFetch}>
            <i className="bi bi-arrow-clockwise me-1"></i>
            Regenerate
          </button>
        )}
      </div>

      <div className="ai-card-body">
        {loading && (
          <div className="ai-loading">
            <div className="ai-spinner"></div>
            <span>Llama is thinking...</span>
          </div>
        )}
        {!loading && !fetched && (
          <div className="ai-placeholder">
            <i className="bi bi-stars"></i>
            <p>Click <strong>Generate</strong> to get AI-powered insights.</p>
          </div>
        )}
        {!loading && fetched && (
          <p className="ai-text">{text}</p>
        )}
      </div>
    </div>
  );
}
