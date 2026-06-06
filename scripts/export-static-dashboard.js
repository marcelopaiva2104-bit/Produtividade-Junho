const fs = require("fs");
const path = require("path");

const root = process.cwd();
const dataPath = path.join(root, "data", "latest-dashboard.json");
const stylesPath = path.join(root, "public", "styles.css");
const appPath = path.join(root, "public", "app.js");
const outputPaths = [
  path.join(root, "dashboard-produtividade-atualizado.html"),
  path.join(root, "public", "dashboard-produtividade-atualizado.html"),
  path.join(root, "public", "index.html")
];

function readRequired(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo obrigatorio nao encontrado: ${path.relative(root, filePath)}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function buildStaticHtml() {
  const dashboard = JSON.parse(readRequired(dataPath));
  const styles = readRequired(stylesPath);
  const app = readRequired(appPath);
  const dataScript = `window.STATIC_DASHBOARD_DATA = ${JSON.stringify(dashboard)};`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard de Produtividade</title>
  <style>
${styles}
  </style>
</head>
<body>
  <main class="dashboard">
    <header class="topbar">
      <div>
        <p class="eyebrow">Analise de produtividade</p>
        <h1>Modelo por imobiliaria e corretores</h1>
      </div>
      <div class="topbar-actions">
        <div class="period-card">
          <span>Base</span>
          <strong id="periodLabel">Carregando...</strong>
          <small id="updatedAt">Buscando dados</small>
        </div>
      </div>
    </header>

    <section aria-label="Indicadores principais" class="metric-grid" id="metricGrid"></section>

    <section aria-label="Racional de meta" class="sheet-toolbar">
      <div>
        <span class="filter-label">Regra de leitura</span>
        <strong>IPC anual ajustado pelos meses trabalhados no ano</strong>
      </div>
      <div class="toolbar-pills">
        <span class="rule-pill">Repasses do mes atual: data de assinatura no mes da base, sem distrato ou cancelado</span>
        <span class="rule-pill">Reservas do mes atual: reservas ativas, sem cancelada/distrato/venda finalizada</span>
        <span class="rule-pill">IPC = repasses / meses ativos</span>
        <span class="rule-pill">Afastado: sem meta</span>
        <span class="rule-pill">0-3m: 0,33</span>
        <span class="rule-pill">3-6m: 1,33</span>
        <span class="rule-pill">6-9m: 1,66</span>
        <span class="rule-pill">9m+: 2,00</span>
      </div>
    </section>

    <section class="summary-grid" id="areaGrid"></section>
    <div id="teams"></div>

    <section aria-label="Resumo por gerente" class="manager-summary">
      <article class="realty-section">
        <header class="realty-header compact-header">
          <div>
            <p class="eyebrow">Resumo gerencial</p>
            <h2>Produtividade por gerente</h2>
          </div>
          <div class="realty-kpis"><span><b>Leitura</b> acima x abaixo</span><span><b>Foco</b> reservas do mes</span></div>
        </header>
        <div class="sheet-table-wrap" id="managerSummary"></div>
      </article>

      <article class="realty-section">
        <header class="realty-header compact-header">
          <div>
            <p class="eyebrow">Prioridade de acao</p>
            <h2>Corretores abaixo da meta com carteira</h2>
          </div>
          <div class="realty-kpis"><span><b>Regra</b> maior reserva do mes primeiro</span><span><b>Objetivo</b> converter reservas do mes</span></div>
        </header>
        <div class="sheet-table-wrap" id="priorityList"></div>
      </article>
    </section>

    <section class="insight-grid" id="insights"></section>
  </main>
  <script>
${dataScript}
  </script>
  <script>
${app}
  </script>
</body>
</html>
`;
}

function exportStaticDashboard() {
  const html = buildStaticHtml();
  for (const outputPath of outputPaths) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html);
  }
  return outputPaths;
}

if (require.main === module) {
  const outputs = exportStaticDashboard();
  console.log(`Dashboard estatico exportado: ${outputs.map((file) => path.relative(root, file)).join(", ")}`);
}

module.exports = { exportStaticDashboard };
