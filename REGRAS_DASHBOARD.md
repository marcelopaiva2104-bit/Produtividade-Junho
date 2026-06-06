# Regras de negocio e definicoes de KPIs do dashboard

Este documento descreve as regras usadas para montar o dashboard de produtividade gerado por `npm run process:local` e `npm run process:june`.

## Fontes de dados

O processamento local usa os arquivos da pasta do projeto:

- `Meta.IPC.repasses.v2.xlsx`: base de metas, historico de IPC, anos anteriores e situacao inicial dos corretores.
- `QLP - Taveira.xlsx`: estrutura de times, areas, gerentes e corretores.
- `Colaboradores.cooretores.data entrada.xlsx`: data de entrada/admissao dos colaboradores.
- `Repasse.*.xlsx`: arquivo mais recente de repasses encontrado na pasta.
- `reserva.*.xlsx`: arquivo mais recente de reservas encontrado na pasta.

O resultado consolidado e salvo em:

- `data/latest-dashboard.json`
- `dashboard-produtividade-atualizado.html`
- `public/dashboard-produtividade-atualizado.html`
- `public/index.html`
- `dashboard-produtividade-atualizado.pdf`, quando o PDF e gerado.

## Periodo do dashboard

O periodo pode ser forçado por variavel de ambiente:

- `DASHBOARD_PERIOD=AAAA-MM`
- `PROCESS_PERIOD=AAAA-MM`

No comando `npm run process:june`, o periodo e fixado como `2026-06`.

Se nenhum periodo for informado, o script tenta detectar o mes/ano mais recente pelas datas das planilhas.

## Areas e metas gerais

As areas consideradas no quadro-resumo sao:

| Area | Meta time | Meta imobiliaria | Meta total |
| --- | ---: | ---: | ---: |
| FSA | 35 | 10 | 45 |
| AGL | 32 | 5 | 37 |
| CAT | 25 | 25 | 50 |

Meta geral = soma das metas totais das areas.

No cenario atual:

`45 + 37 + 50 = 132`

## Repasses do mes atual

Fonte: `Repasse.*.xlsx`.

Regra:

- Usa a coluna de data que contenha `ASSINATURA`.
- Conta apenas registros do mes/ano do periodo do dashboard.
- Ignora linhas cuja situacao contenha `DISTRATO` ou `CANCEL`.
- Agrupa por corretor.
- Agrupa tambem por time/canal/imobiliaria.
- Para imobiliarias, a chave do registro separa pessoa/origem e time para nao misturar imobiliarias de areas diferentes.

Campo no corretor:

- `repassesMonth`

Campo no time:

- `repasses`

## Repasses de maio

Fonte: `Repasse.*.xlsx`.

Regra:

- Usa o mes anterior ao periodo do dashboard.
- Para Junho/2026, puxa Maio/2026.
- Usa a mesma regra de filtro dos repasses do mes atual: data de `ASSINATURA`, rejeitando `DISTRATO` e `CANCEL`.

Campo no corretor:

- `repassesPreviousMonth`

Na tabela do dashboard, aparece como coluna `Repasses de maio`, antes de `Meta atual`.

## Repasses acumulados de 2026

Fonte: `Repasse.*.xlsx`.

Regra:

- Conta todos os repasses do ano do periodo, nao apenas do mes.
- Usa a coluna de data de `ASSINATURA`.
- Rejeita situacoes com `DISTRATO` ou `CANCEL`.

Campos do corretor:

- `y2026`: total anual usado no dashboard.
- `ipc2026`: `y2026 / denominador`.

Denominador:

- Se o ano do dashboard for o ano atual do processamento, usa o numero do mes do periodo.
- Para Junho/2026, denominador = `6`.
- Caso contrario, usa `12`.

Exemplo:

`ipc2026 = repasses acumulados em 2026 / 6`

## Reservas do mes atual

Fonte: `reserva.*.xlsx`.

Apesar do nome visual ser "Reservas do mes atual", a regra atual considera reservas ativas de pipeline, sem limitar por data.

Situacoes consideradas:

