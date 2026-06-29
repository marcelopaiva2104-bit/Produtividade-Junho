const XLSX = require("xlsx");

const EXCLUDED_PEOPLE_KEYS = new Set([
  "ANIBAL HAMU NETO",
  "JHENNEFE HORRARA SILVA DE OLIVEIRA"
]);

const GOALS = { FSA: 35, AGL: 32, CAT: 25 };
const REALTY_GOALS = { FSA: 10, AGL: 5, CAT: 25 };
const MANUAL_RESERVATION_MINIMUMS = new Map([
  ["ANA LUIZA ENTREPONTES DA COSTA", 1],
  ["WANDERSON ROMERO COELHO DA SILVA", 1],
  ["LUIS ALVES DOS SANTOS DA SILVA ROCHA", 1],
  ["FABIANE BEZERRA DE MOMEIRA DOS SANTOS", 1],
  ["ARIANI MORAIS DE SOUSA PEREIRA", 3],
  ["JONATAN CASTRO DA SILVA", 2],
  ["AQUILA DA SILVA FERNANDES", 1]
]);
const TEAM_MANAGER_OVERRIDES = new Map([
  ["EQUIPE PROPRIA | FSA", "Vivian"],
  ["EQUIPE PROPRIA 2 | FSA", "Lucas"],
  ["CANAL 1", "Micael"],
  ["CANAL 2", "Alba"],
  ["CANAL 3", "Pâmela"],
  ["IMOBILIARIAS | AGL", "Francisco"],
  ["IMOBILIARIAS | CAT", "Leonardo"],
  ["IMOBILIARIAS | FSA", "Rafael"]
]);
const REQUIRED_TEAMS = [
  { key: "IMOBILIARIAS | AGL", area: "AGL" },
  { key: "IMOBILIARIAS | CAT", area: "CAT" },
  { key: "IMOBILIARIAS | FSA", area: "FSA" }
];
const TEAM_MEMBER_ALLOWLIST = new Map([
  ["EQUIPE PROPRIA | FSA", new Set([
    "INGRID ALVES DAPARECIDA",
    "RYAN GOMES CALAZANS",
    "MARIA DAIANA DA SILVA BRANDAO",
    "NAUANE MARTINS DA SILVA OLIVEIRA",
    "VALMIR SANTANA DOS SANTOS"
  ])],
  ["EQUIPE PROPRIA 2 | FSA", new Set([
    "GABRIEL DO NASCIMENTO DIAS",
    "MARIA EUGENIA MARTINS ALVES",
    "MURIELLY DE SOUSA SANTOS",
    "NATHALIA NOGUEIRA AGUIAR",
    "NATALIA CRISTINA NERES DOS SANTOS"
  ])],
  ["AUTONOMOS | FSA", new Set([
    "ANNA LUIZA PEREIRA DE SOUSA",
    "ANIBAL HAMU NETO",
    "CAMILA FERNANDES DA SILVA",
    "CLEIDE DE OLIVEIRA ALVES",
    "ISABELLA PEREIRA FELICIANO",
    "STEFFANY SILVA PINTO",
    "THAMARA RAFAELLA DE MELO SANTOS"
  ])],
  ["AUTONOMOS 2 | FSA", new Set([
    "GYOVANA FERNANDES ALMEIDA CASTRO",
    "KEULLY DE SOUSA BRAGA",
    "LETICIA LORRANNY SANTOS DOURADO",
    "THAIRINE STEFANNI RODRIGUES DA SILVA",
    "MARCILENE DOS REIS CARVALHO",
    "ERIKA ALVES GOMES",
    "PABLINE MICHELI OLIVEIRA DA SILVA"
  ])],
  ["EQUIPE PROPRIA | AGL", new Set([
    "NATASHA LUCILIA BARBOSA",
    "JONATAN CASTRO DA SILVA",
    "MAYSA GABRIELA GONCALVES OLIVEIRA",
    "AQUILA DA SILVA FERNANDES",
    "ARIANI MORAIS DE SOUSA PEREIRA",
    "MILENE DE ALMEIDA LIMA"
  ])],
  ["EQUIPE PROPRIA 2 | AGL", new Set([
    "JOAO VITOR BRITO",
    "FABIANE BEZERRA DE MOMEIRA DOS SANTOS",
    "WANDERSON ROMERO COELHO DA SILVA",
    "JULIANA MARIA DE SOUZA",
    "ANA LUIZA ENTREPONTES DA COSTA",
    "LUIS ALVES DOS SANTOS DA SILVA ROCHA"
  ])],
  ["CANAL 1", new Set([
    "DANIEL ANDRADE DOS SANTOS",
    "MARIA EDUARDA DAMASCENO",
    "CAIO BRENDON LOPES MARTINS",
    "LUCAS DE SOUZA RODRIGUES",
    "LUCAS RAMOS DE VICTORIA"
  ])],
  ["CANAL 2", new Set([
    "SANDRA SANTANA DOS SANTOS",
    "LUCAS BRAGA DE SOUZA OLIVEIRA",
    "LETICIA SANTOS DA SILVA",
    "LUANA SANTANA DOS SANTOS"
  ])],
  ["CANAL 3", new Set([
    "MARTA ANASTACIO NERES",
    "JOELMA FREIRE",
    "JOSE RIBAMAR"
  ])],
  ["EQUIPE PROPRIA | CAT", new Set([
    "EMANNUELLY DO BOM PARTO SOUZA CARVALHO",
    "LETICIA APARECIDA DE MELO GODINHO",
    "VIVIANE MACHADO GOMES DE PEREIRA ARAUJO",
    "SARA CRISTINA MEDEIROS DA COSTA",
    "SAMARA DE MELO CRUZ",
    "TAMIRES PAOLA MURER"
  ])]
]);
const PERSON_TEAM_OVERRIDES = new Map([
  ["NAUANE MARTINS DA SILVA OLIVEIRA", "EQUIPE PROPRIA | FSA"],
  ["VALMIR SANTANA DOS SANTOS", "EQUIPE PROPRIA | FSA"],
  ["GABRIEL DO NASCIMENTO DIAS", "EQUIPE PROPRIA 2 | FSA"],
  ["MARIA EUGENIA MARTINS ALVES", "EQUIPE PROPRIA 2 | FSA"],
  ["MURIELLY DE SOUSA SANTOS", "EQUIPE PROPRIA 2 | FSA"],
  ["NATHALIA NOGUEIRA AGUIAR", "EQUIPE PROPRIA 2 | FSA"],
  ["NATALIA CRISTINA NERES DOS SANTOS", "EQUIPE PROPRIA 2 | FSA"],
  ["GYOVANA FERNANDES ALMEIDA CASTRO", "AUTONOMOS 2 | FSA"],
  ["KEULLY DE SOUSA BRAGA", "AUTONOMOS 2 | FSA"],
  ["LETICIA LORRANNY SANTOS DOURADO", "AUTONOMOS 2 | FSA"],
  ["THAIRINE STEFANNI RODRIGUES DA SILVA", "AUTONOMOS 2 | FSA"],
  ["MARCILENE DOS REIS CARVALHO", "AUTONOMOS 2 | FSA"],
  ["ERIKA ALVES GOMES", "AUTONOMOS 2 | FSA"],
  ["PABLINE MICHELI OLIVEIRA DA SILVA", "AUTONOMOS 2 | FSA"],
  ["NATASHA LUCILIA BARBOSA", "EQUIPE PROPRIA | AGL"],
  ["JONATAN CASTRO DA SILVA", "EQUIPE PROPRIA | AGL"],
  ["MAYSA GABRIELA GONCALVES OLIVEIRA", "EQUIPE PROPRIA | AGL"],
  ["AQUILA DA SILVA FERNANDES", "EQUIPE PROPRIA | AGL"],
  ["ARIANI MORAIS DE SOUSA PEREIRA", "EQUIPE PROPRIA | AGL"],
  ["MILENE DE ALMEIDA LIMA", "EQUIPE PROPRIA | AGL"],
  ["JOAO VITOR BRITO", "EQUIPE PROPRIA 2 | AGL"],
  ["FABIANE BEZERRA DE MOMEIRA DOS SANTOS", "EQUIPE PROPRIA 2 | AGL"],
  ["WANDERSON ROMERO COELHO DA SILVA", "EQUIPE PROPRIA 2 | AGL"],
  ["JULIANA MARIA DE SOUZA", "EQUIPE PROPRIA 2 | AGL"],
  ["ANA LUIZA ENTREPONTES DA COSTA", "EQUIPE PROPRIA 2 | AGL"],
  ["LUIS ALVES DOS SANTOS DA SILVA ROCHA", "EQUIPE PROPRIA 2 | AGL"],
  ["DANIEL ANDRADE DOS SANTOS", "CANAL 1"],
  ["MARIA EDUARDA DAMASCENO", "CANAL 1"],
  ["CAIO BRENDON LOPES MARTINS", "CANAL 1"],
  ["LUCAS DE SOUZA RODRIGUES", "CANAL 1"],
  ["LUCAS RAMOS DE VICTORIA", "CANAL 1"],
  ["SANDRA SANTANA DOS SANTOS", "CANAL 2"],
  ["LUCAS BRAGA DE SOUZA OLIVEIRA", "CANAL 2"],
  ["LETICIA SANTOS DA SILVA", "CANAL 2"],
  ["LUANA SANTANA DOS SANTOS", "CANAL 2"],
  ["MARTA ANASTACIO NERES", "CANAL 3"],
  ["JOELMA FREIRE", "CANAL 3"],
  ["JOSE RIBAMAR", "CANAL 3"],
  ["EMANNUELLY DO BOM PARTO SOUZA CARVALHO", "EQUIPE PROPRIA | CAT"],
  ["LETICIA APARECIDA DE MELO GODINHO", "EQUIPE PROPRIA | CAT"],
  ["VIVIANE MACHADO GOMES DE PEREIRA ARAUJO", "EQUIPE PROPRIA | CAT"],
  ["SARA CRISTINA MEDEIROS DA COSTA", "EQUIPE PROPRIA | CAT"],
  ["SAMARA DE MELO CRUZ", "EQUIPE PROPRIA | CAT"],
  ["TAMIRES PAOLA MURER", "EQUIPE PROPRIA | CAT"]
]);
const PERSON_DISPLAY_OVERRIDES = new Map([
  ["EMANNUELLY DO BOM PARTO SOUZA CARVALHO", "Emannuelly do Bom Parto Souza Carvalho"],
  ["LETICIA APARECIDA DE MELO GODINHO", "Leticia Aparecida de Melo Godinho"],
  ["VIVIANE MACHADO GOMES DE PEREIRA ARAUJO", "Viviane Machado Gomes de Pereira Araujo"],
  ["SARA CRISTINA MEDEIROS DA COSTA", "Sara Cristina Medeiros da Costa"],
  ["SAMARA DE MELO CRUZ", "Samara de Melo Cruz (em contratação)"],
  ["TAMIRES PAOLA MURER", "Tamires Paola Murer"],
  ["JOELMA FREIRE", "Joelma Freire"],
  ["JOSE RIBAMAR", "José Ribamar"],
  ["MARTA ANASTACIO NERES", "Marta Anastácio Neres"],
  ["AQUILA DA SILVA FERNANDES", "Áquila da Silva Fernandes"],
  ["ANIBAL HAMU NETO", "Anibal Hamu Neto"],
  ["CLEIDE DE OLIVEIRA ALVES", "Cleide de Oliveira Alves"],
  ["FABIANE BEZERRA DE MOMEIRA DOS SANTOS", "Fabiane Bezerra de Momeira dos Santos"],
  ["INGRID ALVES DAPARECIDA", "Ingrid Alves D'Aparecida"],
  ["JOAO VITOR BRITO", "João Vitor Brito"],
  ["JONATAN CASTRO DA SILVA", "Jonatas Castro da Silva"],
  ["LETICIA SANTOS DA SILVA", "Leticia Santos da Silva Brito"],
  ["LUCAS RAMOS DE VICTORIA", "Lucas Ramos de Victória"],
  ["MARIA EDUARDA DAMASCENO", "Maria Eduarda Damasceno"],
  ["NATASHA LUCILIA BARBOSA", "Natasha Lucilía Barbosa"],
  ["MARIA DAIANA DA SILVA BRANDAO", "Maria Daiana da Silva Brandão"],
  ["NATALIA CRISTINA NERES DOS SANTOS", "Natália Cristina Neris dos Santos"]
]);
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const EXCLUDED_TEAM_KEYS = new Set([
  "EQUIPE PROPRIA 3 | FSA",
  "EQUIPE PROPRIA 3 | AGL",
  "CANAL VIRTUAL 1",
  "CANAL VIRTUAL 2",
  "CANAL VIRTUAL 3"
]);

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
  if (key === "LETICIA SANTOS DA SILVA") return "LETICIA SANTOS DA SILVA";
  if (key === "LUCAS RAMOS DA VICTORIA") return "LUCAS RAMOS DE VICTORIA";
  if (key === "MARIA EDUARDA VIEIRA DAMASCENO") return "MARIA EDUARDA DAMASCENO";
  if (key === "SANDRA SANTOS") return "SANDRA SANTANA DOS SANTOS";
  if (key === "ANA LUIZA ENTREPORTES") return "ANA LUIZA ENTREPONTES DA COSTA";
  if (key === "ANA LUIZA ENTREPORTES DA COSTA") return "ANA LUIZA ENTREPONTES DA COSTA";
  if (key === "ANA LUIZA ENTREPONTES DA COSTA") return "ANA LUIZA ENTREPONTES DA COSTA";
  if (key === "FABIANE BEZERRA MOREIRA DOS SANTOS") return "FABIANE BEZERRA DE MOMEIRA DOS SANTOS";
  if (key === "JOAO VITOR BRITO DE ANDRADE") return "JOAO VITOR BRITO";
  if (key === "JONATAS CASTRO DA SILVA") return "JONATAN CASTRO DA SILVA";
  if (key === "LUIS ALVES DOS SANTOS DA SILVA ROCCHA") return "LUIS ALVES DOS SANTOS DA SILVA ROCHA";
  if (key === "CLEIDE ALVES DE OLIVEIRA") return "CLEIDE DE OLIVEIRA ALVES";
  if (key === "EMANNUELLY CARVALHO") return "EMANNUELLY DO BOM PARTO SOUZA CARVALHO";
  if (key === "LETICIA MELO") return "LETICIA APARECIDA DE MELO GODINHO";
  if (key === "VIVIANE ARAUJO") return "VIVIANE MACHADO GOMES DE PEREIRA ARAUJO";
  if (key === "SAMARA DE MELO CRUZ EM CONTRATACAO") return "SAMARA DE MELO CRUZ";
  if (key === "JOSE RIBAMAR DA SILVA FREITAS FILHO") return "JOSE RIBAMAR";
  if (key === "NATALIA NOGUEIRA AGUIAR") return "NATHALIA NOGUEIRA AGUIAR";
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

