const RiskDashboardPage = ({ data }) => {
  return (
    <div>
      <h1>Risk Score: {data.risk.overall}</h1>

      {Object.entries(data.risk.categories).map(([k, v]) => (
        <div key={k}>
          {k}: {v}
        </div>
      ))}
    </div>
  );
};