import { useState, useEffect } from "react";

export const RecipeScaler = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState("REC-01");
  const [targetUnits, setTargetUnits] = useState(20);
  const [scaleResult, setScaleResult] = useState(null);
  const [batches, setBatches] = useState([]);
  const [, setIsCalculating] = useState(false);
  const [productionMessage, setProductionMessage] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedRecipeId && targetUnits > 0) {
      calculateScale();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecipeId, targetUnits]);

  const fetchInitialData = async () => {
    try {
      const [recRes, batchRes] = await Promise.all([
        fetch("http://localhost:5000/api/recipes"),
        fetch("http://localhost:5000/api/production/batches")
      ]);
      const recJson = await recRes.json();
      const batchJson = await batchRes.json();
      setRecipes(recJson.recipes || []);
      setBatches(batchJson.batches || []);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateScale = async () => {
    setIsCalculating(true);
    try {
      const res = await fetch("http://localhost:5000/api/recipes/scale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: selectedRecipeId,
          targetUnits: parseInt(targetUnits, 10)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setScaleResult(data);
      }
      setIsCalculating(false);
    } catch (err) {
      console.error(err);
      setIsCalculating(false);
    }
  };

  const handleStartFefoRun = async () => {
    if (!scaleResult) return;
    try {
      const res = await fetch("http://localhost:5000/api/production/consume-fefo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "bakesphere_dev_key_2026"
        },
        body: JSON.stringify({
          recipeId: selectedRecipeId,
          quantity: parseInt(targetUnits, 10),
          branchId: "BR-01"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setProductionMessage(`🚀 Success! Batch ${data.batch.batchId} created and FEFO raw ingredients deducted.`);
        // Refresh batches
        const bRes = await fetch("http://localhost:5000/api/production/batches");
        const bData = await bRes.json();
        setBatches(bData.batches || []);
      } else {
        alert(data.error || "Production run failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProgressStage = async (batchId, nextStage) => {
    try {
      const res = await fetch(`http://localhost:5000/api/production/batches/${batchId}/stage`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "bakesphere_dev_key_2026"
        },
        body: JSON.stringify({ stage: nextStage })
      });
      if (res.ok) {
        const bRes = await fetch("http://localhost:5000/api/production/batches");
        const bData = await bRes.json();
        setBatches(bData.batches || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stages = [
    { key: "planned", label: "1. Planned" },
    { key: "allocated", label: "2. Allocated" },
    { key: "mixing", label: "3. Mixing" },
    { key: "baking", label: "4. Baking" },
    { key: "cooling", label: "5. Cooling" },
    { key: "ready_for_sale", label: "6. Ready for Sale" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div className="badge badge-gold" style={{ marginBottom: "0.5rem" }}>
          🧑‍🍳 Kitchen Production Intelligence
        </div>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
          Dynamic Recipe Scaler & FEFO Batch Engine
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Scales base master formulas to any target volume down to the gram, verifies warehouse stock levels, and automatically allocates oldest non-expired raw materials using First-Expire, First-Out (FEFO) rules.
        </p>
      </div>

      {/* Control Bar: Recipe Picker & Batch Multiplier */}
      <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
            Select Master Recipe:
          </label>
          <select
            value={selectedRecipeId}
            onChange={(e) => setSelectedRecipeId(e.target.value)}
            style={{
              width: "100%",
              background: "#ffffff",
              color: "#1f2937",
              fontWeight: 600,
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "0.65rem 0.9rem",
              fontSize: "0.92rem",
              outline: "none"
            }}
          >
            {recipes.map((r) => (
              <option key={r.id} value={r.id} style={{ background: "#ffffff", color: "#1f2937" }}>
                {r.name} ({r.baseBatchUnit})
              </option>
            ))}
          </select>
        </div>

        <div style={{ width: "200px" }}>
          <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
            Target Production Units:
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="number"
              value={targetUnits}
              onChange={(e) => setTargetUnits(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
              max="200"
              style={{
                width: "100%",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "0.6rem 0.9rem",
                color: "#1f2937",
                fontSize: "1rem",
                fontWeight: 700,
                textAlign: "center",
                outline: "none"
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", height: "100%", paddingTop: "1.4rem" }}>
          <button
            onClick={handleStartFefoRun}
            disabled={!scaleResult || !scaleResult.canProduceImmediately}
            className="btn-gold"
            style={{
              padding: "0.68rem 1.4rem",
              opacity: scaleResult && scaleResult.canProduceImmediately ? 1 : 0.5
            }}
          >
            🚀 Execute FEFO Production Run
          </button>
        </div>
      </div>

      {/* Execution Feedback Message */}
      {productionMessage && (
        <div style={{
          background: "#f0fdf4",
          border: "1px solid #86efac",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.4rem",
          color: "#15803d",
          fontWeight: 600,
          fontSize: "0.9rem"
        }}>
          {productionMessage}
        </div>
      )}

      {/* Scaled Ingredients Table & Baking Specs */}
      {scaleResult && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem" }}>
          {/* Scaled Ingredients Breakdown */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
                ⚖️ Scaled Raw Materials Requirement ({scaleResult.targetUnits} Units)
              </h3>
              <span className={`badge ${scaleResult.canProduceImmediately ? "badge-emerald" : "badge-rose"}`}>
                {scaleResult.canProduceImmediately ? "Stock Available" : "Stock Shortage"}
              </span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textAlign: "left" }}>
                  <th style={{ padding: "0.6rem" }}>Ingredient</th>
                  <th style={{ padding: "0.6rem" }}>Base (1 Unit)</th>
                  <th style={{ padding: "0.6rem" }}>Scaled Total</th>
                  <th style={{ padding: "0.6rem" }}>Inventory Status</th>
                </tr>
              </thead>
              <tbody>
                {scaleResult.scaledIngredients.map((ing) => (
                  <tr key={ing.ingredientId} style={{ borderBottom: "1px solid rgba(245, 158, 11, 0.06)" }}>
                    <td style={{ padding: "0.65rem 0.6rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {ing.name}
                    </td>
                    <td style={{ padding: "0.65rem 0.6rem", color: "var(--text-secondary)" }}>
                      {ing.basePerUnit}
                    </td>
                    <td style={{ padding: "0.65rem 0.6rem", fontWeight: 700, color: "var(--gold-400)" }}>
                      {ing.scaledTotal}
                    </td>
                    <td style={{ padding: "0.65rem 0.6rem" }}>
                      <span className={`badge ${ing.stockStatus === "available" ? "badge-emerald" : "badge-rose"}`} style={{ fontSize: "0.7rem" }}>
                        {ing.currentStock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recipe Baking Specs & Estimated Cost */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.8rem" }}>
                🔥 Thermal & Production Parameters
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.84rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                  <span>Deck Oven Baking Temperature:</span>
                  <strong style={{ color: "var(--gold-400)" }}>{scaleResult.bakingSpecs.temperature}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                  <span>Baking Duration:</span>
                  <strong style={{ color: "var(--gold-400)" }}>{scaleResult.bakingSpecs.duration}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                  <span>Total Preparation & Proofing:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{scaleResult.totalPreparationTimeMin} mins</strong>
                </div>
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.6rem", marginTop: "0.4rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: 700 }}>
                    <span>Estimated Ingredient Cost:</span>
                    <span style={{ color: "#34d399" }}>₹{scaleResult.totalEstimatedIngredientCost}</span>
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Cost per finished unit: ₹{scaleResult.costPerUnit}
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Operating Procedure (SOP) */}
            <div className="glass-panel" style={{ padding: "1.5rem", flex: 1 }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--gold-400)", marginBottom: "0.6rem" }}>
                📋 Chef's Standard Operating Procedure
              </h3>
              <ol style={{ paddingLeft: "1.2rem", fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {scaleResult.procedure.map((step, idx) => (
                  <li key={idx} style={{ lineHeight: 1.45 }}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Production Stage Pipeline Tracker */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
          🏭 Active Kitchen Batches & Stage Pipeline
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {batches.map((batch) => {
            const currentStage = batch.currentStage || "mixing";
            return (
              <div
                key={batch.batchId}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "var(--radius-md)",
                  padding: "1.2rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--crimson-500)", marginRight: "0.8rem" }}>
                      {batch.batchId}
                    </span>
                    <strong style={{ color: "var(--text-primary)" }}>{batch.productName}</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginLeft: "0.6rem" }}>
                      ({batch.quantityProduced} Units • Baker: {batch.baker})
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span className="badge badge-emerald">
                      Shelf-Life: {new Date(batch.expiresAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Pipeline Stage Chips */}
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
                  {stages.map((st) => {
                    const isPassed = stages.findIndex((s) => s.key === st.key) <= stages.findIndex((s) => s.key === currentStage);
                    const isCurrent = currentStage === st.key;
                    return (
                       <button
                         key={st.key}
                         onClick={() => handleProgressStage(batch.batchId, st.key)}
                         style={{
                           background: isCurrent ? "var(--crimson-500)" : isPassed ? "#dcfce7" : "#ffffff",
                           color: isCurrent ? "#ffffff" : isPassed ? "#15803d" : "#475569",
                           border: isCurrent ? "none" : isPassed ? "1px solid #86efac" : "1px solid #cbd5e1",
                           padding: "0.35rem 0.75rem",
                           borderRadius: "var(--radius-full)",
                           fontSize: "0.76rem",
                           fontWeight: isCurrent ? 700 : 500,
                           cursor: "pointer",
                           transition: "all 0.15s ease"
                         }}
                       >
                         {isPassed && !isCurrent ? "✓ " : ""}{st.label}
                       </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