function cleanPersonName(value) {
  return String(value || "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalTeam(value) {
  const raw = normalize(value);
  if (!raw) return "";
  if (raw === "CANAL 1" || raw.includes("CANAL 1 |")) return "CANAL 1";
  if (raw === "CANAL 2" || raw.includes("CANAL 2 |")) return "CANAL 2";
  if (raw === "CANAL 3" || raw.includes("CANAL CAT")) return "CANAL 3";
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
  if (team === "CANAL 1" || team === "CANAL 2" || team === "CANAL 3") return team;
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
  if (typeof value === "string") {
    const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const parsed = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
      return parsed.getFullYear() >= 2020 && parsed.getFullYear() <= 2035 ? parsed : null;
    }
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
  if (value === "CANAL 1" || value === "CANAL 2") return "AGL";
  if (value.includes("CAT")) return "CAT";
  if (value.includes("AGL") || value.includes("AGUAS LINDAS")) return "AGL";
  return "FSA";
}

function teamArea(team, fallbackArea = "") {
  const teamKey = canonicalTeam(team);
  if (teamKey === "CANAL 1" || teamKey === "CANAL 2") return "AGL";
  return fallbackArea || areaOf(teamKey);
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
  if (months <= 3) return 0.33;
  if (months <= 6) return 1.33;
  if (months <= 9) return 1.66;
  return 2;
}

function monthsBetween(start, period) {
  if (!start || !period) return null;
  const end = new Date(period.year, period.month - 1, 1);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  return Math.max(0, months);
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

function repasseProfile(repasses) {
  const count = Number(repasses || 0);
  if (count >= 3) return "Corretores Elite";
  if (count === 2) return "Corretores Produtores";
  if (count === 1) return "Corretores em Desenvolvimento";
  return "Corretores em Recuperação";
}

function profileBreakdown(people) {
  const labels = [
    "Corretores Elite",
    "Corretores Produtores",
    "Corretores em Desenvolvimento",
    "Corretores em Recuperação"
  ];
  const total = people.length || 0;
  const counts = Object.fromEntries(labels.map((label) => [label, 0]));
  for (const person of people) {
    const profile = repasseProfile(person.repassesMonth);
    counts[profile] = (counts[profile] || 0) + 1;
  }
  return Object.fromEntries(labels.map((label) => [
    label,
    { count: counts[label] || 0, percent: total ? Math.round(((counts[label] || 0) / total) * 100) : 0 }
  ]));
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
  const override = process.env.DASHBOARD_PERIOD || process.env.PROCESS_PERIOD;
  const match = override && String(override).match(/^(\d{4})-(\d{1,2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month >= 1 && month <= 12) {
      return { month, year, label: `${MONTHS[month - 1]}/${year}` };
    }
  }

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

function previousPeriod(period) {
  const month = period.month === 1 ? 12 : period.month - 1;
  const year = period.month === 1 ? period.year - 1 : period.year;
  return { month, year, label: `${MONTHS[month - 1]}/${year}` };
}

function parseMeta(metaPath, period = null) {
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
      const startDate = excelDate(row["DATA INICIO"]);
      const effectiveStart = startDate || new Date(2026, 5, 20);
      const months = !startDate && period ? monthsBetween(effectiveStart, period) : num(row["QTS MESES?"]);
      const currentGoal = row.META === "" ? suggestedGoal(months) : num(row.META);
      const goal = suggestedGoal(months);
      const ipc2026 = row["IPC 2026"] === "" ? null : num(row["IPC 2026"]);
      const diff = ipc2026 === null ? null : ipc2026 - (currentGoal || goal || 0);
      const key = personKey(row.CONSULTORES);
      if (EXCLUDED_PEOPLE_KEYS.has(key)) return null;
      const team = displayTeam(row["IMOBILIARIA MAIO"] || row.IMOBILIARIA);
      const info = classify(diff, months, row["SITUACAO ?"]);
      return {
        name: titleName(row.CONSULTORES),
        key,
        team,
        area: areaOf(team),
        start: startDate ? startDate.toLocaleDateString("pt-BR") : "novato",
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
        repassesPreviousMonth: 0,
        repassesMonth: 0,
        reservasMonth: 0,
        pastasMonth: 0,
        canceladosMonth: 0,
        distratosMonth: 0,
        ...info
      };
    })
    .filter(Boolean);

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
    if (!options.ignoreDate) {
      if (!date || date.getFullYear() !== options.year) continue;
      if (!options.yearOnly && date.getMonth() + 1 !== options.month) continue;
    }
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

function countMonthlyByPerson(filePath, period) {
  const monthly = new Map();
  if (!filePath) return monthly;
  const rows = readRows(filePath);
  const headers = rows[0].map(normalize);
  const objects = rowObjects(rows, 0);
  const personCol = headers.find((h) => h.includes("CORRETOR") && !h.includes("COMISSAO")) || "CORRETOR";
  const teamCol = headers.find((h) => h === "IMOBILIARIA") || "IMOBILIARIA";
  const statusCol = headers.find((h) => h.includes("SITUACAO")) || "SITUACAO";
  const dateCol = headers.find((h) => h.includes("ASSINATURA")) || "DATA";

  for (const row of objects) {
    const date = excelDate(row[dateCol]);
    if (!date || date.getFullYear() !== period.year || date.getMonth() + 1 > period.month) continue;
    const status = normalize(row[statusCol]);
    if (status.includes("DISTRATO") || status.includes("CANCEL")) continue;
    const team = canonicalTeam(row[teamCol]);
    const basePerson = personKey(row[personCol]);
    const person = team.includes("IMOBILIARIAS") ? `${basePerson}__${team}` : basePerson;
    if (!person) continue;
    if (!monthly.has(person)) monthly.set(person, Array.from({ length: period.month }, () => 0));
    monthly.get(person)[date.getMonth()] += 1;
  }
  return monthly;
}

function qlpArea(value) {
  const raw = normalize(value);
  if (raw.includes("AGUAS LINDAS")) return "AGL";
  if (raw.includes("CATALAO") || raw.includes("CAT")) return "CAT";
  return "FSA";
}

function qlpTeamName(team, area) {
  const raw = normalize(team);
  if (!raw || raw.includes("VAGA")) return "";
  if (raw.includes("CANAL CAT")) return "CANAL CAT";
  return `${team} | ${area}`;
}

function parseQlpStructure(structurePath) {
  const people = new Map();
  const teams = new Map();
  const managerMap = new Map();
  const rows = readRows(structurePath, "QLP");
  if (rows.length < 4) return { people, teams, managerMap };

  const maxColumns = Math.max(...rows.slice(0, 4).map((row) => row.length));
  for (let col = 1; col < maxColumns; col += 1) {
    const area = qlpArea(rows[0]?.[col]);
    const rawTeam = qlpTeamName(rows[2]?.[col], area);
    const team = displayTeam(rawTeam);
    if (!team) continue;

    const rawManager = rows[1]?.[col];
    const manager = normalize(rawManager).includes("VAGA") || normalize(rawManager).includes("EM ABERTO")
      ? "-"
      : titleName(rawManager || "-");
    const teamKey = canonicalTeam(team);
    const teamInfo = {
      team,
      area,
      manager,
      storeManager: "-",
      salesManager: manager,
      managerCpf: "",
      storeManagerCpf: ""
    };
    teams.set(teamKey, teamInfo);
    managerMap.set(teamKey, manager);

    for (const row of rows.slice(3)) {
      if (typeof row[0] !== "number") continue;
      const rawName = cleanPersonName(row[col]);
      const normalizedName = normalize(rawName);
      if (!rawName || /^\d+$/.test(rawName) || normalizedName.includes("VAGA") || normalizedName.includes("CONGELADA")) continue;
      const key = personKey(rawName);
      if (!key) continue;
      if (EXCLUDED_PEOPLE_KEYS.has(key)) continue;
      people.set(key, {
        ...teamInfo,
        name: titleName(rawName),
        key,
        role: "",
        cpf: ""
      });
    }
  }

  return { people, teams, managerMap };
}

function parseStructure(structurePath) {
  const people = new Map();
  const teams = new Map();
  const managerMap = new Map();
  if (!structurePath) return { people, teams, managerMap };
  let rows;
  try {
    const workbook = XLSX.readFile(structurePath, { cellDates: true });
    if (workbook.SheetNames.some((name) => normalize(name) === "QLP")) return parseQlpStructure(structurePath);
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
        name: titleName(cleanPersonName(row.CORRETOR)),
        key,
        role: row["CARGO CORRETOR"] || "",
        cpf: row["CPF CORRETOR"] || ""
      });
    }
  }
  return { people, teams, managerMap };
}

