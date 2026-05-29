const { getLatestDashboard } = require("../lib/storage");

module.exports = async function handler(req, res) {
  try {
    res.setHeader("Cache-Control", "no-store");
    const payload = await getLatestDashboard();
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message || "Erro ao carregar dashboard." });
  }
};
