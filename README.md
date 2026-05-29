# Produtividade Junho

Dashboard de produtividade para acompanhamento de gerentes, imobiliárias e corretores.

## Links locais

- Dashboard estático: `dashboard-produtividade-atualizado.html`
- Servidor local: `npm start` e acessar `http://localhost:3000/dashboard-produtividade-atualizado.html`

## Atualização da base

1. Coloque os arquivos `Repasse.*.xlsx` e `reserva.*.xlsx` na raiz do projeto.
2. Rode `npm run process:local`.
3. O arquivo `data/latest-dashboard.json` será atualizado.
4. Gere/atualize o HTML estático antes de publicar.

## Arquitetura

- `api/`: endpoints locais/Vercel para dados e upload.
- `lib/`: leitura das planilhas, regras de negócio e armazenamento.
- `scripts/`: processamento local dos arquivos Excel.
- `public/`: páginas, CSS e JS do dashboard/admin.
- `data/`: snapshot atual do dashboard.