- `EM PROCESSO`
- `CREDITO`
- `SECRETARIA DE VENDAS`

Regra:

- Usa a coluna de corretor.
- Usa a coluna de situacao.
- Nao filtra por data.
- Exclui reservas cujo codigo ja esteja no arquivo de repasses do mes atual, para evitar duplicidade entre venda finalizada e reserva ativa.
- Rejeita linhas sem situacao.

Campo no corretor:

- `reservasMonth`

Campo no time:

- `reservas`

## Reservas ativas de imobiliarias

Fonte: `reserva.*.xlsx`.

Regra:

- Tambem considera `EM PROCESSO`, `CREDITO` e `SECRETARIA DE VENDAS`.
- Nao limita por data.
- Agrupa por area e origem/imobiliaria.
- Exclui reservas ja convertidas em repasse do mes atual quando aplicavel.
- Ignora canais diferentes de `IMOBILIARIAS | FSA` e `IMOBILIARIAS | AGL` na rotina especifica de detalhes de reservas de imobiliarias.

Saida visual:

- Tabela `Reservas ativas das imobiliarias`.

## Cancelados e distratos

Fonte: `reserva.*.xlsx`.

Cancelados:

- Filtra pelo mes/ano do dashboard.
- Inclui situacoes que contenham `CANCEL`.

Distratos:

- Filtra pelo mes/ano do dashboard.
- Inclui situacoes que contenham `DISTRATO`.

Campos:

- `canceladosMonth`
- `distratosMonth`

## Data de entrada e meses de casa

Fonte principal:

- `Colaboradores.cooretores.data entrada.xlsx`, aba `Colaboradores`.

Colunas usadas:

- `FUNCIONARIO`
- `ADMISSAO`

Regra:

- O nome do colaborador e normalizado para bater com o nome do dashboard.
- A data de admissao substitui a data da base de metas quando encontrada.
- Meses de casa = diferenca entre o mes do periodo e o mes de admissao, contando o mes inicial.

Exemplo:

- Entrada em `01/10/2024`
- Periodo `Junho/2026`
- Meses = `21`

## Meta atual e meta sugerida por tempo de casa

A meta sugerida e definida por meses de casa:

| Meses de casa | Meta IPC |
| ---: | ---: |
| 0 a 3 | 0,33 |
| 4 a 6 | 1,33 |
| 7 a 9 | 1,66 |
| 10 ou mais | 2,00 |

Regra:

- `suggestedGoal` sempre segue a tabela acima.
- `currentGoal` vem da coluna `META` da planilha de metas quando preenchida.
- Se a meta atual estiver vazia, ou se o corretor foi criado como novato/admissao pelo sistema, `currentGoal` recebe a meta sugerida.
- Novatos/admissao ficam com meta inicial `0,33`.

## IPC

IPC e o indicador de produtividade por corretor.

Campos historicos:

- `ipc2024`: vem da base de metas.
- `ipc2025`: vem da base de metas.
- `ipc2026`: recalculado pelos repasses acumulados do ano.

Formula atual de 2026:

`IPC 2026 = repasses acumulados no ano / numero de meses do periodo`

Para Junho/2026:

`IPC 2026 = repasses de 2026 / 6`

IPC do mes do time:

`IPC do mes = repasses do mes atual do time / corretores ativos para producao`

IPC 2026 do time:

Media do `ipc2026` dos corretores ativos para producao.

IPC geral do dashboard:

Media do `ipc2026` dos corretores ativos para producao, excluindo imobiliarias.

## Diferenca contra meta

Campo:

- `diff`

Formula:

`diff = ipc2026 - meta atual`

Se nao houver IPC, a diferenca fica sem calculo.

## Classificacao do corretor

Regras:

- Se a situacao contem `AFAST`: `Sem meta`.
- Se meses de casa < 1: `admissao`.
- Se nao ha diferenca calculada: `Sem dados`.
- Se `diff >= 0`: `OK`.
- Se `diff >= 0,30`: perfil `Alta performance`.
- Se `0 <= diff < 0,30`: perfil `Estavel`.
- Se `diff <= -1`: `Critico`.
- Caso contrario: `Analisar`.

