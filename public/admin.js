async function loadStatus() {
  const response = await fetch("/api/data", { cache: "no-store" });
  const data = await response.json();
  const rows = (data.files || []).map((file) => `<tr><td>${file.kind}</td><td><strong>${file.originalName}</strong></td><td>${file.storagePath}</td></tr>`).join("");
  document.getElementById("fileStatus").innerHTML = `<table class="sheet-table summary-table">
    <thead><tr><th>Tipo</th><th>Arquivo</th><th>Destino</th></tr></thead>
    <tbody>${rows || "<tr><td colspan='3'>Nenhum arquivo processado ainda.</td></tr>"}</tbody>
  </table>`;
}

document.getElementById("uploadForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("uploadStatus");
  status.className = "upload-status";
  status.textContent = "Processando...";

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: new FormData(event.currentTarget)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Erro ao processar arquivos.");
    status.className = "upload-status ok-message";
    status.textContent = `Base atualizada em ${new Date(result.dashboard.updatedAt).toLocaleString("pt-BR")}.`;
    event.currentTarget.reset();
    await loadStatus();
  } catch (error) {
    status.className = "upload-status error-message";
    status.textContent = error.message;
  }
});

loadStatus();
