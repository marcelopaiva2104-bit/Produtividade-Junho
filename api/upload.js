const { formidable } = require("formidable");
const path = require("path");
const { processExcelFiles } = require("../lib/excelProcessor");
const { saveDashboard, saveUploadedFile } = require("../lib/storage");

exports.config = {
  api: {
    bodyParser: false
  }
};

function parseForm(req) {
  const form = formidable({
    multiples: false,
    maxFileSize: 20 * 1024 * 1024,
    filter: (part) => part.mimetype?.includes("spreadsheet") || part.originalFilename?.endsWith(".xlsx")
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) reject(error);
      else resolve({ fields, files });
    });
  });
}

function single(files, key) {
  const file = files[key];
  return Array.isArray(file) ? file[0] : file;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  try {
    const { fields, files } = await parseForm(req);
    const configuredPassword = process.env.ADMIN_PASSWORD || "Mr150782";
    const password = Array.isArray(fields.password) ? fields.password[0] : fields.password;
    if (!password || password !== configuredPassword) {
      res.status(401).json({ error: "Senha inválida." });
      return;
    }

    const repasse = single(files, "repasse");
    const reserva = single(files, "reserva");
    if (!repasse || !reserva) {
      res.status(400).json({ error: "Envie os 2 arquivos: Repasse e Reserva." });
      return;
    }

    const savedFiles = [];
    savedFiles.push({
      kind: "meta",
      originalName: "Meta.IPC.repasses.v2.xlsx",
      storagePath: path.join(process.cwd(), "Meta.IPC.repasses.v2.xlsx")
    });
    savedFiles.push({
      kind: "structure",
      originalName: "Estrutura_Time_Com_CPFs_CAT.xlsx",
      storagePath: path.join(process.cwd(), "Estrutura_Time_Com_CPFs_CAT.xlsx")
    });
    savedFiles.push(await saveUploadedFile("repasse", repasse));
    savedFiles.push(await saveUploadedFile("reserva", reserva));

    const dashboard = await processExcelFiles({
      meta: path.join(process.cwd(), "Meta.IPC.repasses.v2.xlsx"),
      structure: path.join(process.cwd(), "Estrutura_Time_Com_CPFs_CAT.xlsx"),
      repasse: repasse.filepath,
      reserva: reserva.filepath
    }, savedFiles);
    await saveDashboard(dashboard);

    res.status(200).json({ ok: true, dashboard });
  } catch (error) {
    res.status(500).json({ error: error.message || "Erro ao processar arquivos." });
  }
};
