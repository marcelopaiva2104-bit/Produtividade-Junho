const XLSX = require("xlsx");

const GOALS = { FSA: 35, AGL: 32 };
const REALTY_GOALS = { FSA: 10, AGL: 5 };
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*\|\s*/g, " | ")
    .trim()
    .toUpperCase();
}

function personKey(value) {
  const key = normalize(value)
    .replace(/['’]/g, "")
    .replace(/\s+-\s+.*$/, "")
    .replace(/\bCLT\b|\bDESLIGADO\b|\bIMOB\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (key === "LETICIA SANTOS DA SILVA BRITO") return "LETICIA SANTOS DA SILVA";
  if (key === "SANDRA SANTOS") return "SANDRA SANTANA DOS SANTOS";
  if (key === "ANA LUIZA ENTREPORTES") return "ANA LUIZA ENTREPORTES DA COSTA";
  if (key === "LUIS ALVES DOS SANTOS DA SILVA ROCCHA") return "LUIS ALVES DOS SANTOS DA SILVA ROCHA";
  return key;
}

function titleName(value) {
  return String(value || "")
    .toLocaleLowerCase("pt-BR")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (/^(da|de|do|dos|das|e)$/i.test(word)) return word;
      return word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1);
    })
    .join(" ");
}

function canonicalTeam(value) {
  const raw = normalize(value);
  if (!raw) return "";
  if (raw.includes("DF")) return raw;
  if (raw.includes("IMOBILIARIA") || raw.includes("IMOB ")) return `IMOBILIARIAS | ${areaOf(raw)}`;
  if (raw.includes("EQUIPE PROPRIA")) {
    const suffix = raw.match(/\b2\b/) ? " 2" : raw.match(/\b3\b/) ? " 3" : "";
    return `EQUIPE PROPRIA${suffix} | ${areaOf(raw)}`;
  }
  if (raw.includes("AUTONOMOS")) {
    const suffix = raw.match(/\b2\b/) ? " 2" : "";
    return `AUTONOMOS${suffix} | ${areaOf(raw)}`;
  }
  return raw;
}

function displayTeam(value) {
  const team = canonicalTeam(value);
  return team
    .replace("EQUIPE PROPRIA", "EQUIPE PRÓPRIA")
    .replace("IMOBILIARIAS", "IMOBILIÁRIAS")
    .replace("AUTONOMOS", "AUTÔNOMOS");
}

function readRows(filePath, sheetName) {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheet = sheetName ? workbook.Sheets[sheetName] : workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error(`Aba não encontrada: ${sheetName}`);
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
}

function findHeaderRow(rows, labels) {
  const wanted = labels.map(normalize);
  return rows.findIndex((row) => {
    const current = row.map(normalize);
    return wanted.every((label) => current.includes(label));
  });
}

function rowObjects(rows, headerIndex) {
  const headers = rows[headerIndex].map((h) => normalize(h));
  return rows.slice(headerIndex + 1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      if (h) obj[h] = row[i];
    });
    return obj;
  });
}

function excelDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.getFullYear() >= 2020 && value.getFullYear() <= 2035 ? value : null;
  }
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed && parsed.y >= 2020 && parsed.y <= 2035) return new Date(parsed.y, parsed.m - 1, parsed.d);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.getFullYear() >= 2020 && date.getFullYear() <= 2035 ? date : null;
}