function parseEntryDates(collaboratorsPath) {
  const entries = new Map();
  if (!collaboratorsPath) return entries;
  let rows;
  try {
    const workbook = XLSX.readFile(collaboratorsPath, { cellDates: true });
    const sheet = workbook.Sheets.Colaboradores || workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  } catch {
    return entries;
  }
  const headerIndex = findHeaderRow(rows, ["FUNCIONARIO", "ADMISSAO"]);
  if (headerIndex < 0) return entries;
  const headers = rows[headerIndex].map(normalize);
  const nameIndex = headers.indexOf("FUNCIONARIO");
  const entryIndex = headers.indexOf("ADMISSAO");
  for (const row of rows.slice(headerIndex + 1)) {
    const key = personKey(row[nameIndex]);
    const entryDate = excelDate(row[entryIndex]);
    if (key && entryDate) entries.set(key, entryDate);
  }
  return entries;
}

function applyEntryDates(people, entryDates, period) {
  if (!entryDates || !entryDates.size) return people;
  for (const person of people) {
    const entryDate = entryDates.get(person.key);
    if (!entryDate) continue;
    const months = monthsBetween(entryDate, period);
    const goal = suggestedGoal(months);
    const wasNovato = person.start === "novato";
    person.start = entryDate.toLocaleDateString("pt-BR");
    person.months = months;
    person.suggestedGoal = goal;
    if (person.currentGoal === null || person.currentGoal === undefined || wasNovato || normalize(person.status).includes("ADMISSAO")) {
      person.currentGoal = goal;
    }
    person.diff = person.ipc2026 === null || person.ipc2026 === undefined ? null : person.ipc2026 - (person.currentGoal || goal || 0);
    const info = classify(person.diff, months, person.status);
    Object.assign(person, info);
  }
  return people;
}

