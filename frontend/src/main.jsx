import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "3rem", textAlign: "center", color: "#fff", background: "#0b0f19", minHeight: "100vh", fontFamily: "sans-serif" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "#f87171", marginBottom: "0.5rem" }}>BakeSphere UI Error Detected</h2>
          <p style={{ color: "#94a3b8", maxWidth: "500px", margin: "0 auto 1.5rem" }}>
            An unexpected error occurred while rendering the page. Click the button below to reset the session and reload.
          </p>
          <pre style={{ background: "#1e293b", padding: "1rem", borderRadius: "8px", maxWidth: "600px", margin: "0 auto 1.5rem", textAlign: "left", overflowX: "auto", color: "#fca5a5", fontSize: "0.85rem" }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => {
              sessionStorage.clear();
              localStorage.removeItem("bakesphere_cart");
              window.location.reload();
            }}
            style={{ padding: "0.75rem 1.5rem", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "0.95rem" }}
          >
            🔄 Reset & Reload Site
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
