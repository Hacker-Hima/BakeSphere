import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

export const ApiPlayground = () => {
  const { token } = useAuth();

  const [endpoints, setEndpoints] = useState([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [requestHeaders, setRequestHeaders] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseBody, setResponseBody] = useState("");
  const [latency, setLatency] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const selectEndpoint = (ep) => {
    setSelectedEndpoint(ep);
    setResponseStatus(null);
    setResponseBody("");

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...(ep.authRequired || token
        ? { Authorization: `Bearer ${token || "bakesphere_sample_jwt_token"}` }
        : { "x-api-key": "bakesphere_dev_key_2026" })
    };

    setRequestHeaders(JSON.stringify(defaultHeaders, null, 2));
    setRequestBody(ep.sampleBody ? JSON.stringify(ep.sampleBody, null, 2) : "");
  };

  const fetchEndpoints = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/docs/endpoints");
      const data = await res.json();
      setEndpoints(data.endpoints || []);
      if (data.endpoints && data.endpoints.length > 0) {
        selectEndpoint(data.endpoints[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEndpoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const executeRequest = async () => {
    if (!selectedEndpoint) return;
    setIsExecuting(true);
    setResponseStatus(null);
    setResponseBody("");

    const startTime = performance.now();
    try {
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(requestHeaders);
      } catch (parseErr) {
        console.warn("Invalid custom JSON headers, using defaults:", parseErr);
        parsedHeaders = { "Content-Type": "application/json" };
      }

      const options = {
        method: selectedEndpoint.method,
        headers: parsedHeaders
      };

      if (selectedEndpoint.method !== "GET" && requestBody) {
        options.body = requestBody;
      }

      let url = `http://localhost:5000${selectedEndpoint.path}`;
      if (selectedEndpoint.method === "GET" && selectedEndpoint.sampleQuery) {
        url += selectedEndpoint.sampleQuery;
      }

      const res = await fetch(url, options);
      const elapsed = Math.round(performance.now() - startTime);
      setLatency(elapsed);
      setResponseStatus(res.status);

      const json = await res.json();
      setResponseBody(JSON.stringify(json, null, 2));
      setIsExecuting(false);
    } catch (err) {
      setIsExecuting(false);
      setResponseStatus("Network Error");
      setResponseBody(JSON.stringify({ error: err.message }, null, 2));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div className="badge badge-gold" style={{ marginBottom: "0.5rem" }}>
          ⚡ Live Interactive Developer Playground
        </div>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
          REST API Console & JWT Authorization Explorer
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Test all secured endpoints live directly against the Express backend. The console automatically attaches your authenticated session JWT Bearer token or development API key.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem" }}>
        {/* Left Column: Endpoints Directory */}
        <div className="glass-panel" style={{ padding: "1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem", height: "fit-content" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--gold-400)", textTransform: "uppercase", marginBottom: "0.3rem" }}>
            Available API Endpoints
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: "560px", overflowY: "auto" }}>
            {endpoints.map((ep) => {
              const isSelected = selectedEndpoint?.id === ep.id;
              const isPost = ep.method === "POST";
              return (
                <div
                  key={ep.id}
                  onClick={() => selectEndpoint(ep)}
                  style={{
                    padding: "0.6rem 0.8rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: isSelected ? "rgba(245, 158, 11, 0.15)" : "rgba(255, 255, 255, 0.02)",
                    border: isSelected ? "1px solid var(--gold-500)" : "1px solid rgba(255, 255, 255, 0.06)",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.4rem",
                        borderRadius: "4px",
                        background: isPost ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.2)",
                        color: isPost ? "#60a5fa" : "#34d399"
                      }}
                    >
                      {ep.method}
                    </span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {ep.path}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {ep.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Request & Response Sandbox */}
        {selectedEndpoint && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {/* Request Configuration */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      padding: "0.25rem 0.6rem",
                      borderRadius: "6px",
                      background: selectedEndpoint.method === "POST" ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.2)",
                      color: selectedEndpoint.method === "POST" ? "#60a5fa" : "#34d399"
                    }}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <code style={{ fontSize: "1rem", color: "var(--gold-400)", fontFamily: "var(--font-mono)" }}>
                    http://localhost:5000{selectedEndpoint.path}
                  </code>
                </div>

                <button
                  onClick={executeRequest}
                  disabled={isExecuting}
                  className="btn-gold"
                  style={{ padding: "0.6rem 1.4rem", fontSize: "0.88rem" }}
                >
                  {isExecuting ? "Executing..." : "▶ Send Request"}
                </button>
              </div>

              {/* Headers Editor */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
                  HTTP Request Headers (JSON):
                </label>
                <textarea
                  value={requestHeaders}
                  onChange={(e) => setRequestHeaders(e.target.value)}
                  rows={4}
                  style={{
                    width: "100%",
                    background: "rgba(15, 10, 7, 0.9)",
                    color: "var(--gold-400)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.78rem",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    padding: "0.6rem",
                    outline: "none"
                  }}
                />
              </div>

              {/* Request Body (For POST/PUT) */}
              {selectedEndpoint.method !== "GET" && (
                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
                    Request Body Payload (JSON):
                  </label>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={7}
                    style={{
                      width: "100%",
                      background: "rgba(15, 10, 7, 0.9)",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.78rem",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "8px",
                      padding: "0.6rem",
                      outline: "none"
                    }}
                  />
                </div>
              )}
            </div>

            {/* Live Response Panel */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    Live Response
                  </h3>
                  {responseStatus && (
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        background: String(responseStatus).startsWith("2") ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)",
                        color: String(responseStatus).startsWith("2") ? "#34d399" : "#fb7185"
                      }}
                    >
                      Status: {responseStatus}
                    </span>
                  )}
                </div>

                {latency !== null && (
                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                    ⚡ Latency: {latency} ms
                  </span>
                )}
              </div>

              <pre style={{
                background: "rgba(10, 6, 4, 0.95)",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                color: "#34d399",
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                overflowX: "auto",
                maxHeight: "380px"
              }}>
                {responseBody || "// Click 'Send Request' above to view live server response..."}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
