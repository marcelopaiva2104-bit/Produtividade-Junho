# Produtividade Junho

Dashboard de produtividade para acompanhamento de gerentes, imobiliárias e corretores.

## Links locais

- Dashboard estático: `dashboard-produtividade-atualizado.html`
- Servidor local: `npm start` e acessar `http://localhost:3000/dashboard-produtividade-atualizado.html`

## Atualização da base

1. Coloque os arquivos `Repasse.*.xlsx` e `reserva.*.xlsx` na raiz do projeto.
2. Rode `npm run process:local`.
3. O arquivo `data/latest-dashboard.json` será atualizado e o dashboard estático será exportado automaticamente para a raiz e para `public/`.
4. Para exportar novamente usando apenas a base JSON atual, rode `npm run export:static`.
5. Para forçar uma competência, rode no PowerShell: `$env:DASHBOARD_PERIOD='2026-06'; npm.cmd run process:local`.
6. Para junho/2026, também é possível rodar `npm run process:june`.

## Arquitetura

- `api/`: endpoints locais/Vercel para dados e upload.
- `lib/`: leitura das planilhas, regras de negócio e armazenamento.
- `scripts/`: processamento local dos arquivos Excel.
- `public/`: páginas, CSS e JS do dashboard/admin.
- `data/`: snapshot atual do dashboard.