Acoes sugeridas:

- `Alta performance`: replicar rotina e usar como referencia.
- `Estavel`: manter cadencia e gerar novas reservas.
- `Critico`: plano de recuperacao individual.
- `Analisar`: plano semanal com o gerente.
- Com reservas ativas: priorizar ataque das reservas com o gerente.

## Corretores ativos para producao

Um corretor entra nos calculos de produtividade quando sua situacao nao contem:

- `SEM META`
- `AFAST`
- `SEM DADOS`
- `ADMISSAO`
- `CONTRAT`

Esses filtros afetam:

- IPC do mes.
- IPC 2026 medio.
- Quantidade de corretores ativos.

## Meta do mes por time

Campo:

- `teamGoal`

Formula:

`teamGoal = soma da meta atual dos corretores ativos do time`

Observacao:

- A soma nao e arredondada para inteiro.
- Exemplo validado da gerente Ana:

`2 + 2 + 1,33 + 1,66 + 1,66 = 8,65`

## Atingimento

Por area:

`percentual = repasses da area / meta total da area`

Geral:

`achievement = total realizado / meta geral`

O percentual e arredondado para inteiro.

## Total realizado

Campo:

- `metrics.total`

Formula:

`total realizado = soma dos repasses das areas`

As areas consideradas sao FSA, AGL e CAT.

## Prioridades

A lista de prioridades pega os corretores com:

- `diff < 0`

Ordenacao:

1. Maior quantidade de reservas ativas.
2. Maior gap negativo contra a meta.

Limite:

- Top 15 corretores.

Se o corretor tem reserva ativa, o perfil visual ganha contexto de carteira e a acao vira:

`Atacar reservas do mes com gerente`

## Times, gerentes e overrides manuais

Algumas regras foram fixadas manualmente para refletir a estrutura combinada no dashboard.

Gerentes sobrescritos:

| Time | Gerente |
| --- | --- |
| Equipe propria FSA | Vivian |
| Equipe propria 2 FSA | Lucas |
| Canal 1 | Micael |
| Canal 2 | Alba |
| Canal 3 | Pamela |
| Imobiliarias AGL | Francisco |
| Imobiliarias CAT | Leonardo |
| Imobiliarias FSA | Rafael |

Times obrigatorios de imobiliarias:

- `IMOBILIARIAS | AGL`
- `IMOBILIARIAS | CAT`
- `IMOBILIARIAS | FSA`

Times removidos:

- `EQUIPE PROPRIA 3 | FSA`
- `EQUIPE PROPRIA 3 | AGL`
- `CANAL VIRTUAL 1`
- `CANAL VIRTUAL 2`
- `CANAL VIRTUAL 3`

Pessoas removidas da base:

- `ANIBAL HAMU NETO`
- `JHENNEFE HORRARA SILVA DE OLIVEIRA`

Observacao:

- Anibal permanece em regras de equipe historicas/permitidas quando necessario, mas esta na lista global de exclusao de pessoas do processamento.

## Ordem dos times

Regras de posicionamento aplicadas:

- `IMOBILIARIAS | FSA` fica depois de `AUTONOMOS 2 | FSA`.
- `EQUIPE PROPRIA 2 | AGL` fica depois de `EQUIPE PROPRIA | AGL`.
- `IMOBILIARIAS | AGL` fica depois de `EQUIPE PROPRIA 2 | AGL`.
- `IMOBILIARIAS | CAT` fica depois de `EQUIPE PROPRIA | CAT`.

## Exportacao automatica

Ao rodar:

```bash
npm run process:local
```

ou:

```bash
npm run process:june
```

o fluxo:

1. Localiza os arquivos mais recentes de repasse e reserva.
2. Processa as bases.
3. Atualiza `data/latest-dashboard.json`.
4. Exporta os HTMLs estaticos da raiz e de `public/`.

O script de exportacao estatica usa:

- `data/latest-dashboard.json`
- `public/styles.css`
- `public/app.js`

e gera os HTMLs sincronizados.