function num(value) {
  if (value === "" || value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function fmt(value, decimals = 2) {
  if (value === "" || value === null || value === undefined || Number.isNaN(value)) return "-";
  return Number(value).toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function avg(values) {
  const valid = values.filter((value) => value !== null && value !== undefined && !Number.isNaN(value));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}

function areaOf(team) {
  const value = normalize(team);
  if (value.includes("CAT")) return "CAT";
  if (value.includes("AGL") || value.includes("AGUAS LINDAS")) return "AGL";
  return "FSA";
}

function resultAreaOf(value) {
  const raw = normalize(value);
  if (!raw || raw.includes("DF") || raw.includes("BRASILIA")) return "";
  if (raw.includes("AGL") || raw.includes("AGUAS LINDAS")) return "AGL";
  if (raw.includes("FSA") || raw.includes("FORMOSA")) return "FSA";
  return "";
}

function suggestedGoal(months) {
  if (!months && months !== 0) return null;
  if (months <= 3) return 0.66;
  if (months <= 6) return 1.33;
  if (months <= 9) return 1.66;
  return 2;
}

function classify(diff, months, status) {
  const raw = normalize(status);
  if (raw.includes("AFAST")) return { status: "Sem meta", statusClass: "neutral", profile: "Afastado", action: "Sem meta no período" };
  if (months < 1) return { status: "admissão", statusClass: "neutral", profile: "admissão", action: "Acompanhar integração" };
  if (diff === null) return { status: "Sem dados", statusClass: "neutral", profile: "Sem dados", action: "Definir próxima ação" };
  if (diff >= 0) return { status: "OK", statusClass: "ok", profile: diff >= 0.3 ? "Alta performance" : "Estável", action: diff >= 0.3 ? "Replicar rotina e usar como referência" : "Manter cadência e gerar novas reservas" };
  if (diff <= -1) return { status: "Crítico", statusClass: "danger", profile: "Crítico", action: "Plano de recuperação individual" };
  return { status: "Analisar", statusClass: "attention", profile: "Em recuperação", action: "Plano semanal com o gerente" };
}

function isActiveForProduction(person) {
  const status = normalize(person.status);
  return !status.includes("SEM META") &&
    !status.includes("AFAST") &&
    !status.includes("SEM DADOS") &&
    !status.includes("ADMISSAO") &&
    !status.includes("CONTRAT");
}

function detectPeriod(files, fallbackRows) {
  const dates = [];
  for (const rows of fallbackRows) {
    const headerIndex = rows.findIndex((row) => row.map(normalize).includes("DATA"));
    if (headerIndex >= 0) {
      const dataIndex = rows[headerIndex].map(normalize).indexOf("DATA");
      for (const row of rows.slice(headerIndex + 1)) {
        const d = excelDate(row[dataIndex]);
        if (d) dates.push(d);
      }
    }
  }
  const date = dates.sort((a, b) => b - a)[0] || new Date();
  return { month: date.getMonth() + 1, year: date.getFullYear(), label: `${MONTHS[date.getMonth()]}/${date.getFullYear()}` };
}

function parseMeta(metaPath) {
  const workbook = XLSX.readFile(metaPath, { cellDates: true });
  const sheetName = workbook.SheetNames.find((name) => normalize(name).includes("AJUSTE")) ||
    workbook.SheetNames.find((name) => normalize(name).includes("PLANILHA2")) ||
    workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" });
  const headerIndex = findHeaderRow(rows, ["Imobiliária", "Consultores", "Data Início"]);
  if (headerIndex < 0) throw new Error("Não encontrei as colunas de Imobiliária, Consultores e Data Início na planilha Meta/IPCs.");
  const objects = rowObjects(rows, headerIndex);
  const people = objects
    .filter((row) => row.CONSULTORES && (row.IMOBILIARIA || row["IMOBILIARIA MAIO"]))
    .map((row) => {
      const months = num(row["QTS MESES?"]);
      const currentGoal = row.META === "" ? suggestedGoal(months) : num(row.META);
      const goal = suggestedGoal(months);
      const ipc2026 = row["IPC 2026"] === "" ? null : num(row["IPC 2026"]);
      const diff = ipc2026 === null ? null : ipc2026 - (currentGoal || goal || 0);
      const team = displayTeam(row["IMOBILIARIA MAIO"] || row.IMOBILIARIA);
      const info = classify(diff, months, row["SITUACAO ?"]);
      return {
        name: titleName(row.CONSULTORES),
        key: personKey(row.CONSULTORES),
        team,
        area: areaOf(team),
        start: excelDate(row["DATA INICIO"])?.toLocaleDateString("pt-BR") || "-",
        months,
        y2024: num(row["2024"]),
        y2025: num(row["2025"]),
        y2026: num(row["2026"]),
        ipc2024: row["IPC 2024"] === "" ? null : num(row["IPC 2024"]),
        ipc2025: row["IPC 2025"] === "" ? null : num(row["IPC 2025"]),
        ipc2026,
        currentGoal,
        suggestedGoal: goal,
        diff,
        repassesMonth: 0,
        reservasMonth: 0,
        canceladosMonth: 0,
        distratosMonth: 0,
        ...info
      };
    });

  return { people, rows };
}

function parseManagers(metaPath) {
  const workbook = XLSX.readFile(metaPath, { cellDates: true });
  const sheetName = workbook.SheetNames.find((name) => normalize(name).includes("GERENTES"));
  if (!sheetName) return new Map();
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" });
  const map = new Map();
  rows.forEach((row) => {
    const team = canonicalTeam(row[5]);
    const manager = row[6];
    if (team && manager && !team.includes("SUBTOTAL")) map.set(team, titleName(manager));
  });
  return map;
}

function countByPerson(filePath, options) {
  if (!filePath) return { counts: new Map(), teamCounts: new Map(), areaCounts: new Map(), personTeams: new Map(), personNames: new Map(), codes: new Set(), rows: [] };
  const rows = readRows(filePath);
  const headerIndex = 0;
  const headers = rows[headerIndex].map(normalize);
  const objects = rowObjects(rows, headerIndex);
  const personCol = headers.find((h) => h.includes("CORRETOR") && !h.includes("COMISSAO")) || "CORRETOR";
  const teamCol = headers.find((h) => h === "IMOBILIARIA") || "IMOBILIARIA";
  const resultAreaCol = headers.find((h) => h.includes("EMPREENDIMENTO")) || "";
  const statusCol = headers.find((h) => h.includes("SITUACAO")) || "SITUACAO";
  const dateCol = options.dateHints.map((hint) => headers.find((h) => h.includes(hint))).find(Boolean) || "DATA";
  const codeCol = headers.find((h) => h === "RESERVA") || "RESERVA";
  const counts = new Map();
  const teamCounts = new Map();
  const areaCounts = new Map();
  const personTeams = new Map();
  const personNames = new Map();
  const codes = new Set();

  for (const row of objects) {
    const date = excelDate(row[dateCol]);
    if (!date || date.getMonth() + 1 !== options.month || date.getFullYear() !== options.year) continue;
    const status = normalize(row[statusCol]);
    if (options.include && !options.include.some((wanted) => status.includes(wanted))) continue;
    if (options.reject && options.reject.some((bad) => status.includes(bad))) continue;
    if (options.requireActive && !options.requireActive(status, row)) continue;
    const code = row[codeCol] ? String(row[codeCol]).trim() : "";
    if (options.excludeCodes && code && options.excludeCodes.has(code)) continue;
    const team = canonicalTeam(row[teamCol]);
    const basePerson = personKey(row[personCol]);
    const person = team.includes("IMOBILIARIAS") ? `${basePerson}__${team}` : basePerson;
    const resultArea = resultAreaOf(row[resultAreaCol] || team);
    if (person) counts.set(person, (counts.get(person) || 0) + 1);
    if (person && team && !personTeams.has(person)) personTeams.set(person, team);
    if (person && !personNames.has(person)) personNames.set(person, row[personCol]);
    if (team) teamCounts.set(team, (teamCounts.get(team) || 0) + 1);
    if (resultArea) areaCounts.set(resultArea, (areaCounts.get(resultArea) || 0) + 1);
    if (code) codes.add(code);
  }
  return { counts, teamCounts, areaCounts, personTeams, personNames, codes, rows };
}

function parseStructure(structurePath) {
  const people = new Map();
  const teams = new Map();
  const managerMap = new Map();
  if (!structurePath) return { people, teams, managerMap };
  let rows;
  try {
    rows = readRows(structurePath, "Estrutura");
  } catch {
    return { people, teams, managerMap };
  }
  const headerIndex = findHeaderRow(rows, ["Area", "Time / Imobiliaria", "Gerente de Vendas"]);
  if (headerIndex < 0) return { people, teams, managerMap };
  const objects = rowObjects(rows, headerIndex);
  for (const row of objects) {
    const team = displayTeam(row["TIME / IMOBILIARIA"]);
    if (!team) continue;
    const teamKey = canonicalTeam(team);
    const manager = titleName(row["GERENTE DE VENDAS"] || row["GERENTE DE LOJA"] || "-");
    const area = normalize(row.AREA) || areaOf(team);
    const teamInfo = {
      team,
      area,
      manager,
      storeManager: titleName(row["GERENTE DE LOJA"] || "-"),
      salesManager: manager,
      managerCpf: row["CPF GERENTE DE VENDAS"] || "",
      storeManagerCpf: row["CPF GERENTE DE LOJA"] || ""
    };
    teams.set(teamKey, teamInfo);
    managerMap.set(teamKey, manager);
    const key = personKey(row.CORRETOR);
    if (key) {
      people.set(key, {
        ...teamInfo,
        name: titleName(row.CORRETOR),
        key,
        role: row["CARGO CORRETOR"] || "",
        cpf: row["CPF CORRETOR"] || ""
      });
    }
  }
  return { people, teams, managerMap };
}

function applyStructure(people, managerMap, structure) {
  if (!structure || !structure.people.size) return { people, managerMap };
  const byKey = new Map(people.map((p) => [p.key, p]));
  for (const person of people) {
    const structured = structure.people.get(person.key);
    if (!structured) continue;
    person.team = structured.team;
    person.area = structured.area;
    person.cpf = structured.cpf || person.cpf || "";
    person.role = structured.role || person.role || "";
  }
  for (const [key, structured] of structure.people) {
    if (byKey.has(key)) continue;
    people.push({
      name: structured.name,
      key,
      team: structured.team,
      area: structured.area,
      cpf: structured.cpf || "",
      role: structured.role || "",
      start: "-",
      months: null,
      y2024: 0,
      y2025: 0,
      y2026: 0,
      ipc2024: null,
      ipc2025: null,
      ipc2026: null,
      currentGoal: null,
      suggestedGoal: null,
      diff: null,
      repassesMonth: 0,
      reservasMonth: 0,
      canceladosMonth: 0,
      distratosMonth: 0,
      status: "Sem dados",
      statusClass: "neutral",
      profile: "Sem dados",
      action: "Cadastrar meta e histórico de produtividade"
    });
  }
  for (const [teamKey, manager] of structure.managerMap) {
    managerMap.set(teamKey, manager);
  }
  return { people, managerMap };
}

function countRealtyReservations(filePath, period, excludeCodes = new Set()) {
  const rows = readRows(filePath);
  const groups = new Map();
  const totals = new Map();

  for (const row of rows.slice(1)) {
    const date = excelDate(row[2]);
    if (!date || date.getMonth() + 1 !== period.month || date.getFullYear() !== period.year) continue;
    const status = normalize(row[4]);
    if (!status || status.includes("CANCEL") || status.includes("DISTRATO")) continue;
    const code = row[0] ? String(row[0]).trim() : "";
    if (status.includes("VENDA FINALIZADA") && code && excludeCodes.has(code)) continue;
    const channel = canonicalTeam(row[31]);
    if (channel !== "IMOBILIARIAS | FSA" && channel !== "IMOBILIARIAS | AGL") continue;

    const area = areaOf(channel);
    const team = displayTeam(channel);
    const origin = titleName(row[28] || "-");
    const partner = row[32] || "-";
    const client = titleName(row[17] || "-");
    const dateLabel = date.toLocaleDateString("pt-BR");
    const key = `${area}__${origin}`;

    totals.set(team, (totals.get(team) || 0) + 1);
    if (!groups.has(key)) {
      groups.set(key, { area, origin, partners: new Set(), clients: [], dates: new Set(), reservas: 0 });
    }
    const group = groups.get(key);
    group.reservas += 1;
    group.partners.add(partner);
    group.clients.push(client);
    group.dates.add(dateLabel);
  }

  const details = [...groups.values()]
    .map((group) => ({
      area: group.area,
      origin: group.origin,
      partners: [...group.partners].sort().join(", "),
      clients: group.clients.join("; "),
      dates: [...group.dates].sort().join(", "),
      reservas: group.reservas
    }))
    .sort((a, b) => a.area.localeCompare(b.area) || a.dates.localeCompare(b.dates) || a.origin.localeCompare(b.origin));

  return { totals, details };
}

function mergeCounts(people, repasseCounts, reservaCounts, cancelCounts, distratoCounts) {
  const byKey = new Map(people.map((p) => [p.key, p]));
  const ensurePerson = (key, source) => {
    if (!key || byKey.has(key)) return byKey.get(key);
    const teamKey = source.personTeams?.get(key) || "";
    if (!teamKey || normalize(teamKey).includes("DF")) return null;
    const rawName = source.personNames?.get(key) || key.split("__")[0] || key;
    const person = {
      name: titleName(rawName),
      key,
      team: displayTeam(teamKey),
      area: areaOf(teamKey),
      start: "-",
      months: null,
      y2024: 0,
      y2025: 0,
      y2026: 0,
      ipc2024: null,
      ipc2025: null,
      ipc2026: null,
      currentGoal: null,
      suggestedGoal: null,
      diff: null,
      repassesMonth: 0,
      reservasMonth: 0,
      canceladosMonth: 0,
      distratosMonth: 0,
      status: "Sem base",
      statusClass: "neutral",
      profile: "Sem base",
      action: "Cadastrar ou vincular na base de metas"
    };
    people.push(person);
    byKey.set(key, person);
    return person;
  };
  for (const [key, count] of repasseCounts.counts) {
    const person = byKey.get(key) || ensurePerson(key, repasseCounts);
    if (person) person.repassesMonth = count;
  }
  for (const [key, count] of reservaCounts.counts) {
    const person = byKey.get(key) || ensurePerson(key, reservaCounts);
    if (person) person.reservasMonth = count;
  }
  for (const [key, count] of cancelCounts.counts) {
    const person = byKey.get(key) || ensurePerson(key, cancelCounts);
    if (person) person.canceladosMonth = count;
  }
  for (const [key, count] of distratoCounts.counts) {
    const person = byKey.get(key) || ensurePerson(key, distratoCounts);
    if (person) person.distratosMonth = count;
  }
  return people;
}

function buildDashboard(people, managerMap, files, period, repasseTeamCounts = new Map(), realtyReservations = { totals: new Map(), details: [] }, repasseAreaCounts = new Map(), structure = { teams: new Map() }) {
  const teamMap = new Map();
  for (const [teamKey, team] of structure.teams || new Map()) {
    teamMap.set(teamKey, {
      name: team.team,
      area: team.area,
      manager: team.manager,
      people: []
    });
  }
  for (const person of people) {
    const teamKey = canonicalTeam(person.team);
    if (!teamMap.has(teamKey)) {
      teamMap.set(teamKey, {
        name: person.team,
        area: areaOf(teamKey),
        manager: managerMap.get(teamKey) || "-",
        people: []
      });
    }
    teamMap.get(teamKey).people.push(person);
  }
  for (const [teamKey] of repasseTeamCounts) {
    if (teamKey.includes("DF")) continue;
    if (!teamMap.has(teamKey)) {
      teamMap.set(teamKey, {
        name: displayTeam(teamKey),
        area: areaOf(teamKey),
        manager: "Imobiliárias",
        people: []
      });
    }
  }
  for (const [teamName] of realtyReservations.totals) {
    const teamKey = canonicalTeam(teamName);
    if (!teamMap.has(teamKey)) {
      teamMap.set(teamKey, {
        name: displayTeam(teamKey),
        area: areaOf(teamKey),
        manager: "Imobiliárias",
        people: []
      });
    }
  }

  const teams = [...teamMap.values()].map((team) => {
    const active = team.people.filter((p) => normalize(p.status) !== "SEM META");
    const productionActive = active.filter(isActiveForProduction);
    const above = active.filter((p) => p.diff !== null && p.diff >= 0).length;
    const below = active.filter((p) => p.diff !== null && p.diff < 0).length;
    const critical = active.filter((p) => p.diff !== null && p.diff <= -1).length;
    const teamGoal = Math.round(active.reduce((sum, p) => sum + (p.currentGoal || p.suggestedGoal || 0), 0));
    const peopleRepasses = active.reduce((sum, p) => sum + p.repassesMonth, 0);
    const teamCount = repasseTeamCounts.get(canonicalTeam(team.name));
    const repasses = teamCount === undefined ? peopleRepasses : teamCount;
    const realtyReservaCount = realtyReservations.totals.get(displayTeam(canonicalTeam(team.name)));
    const reservas = realtyReservaCount === undefined ? active.reduce((sum, p) => sum + p.reservasMonth, 0) : realtyReservaCount;
    const cancelados = active.reduce((sum, p) => sum + p.canceladosMonth, 0);
    const distratos = active.reduce((sum, p) => sum + p.distratosMonth, 0);
    const ipcYear = avg(productionActive.map((p) => p.ipc2026));
    const ipcMonth = productionActive.length ? peopleRepasses / productionActive.length : null;
    return { ...team, above, below, critical, teamGoal, repasses, reservas, cancelados, distratos, ipcYear, ipcMonth, activePeople: productionActive.length };
  });

  const areaTotals = ["FSA", "AGL"].map((area) => {
    const areaTeams = teams.filter((team) => team.area === area);
    const fallbackRepasses = areaTeams.reduce((sum, team) => sum + team.repasses, 0);
    const repasses = repasseAreaCounts.has(area) ? repasseAreaCounts.get(area) : fallbackRepasses;
    const goal = GOALS[area] + REALTY_GOALS[area];
    const realtyGoal = REALTY_GOALS[area];
    const realtyRepasses = teams
      .filter((team) => team.area === area && normalize(team.name).includes("IMOBILIARIA"))
      .reduce((sum, team) => sum + team.repasses, 0);
    return { area, repasses, goal, baseGoal: GOALS[area], realtyGoal, realtyRepasses, percent: goal ? Math.round((repasses / goal) * 100) : 0 };
  });
  const total = areaTotals.reduce((sum, item) => sum + item.repasses, 0);
  const goal = areaTotals.reduce((sum, item) => sum + item.goal, 0);
  const productionTeams = teams.filter((team) => !normalize(team.name).includes("IMOBILIARIA"));
  const activePeople = productionTeams.reduce((sum, team) => sum + team.activePeople, 0);
  const teamRepasses = productionTeams.reduce((sum, team) => sum + team.people.reduce((personSum, person) => personSum + person.repassesMonth, 0), 0);
  const ipcYear = avg(productionTeams.flatMap((team) => team.people.filter(isActiveForProduction).map((p) => p.ipc2026)));
  const ipcMonth = activePeople ? teamRepasses / activePeople : null;

  const managers = teams.map((team) => ({
    manager: team.manager,
    team: team.name,
    area: team.area,
    type: normalize(team.name).includes("IMOBILIARIA") ? "Imobiliária" : "Time",
    people: team.people.length,
    above: team.above,
    below: team.below,
    critical: team.critical,
    goal: team.teamGoal || "-",
    repasses: team.repasses,
    reservas: team.reservas,
    ipcYear: team.ipcYear,
    ipcMonth: team.ipcMonth,
    cancelados: team.cancelados,
    distratos: team.distratos
  }));

  const priorities = people
    .filter((p) => p.diff !== null && p.diff < 0)
    .sort((a, b) => (b.reservasMonth - a.reservasMonth) || (a.diff - b.diff))
    .slice(0, 15)
    .map((p, index) => ({
      index: index + 1,
      name: p.name,
      context: `${p.team} | ${managerMap.get(canonicalTeam(p.team)) || "-"}`,
      diff: p.diff,
      repasses: p.repassesMonth,
      reservas: p.reservasMonth,
      profile: p.reservasMonth > 0 ? `${p.profile} com carteira` : p.profile,
      action: p.reservasMonth > 0 ? "Atacar reservas do mês com gerente" : p.action
    }));

  return {
    periodLabel: period.label,
    updatedAt: new Date().toISOString(),
    files,
    metrics: {
      total,
      goal,
      achievement: goal ? Math.round((total / goal) * 100) : 0,
      ipcYear,
      ipcMonth,
      teamRepasses,
      activePeople,
      realtyCount: teams.length,
      toAnalyze: people.filter((p) => p.diff !== null && p.diff < 0).length
    },
    areas: areaTotals,
    teams,
    managers,
    realtyReservations: realtyReservations.details,
    priorities,
    insights: [
      { kind: "danger", title: "Gaps críticos", text: "Priorizar corretores com diferença igual ou abaixo de -1,00 e cruzar com reservas do mês." },
      { kind: "attention", title: "Meta sugerida", text: "Quando a meta atual estiver acima da sugerida pelo tempo de casa, validar regra comercial ou decisão gerencial." },
      { kind: "ok", title: "Frente de conversão", text: "Use reservas do mês para orientar ações rápidas de conversão por gerente." }
    ]
  };
}

async function processExcelFiles(paths, savedFiles = []) {
  if (!paths.meta || !paths.repasse || !paths.reserva) throw new Error("Envie os arquivos de Repasse e Reserva. A meta usa a base fixa do projeto.");
  const meta = parseMeta(paths.meta);
  const structure = parseStructure(paths.structure);
  const structured = applyStructure(meta.people, parseManagers(paths.meta), structure);
  const managerMap = structured.managerMap;
  const period = detectPeriod(savedFiles, [meta.rows, readRows(paths.reserva)]);
  const repasses = countByPerson(paths.repasse, {
    month: period.month,
    year: period.year,
    dateHints: ["ASSINATURA"],
    reject: ["DISTRATO", "CANCEL"]
  });
  const reservas = countByPerson(paths.reserva, {
    month: period.month,
    year: period.year,
    dateHints: ["DATA"],
    reject: ["CANCEL", "DISTRATO"],
    excludeCodes: repasses.codes,
    requireActive: (status) => status !== ""
  });
  const cancelados = countByPerson(paths.reserva, {
    month: period.month,
    year: period.year,
    dateHints: ["DATA"],
    include: ["CANCEL"],
    reject: []
  });
  const distratos = countByPerson(paths.reserva, {
    month: period.month,
    year: period.year,
    dateHints: ["DATA"],
    include: ["DISTRATO"],
    reject: []
  });
  const realtyReservations = countRealtyReservations(paths.reserva, period, repasses.codes);
  const people = mergeCounts(structured.people, repasses, reservas, cancelados, distratos);
  return buildDashboard(people, managerMap, savedFiles, period, repasses.teamCounts, realtyReservations, repasses.areaCounts, structure);
}

module.exports = { processExcelFiles, normalize, fmt };