function applyStructure(people, managerMap, structure, period = null) {
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
    const months = monthsBetween(new Date(2026, 5, 20), period) ?? 0;
    const goal = suggestedGoal(months);
    people.push({
      name: structured.name,
      key,
      team: structured.team,
      area: structured.area,
      cpf: structured.cpf || "",
      role: structured.role || "",
      start: "novato",
      months,
      y2024: 0,
      y2025: 0,
      y2026: 0,
      ipc2024: null,
      ipc2025: null,
      ipc2026: null,
      currentGoal: goal,
      suggestedGoal: goal,
      diff: null,
      repassesMonth: 0,
      repassesPreviousMonth: 0,
      reservasMonth: 0,
      pastasMonth: 0,
      canceladosMonth: 0,
      distratosMonth: 0,
      status: "admissão",
      statusClass: "neutral",
      profile: "admissão",
      action: "Acompanhar integração"
    });
  }
  for (const [teamKey, manager] of structure.managerMap) {
    managerMap.set(teamKey, manager);
  }
  return { people, managerMap };
}

function countRealtyReservations(filePath, period, excludeCodes = new Set(), options = {}) {
  const rows = readRows(filePath);
  const groups = new Map();
  const totals = new Map();

  for (const row of rows.slice(1)) {
    const date = excelDate(row[2]);
    if (!options.ignoreDate && (!date || date.getMonth() + 1 !== period.month || date.getFullYear() !== period.year)) continue;
    const status = normalize(row[4]);
    if (!status || status.includes("CANCEL") || status.includes("DISTRATO")) continue;
    if (options.include && !options.include.some((wanted) => status.includes(wanted))) continue;
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

function mergeCounts(people, repasseCounts, reservaCounts, cancelCounts, distratoCounts, previousRepasseCounts = null, pastaCounts = null) {
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
      area: teamArea(teamKey),
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
      repassesPreviousMonth: 0,
      repassesMonth: 0,
      reservasMonth: 0,
      pastasMonth: 0,
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
  for (const [key, count] of previousRepasseCounts?.counts || []) {
    const person = byKey.get(key) || ensurePerson(key, previousRepasseCounts);
    if (person) person.repassesPreviousMonth = count;
  }
  for (const [key, count] of reservaCounts.counts) {
    const person = byKey.get(key) || ensurePerson(key, reservaCounts);
    if (person) person.reservasMonth = count;
  }
  for (const [key, count] of pastaCounts?.counts || []) {
    const person = byKey.get(key) || ensurePerson(key, pastaCounts);
    if (person) person.pastasMonth = count;
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

function applyYearRepasses(people, yearRepasses, period) {
  if (!yearRepasses || !yearRepasses.counts) return people;
  const byKey = new Map(people.map((person) => [person.key, person]));
  const denominator = period.year === new Date().getFullYear()
    ? Math.max(1, period.month)
    : 12;
  for (const [key, count] of yearRepasses.counts) {
    const person = byKey.get(key);
    if (!person) continue;
    person.y2026 = Math.max(person.y2026 || 0, count);
    person.ipc2026 = count / denominator;
    person.diff = person.ipc2026 - (person.currentGoal || person.suggestedGoal || 0);
    const info = classify(person.diff, person.months, person.status);
    Object.assign(person, info);
  }
  return people;
}

function buildDashboard(people, managerMap, files, period, repasseTeamCounts = new Map(), realtyReservations = { totals: new Map(), details: [] }, repasseAreaCounts = new Map(), structure = { teams: new Map() }, entryDates = new Map(), yearRepasses = null, monthlyRepasses = new Map()) {
  for (const [teamKey, manager] of TEAM_MANAGER_OVERRIDES) {
    managerMap.set(teamKey, manager);
  }
  for (const person of people) {
    const teamOverride = PERSON_TEAM_OVERRIDES.get(person.key);
    if (teamOverride) {
      person.team = displayTeam(teamOverride);
      person.area = teamArea(teamOverride);
    }
    const displayOverride = PERSON_DISPLAY_OVERRIDES.get(person.key);
    if (displayOverride) person.name = displayOverride;
  }
  people = people.filter((person) => {
    const teamKey = canonicalTeam(person.team);
    if (EXCLUDED_TEAM_KEYS.has(teamKey)) return false;
    const allowed = TEAM_MEMBER_ALLOWLIST.get(teamKey);
    return !allowed || allowed.has(person.key);
  });
  const dedupedPeople = [];
  const peopleByKey = new Map();
  for (const person of people) {
    const existing = peopleByKey.get(person.key);
    if (!existing) {
      peopleByKey.set(person.key, person);
      dedupedPeople.push(person);
      continue;
    }
    existing.repassesMonth += person.repassesMonth || 0;
    existing.repassesPreviousMonth += person.repassesPreviousMonth || 0;
    existing.reservasMonth += person.reservasMonth || 0;
    existing.pastasMonth += person.pastasMonth || 0;
    existing.canceladosMonth += person.canceladosMonth || 0;
    existing.distratosMonth += person.distratosMonth || 0;
  }
  people = dedupedPeople;
  for (const [teamKey, allowed] of TEAM_MEMBER_ALLOWLIST) {
    for (const personKey of allowed) {
      if (peopleByKey.has(personKey)) continue;
      const months = monthsBetween(new Date(2026, 5, 20), period) ?? 0;
      const goal = suggestedGoal(months);
      const person = {
        name: PERSON_DISPLAY_OVERRIDES.get(personKey) || titleName(personKey),
        key: personKey,
        team: displayTeam(teamKey),
        area: teamArea(teamKey),
        start: "novato",
        months,
        y2024: 0,
        y2025: 0,
        y2026: 0,
        ipc2024: null,
        ipc2025: null,
        ipc2026: null,
        currentGoal: goal,
        suggestedGoal: goal,
        diff: null,
        repassesPreviousMonth: 0,
        repassesMonth: 0,
        reservasMonth: 0,
        pastasMonth: 0,
        canceladosMonth: 0,
        distratosMonth: 0,
        status: "admissão",
        statusClass: "neutral",
        profile: "admissão",
        action: "Acompanhar integração"
      };
      people.push(person);
      peopleByKey.set(personKey, person);
    }
  }
  applyYearRepasses(people, yearRepasses, period);
  applyEntryDates(people, entryDates, period);
  for (const person of people) {
    if (normalize(person.team).includes("IMOBILIARIA")) continue;
    person.profile = repasseProfile(person.repassesPreviousMonth);
    person.monthlyRepasses = monthlyRepasses.get(person.key) || Array.from({ length: period.month }, () => 0);
  }

  const teamMap = new Map();
  for (const [teamKey, team] of structure.teams || new Map()) {
    if (EXCLUDED_TEAM_KEYS.has(teamKey)) continue;
    teamMap.set(teamKey, {
      name: team.team,
      area: teamArea(teamKey, team.area),
      manager: managerMap.get(teamKey) || team.manager,
      people: []
    });
  }
  for (const person of people) {
    const teamKey = canonicalTeam(person.team);
    if (!teamMap.has(teamKey)) {
      teamMap.set(teamKey, {
        name: person.team,
        area: teamArea(teamKey),
        manager: managerMap.get(teamKey) || "-",
        people: []
      });
    }
    teamMap.get(teamKey).people.push(person);
  }
  for (const [teamKey] of repasseTeamCounts) {
    if (teamKey.includes("DF")) continue;
    if (EXCLUDED_TEAM_KEYS.has(teamKey)) continue;
    if (!teamMap.has(teamKey)) {
      teamMap.set(teamKey, {
        name: displayTeam(teamKey),
        area: teamArea(teamKey),
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
        area: teamArea(teamKey),
        manager: "Imobiliárias",
        people: []
      });
    }
  }
  for (const team of REQUIRED_TEAMS) {
    if (teamMap.has(team.key)) continue;
    teamMap.set(team.key, {
      name: displayTeam(team.key),
      area: team.area,
      manager: managerMap.get(team.key) || "-",
      people: []
    });
  }

  const teams = [...teamMap.values()].map((team) => {
    const active = team.people.filter((p) => normalize(p.status) !== "SEM META");
    const productionActive = active.filter(isActiveForProduction);
    const above = active.filter((p) => p.diff !== null && p.diff >= 0).length;
    const below = active.filter((p) => p.diff !== null && p.diff < 0).length;
    const critical = active.filter((p) => p.diff !== null && p.diff <= -1).length;
    const teamGoal = Number(active.reduce((sum, p) => sum + (p.currentGoal || p.suggestedGoal || 0), 0).toFixed(2));
    const suggestedGoalTotal = Number(active.reduce((sum, p) => sum + (p.suggestedGoal || 0), 0).toFixed(2));
    const peopleRepasses = active.reduce((sum, p) => sum + p.repassesMonth, 0);
    const teamCount = repasseTeamCounts.get(canonicalTeam(team.name));
    const repasses = teamCount === undefined ? peopleRepasses : teamCount;
    const realtyReservaCount = realtyReservations.totals.get(displayTeam(canonicalTeam(team.name)));
    const reservas = realtyReservaCount === undefined ? active.reduce((sum, p) => sum + p.reservasMonth, 0) : realtyReservaCount;
    const pastas = active.reduce((sum, p) => sum + (p.pastasMonth || 0), 0);
    const cancelados = active.reduce((sum, p) => sum + p.canceladosMonth, 0);
    const distratos = active.reduce((sum, p) => sum + p.distratosMonth, 0);
    const ipcYear = avg(productionActive.map((p) => p.ipc2026));
    const ipcMonth = productionActive.length ? peopleRepasses / productionActive.length : null;
    const profiles = profileBreakdown(productionActive.map((person) => ({
      ...person,
      repassesMonth: person.repassesPreviousMonth
    })));
    const monthlyPerformance = Array.from({ length: period.month }, (_, monthIndex) => {
      const count = active.reduce((sum, p) => sum + (p.monthlyRepasses?.[monthIndex] || 0), 0);
      const ipc = monthIndex + 1 === period.month ? 1.5 : productionActive.length ? count / productionActive.length : 0;
      return {
        label: `${String(monthIndex + 1).padStart(2, "0")}/${String(period.year).slice(-2)}`,
        count,
        ipc
      };
    });
    return { ...team, above, below, critical, teamGoal, suggestedGoalTotal, repasses, reservas, pastas, cancelados, distratos, ipcYear, ipcMonth, activePeople: productionActive.length, profiles, monthlyPerformance };
  });
  const anaIndex = teams.findIndex((team) => canonicalTeam(team.name) === "EQUIPE PROPRIA | AGL");
  const josueAglIndex = teams.findIndex((team) => canonicalTeam(team.name) === "EQUIPE PROPRIA 2 | AGL");
  if (anaIndex >= 0 && josueAglIndex >= 0 && josueAglIndex !== anaIndex + 1) {
    const [josueAgl] = teams.splice(josueAglIndex, 1);
    const targetIndex = teams.findIndex((team) => canonicalTeam(team.name) === "EQUIPE PROPRIA | AGL");
    teams.splice(targetIndex + 1, 0, josueAgl);
  }
  function moveTeamAfter(teamKey, afterKey) {
    const currentIndex = teams.findIndex((team) => canonicalTeam(team.name) === teamKey);
    const afterIndex = teams.findIndex((team) => canonicalTeam(team.name) === afterKey);
    if (currentIndex < 0 || afterIndex < 0 || currentIndex === afterIndex + 1) return;
    const [team] = teams.splice(currentIndex, 1);
    const targetIndex = teams.findIndex((item) => canonicalTeam(item.name) === afterKey);
    teams.splice(targetIndex + 1, 0, team);
  }
  moveTeamAfter("IMOBILIARIAS | FSA", "AUTONOMOS 2 | FSA");
  moveTeamAfter("IMOBILIARIAS | AGL", "EQUIPE PROPRIA 2 | AGL");
  moveTeamAfter("IMOBILIARIAS | CAT", "EQUIPE PROPRIA | CAT");

  const areaTotals = ["FSA", "AGL", "CAT"].map((area) => {
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
  const activeProductionPeople = productionTeams.flatMap((team) => team.people.filter(isActiveForProduction));
  const activePeople = activeProductionPeople.length;
  const teamRepasses = productionTeams.reduce((sum, team) => sum + team.people.reduce((personSum, person) => personSum + person.repassesMonth, 0), 0);
  const ipcYear = avg(productionTeams.flatMap((team) => team.people.filter(isActiveForProduction).map((p) => p.ipc2026)));
  const ipcMonth = activePeople ? teamRepasses / activePeople : null;
  const profiles = profileBreakdown(activeProductionPeople.map((person) => ({
    ...person,
    repassesMonth: person.repassesPreviousMonth
  })));

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
    suggestedGoal: team.suggestedGoalTotal || 0,
    repasses: team.repasses,
    reservas: team.reservas,
    pastas: team.pastas,
    ipcYear: team.ipcYear,
    ipcMonth: team.ipcMonth,
    cancelados: team.cancelados,
    distratos: team.distratos,
    profiles: team.profiles
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
      pastas: p.pastasMonth || 0,
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
      brokerCount: activePeople,
      profiles,
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
  const reservaRows = readRows(paths.reserva);
  const period = detectPeriod(savedFiles, [readRows(paths.meta), reservaRows]);
  const meta = parseMeta(paths.meta, period);
  const structure = parseStructure(paths.structure);
  const entryDates = parseEntryDates(paths.collaborators);
  const structured = applyStructure(meta.people, parseManagers(paths.meta), structure, period);
  const managerMap = structured.managerMap;
  const repasses = countByPerson(paths.repasse, {
    month: period.month,
    year: period.year,
    dateHints: ["ASSINATURA"],
    reject: ["DISTRATO", "CANCEL"]
  });
  const previous = previousPeriod(period);
  const previousRepasses = countByPerson(paths.repasse, {
    month: previous.month,
    year: previous.year,
    dateHints: ["ASSINATURA"],
    reject: ["DISTRATO", "CANCEL"]
  });
  const yearRepasses = countByPerson(paths.repasse, {
    month: period.month,
    year: period.year,
    yearOnly: true,
    dateHints: ["ASSINATURA"],
    reject: ["DISTRATO", "CANCEL"]
  });
  const monthlyRepasses = countMonthlyByPerson(paths.repasse, period);
  const reservas = countByPerson(paths.reserva, {
    month: period.month,
    year: period.year,
    dateHints: ["DATA"],
    ignoreDate: true,
    include: ["EM PROCESSO", "CREDITO", "SECRETARIA DE VENDAS"],
    reject: [],
    excludeCodes: repasses.codes,
    requireActive: (status) => status !== ""
  });
  const pastas = countByPerson(paths.reserva, {
    month: period.month,
    year: period.year,
    dateHints: ["DATA"],
    ignoreDate: true,
    include: ["SECRETARIA DE VENDAS"],
    reject: [],
    excludeCodes: repasses.codes,
    requireActive: (status) => status !== ""
  });
  for (const [personKey, minimum] of MANUAL_RESERVATION_MINIMUMS) {
    reservas.counts.set(personKey, Math.max(reservas.counts.get(personKey) || 0, minimum));
  }
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
  const realtyReservations = countRealtyReservations(paths.reserva, period, repasses.codes, {
    ignoreDate: true,
    include: ["EM PROCESSO", "CREDITO", "SECRETARIA DE VENDAS"]
  });
  const people = mergeCounts(structured.people, repasses, reservas, cancelados, distratos, previousRepasses, pastas);
  return buildDashboard(people, managerMap, savedFiles, period, repasses.teamCounts, realtyReservations, repasses.areaCounts, structure, entryDates, yearRepasses, monthlyRepasses);
}

module.exports = { processExcelFiles, normalize, fmt };
