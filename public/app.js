const br = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function text(value) {
  return value === null || value === undefined || value === "" ? "-" : String(value);
}

function num(value, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return Number(value).toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function clsDiff(value) {
  return value < 0 ? "bad" : "neutral-text";
}

function metric(title, value, detail, progress, warning = false) {
  return `<article class="metric-card ${warning ? "warning" : ""}">
    <span>${title}</span>
    <strong>${value}</strong>
    ${progress === undefined ? `<small>${detail || ""}</small>` : `<div class="progress"><span style="width:${Math.min(progress, 100)}%"></span></div>`}
  </article>`;
}

function personRow(person, index) {
  return `<tr>
    <td>${index + 1}</td>
    <td><strong>${person.name}</strong></td>
    <td>${person.start}</td>
    <td>${num(person.months, 1)}</td>
    <td>${person.y2024 || "-"}</td>
    <td>${person.y2025 || "-"}</td>
    <td>${person.y2026 || "-"}</td>
    <td>${person.ipc2024 === null ? "-" : num(person.ipc2024, 2)}</td>
    <td>${person.ipc2025 === null ? "-" : num(person.ipc2025, 2)}</td>
    <td>${person.ipc2026 === null ? "-" : num(person.ipc2026, 2)}</td>
    <td class="num-focus ${person.repassesPreviousMonth ? "front-strong" : "muted-num"}">${person.repassesPreviousMonth || 0}</td>
    <td>${person.currentGoal ? num(person.currentGoal, 2) : "-"}</td>
    <td>${person.suggestedGoal ? num(person.suggestedGoal, 2) : "-"}</td>
    <td class="${clsDiff(person.diff)}">${person.diff === null ? "sem IPC" : `${person.diff >= 0 ? "+" : ""}${num(person.diff, 2)}`}</td>
    <td class="num-focus ${person.repassesMonth ? "front-strong" : "muted-num"}">${person.repassesMonth}</td>
    <td class="num-focus ${person.reservasMonth ? "front-strong" : "muted-num"}">${person.reservasMonth}</td>
    <td class="num-focus ${person.canceladosMonth ? "front-strong" : "muted-num"}">${person.canceladosMonth || 0}</td>
    <td class="num-focus ${person.distratosMonth ? "front-strong" : "muted-num"}">${person.distratosMonth || 0}</td>
    <td><span class="status-pill ${person.statusClass}">${person.status}</span></td>
    <td><span class="profile-pill">${person.profile}</span></td>
    <td>${person.action}</td>
  </tr>`;
}

function teamSection(team) {
  return `<section class="realty-section">
    <header class="realty-header">
      <div><p class="eyebrow">Imobiliária</p><h2>${team.name}</h2></div>
      <div class="realty-kpis">
        <span><b>Gerente</b> ${team.manager}</span>
        <span><b>Corretores</b> ${team.people.length}</span>
        <span><b>Acima da meta</b> ${team.above}</span>
        <span><b>Abaixo da meta</b> ${team.below}</span>
        <span><b>Produtividade do time</b> ${team.repasses}</span>
        <span><b>Meta do mês</b> ${team.teamGoal || "-"}</span>
        <span><b>Repasses do mês atual</b> ${team.repasses}</span>
        <span><b>Reservas do mês atual</b> ${team.reservas}</span>
        <span><b>Cancelados do mês</b> ${team.cancelados || 0}</span>
        <span><b>Distratos do mês</b> ${team.distratos || 0}</span>
        <span><b>IPC do ano</b> ${team.ipcYear === null ? "-" : num(team.ipcYear, 2)}</span>
        <span><b>IPC do mês</b> ${team.ipcMonth === null ? "-" : num(team.ipcMonth, 2)}</span>
      </div>
    </header>
    <div class="sheet-table-wrap">
      <table class="sheet-table broker-table">
        <thead><tr><th>#</th><th>Corretor</th><th>Início</th><th>Meses</th><th>2024</th><th>2025</th><th>2026</th><th>IPC 2024</th><th>IPC 2025</th><th>IPC 2026</th><th>Repasses de maio</th><th>Meta atual</th><th>Meta sugerida</th><th>Diferença</th><th>Repasses do mês atual</th><th>Reservas do mês atual</th><th>Cancelados do mês</th><th>Distratos do mês</th><th>Situação</th><th>Perfil</th><th>Ação</th></tr></thead>
        <tbody>${team.people.map(personRow).join("")}</tbody>
      </table>
    </div>
  </section>`;
}

function managerTable(rows) {
  return `<table class="sheet-table summary-table">
    <thead><tr><th>Gerente</th><th>Time / Imobiliária</th><th>Área</th><th>Tipo</th><th>Corretores</th><th>Acima</th><th>Abaixo</th><th>Críticos</th><th>Meta</th><th>Repasses do mês atual</th><th>Reservas do mês atual</th><th>IPC do ano</th><th>IPC do mês</th><th>Cancelados do mês</th><th>Distratos do mês</th></tr></thead>
    <tbody>${rows.map((row) => `<tr>
      <td><strong>${row.manager}</strong></td><td>${row.team}</td><td>${row.area}</td><td>${row.type}</td><td>${row.people}</td>
      <td class="good">${row.above}</td><td class="bad">${row.below}</td><td>${row.critical}</td><td>${row.goal}</td>
      <td class="num-focus ${row.repasses ? "front-strong" : "muted-num"}">${row.repasses}</td>
      <td class="num-focus ${row.reservas ? "front-strong" : "muted-num"}">${row.reservas}</td>
      <td class="num-focus ${row.ipcYear >= 1 ? "front-strong" : "muted-num"}">${row.ipcYear === null ? "-" : num(row.ipcYear, 2)}</td>
      <td class="num-focus ${row.ipcMonth >= 1 ? "front-strong" : "muted-num"}">${row.ipcMonth === null ? "-" : num(row.ipcMonth, 2)}</td>
      <td class="num-focus ${row.cancelados ? "front-strong" : "muted-num"}">${row.cancelados || 0}</td>
      <td class="num-focus ${row.distratos ? "front-strong" : "muted-num"}">${row.distratos || 0}</td>
    </tr>`).join("")}</tbody>
  </table>`;
}

function realtyReservationsTable(rows) {
  if (!rows || !rows.length) return "";
  return `<h3 class="section-title">Reservas ativas das imobiliárias</h3>
  <table class="sheet-table">
    <thead><tr><th>Data</th><th>Área</th><th>Imobiliária / origem</th><th>Parceiro</th><th>Reservas do mês atual</th><th>Clientes</th></tr></thead>
    <tbody>${rows.map((row) => `<tr>
      <td>${row.dates}</td><td>${row.area}</td><td>${row.origin}</td><td>${row.partners}</td>
      <td class="num-focus ${row.reservas ? "front-strong" : "muted-num"}">${row.reservas}</td><td>${row.clients}</td>
    </tr>`).join("")}</tbody>
  </table>`;
}

function priorityTable(rows) {
  return `<table class="sheet-table priority-table">
    <thead><tr><th>#</th><th>Corretor</th><th>Diferença</th><th>Repasses do mês atual</th><th>Reservas do mês atual</th><th>Perfil</th><th>Ação</th></tr></thead>
    <tbody>${rows.map((row) => `<tr>
      <td>${row.index}</td><td><strong>${row.name}</strong><span>${row.context}</span></td>
      <td class="bad">${num(row.diff, 2)}</td>
      <td class="num-focus ${row.repasses ? "front-strong" : "muted-num"}">${row.repasses}</td>
      <td class="num-focus ${row.reservas ? "front-strong" : "muted-num"}">${row.reservas}</td>
      <td><span class="profile-pill">${row.profile}</span></td><td>${row.action}</td>
    </tr>`).join("")}</tbody>
  </table>`;
}

async function loadDashboard() {
  if (window.STATIC_DASHBOARD_DATA) return window.STATIC_DASHBOARD_DATA;

  const response = await fetch("/api/data", { cache: "no-store" });
  if (!response.ok) throw new Error("Não foi possível carregar os dados.");
  return response.json();
}

function render(data) {
  document.getElementById("periodLabel").textContent = data.periodLabel || "Sem base";
  document.getElementById("updatedAt").textContent = data.updatedAt
    ? `Atualizado em ${new Date(data.updatedAt).toLocaleString("pt-BR")}`
    : "Nenhum upload processado";

  document.getElementById("metricGrid").innerHTML = [
    metric("Total realizado", data.metrics.total, data.areas.map((a) => `${a.area} ${a.repasses} (Imob ${a.area} ${a.realtyRepasses || 0})`).join(" + ")),
    metric("Meta geral", data.metrics.goal, data.areas.map((a) => `${a.area} ${a.baseGoal} / Imob ${a.area} ${a.realtyGoal}`).join(" + ")),
    metric("Atingimento", `${data.metrics.achievement}%`, "", data.metrics.achievement),
    metric("IPC 2026", num(data.metrics.ipcYear, 2), "Média do IPC 2026 dos corretores ativos"),
    metric("IPC do mês", num(data.metrics.ipcMonth, 2), `${data.metrics.teamRepasses || 0} repasses do time / ${data.metrics.activePeople || 0} corretores ativos`),
    metric("Imobiliárias", data.metrics.realtyCount, "Times encontrados na planilha"),
    metric("Para analisar", data.metrics.toAnalyze, "Abaixo da meta ou sem tração", undefined, true)
  ].join("");

  document.getElementById("areaGrid").innerHTML = data.areas.map((area) => `<article class="summary-card">
    <span>${area.area}</span><strong>${area.repasses} / ${area.goal}</strong>
    <div class="bar"><span class="${area.percent >= 80 ? "ok" : area.percent >= 50 ? "attention" : "danger"}" style="width:${Math.min(area.percent, 100)}%"></span></div>
    <small>${area.percent}% de atingimento; Imob ${area.area}: ${area.realtyRepasses || 0}/${area.realtyGoal || 0}</small>
  </article>`).join("");

  document.getElementById("teams").innerHTML = data.teams.map(teamSection).join("");
  document.getElementById("managerSummary").innerHTML = managerTable(data.managers || []) + realtyReservationsTable(data.realtyReservations || []);
  document.getElementById("priorityList").innerHTML = priorityTable(data.priorities || []);
  document.getElementById("insights").innerHTML = (data.insights || []).map((item) => `<article class="insight-card ${item.kind}-border"><span>Insight</span><strong>${item.title}</strong><p>${item.text}</p></article>`).join("");
}

loadDashboard()
  .then(render)
  .catch((error) => {
    document.getElementById("periodLabel").textContent = "Erro";
    document.getElementById("updatedAt").textContent = error.message;
  });
