const path = require("path");
const fs = require("fs");
const { processExcelFiles } = require("../lib/excelProcessor");
const { saveDashboard } = require("../lib/storage");
const { exportStaticDashboard } = require("./export-static-dashboard");

function latestFile(root, prefixes) {
  const list = Array.isArray(prefixes) ? prefixes : [prefixes];
  const candidates = fs.readdirSync(root)
    .filter((name) => list.some((prefix) => name.toLowerCase().startsWith(prefix.toLowerCase())) && name.toLowerCase().endsWith(".xlsx"))
    .map((name) => ({ name, time: fs.statSync(path.join(root, name)).mtimeMs }))
    .sort((a, b) => b.time - a.time);
  if (!candidates.length) throw new Error(`Arquivo não encontrado: ${list.join(" ou ")}*.xlsx`);
  return path.join(root, candidates[0].name);
}

async function main() {
  const root = process.cwd();
  const files = {
    meta: path.join(root, "Meta.IPC.repasses.v2.xlsx"),
    structure: path.join(root, "QLP - Taveira.xlsx"),
    collaborators: path.join(root, "Colaboradores.cooretores.data entrada.xlsx"),
    repasse: latestFile(root, ["Repasse.", "repasses."]),
    reserva: latestFile(root, "reserva.")
  };
  const dashboard = await processExcelFiles(files, [
    { kind: "meta", originalName: path.basename(files.meta), storagePath: files.meta },
    { kind: "structure", originalName: path.basename(files.structure), storagePath: files.structure },
    { kind: "collaborators", originalName: path.basename(files.collaborators), storagePath: files.collaborators },
    { kind: "repasse", originalName: path.basename(files.repasse), storagePath: files.repasse },
    { kind: "reserva", originalName: path.basename(files.reserva), storagePath: files.reserva }
  ]);
  await saveDashboard(dashboard);
  const outputs = exportStaticDashboard();
  console.log(`Dashboard gerado: ${dashboard.metrics.total}/${dashboard.metrics.goal} (${dashboard.periodLabel})`);
  console.log(`HTML estatico sincronizado: ${outputs.map((file) => path.relative(root, file)).join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
