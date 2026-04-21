import React, { useEffect, useState } from "react";
import { fetchConfig, updateConfig } from "../api/reportApi";

const GovernanceConfigPage = () => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetchConfig().then(setConfig);
  }, []);

  const handleChange = (index, field, value) => {
    const updated = { ...config };
    updated.kpi_rules[index][field] = value;
    setConfig(updated);
  };

  const saveConfig = async () => {
    await updateConfig(config);
    alert("Saved");
  };

  if (!config) return <div>Loading...</div>;

  return (
    <div>
      <h2>Governance Configuration</h2>

      {config.kpi_rules.map((rule, i) => (
        <div key={i}>
          <h4>{rule.name}</h4>

          <input
            value={rule.weight}
            onChange={(e) =>
              handleChange(i, "weight", Number(e.target.value))
            }
          />

          <input
            value={rule.thresholds?.red || ""}
            placeholder="Red"
            onChange={(e) =>
              handleChange(i, "thresholds", {
                ...rule.thresholds,
                red: Number(e.target.value)
              })
            }
          />
        </div>
      ))}

      <button onClick={saveConfig}>Save</button>
    </div>
  );
};

export default GovernanceConfigPage;