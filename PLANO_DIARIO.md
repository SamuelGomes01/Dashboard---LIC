# Plano de Trabalho — Dashboard Cronograma de Contratações CPII
> Atualizado em: 12/05/2026 — aba Capacidade recriada (v3) + Codigo.gs adaptado; aguarda publicação no GAS.

---

## 📌 SESSÃO 12/05/2026 — Aba Capacidade recriada + Codigo.gs adaptado [AGUARDA PUBLICAÇÃO]

### ✅ IMPLEMENTADO NESTA SESSÃO

**Decisão de arquitetura:**
- Abordagem de migração via código (`prepararAutomacaoCapacidade`, `prepararMigracaoCapacidade`, `aplicarMigracaoCapacidade`) descartada — modificar estrutura da planilha por código é frágil e causou falhas.
- Nova abordagem: aba Capacidade com estrutura definitiva e fixa; código apenas lê e escreve dados.

**Planilha: `CronogramaContratacoes_CPII_v3.xlsx`** (salva em `Dashboard - LIC/`)
- Aba `📊 Capacidade` completamente recriada com estrutura definitiva:
  - Resumo por servidor (linhas 6–9): SUMIFS filtrando `$D$19:$D$300,"Sim"` (coluna D = Ativo)
  - Total do setor (linha 10): SUM dos resumos
  - Status do setor (linha 13): % e nível calculados por fórmula
  - Cabeçalho do registro (linha 17): Servidor, Processo/Objeto, ProcessoID, Ativo, Modalidade, Fase da Carga, pts (Mod/Nat/Sess/Outros), Total
  - Linha 18: aviso/instrução (não é dado)
  - Linhas 19–28: 10 processos atuais já preenchidos com ProcessoID e Ativo=Sim
  - Linhas 29–34: linhas em branco para novos processos
- Colunas amarelas = editáveis manualmente; azul claro = gerenciadas pelo código

**`AppsScript_Codigo.gs` — alterações:**
1. Menu simplificado: submenu Capacidade agora tem: **Migrar processos atuais** + Sincronizar capacidade + Concluir processo.
2. `capFindHeaderRow_()`: critério aprimorado — busca linha com ProcessoID + Servidor + Total (antes buscava só Servidor + Total, retornando a linha do resumo em vez do registro).
3. `capGetInfo_()`: `dataStartRow = headerRow + 2` (linha 18 é aviso, dados começam na 19).
4. `capGetInfo_()`: aliases de pts adicionados — `Mod (pts)`, `Nat (pts)`, `Sess (pts)`, `Outros (pts)`.
5. Constantes atualizadas: `CAP_HEADER_ROW_FALLBACK = 17`, `CAP_DATA_START_ROW_FALLBACK = 19`.
6. Truncamento corrigido: `getCapacidade()` estava cortada no meio — função restaurada ao final do arquivo.

**Verificação:** balanceamento de chaves/parênteses = ✅ OK (depth final 0).

### ⚠️ AÇÕES NECESSÁRIAS PARA PUBLICAR
1. Importar `CronogramaContratacoes_CPII_v3.xlsx` no Google Drive (substituir a planilha atual).
2. Colar `AppsScript_Codigo.gs` atualizado no GAS e salvar.
3. Implantar → Nova versão.
4. **Conferir os 10 processos na aba Capacidade** — validar ProcessoID, Ativo=Sim, pontuações.
5. Ajustar "Outros (fixo)" dos servidores se necessário (Amanda=3, Samuel=2 pré-preenchidos).

**Nova função `migrarCapacidadeAtual()`:**
- Preenche ProcessoID nas linhas sem PID (cruza pelo nome do objeto com a aba Processos).
- Para cada Pregão com apenas linha interna: cria linha de fase externa com Ativo=Não e servidor=REVISAR.
- Preserva todas as pontuações existentes — não recalcula nada.
- Processos sem servidor ou com IGOR ficam com servidor=REVISAR na linha externa.
- Idempotente: ignora linhas que já têm fase externa definida.

### 🧭 FLUXO DE USO DA CAPACIDADE (pós-publicação)
- **Novo processo:** `novoProcesso()` → insere linha(s) no registro automaticamente com ProcessoID + Ativo=Sim.
- **Virada de fase (Pregão):** menu Capacidade → Sincronizar capacidade → atualiza Ativo das linhas interna/externa.
- **Processo concluído:** menu Capacidade → Concluir processo → marca Ativo=Não (linha permanece, histórico preservado, SUMIFS exclui da soma automaticamente).
- **Edição manual:** colunas amarelas (◄) são sempre editáveis; ProcessoID/Ativo/Fase da Carga são gerenciados pelo código.

---

## 📌 SESSÃO 10/05/2026 — Automação de Capacidade por Processo [DESCARTADA — substituída pela sessão 12/05]

### ✅ IMPLEMENTADO NESTA SESSÃO (`Web app/AppsScript_Codigo.gs`)

**Menu novo "Capacidade" dentro do menu `📊 Painel SEL`:**
- `Preparar automacao`
- `Preparar migracao`
- `Aplicar migracao`
- `Sincronizar capacidade`
- `Concluir processo`

**`novoProcesso()` ampliado:**
- Modalidades agora separadas: Dispensa Eletrônica, Inexigibilidade, Pregão Eletrônico e Concorrência.
- Pregão exige responsável interno e responsável externo diferentes.
- Demais modalidades usam um responsável único; responsável externo fica conceitualmente como `N/A`.
- Pergunta apenas categorias simples (natureza do objeto, IRP quando aplicável e sessão externa); a matriz calcula os pontos automaticamente.
- Preenche automaticamente `Agente Responsável` nas etapas 1–7 e etapa 8.
- Registra linhas na aba `📊 Capacidade`:
  - Pregão: linha interna ativa + linha externa inativa.
  - Demais modalidades: uma linha única ativa.
- Adiciona nota nas células de servidor/total explicando a pontuação da linha.

**Setup e migração de capacidade:**
- `prepararAutomacaoCapacidade()` adiciona colunas necessárias sem duplicar e troca o resumo por servidor para `SUMIFS`, somando apenas `Ativo = "Sim"`.
- `prepararMigracaoCapacidade()` gera a aba `Previa Migracao Capacidade` sem apagar nada.
- Quando já houver linhas preenchidas na aba Capacidade, a prévia reaproveita essas linhas como fonte principal, preservando servidor, pontuações, fase e observação; o código tenta vincular o `Processo / Objeto` ao `ProcessoID` da aba Processos.
- `aplicarMigracaoCapacidade()` importa apenas linhas marcadas como `Aplicar? = Sim`, ignorando `REVISAR`.
- `sincronizarCapacidade()` altera somente `Ativo` conforme etapas:
  - Pregão: etapa 7 concluída desativa interna e ativa externa.
  - Carga única permanece ativa até conclusão.
  - Processo concluído no escopo SEL desativa a carga.
- `concluirProcesso()` desativa a carga de um `ProcessoID`.
- `invalidarCache()` agora limpa também o cache de capacidade (`dados_capacidade`).

### ⚠️ AÇÕES NECESSÁRIAS ANTES DE RODAR A MIGRAÇÃO
1. Colar o `AppsScript_Codigo.gs` atualizado no GAS e salvar.
2. Na aba `📊 Capacidade`, trocar categorias genéricas por nomes de processos onde ainda estiver genérico demais.
3. Usar apenas nomes atuais: `AMANDA`, `BEATRIZ`, `BRUNO`, `SAMUEL`.
4. Remover/ignorar `IGOR`; se ele aparecer sozinho, o processo deve ser revisado manualmente.
5. Conferir se os objetos/processos estão com nomenclatura clara para facilitar vínculo automático com `ProcessoID`.

### 🧭 ORDEM SEGURA PARA USAR
1. Rodar `📊 Painel SEL → Capacidade → Preparar automacao`.
2. Rodar `Preparar migracao`.
3. Conferir a aba `Previa Migracao Capacidade`, ajustando responsáveis, classificações/pontos herdados quando necessário, `Ativo` e `Aplicar?`.
4. Rodar `Aplicar migracao`.
5. Conferir o KPI de capacidade e as notas das células.
6. Só depois apagar as linhas antigas por categoria da aba Capacidade.
7. Rodar `Sincronizar capacidade` quando quiser atualizar viradas/conclusões.

### ✅ VERIFICAÇÃO LOCAL
- `node --check` executado sobre `AppsScript_Codigo.gs` via stdin: sem erro de sintaxe.

---

## 📌 SESSÃO 08/05/2026 (tarde) — Fix KPI + Planejamento de Automação [AGUARDA REPUBLICAÇÃO]

### ✅ IMPLEMENTADO NESTA SESSÃO (`AppsScript_index.html`)

**Fix KPI "Em Andamento" com filtro Atrasado ativo:**
- Quando `activeStatus === 'atrasado'`, o KPI "Em Andamento" agora exibe `——` em vez do número (contextos mutuamente exclusivos).
- Linha 1791 do `index.html`. Só `index.html` foi alterado — `Codigo.gs` não foi tocado.

### ⚠ AÇÕES NECESSÁRIAS PARA PUBLICAR
- Colar `AppsScript_index.html` atualizado no GAS e salvar
- Implantar → Nova versão

---

### 📋 PLANO APROVADO — Automação de Capacidade (próximas sessões)

**Fase 1 — Samuel faz 1x na planilha (antes de codar):**
1. Na aba `📊 Capacidade`, no bloco "REGISTRO DE PROCESSOS ATIVOS": inserir coluna `ProcessoID` como primeira coluna (antes de "Servidor ◄ EDITAR").
2. No bloco "RESUMO POR SERVIDOR": trocar as fórmulas de soma da coluna "Processos (soma)" de `=SUM(range)` para `=SUMIF(colProcessoID_do_registro, "NOME_SERVIDOR", colTotal_do_registro)` — uma por linha de servidor.
   - Exemplo para AMANDA: `=SUMIF($A$14:$A$200,"AMANDA",$G$14:$G$200)` (ajustar colunas conforme a posição real após inserir ProcessoID).
3. Confirmar que as fórmulas somam corretamente antes de chamar o código.

**Fase 2 — `novoProcesso()` ampliado (`Codigo.gs`):**
- Perguntar: Responsável Fase Interna (lista: Amanda/Beatriz/Bruno/Samuel)
- Perguntar: Responsável Fase Externa (lista sem o mesmo da interna — segregação de funções, Lei 14.133/2021)
- Perguntar: Natureza do Objeto (Comum=0 / TIC=+1 / Especiais=+2 / MO Dedicada=+3 / Obras=+3)
- Perguntar: Itens IRP (só se temIRP=Sim → Até 10=+0,5 / Até 25=+1 / Até 50=+1,5 / 100+=+2)
- Calcular pontos automaticamente pela Matriz de Complexidade
- Inserir 2 linhas na Capacidade: uma para resp. fase interna (Fase Interna), outra para resp. fase externa (Fase Externa), com ProcessoID na nova coluna
- Preencher `Agente Responsável` nas etapas 1–7 (resp. interno) e etapa 8 (resp. externo) na aba Etapas

**Fase 3 — `concluirProcesso()` nova função (`Codigo.gs`):**
- Acessível via menu SEL → Concluir Processo
- Pede o ProcessoID (ou detecta automaticamente processos com todas as etapas = Concluída)
- Localiza linhas com aquele ProcessoID na coluna A do registro de Capacidade
- Apaga essas linhas → SUMIF cai automaticamente no resumo → painel atualiza
- Invalida cache após a operação

**Regras de negócio a respeitar:**
- Segregação de funções: responsável fase interna ≠ responsável fase externa (obrigatório)
- Pontuação base: Dispensa=1, Inexigibilidade=2, Pregão/Concorrência=3
- Sessão fase externa: sem sessão=0, Dispensa eletrônica=+1, Pregão/Concorrência=+2
- Natureza: Comum=0, TIC=+1, Especiais=+2, MO Dedicada=+3, Obras=+3
- IRP (só quando temIRP=Sim): ≤10=+0,5 / ≤25=+1 / ≤50=+1,5 / ≥100=+2

---

## 📌 SESSÃO 08/05/2026 (manhã) — Correções de KPI + Filtros [AGUARDA REPUBLICAÇÃO]

### ✅ IMPLEMENTADO NESTA SESSÃO (`AppsScript_index.html`)

Todos os ajustes foram no `index.html`, nas funções `updateKPIs()` e `applyFilters()`. O `Codigo.gs` não foi alterado.

**`updateKPIs()` — regras redefinidas:**

1. **KPI "Total de Processos"** — passa a excluir processos na fila (`status === 'planejamento'`). Fórmula: andamento + atrasados ativos + concluídos. Quando um filtro de status está ativo (`activeStatus` preenchido), exibe `——` no lugar do número (o total perde sentido contextual ao filtrar por categoria).
2. **KPI "Em Andamento"** — passa a incluir processos `atrasado` com `execucao < 100`. Processos `atrasado && execucao === 100` **não** entram mais neste KPI.
3. **KPI "Atrasados"** — exibe apenas `atrasado && execucao < 100`. Processos concluídos com histórico de atraso são excluídos — aparecem exclusivamente no KPI "Concluídos".
4. **Traço `——` para KPIs zerados** — função auxiliar `kpiVal(n)` adicionada: retorna o número se `n > 0`, ou `'——'` se `n === 0`. Aplicada em todos os cinco KPIs.

**`applyFilters()` — lógica de `matchS` redefinida:**

| Botão | Comportamento anterior | Novo comportamento |
|---|---|---|
| **Todos** | todos os processos (inclusive fila) | exclui `planejamento` — mostra andamento + atrasados + concluídos |
| **Andamento** | só `andamento` | `andamento \|\| aguardando \|\| paralisado \|\| (atrasado && execucao < 100)` |
| **Atrasado** | todos com `status === 'atrasado'` | só `atrasado && execucao < 100` |
| **A iniciar** | sem alteração | sem alteração |
| **Concluídos** | sem alteração | sem alteração |

**Arquivo afetado:** `AppsScript_index.html` apenas.

### ⚠ AÇÕES NECESSÁRIAS PARA PUBLICAR
- Colar `AppsScript_index.html` atualizado no GAS e salvar
- Implantar → Nova versão

---

## 📌 SESSÃO 06/05/2026 — Ramais + renomear status + KPI + novoProcesso() [AGUARDA REPUBLICAÇÃO | TESTADO ✅]

### ✅ IMPLEMENTADO NESTA SESSÃO (`AppsScript_index.html` + `AppsScript_Codigo.gs`)

**`AppsScript_Codigo.gs` — novoProcesso() (melhorias desta sessão):**
1. **Prompt Link SUAP** — pergunta a URL após o IRP. Gravada na coluna `Link SUAP`.
2. **D0 sem hora** — `setNumberFormat('DD/MM/YYYY')` na célula D0 após gravar.
3. **Arquitetura de blocos pré-formatados (mudança principal):** Samuel pré-formatou a aba Etapas com 100 blocos de 10 linhas (1 separador mesclado azul + 9 etapas com bordas/Arial 11/formatação condicional cobrindo todo o range até a linha ~985). O `novoProcesso()` foi reescrito para localizar o primeiro bloco livre (separador com ProcessoID e Ord. vazios) e preencher apenas: (a) nome do objeto no separador, (b) ProcessoID nas 9 etapas, (c) StatusEtapa da etapa 4 (IRP) = "Não se aplica" se temIRP=Não, (d) nome e prazo da etapa 8 quando não for Pregão Eletrônico. O código não cria linhas, não seta cores, não expande formatação condicional. Aba Processos também usa `setValues()` na primeira linha vazia em vez de `appendRow()`.
4. **Fix crítico — `getDataRange()` é cego a linhas pré-formatadas:** linhas com apenas estilos (bordas, fontes, FC) mas sem valores não são retornadas por `getDataRange().getValues()`. Solução: substituir por `wsProc.getRange(primeiraLinhaProc, 1, 150, nColsProc).getValues()` (Processos) e `wsEtapas.getRange(primeiraLinhaEtap, 1, 1100, nColsEtap).getValues()` (Etapas) — leitura explícita de range fixo grande, que enxerga todas as linhas pré-formatadas vazias.
5. **getDados() não precisou ser alterado** — `if (!rowE[0]) continue;` já pula etapas com ProcessoID vazio, blocos livres são invisíveis para o painel automaticamente.

**Teste confirmatório:** SEL-2026-020 criado com sucesso em ambas as abas — formatação condicional aplicada corretamente, D0 sem hora, separador azul com nome do objeto. Samuel confirmou: "excelente meu amigo. acho que deu bom". ✅

**`AppsScript_index.html`:**

1. **Ramais reais do SEL** — footer atualizado: `2123-4001/4002/4003` → `2163-5762 / 2163-5718 / 2163-5763`

2. **"Em planejamento" renomeado para "A iniciar - Fila de Prioridade"** em todo o frontend:
   - KPI card label: `Em Planejamento` → `Fila de Prioridade`
   - KPI subtítulo: `fase interna não iniciada` → `fase interna a iniciar`
   - Botão de filtro: `Planejamento` → `A iniciar` (atributo `data-s="planejamento"` mantido — chave interna não muda)
   - `STATUS_LABEL['planejamento']`: `'Em planejamento'` → `'A iniciar - Fila de Prioridade'` (tooltip)

3. **Bug de KPI corrigido — total não fechava (19 ≠ 2+9+6=17):**
   - Causa: processos com status `'aguardando'` e `'paralisado'` somavam no total mas não entravam em nenhum KPI de linha.
   - Correção: `kv-and` (Em andamento) agora conta `andamento || aguardando || paralisado`. Total sempre fecha: and + atra + plan + conc = total.

### ⚠ AÇÕES NECESSÁRIAS PARA PUBLICAR
- Colar `AppsScript_Codigo.gs` atualizado no GAS e salvar
- Colar `AppsScript_index.html` atualizado no GAS e salvar
- Implantar → Nova versão
- **Excluir o processo de teste SEL-2026-020** da aba Processos e suas etapas da aba Etapas (foi criado para teste)

---

## 📌 SESSÃO 05/05/2026 (tarde) — Diagnóstico + correção de bugs no novoProcesso()

### 🔍 PROBLEMAS IDENTIFICADOS NA PLANILHA

1. **DataRealizacao incorreta — SEL-2026-014 etapa 1 "Designação da equipe":**
   - Valor atual: `26/05/2025` — mas o D0 do processo é `11/07/2025`
   - A data está ANTES do início do processo → o sistema calcula atraso negativo → **o atraso não aparece no painel**
   - **Solução (Samuel):** abrir a aba 🗓 Etapas, localizar SEL-2026-014 etapa 1, corrigir a `DataRealizacao◄ EDITAR` para a data real de conclusão (em torno de ago/set/out 2025, ~35 dias úteis após 18/07/2025 — Samuel confirma a data exata)

2. **Linhas fantasmas na aba Processos:**
   - Linhas 23 e 24 têm espaços na coluna C (Objeto) com fundo cinza — resquício de uma tentativa falha do `novoProcesso()`
   - Essas linhas não aparecem como processos reais, mas poluem a aba
   - **Solução (Samuel):** selecionar as linhas 23 e 24 inteiras na aba 🏛 Processos → clique direito → Excluir linhas

3. **Formatação branca nas etapas dos processos SEL-2026-016 a 019:**
   - As linhas de etapas ficaram com fundo branco em vez das cores de status (cinza para "Não iniciada", azul para "Concluída" etc.)
   - Ocorre porque a regra de formatação condicional do Sheets só cobre o range original e não se expande automaticamente
   - **Solução (Samuel):** Formatar → Formatação condicional → editar cada regra existente e expandir o range até a linha atual (ex: até linha 250 para folga)

### ✅ CORRIGIDO NO CODIGO.GS (4 bugs em novoProcesso())

1. **Nomes incorretos das etapas** — agora batem com o padrão da planilha:
   - `'Designação da equipe de planejamento'` → `'Designação da equipe'`
   - `'Minuta do TR'` → `'Minuta do Termo de Referência'`
   - `'IRP (se SRP)'` → `'IRP — Intenção de Registro de Preços'`
   - `'Envio ao SEL'` → `'Envio ao SEL/SEPMA'`
   - `'Fase Externa (...)'` → `'Fase externa — ...'` (minúsculo, com travessão)

2. **DataRealizacao = `new Date()` em etapas não iniciadas** → corrigido para `''` (vazio). Antes, inserir data de hoje em todas as etapas fazia o cascateamento calcular como se todas já tivessem sido concluídas em 05/05/2026, distorcendo todos os prazos do processo novo.

3. **IRP incluída mesmo quando `temIRP = Não`** → corrigido. Agora a etapa IRP só é criada quando `temIRP = 'Sim'`. Sem IRP: 8 etapas. Com IRP: 9 etapas.

4. **Etapa "Assinatura contrato / Ata (ARP)" faltando** → adicionada ao final de todo processo, sempre com status "Não se aplica" (fora do escopo do SEL).

### ✅ IMPLEMENTADO NO CODIGO.GS (sessão 05/05 tarde)

Itens 1–4 acima corrigidos no `AppsScript_Codigo.gs`. Samuel colou e reimplantou. ✅

### ⚠ AÇÕES PENDENTES NA PLANILHA (Samuel)

1. Corrigir `DataRealizacao◄ EDITAR` da etapa 1 do SEL-2026-014 (data real de conclusão da Designação da equipe — em torno de ago/set/out 2025)
2. Deletar linhas 23-24 da aba 🏛 Processos (linhas fantasmas com espaços)
3. Expandir regras de formatação condicional da aba 🗓 Etapas para cobrir novas linhas (Formatar → Formatação condicional → ampliar range)

---

## 📌 SESSÃO 05/05/2026 (tarde — continuação) — Otimização de performance + separador

### ✅ IMPLEMENTADO

1. **`novoProcesso()` reescrito com escrita em lote (`AppsScript_Codigo.gs`):**
   - Substituídas ~70 chamadas individuais (`appendRow` + `setBackground` + `setFontColor` por linha) por 3 chamadas em lote: `setValues()`, `setBackgrounds()`, `setFontColors()` no bloco inteiro de uma vez
   - Adicionado `SpreadsheetApp.flush()` ao final para confirmar escritas
   - Resultado: de ~6s por processo para <1s — cadastrar 4–5 processos seguidos sem estourar o limite de 6 min

2. **Separador da aba Etapas corrigido (`novoProcesso()`):**
   - Texto: removido prefixo `"N° SUAP: xxx |"` → exibe apenas o nome do objeto
   - Alinhamento: centralizado horizontalmente
   - Mesclagem: de `A1` (coluna única, invisível quando A oculta) → `A1:I1` (todas as colunas) — texto aparece mesmo com coluna A (ProcessoID) oculta. Detecção de separador no `getDados()` continua funcionando (células mescladas retornam vazio nas colunas secundárias)

3. **Dica de planilha:** para células que precisam exibir `+2`, `+3` etc. sem virar fórmula — usar apóstrofo antes (`'+2`) ou formatar a coluna como Texto simples (Formatar → Número → Texto simples)

### 📅 PRÓXIMOS PASSOS

- Samuel testando `novoProcesso()` após reimplantação
- Pendências na planilha listadas acima
- Próxima tarefa: Nota Técnica para RSC

---

---

## 📌 SESSÃO 02/05/2026 (noite) — Correção de bugs pós-importação + Auditoria de cálculos [AGUARDA REPUBLICAÇÃO]

### ✅ IMPLEMENTADO NESTA SESSÃO

1. **Footer duplicado removido (`index.html`)** — havia dois footers: `<div class="footer">` (correto, com toda a estilização) + `<footer class="footer">` sem CSS correspondente no final do arquivo. O segundo foi removido.

2. **Scroll vertical da coluna de nomes corrigido (`index.html`)** — `gl-panel-body` mudou de `overflow:hidden` para `overflow-y:scroll` com scrollbar invisível (`scrollbar-width:none`). Adicionado listener `wheel` no `gl-panel-body` que propaga `deltaY/deltaX` para `gr-panel-body`. Evento `scroll` do `gr-panel-body` sincroniza `scrollTop` do `gl-panel-body`.

3. **Bug de timezone corrigido (`Codigo.gs`)** — `parseDateValue`: quando o Google Sheets retorna objeto `Date` (datas importadas do xlsx), usava `.getFullYear()` que aplica fuso local (UTC-3 no Brasil), podendo jogar 01/03/2026 para 28/02/2026. Corrigido para `.getUTCFullYear/Month/Date` — lê a data em UTC puro, como o Sheets armazena internamente.

4. **`modalAbrev` reforçada (`Codigo.gs`)** — normalização NFD antes de comparar remove acentos, evitando que "Pregão" com encoding diferente do xlsx seja tratado como CD. Regex atualizado.

5. **Log diagnóstico temporário adicionado (`Codigo.gs`)** — ao rodar `getDados()`, imprime no Logger: PID, objeto, modalidade e D0 bruta de cada processo. **Remover após confirmar que as datas estão corretas no painel.**

### 📊 AUDITORIA DOS CÁLCULOS (planilha CronogramaContratacoes_CPII (2).xlsx)

- ✅ **Dias úteis**: correto — pula sáb/dom + 9 feriados nacionais (inclui 20/Nov, Tiradentes 21/Abr, etc.)
- ✅ **Cascateamento**: correto — atraso de uma etapa propaga para todas as seguintes
- ✅ **Fase externa**: PE=90d, CD=30d, CC=100d — conforme Portaria 638/2026
- ✅ **IRP**: incluída (15d) apenas quando `Tem IRP? = Sim`
- ⚠ **SEL-2026-013 etapa 3**: DataRealizacao=25/11 igual ao início — logicamente OK, mas verificar se é dado real
- ⚠ **11 etapas "Concluída" sem DataRealizacao** — cálculo OK, mas tooltip não exibe "Realizado em". Preencher para rastrear histórico
- ⚠ **SEL-2026-005 (Vigilância)** e **SEL-2026-014 (Iluminação)**: fase externa matematicamente vencida — verificar prorrogação real

### ⚠ AÇÕES PARA PUBLICAR

1. Colar `AppsScript_Codigo.gs` no GAS e salvar
2. Colar `AppsScript_index.html` no GAS e salvar
3. Implantar → Nova versão
4. Verificar footer (único), scroll da coluna de nomes e datas no painel
5. Após confirmar datas corretas: **remover as linhas do LOG DIAGNÓSTICO** do `Codigo.gs` (bloco logo acima de `// ── Lê e mapeia a aba de Etapas`)
6. Reinstalar trigger via **📊 Painel SEL → 🔔 Detector de Atraso → Instalar**

### 📅 PRÓXIMOS PASSOS

- **Samuel finalizando edições na planilha** (ainda em andamento em 02/05)
- **Apresentação para a equipe: terça-feira 05/05/2026**
- **Próxima tarefa: Nota Técnica para formalizar o projeto (base para RSC)**

---

---

### ✅ IMPLEMENTADO NESTA SESSÃO

1. **Nova aba `📊 Capacidade` na planilha `CronogramaContratacoes_CPII_v2.xlsx`** — incorpora a lógica da planilha `Pontuacao_Licitacoes_SEL_v4.xlsx`:
   - **RESUMO POR SERVIDOR** (linhas 6-9): AMANDA, BEATRIZ, BRUNO, SAMUEL. Teto individual 10 pts. Coluna "Outros (fixo) ◄ EDITAR" (carga permanente: chefia +3, GT +2, capacitação +2) em amarelo. Coluna "Processos (soma)" calculada por SUMIF sobre o Registro de Processos abaixo.
   - **TOTAL DO SETOR** (linha 10): somas das 4 colunas (Outros, Processos, Total, Teto).
   - **STATUS DE CAPACIDADE** (linha 13): `% = D10/E10`, Nível via IF (`🟢 Disponível` < 60%, `🟡 Limitada` 60-89%, `🔴 Máxima` ≥ 90%), Mensagem descritiva.
   - **REGISTRO DE PROCESSOS ATIVOS** (linhas 17+): Servidor, Objeto, pontuações (Modalidade, Natureza, Sessão, Outros), Total automático, Fase atual. Colunas editáveis em amarelo.
   - **LEGENDA** ao final com os 3 níveis e faixas.
   - Aba fica em 2ª posição (após Instruções, antes de Processos).

2. **Nova função `getCapacidade()` no `Codigo.gs`** — lê a aba `📊 Capacidade` da planilha. Extrai % (B13), nível (C13), mensagem (D13), totalPts (D10), tetoPts (E10). Cache separado de 60s. Fallback no servidor: se a fórmula da planilha não calculou (planilha recém-importada), calcula nível e mensagem com base no % diretamente. Retorna `{ ok, pct, nivel, mensagem, totalPts, tetoPts }`.

3. **6º card KPI "Capacidade do Setor" no `index.html`**:
   - Grid KPI expandido de `repeat(5,minmax(0,220px))` para `repeat(5,minmax(0,200px)) minmax(0,260px)`.
   - Card com ícone de medidor (gauge SVG), valor `🟢/🟡/🔴 XX%`, barra de progresso thin (3px) e mensagem sutil em itálico.
   - Classes dinâmicas: `cap-disp` (verde `#1e7a45`), `cap-lim` (âmbar `#b08a10`), `cap-max` (vermelho `#b02035`).
   - Função `carregarCapacidade()` disparada em paralelo com `getDados()` na carga inicial — falha silenciosa se aba não existir (exibe "N/D").
   - Função `updateCapacidade(cap)` atualiza cor, valor, barra e mensagem.

4. **Bug corrigido: arquivo `index.html` truncado** — o arquivo estava truncado após o comentário da seção de persistência de filtros (mesmo problema de 24/04). Reconstruído: `salvarFiltros()`, `restaurarFiltros()`, chamada `carregarDados()`, tooltip div, footer e fechamento `</body></html>` restaurados.

**Arquivos afetados:** `CronogramaContratacoes_CPII_v2.xlsx` (nova aba `📊 Capacidade`), `AppsScript_Codigo.gs` (função `getCapacidade()`), `AppsScript_index.html` (CSS do card, HTML do card, `carregarCapacidade()`, `updateCapacidade()`, reconstituição do final truncado).

### ⚠ AÇÕES NECESSÁRIAS PARA PUBLICAR

1. **Copiar `AppsScript_Codigo.gs` para o editor GAS** — cole o conteúdo completo e salve.
2. **Copiar `AppsScript_index.html` para o editor GAS** — cole o conteúdo completo e salve.
3. **Importar a planilha atualizada para o Google Sheets** — `CronogramaContratacoes_CPII_v2.xlsx` (agora com aba `📊 Capacidade`). *Na 1ª abertura, aguardar o Sheets recalcular as fórmulas SUMIF/IF.*
4. **Implantar → Nova versão** — republique o web app.
5. *(Opcional)* Atualizar os dados de processos na aba `📊 Capacidade → REGISTRO DE PROCESSOS ATIVOS` conforme os processos reais atuais.

### 📌 OBSERVAÇÕES DE MANUTENÇÃO

- A aba Capacidade é **mantida manualmente** pela equipe: editar "Outros (fixo)" por servidor e adicionar/remover linhas de processos no Registro conforme o andamento das licitações. O painel reflete automaticamente qualquer mudança.
- Os pontos de modalidade seguem a Matriz: Dispensa=1, Inexigibilidade=2, Pregão/Concorrência=3. Sessão: sem sessão=0, DE=+1, Pregão/Concorrência=+2. Natureza: bens comuns=0, TIC=+1, especiais=+2, MO dedicada=+3, obras=+3.
- Se a planilha for muito grande e o SUMIF ficar lento, considerar mover o Registro para uma aba separada e ajustar o SUMIF.

**Implementado em 02/05/2026 (sessão tarde — planilha final):**
- `CronogramaContratacoes_CPII_Final_v2.xlsx` reconstruída com 6 abas reformatadas e salva em `Dashboard - LIC/Web app/`.
- **Aba 📋 Instruções** — totalmente reescrita com manual completo: visão geral, função de cada aba, fluxo de registro de atraso (5 passos), prazos Portaria 638/2026, menu do Sheets, atenção aos nomes de colunas (sem espaço em `DataRealizacao◄ EDITAR`).
- **Aba 🏛 Processos** — cores por status aplicadas (atrasado=vermelho claro, andamento=branco, planejamento=azul claro, aguardando=âmbar, paralisado=roxo claro, concluído=verde claro).
- **Aba 🗓 Etapas** — colunas extras 10–21 removidas (ficaram só as 9 colunas necessárias), separadores SUAP em azul claro, etapas coloridas por status, colunas editáveis com header dourado, freeze linha 3.
- **Aba Prioridades GUT** — reconstruída com header "USO INTERNO DA CHEFIA", escala 1–5, 15 processos com cores por prioridade, fórmulas G×U×T.
- Validação: `recalc.py` → 52 fórmulas, **0 erros**.
- Ordem: 📋 Instruções → Matriz de Pontuação → 📊 Capacidade → 🏛 Processos → 🗓 Etapas → Prioridades GUT.

### ⚠ AÇÕES PENDENTES (02/05/2026)

1. **Samuel:** substituir arquivo no Google Drive pelo `CronogramaContratacoes_CPII_Final_v2.xlsx` (Arquivo → Importar → Substituir planilha atual). Aguardar recálculo das fórmulas na 1ª abertura.
2. **Samuel:** republicar o web app (colar `Codigo.gs` + `index.html` no GAS → Implantar → Nova versão). *(Aguarda desde 01/05/2026.)*
3. **Samuel:** instalar trigger via **📊 Painel SEL → 🔔 Detector de Atraso → Instalar** e rodar **📅 Preencher datas vazias com hoje** após republicar.

---

---

## 📌 SESSÃO 01/05/2026 (noite) — Formato DD/MM/YY + "Realizado" condicional + bug fim_iso + prompt Aguardando/Paralisado [AGUARDA REPUBLICAÇÃO]

### ✅ IMPLEMENTADO NESTA SESSÃO

1. **Formato de data `DD/MM/YY` nas datas finais do tooltip (`index.html`)** — nova função `isoToDD_MM_YY(iso)` que converte `YYYY-MM-DD` → `DD/MM/YY` (ano com 2 dígitos). Aplicada em:
   - `prazoStr` (Prazo 638/2026 na etapa): agora exibe `DD/MM → DD/MM/YY` em vez de `DD/MM → Mês/AAAA`.
   - `realStr` (Realizado na etapa): mesma lógica, data de conclusão com ano curto.
   - `showProcTT` (Período do processo): data de fim agora exibe `DD/MM/YY` (início continua `DD/MM`).

2. **"Realizado" oculto quando `DataRealizacao` não preenchida (`index.html`)** — `realStr` inicializado como `null` (antes: `'—'`). A linha só é renderizada se `realStr !== null`. Para etapas não concluídas com DataRealizacao vazia, o campo desaparece completamente do tooltip — sem o "—" que induzia a achar que o campo existia mas estava vazio.

3. **Toast sem atraso com dica de objetividade (`Codigo.gs`)** — quando `onEditAtraso()` detecta que a etapa foi concluída dentro do prazo, o toast agora inclui a frase: *"💡 Dica: ao registrar um atraso futuramente, seja objetivo e direto — descreva o fato, não a justificativa."* Duração estendida de 4 para 6 segundos para dar tempo de ler.

4. **Bug corrigido: "Prazo 638/2026" e "Realizado" mostravam a mesma data (`Codigo.gs`)** — `fim_iso` estava sendo definido como `fim` (posição do cursor após avançar), que quando `DataRealizacao` está preenchida é igual a `dataRealizacao`. Isso fazia Prazo e Realizado exibirem datas idênticas mesmo com atraso de 20 dias. Solução: separado em dois campos:
   - `fim_iso` → sempre `fimSemAtraso` (prazo puro da Portaria — usado em "Prazo 638/2026")
   - `fim_real_iso` → `fim` (data real com atraso — usado no "Período" do processo)
   - `procFimIso` agora usa `fim_real_iso` da última etapa (data real de encerramento do processo).

5. **Bug: "Realizado" aparecia em etapas em andamento sem `DataRealizacao` (`index.html`)** — o ramo `else if (et.real_ini !== null)` exibia datas calculadas por índice de mês mesmo sem data real preenchida. Removido completamente. `realStr` agora é um ternário simples: `et.realizacao_iso ? DD/MM → DD/MM/YY : null`. Etapas em andamento, não iniciadas ou "Não se aplica" ficam sem a linha "Realizado".

6. **Prompt de motivo ao selecionar "Aguardando requisitante" ou "Paralisado" (`Codigo.gs`)** — segundo bloco adicionado em `onEditAtraso()`, ativado quando a célula editada é `StatusEtapa ◄ EDITAR`. Comportamento:
   - Só pede motivo se `MotivoAtraso ◄ EDITAR` da mesma linha estiver vazio — preserva motivo existente.
   - Prompt com ícone temático: ⏳ para "Aguardando requisitante", ⛔ para "Paralisado".
   - Ao confirmar, grava em `MotivoAtraso ◄ EDITAR` + exibe toast + invalida cache.
   - Se motivo já preenchido: nenhuma ação (sem interrupção do fluxo).
   - O `return` ao fim do bloco de status garante que a edição de status não caia no bloco de `DataRealizacao`.

**Arquivos afetados:** `AppsScript_index.html` (`isoToDD_MM_YY`, `prazoStr`, `realStr` ternário simples, "Período" em `showProcTT`, remoção do `else if real_ini`) e `AppsScript_Codigo.gs` (toast do `onEditAtraso` sem atraso, separação `fim_iso` / `fim_real_iso`, `procFimIso` usa `fim_real_iso`, novo bloco de prompt para Aguardando/Paralisado em `onEditAtraso`).

---

## 📌 SESSÃO 01/05/2026 — Links no header + DataRealizacao + melhorias de tooltip + formatação condicional [AGUARDA REPUBLICAÇÃO]

### ✅ IMPLEMENTADO NESTA SESSÃO

1. **Links no header (`index.html`)** — o `<span class="top-meta">` foi substituído por dois links `<a class="top-meta">` clicáveis:
   - 📄 **Portaria 638/2026** → abre `https://suap.cp2.g12.br/documento_eletronico/visualizar_documento_digitalizado/944690/` em nova aba
   - 🔗 **Fluxos PROAD** → abre `https://decofcp2-afk.github.io/proad-fluxos/` em nova aba
   - CSS: adicionado `.top-meta:hover` com fundo dourado mais intenso e `text-decoration:none` para aparência de chip clicável.

2. **`DataRealizacao ◄ EDITAR` substitui `AtrasoRealDias ◄ EDITAR` (`Codigo.gs` + planilha)** — mudança central desta sessão:
   - A equipe agora insere a **data real de conclusão** da etapa (ex: `15/04/2026`), não mais o número de dias de atraso.
   - O `Codigo.gs` calcula automaticamente o atraso em dias úteis: `contarDiasUteis(fimSemAtraso, dataRealizacao)`.
   - Se `DataRealizacao` não preenchida: etapa sem atraso registrado (comportamento anterior preservado).
   - O cursor de cascateamento avança até `DataRealizacao` (se preenchida), ou `fimSemAtraso + atraso` (se não).
   - Nova função `contarDiasUteis(dataA, dataB)` adicionada ao `Codigo.gs` — conta dias úteis entre duas datas, com sinal (positivo = atraso, negativo = adiantamento).
   - `novoProcesso()` atualizado: insere `DataRealizacao ◄ EDITAR` vazia + mantém `AtrasoRealDias ◄ EDITAR` por compatibilidade com planilhas legadas.
   - Novo campo `realizacao_iso` devolvido em cada etapa (para uso futuro no tooltip).
   - **AÇÃO NECESSÁRIA NA PLANILHA:** Samuel precisa adicionar a coluna `DataRealizacao ◄ EDITAR` na aba `🗓 Etapas`, entre `Prazo (dias)` e `MotivoAtraso ◄ EDITAR`. O código a lê por nome de coluna, então a posição exata não importa — só o cabeçalho.

3. **Correção de lógica: "Atrasado há X dias" em etapas não iniciadas de processos concluídos (`index.html`)** — antes, qualquer etapa "não iniciada" cuja `ini_iso` estivesse no passado exibia "Atrasado há X dias" comparando sempre com **hoje**, mesmo para processos já 100% concluídos. Agora: a linha "Atrasado há X dias" só aparece se `p.execucao < 100 && p.status !== 'ok'`. Processos concluídos ficam sem esse aviso espúrio.

4. **Tooltip de processo: formato de data com dia (`index.html` + `Codigo.gs`)** — a linha "Previsão" (que duplicava o que o Gantt já mostrava) foi removida. A linha "Período" agora exibe datas completas no formato `DD/MM – DD/MM` (ex: `02/01 – 15/06`):
   - Nova função `isoToDD_MM(iso)` no `index.html` converte `YYYY-MM-DD` → `DD/MM`.
   - `Codigo.gs` agora devolve `ini_iso` e `fim_iso` no objeto de **processo** (além das etapas que já tinham). Usa a data ISO da 1ª etapa (início) e da última etapa (fim).

5. **Tooltip: nome completo ao passar o mouse sobre o processo (`index.html`)** — o `<span class="proc-name">` ganhou `title="..."` com o nome completo do objeto, que fica truncado visualmente por `text-overflow:ellipsis`. O tooltip nativo do browser exibe o texto completo sem necessidade de código adicional.

6. **Formatação condicional em `novoProcesso()` (`Codigo.gs`)** — ao criar um novo processo, as 8 linhas de etapas inseridas na aba `🗓 Etapas` agora recebem `setBackground()` e `setFontColor()` de acordo com o status inicial (`Não iniciada` = cinza, `Não se aplica` = cinza claro). Antes, as regras de formatação condicional da planilha não se propagavam para as linhas novas. Mapa de cores:
   - `Não iniciada` → `#E8EAED` / `#3C4043`
   - `Em andamento` → `#E6F4EA` / `#1E6E42`
   - `Concluída` → `#D2E3FC` / `#1A4D8C`
   - `Aguardando requisitante` → `#FDE8D8` / `#8C3D0F`
   - `Paralisado` → `#EDD9F5` / `#5D2080`
   - `Não se aplica` → `#F8F9FA` / `#9AA0A6`

**Arquivos afetados:** `AppsScript_Codigo.gs` (função `contarDiasUteis`, refatoração do bloco de cálculo de etapa, campos `ini_iso`/`fim_iso`/`realizacao_iso` no processo, `novoProcesso()` com formatação condicional e coluna `DataRealizacao`) e `AppsScript_index.html` (links no header, `isoToDD_MM()`, tooltip de processo sem linha "Previsão" + formato DD/MM, `title` no `proc-name`, correção do "Atrasado há X dias" em processos concluídos, remoção do botão "Atualizar", `carregarDados()` sem dependência de `btn-refresh`). **REPUBLICADO E TESTADO ✅**

### 🐛 Bugs corrigidos pós-publicação (01/05/2026)

- **Painel em branco após remoção do botão "Atualizar"** — `carregarDados()` fazia `btn.disabled = true` logo na primeira linha; sem o botão no DOM, `getElementById('btn-refresh')` retornava `null` e a chamada travava antes de chegar ao `getDados()`. Corrigido removendo todas as referências a `btn` da função.
- **`function toIso()` aninhada dentro de `.map()`** — declaração de função dentro de arrow/map não é suportada de forma confiável pelo runtime do Apps Script. Substituído por inline direto (`d.getFullYear() + '-' + ...`). O CSS `.btn-refresh` foi mantido (inofensivo).
- **Nome da coluna `DataRealizacao◄ EDITAR`** — planilha real não tem espaço antes do ◄ (diferente das outras colunas). Todos os `DataRealizacao ◄ EDITAR` no `Codigo.gs` corrigidos para `DataRealizacao◄ EDITAR` via replace global.
- **"Motivo do atraso" aparecia sem atraso** — `motivoHtml` agora só renderiza quando `et.dias > 0`. Motivos preenchidos manualmente em etapas sem atraso real não aparecem mais.
- **"Realizado" no tooltip de etapa mostrava mês calculado em vez da data real** — quando `et.realizacao_iso` está disponível, o campo "Realizado" exibe `DD/MM (início) → DD/MM (DataRealizacao)`. Sem `realizacao_iso`, mantém comportamento anterior com `absToLabel`.
- **Prazo 638/2026 no tooltip** — início trocado de `absToLabel(prazo_ini)` para `isoToDD_MM(ini_iso)`, dando precisão de dia.

### ✅ Novas funcionalidades adicionadas (01/05/2026)

- **`onEditAtraso()` — detector de atraso installable (`Codigo.gs`)** — quando a equipe preenche `DataRealizacao◄ EDITAR` com data posterior ao prazo previsto, um popup abre automaticamente pedindo o motivo. O motivo é gravado direto em `MotivoAtraso ◄ EDITAR` da mesma linha. Sem atraso: exibe toast verde discreto. Requer instalação via menu: **📊 Painel SEL → 🔔 Detector de Atraso → Instalar** (trigger installable — necessário para abrir UI/prompt). O `onEdit` simples foi renomeado para `onEditAtraso` para compatibilidade.
- **`preencherDataRealizacaoHoje()` — utilitário de calendário (`Codigo.gs`)** — preenche todas as células vazias de `DataRealizacao◄ EDITAR` com a data de hoje + formato `DD/MM/YYYY`. Com valor de data na célula, o Google Sheets abre o calendário no primeiro clique. Disponível em: **📊 Painel SEL → 📅 Preencher datas vazias com hoje**.
- **`novoProcesso()` atualizado** — etapas novas já recebem data de hoje em `DataRealizacao◄ EDITAR` + formato `DD/MM/YYYY` automaticamente.

### ⚠️ AÇÃO NECESSÁRIA NA PLANILHA (antes de republicar)

Samuel precisa adicionar a coluna `DataRealizacao ◄ EDITAR` na aba `🗓 Etapas`:
1. Abrir a aba `🗓 Etapas` no Google Sheets
2. Inserir uma nova coluna ao lado de `Prazo (dias)` (pode ser antes ou depois — o código lê por nome)
3. Nomear o cabeçalho exatamente: `DataRealizacao ◄ EDITAR`
4. Aplicar validação de dados → Tipo: Data (para evitar texto acidental)
5. Para etapas já concluídas com atraso registrado em `AtrasoRealDias`: preencher `DataRealizacao` com a data real de conclusão. O sistema recalculará o atraso automaticamente.
6. Manter a coluna `AtrasoRealDias ◄ EDITAR` por ora (o código ignora se `DataRealizacao` estiver preenchida, mas não quebra se a coluna ainda existir).

---

## 📌 SESSÃO 28/04/2026 — Dias úteis + novos status (Aguardando/Paralisado) + truncamento de motivo [AGUARDA REPUBLICAÇÃO]

### ✅ IMPLEMENTADO NESTA SESSÃO

1. **Dias úteis no cascateamento de datas (`Codigo.gs`)** — substituído `cursor.setDate(cursor.getDate() + base + atraso)` pela função `adicionarDiasUteis(cursor, base + atraso)`. A função pula sábados, domingos e os 9 feriados nacionais fixos (incluindo 20/Nov — Consciência Negra, Lei 14.759/2023). Feriados móveis (Carnaval, Corpus Christi etc.) e feriados municipais do Rio não estão incluídos — podem ser adicionados futuramente em lista configurável. As previsões de conclusão vão ficar mais longas do que antes, pois os prazos da Portaria 638/2026 agora são contados em dias úteis reais.

2. **Novos status de etapa — Aguardando requisitante e Paralisado (`Codigo.gs` + `index.html`):**
   - `"Aguardando requisitante"` → chave interna `'aguardando'` — processo parado aguardando ação do setor requisitante; cor laranja.
   - `"Paralisado"` → chave interna `'paralisado'` — interrupção por fato extraordinário, sem prazo de retomada; cor roxa tracejada.
   - `"Atrasada"` **removida** do `normalizeStatus` — não existe mais no dropdown da planilha.
   - Ordem de prioridade no `statusGeral`: atrasado > aguardando > paralisado > andamento > concluído > planejamento.
   - Ordenação no painel (`ordemStatus`): atrasados em curso (0) → aguardando (1) → paralisado (2) → atrasado concluído (3) → andamento (4) → planejamento (5).
   - Tooltip do processo: caixa laranja ⏳ para aguardando, caixa roxa ⛔ para paralisado (análogas ao `.tt-alert` vermelho).
   - Ícone na linha do Gantt: relógio laranja (aguardando), círculo riscado roxo (paralisado) — mesmo padrão do ícone de atrasado.
   - CSS: `.bar.b-aguardando` (laranja suave) e `.bar.b-paralisado` (roxo tracejado) adicionados.

3. **Truncamento do motivo de atraso no tooltip (`index.html`)** — motivo truncado em 200 caracteres com reticências (`…`). O texto completo continua na planilha e nas etapas expandidas. Aplicado tanto no tooltip do processo (`showProcTT`) quanto no `title` do ícone de alerta (80 chars).

4. **Reflexão sobre `StatusEtapa` — "Atrasada" removida do dropdown** — decisão: o status "Atrasada" gerava confusão porque o sistema já detecta atraso via `AtrasoRealDias`. O dropdown ficou com: Não iniciada | Aguardando requisitante | Em andamento | Concluída | Não se aplica | Paralisado. Samuel ajustou manualmente na planilha.

5. **Discussão: dias corridos vs. úteis** — concluído que dias corridos não faziam sentido operacionalmente (a equipe só trabalha em dias úteis). A Portaria 638/2026 não especifica; adotamos dias úteis como interpretação mais adequada.

**Arquivos afetados:** `AppsScript_Codigo.gs` (função `adicionarDiasUteis`, `isDiaUtil`, `isFeriadoFixo`, `FERIADOS_FIXOS`; `normalizeStatus`; `statusGeral`; cascateamento) e `AppsScript_index.html` (`STATUS_COLORS`, `STATUS_LABEL`, CSS `.tt-warn`, `.tt-paral`, `.bar.b-aguardando`, `.bar.b-paralisado`; `showProcTT` com truncamento e caixas de status; ícones na linha; `ordemStatus`). **Aguarda Samuel republicar no Apps Script.**

5. **Bug corrigido — "No prazo" contraditório com atraso registrado** — `"no prazo"` removido do `normalizeStatus` (não existe mais no dropdown). `STATUS_LABEL` atualizado: `ok` → `'Concluído'` (antes era `'No prazo'`, que aparecia mesmo com `AtrasoRealDias > 0`).

6. **Guia rápido para a equipe** — `Guia_Rapido_Painel_SEL.docx` criado na pasta `Dashboard - LIC`. Cobre: tabela de status com cores/ícones, fluxo de registro de atraso, **exemplo real com 6 capturas de tela** do processo "Abastecimento de água e coleta de esgoto" (N° 23040.007400/2025-31) mostrando o ciclo completo: aguardando → registrar atraso → concluir → próxima etapa recalculada automaticamente. Inclui explicação do cálculo em dias úteis e regra de ouro (só editar `AtrasoRealDias`). Linguagem direta e objetiva.

---

## 📌 SESSÃO 24/04/2026 — Polimento visual + contagem de dias em todas as etapas + conclusão institucional [AGUARDA REPUBLICAÇÃO]

Quatro pedidos do Samuel a partir de capturas de tela do painel:

### ✅ IMPLEMENTADO NESTA SESSÃO

1. **Coluna de nomes ampliada** — `--label-w` passou de `300px` para `325px` em `:root`. Dá mais respiro para o objeto longo (ex: "Serviços de reprodução e encader…") e reduz truncamento.
2. **Brilho sutil no trilho da barra de %** — `.proc-pbar` ganhou `box-shadow:0 0 3px rgba(11,47,99,.28), inset 0 0 0 1px rgba(11,47,99,.10)`. Realce discreto **só no trilho** (não no preenchimento), conforme pedido. O preenchimento (`.proc-pbar-fill`) segue azul CPII/verde inalterado.
3. **Contagem de dias no tooltip de ETAPA (expandida)** — `showEtapaTT()` agora mostra a linha "Prazo restante" / "Início previsto" em **três situações** (oculta na etapa concluída, conforme solicitado):
   - `andamento` / `atrasado` — usa `et.fim_iso`: "Falta X dias" (≤7 âmbar, >7 verde), "Vence hoje" (âmbar), "Venceu há X dias" (vermelho).
   - não iniciada (`pendente`/`planejamento`) — usa `et.ini_iso` (novo): "Começa em X dias" (muted), "Começa hoje" (âmbar), "Atrasado há X dias" (vermelho) se a data prevista já passou sem ninguém iniciar.
   - `ok` (concluída) — **nada exibido** (decisão do Samuel: histórico não interessa no tooltip).
   - Novo campo `ini_iso` adicionado a cada etapa em `Codigo.gs` (YYYY-MM-DD). Necessário porque `prazo_ini` é índice de mês, não dia.
4. **Tooltip de PROCESSO concluído com ícone ✓ institucional** — em `showProcTT()`, quando `p.execucao === 100 || p.status === 'ok'`, aparece uma caixa verde (`.tt-success`, simétrica ao `.tt-alert` vermelho) com o check-circle verde (mesmo SVG da KPI "Concluídos", stroke `#2ecc71`) e o texto fixo: **"Processo concluído — Todas as etapas a cargo do Setor de Licitações foram realizadas."** Substitui o `.tt-alert` de motivo de atraso para processos já finalizados (atrasados concluídos não mostram mais o motivo antigo, pois a mensagem de sucesso já deixa claro que o SEL cumpriu sua parte). Hint também adaptado: "Clique em + para revisar o cronograma executado".
5. **E-mail `central@cp2.g12.br` removido do bloco de endereço do footer** — linha `<span class="footer-addr">central@cp2.g12.br</span>` abaixo do endereço estava duplicada e foi retirada. O bloco oficial `.footer-email` à direita (com label "E-mail" e ícone ✉) permanece intacto.

**Arquivos afetados:** `AppsScript_index.html` (CSS `--label-w`, `.proc-pbar`, `.tt-success`; JS `showProcTT`, `showEtapaTT`; HTML do footer) e `AppsScript_Codigo.gs` (campo `ini_iso` adicionado ao objeto etapa). Sintaxe validada com `node --check`. **Aguarda Samuel republicar no Apps Script.**

### ✅ BÔNUS — Scroll do mouse na coluna de nomes (corrigido)

6. **Scroll vertical agora funciona em toda a área do Gantt** — antes, a rodinha do mouse só rolava quando o cursor estava sobre as barras, porque `.gl-panel-body` tem `overflow:hidden` (era só "seguido" via JS). Adicionado listener de `wheel` em `glBody` que propaga `deltaY`/`deltaX` para `grBody` (único contêiner com scroll real). `passive:false` + `preventDefault()` evitam scroll duplo. A sincronização vertical já existente empurra o `scrollTop` de volta para o painel de nomes automaticamente.

**Nota de manutenção:** durante a validação foi detectado que uma edição anterior havia truncado o `AppsScript_index.html` na linha 1612 (faltavam fechamento de função, `</script>`, `</body>`, `</html>`). Arquivo reconstruído via bash, sintaxe validada com `node --check` e confirmado 1×`</body>`, 1×`</html>`, 1×`</script>`.

### 🔲 NÃO FEITO NESTA SESSÃO (conforme decisão)

- **Justificativa de atraso via UI (modal + gravação na planilha)** — Samuel pediu para deixar **em off por enquanto**. Discussão técnica registrada no histórico (pontos A/B/C: controle de autoria, acoplamento com `AtrasoRealDias`, log `__log_justificativas`). Retomar em sessão futura se o diretor aprovar.
- **Redirecionar e-mail do footer para Outlook/Gmail** — Samuel pediu para deixar **em off**. Proposta técnica discutida: popup com 3 opções (Outlook via `mailto:`, Gmail web, copiar endereço). Retomar se fizer sentido no futuro.

### 🏁 SESSÃO ENCERRADA (24/04/2026)

Samuel aprovou o resultado: "ficou ótimo, o dashboard já está muito bom". Itens pendentes para republicar no Apps Script:
1. Copiar `AppsScript_index.html` atualizado para o projeto "Painel Gantt CPII v1"
2. Copiar `AppsScript_Codigo.gs` atualizado (novo campo `ini_iso` em cada etapa)
3. Implantar → Gerenciar implantações → editar → Nova versão → Implantar
4. Testar em aba anônima: scroll na coluna de nomes, tooltips de etapa com "Começa em X dias", tooltip de processo concluído com check verde, footer sem e-mail duplicado.

---

## 📌 SESSÃO 23/04/2026 (noite) — Análise de código e melhorias rápidas [ENCERRADA ✅]

Análise completa do `Codigo.gs` e do `index.html` gerou 14 sugestões de melhoria (correções de código) + 14 ideias de inovação. O Samuel aprovou um subconjunto; os **itens rápidos foram implementados nesta sessão e testados em produção (republicação feita pelo Samuel)**. Os demais ficam registrados abaixo para próximas sessões.

### ✅ IMPLEMENTADO NESTA SESSÃO (23/04 noite — aguarda republicação)

1. **1.1(B) — ProcessoID automático em `novoProcesso()`** — agora gera `SEL-AAAA-NNN` lendo o maior sequencial existente do ano. Prompt de ProcessoID removido; prompt de Setor também removido (o setor agora vai ser editado manualmente na planilha, já que pode variar por etapa). Alerta final mostra o pid gerado e avisa para preencher "Agente Responsável" depois.
2. **1.1(C) — `populateAnoSelect` sem limite de 2027** — agora lista todos os anos presentes em `inicio`/`fim` dos processos, sem teto.
3. **1.1(D) — Referências a modo de escala "Ano" removidas** — apenas comentários em `getCellW()`, `setEscala` e `barX`. O **filtro por ano** (dropdown) continua funcionando normal. A escala Ano como "zoom-out" fica no backlog para quando houver muitos processos.
4. **1.1(F) — Delay no `hideTT` (150ms) + cancelamento inteligente** — tooltip agora não cintila ao mover entre baseline e barra real. `showProcTT` e `showEtapaTT` cancelam `_ttHideTimer` ao entrar na próxima barra.
5. **1.2(H) — `ANO_BASE = 2026` extraído como constante** — presente em `index.html` e `Codigo.gs`. Substituídos todos os literais `2026` em `todayIdx`, `absToLabel`, `absToYear`, `dateToMonthIdx`, `populateAnoSelect`, `applyFilters` (filtro por ano).
6. **2.1 — "Prazo restante" no tooltip de etapa** — nova linha aparece apenas quando `status === 'andamento'`: "Falta X dias" (verde/âmbar conforme proximidade, ≤7d = âmbar), "Vence hoje" (âmbar) ou "Venceu há X dias" (vermelho) se ninguém atualizou a planilha. Requer novo campo `fim_iso` (YYYY-MM-DD) que `Codigo.gs` agora devolve em cada etapa.
7. **Cores UI — KPI Planejamento** — trocada de âmbar (`#b08a10`) para azul-aço `#4a6b94`. Atualizado em: border top do card (`::after`), fundo do ícone, cor do valor numérico e stroke do SVG.
8. **Cores UI — Nº do processo + cabeçalho do Gantt** — `.proc-num` e `.gh-year-lbl` agora usam `--cpii-navy` (azul-marinho). Fundo dos anos no Gantt trocado de `rgba(240,165,0,.06)` (âmbar) para `#e6ebf4` (cinza-azulado claro — harmoniza com paleta CPII).
9. **Barra de % padronizada + ícone de alerta** — todas as barras de progresso dos processos agora usam a mesma cor azul CPII (antes, atrasados ficavam vermelhos e planejamento ficava cinza). Apenas processos 100% concluídos ganham barra verde. Para processos atrasados, foi adicionado o ícone ⚠ (mesmo SVG da KPI "Atrasados", stroke `#b02035`) no canto direito da linha do processo, em tamanho proporcional (24×24px em row-h 56px). Tooltip nativo no ícone mostra "Processo atrasado — <motivo>".
10. **Ícone de alerta some quando atrasado fecha em 100%** — condição do ícone ficou `p.status === 'atrasado' && p.execucao < 100`. Quando um processo que teve atrasos intermediários finaliza (barra verde), o ⚠ desaparece automaticamente: a conclusão já é comunicada pela cor verde da barra de %. Observação: o status interno continua sendo `'atrasado'` nesse caso (o `Codigo.gs` prioriza atraso > conclusão em `statusGeral`) — isso preserva o histórico mas faz o KPI "Atrasados" contar também processos já concluídos com atraso. Se quiser que o KPI "Atrasados" pare de contar processos 100%, precisa alterar a prioridade em `Codigo.gs` linhas 316–318. Fica registrado para discussão futura.
11. **Reordenação: atrasados concluídos caem para depois dos "em andamento"** — `applyFilters()` agora usa a função auxiliar `ordemStatus(p)`: atrasado em curso = 0, andamento = 1, **atrasado concluído (exec===100) = 2**, planejamento = 3, outros = 4. Assim, quando um processo atrasado é finalizado (barra verde, ícone ⚠ some), ele desce na lista e fica depois do último "em andamento" e antes dos "em planejamento" — a prioridade de topo é reservada aos atrasados que ainda precisam de atenção. Processos atrasados concluídos continuam acima de planejamento porque ainda são execução efetiva.

**Arquivos afetados:** `AppsScript_Codigo.gs`, `AppsScript_index.html`. Sintaxe validada com `node -c` nos dois. Aguarda Samuel republicar no Apps Script.

### 🔲 ANÁLISE PENDENTE — Correções para próximas sessões

**Prioridade alta:**
- **1.1(A) — URL hardcoded `/dev` em `abrirPainel()`** (`Codigo.gs` linha 59). Trocar por `ScriptApp.getService().getUrl()` ou guardar em `PropertiesService` para facilitar atualização.
- **1.1(E) — `expanded` é resetado a cada refresh** — clicar em "Atualizar" recolhe todos. Preservar estado entre recargas (manter IDs que ainda existem).

**Qualidade / manutenção:**
- **1.2(G) — Prazos da Portaria 638/2026 como constante única** — hoje estão em `novoProcesso()` (array local) e espalhados no plano. Extrair para `PRAZOS_638` no topo do `.gs` (e considerar `PropertiesService` para permitir alteração sem editar código).
- **1.2(I) — Detecção de abas por regex é frágil** — `/processo/i` pegaria "Processos Antigos" se alguém criasse. Usar nomes explícitos.
- **1.2(J) — Criar função `validarPlanilha()`** acionada pelo menu — verifica cabeçalhos, D0s válidas, ProcessoIDs únicos, etapas órfãs.
- **1.2(K) — `var` → `const`/`let`** — manter ADIADO; aplicar só em código novo, não refatorar o que está no ar.

### 💡 INOVAÇÕES AINDA NÃO APROVADAS (backlog ranqueado)

**Discutidas mas precisam conversa antes de implementar:**
- **Inovação 2.4 — Alerta "travado há N dias"** (Samuel gostou, conversar melhor). Ideia: se data atual ultrapassou a data prevista da etapa e ninguém atualizou, pintar a barra com padrão listrado/pulsante — complementa o atraso registrado manualmente, mas não o substitui.
- **Ícone de alerta "perto de vencer" (≤15 dias)** — na sessão 23/04 noite foi adicionado o ícone vermelho (KPI Atrasados) à direita da linha dos processos atrasados. Samuel pediu para futuramente criar variação âmbar quando algum prazo do processo estiver a ≤15 dias de vencer (provavelmente reaproveitando `fim_iso` das etapas em andamento). Implementação sugerida: calcular no próprio `render()` o menor `diffDias` entre as etapas em andamento; se `diffDias ≤ 15` e status != atrasado, renderizar ícone-relógio âmbar na mesma posição (`.proc-alert.warn`).
- **Diferenciar "Atenção" de "Atrasado" — ideia em organização (Samuel, 23/04 noite)** — Hoje qualquer etapa com `AtrasoRealDias > 0` classifica o processo inteiro como atrasado. Proposta: criar um status intermediário ("Atenção" / "Recuperável") para processos que tiveram atraso em etapa(s) intermediária(s) mas cujo **somatório de atrasos ainda cabe dentro do prazo final da Portaria 638/2026** — ou seja, ainda dá para correr em outras etapas e entregar no prazo. O status "Atrasado" ficaria reservado para processos onde o somatório já garante estouro do prazo final. Regra de cálculo sugerida: comparar `sum(PrazoBase + AtrasoReal) de todas as etapas` com `sum(PrazoBase puros)`; se a diferença já ultrapassa a folga disponível do restante do cronograma, vira "Atrasado"; se ainda há folga teórica, vira "Atenção". Impacto: novo status intermediário afeta KPIs (novo card ou substitui lógica atual), cor de barra do Gantt, ícone de alerta (âmbar para atenção, vermelho para atrasado) e ordenação em `applyFilters`. **Conversar com Samuel antes de implementar** — precisa alinhar a regra exata, se "Atenção" é um status separado nos KPIs ou só uma variante visual, e se o campo `Status` da planilha deve refletir isso ou permanecer como está.

**Versão mobile:**
- **Sessão dedicada futura** — Samuel já criou protótipo, vai enviar. Precisa auditoria de cada etapa por causa dos layouts fixos (300px label, 70px/célula, `overflow:hidden` no body).

**Backlog completo (não priorizado):**
- Inovação 2 — Filtro "Minha fila" por setor requisitante
- Inovação 3 — Exportar PDF recolhido via `@media print` (pendência antiga)
- Inovação 5 — Caminho crítico visual (cadeia de etapas sem folga)
- Inovação 6 — Log de alterações via `onEdit` trigger (aba `__log`)
- Inovação 7 — Exportar snapshot (versão congelada para apresentação)
- Inovação 8 — Dashboard analítico com Chart.js (tempo médio por etapa/setor)
- Inovação 9 — Modo simulação isolado ("e se atrasar X dias?")
- Inovação 10 — E-mail automático de atrasos por `MailApp` (para e-mail do setor, sem nomes)
- Inovação 11 — Integração leve com SUAP (API ou QR Code por linha)
- Inovação 12 — Modo TV / Apresentação pública rotativa
- Inovação 14 — Relatório textual semanal em `.md`
- Dark Mode, Filtro por Modalidade, Expandir/Recolher Todos (menores)

---

## 🟢 ESTADO ATUAL DO PROJETO (23/04/2026)

**Power BI: DESCARTADO.** Toda a solução roda em Google Apps Script + Google Sheets.

**O site foi publicado em 22/04/2026 e enviado à chefia para avaliação.**

**Pendências ativas:**
- 🔲 **Samuel**: Criar processo no SUAP referente ao painel (tarefa manual do Samuel)
- 🔲 **Documento RSC**: Descrever utilidade do site para pontuação RSC-TAE (Lei 15.367/2026) — ADIADO para versão final do site
- 🔲 **Ramais reais do SEL**: Confirmar com a chefia e substituir 2123-4001/4002/4003 no footer

**Funcionalidades entregues na versão publicada:**
- Split-panel Gantt (nomes fixos + barras com scroll), botões Mês/Trimestre/Ano, grid tracejado alinhado à escala, linha "Hoje" laranja, scroll sincronizado, footer com email central@cp2.g12.br, logo CPII em base64, KPIs, filtros, tooltip, skeleton de carregamento

---

## 📌 SESSÃO 23/04/2026 — Melhorias aprovadas pelo Samuel

### Análise realizada
Em 23/04/2026 foi feita uma análise completa do `Codigo.gs` e `index.html`, com 18 oportunidades identificadas em 3 categorias. O Samuel aprovou as seguintes:

### ✅ APROVADAS PARA ESTA SESSÃO (implementar agora)

**Correções de Código (4 itens):**
1. ✅ **Cache no `getDados()`** — `CacheService.getScriptCache()` com TTL de 120s. Botão "Atualizar" chama `invalidarCache()` antes. Carga inicial usa cache (mais rápido).
2. ✅ **Sanitização XSS no `innerHTML`** — função `esc(str)` adicionada; aplicada em todos os `innerHTML` que inserem dados da planilha (tooltips de processo e etapa, nomes, motivos, links SUAP).
3. ✅ **Remover `var grBody` duplicada** — segunda declaração removida (linha 1098 original).
4. 🔲 **Modernizar `var` → `const`/`let`** — ADIADO por precaução: site no ar, risco de incompatibilidade com versões de runtime do GAS.

**Melhoria de UX (1 item):**
5. ✅ **KPI "Concluídos"** — 5º card verde com ícone ✓, conta processos com `status === 'ok'` ou `execucao === 100`. Grid ajustado de 4 para 5 colunas (220px cada).

### ✅ APROVADAS PARA SESSÃO FUTURA (não implementar agora)

**Melhoria de UX — Exportar PDF (a discutir):**
- Samuel quer exportar PDF com processos recolhidos (Gantt visível), mas questiona se expandido ficaria legível.
- Decisão: ADIADO para conversa futura sobre layout de impressão.

**Inovações via Google Apps Script (2 itens):**
6. 🔲 **Trigger automático diário** (`ScriptApp.newTrigger`) — recalcular status automaticamente (etapa vencida → "atrasada"). Samuel achava que já acontecia; precisa implementar.
7. 🔲 **Menu customizado na planilha** (`onOpen`) — adicionar menu "Painel CPII" com ação "Abrir Painel" para facilitar acesso da equipe que edita a planilha. Requer análise da planilha (estrutura já mapeada em 23/04).

### ❌ NÃO SELECIONADAS (podem ser retomadas no futuro)
- E-mail automático de atrasos (MailApp)
- Log de alterações (onEdit trigger)
- PropertiesService para configs
- Google Chat webhook
- Geração automática de relatórios (.docx)
- Sidebar/Dialog na planilha
- Dark Mode
- Filtro por Modalidade (PE/CD/CC)
- Expandir/Recolher Todos
- Exportar PDF (parcialmente aprovada — ver acima)

### Estrutura da planilha (mapeada em 23/04/2026)
- **3 abas:** `📋 Instruções`, `🏛 Processos`, `🗓 Etapas`
- **15 processos** (linhas 4–18 da aba Processos)
- **~140 linhas** na aba Etapas (incluindo separadores)
- **8 processos em andamento**, 1 atrasado (SEL-2026-001 com IRP +11d), 6 em planejamento
- Aba Instruções contém guia de uso para a equipe (6 passos)

---

## 🟢 ESTADO ANTERIOR DO PROJETO (22/04/2026)

O painel está **100% funcional** com a planilha v2. Implantado e testado com sucesso em 22/04/2026.

**Feito em 22/04/2026:**
- ✅ `Codigo.gs` reescrito para ler a planilha v2 (novos nomes de campo, separadores, N° SUAP)
- ✅ Zoom de 125% aplicado no painel (`html { zoom: 1.25 }`)
- ✅ "Concorrência (CC)" e "Prazo Portaria 638/2026" removidos da legenda
- ✅ SVG do brasão CPII melhorado (globo azul com gradiente, faixa branca diagonal, ramos com bagas)
- ✅ Painel implantado e funcionando: 15 processos, 7 andamento, 2 atrasados, 6 planejamento
- ✅ Logo oficial do CPII: PNG convertido para base64 e inserido no HTML

## 🐛 BUGS CONHECIDOS E PONTOS FRÁGEIS

### ✅ Corrigido em 22/04/2026
- **Gantt cortado para processos com datas anteriores a Jan/2026** — `getRange()` usava `Math.max(0, mn-1)` impedindo índices negativos. Corrigido com `Infinity`/`-Infinity`.

### ⚠️ Riscos ativos (ordem de criticidade)

**1. [ALTO] Processo sem etapas cadastradas**
Se um processo existir na aba Processos mas não tiver linhas na aba Etapas, `p.inicio` e `p.fim` serão `null`. O `render()` pode chamar `barX(null, range.start)` → resultado `NaN` → barra invisível sem erro visível.
→ Fix: adicionar guard no `render()`: `if (p.inicio === null) return;` antes de desenhar a barra.

**2. [ALTO] Data de abertura (D0) vazia ou inválida na planilha**
Se alguém apagar a data de um processo, o `Codigo.gs` calcula todas as datas como `Invalid Date` → processo aparece com datas absurdas ou some do Gantt.
→ Fix: validar no `Codigo.gs` — se `D0` inválido, pular o processo e logar aviso.

**3. [ALTO] AtrasoRealDias com texto em vez de número**
Se alguém digitar "11 dias" em vez de `11`, o cálculo em cascata produz `NaN` em todas as etapas seguintes.
→ Fix: no `Codigo.gs`, fazer `parseInt(valor) || 0` ao ler `AtrasoRealDias`.

**4. [MÉDIO] MotivoAtraso com aspas no texto**
Se alguém escrever `"não respondeu"` no campo, pode quebrar a serialização JSON.
→ Fix: já resolvido se o Codigo.gs usa `JSON.stringify()` corretamente — verificar.

**5. [MÉDIO] StatusEtapa fora do dropdown**
Valor digitado manualmente fora dos 5 opções válidas → cor da barra desaparece.
→ Fix: `normalizeStatus` deve ter fallback para `'pendente'` em vez de `undefined`.

**6. [BAIXO] ProcessoID duplicado na planilha**
Etapas do segundo processo sobrescrevem as do primeiro silenciosamente.
→ Fix: validar unicidade no `Codigo.gs` e logar aviso.

**7. [BAIXO] Data muito futura (ex: 2030)**
Eixo do Gantt fica muito largo. Não quebra, mas prejudica usabilidade.
→ Fix: limitar `end` a no máximo `tidx + 24` (2 anos à frente do mês atual).

---

## ⏳ PRÓXIMA SESSÃO — O que fazer

### 1. ~~Republicar o HTML corrigido~~ ✅ Feito pelo Samuel em 22/04/2026
Bug de Gantt cortado (datas anteriores ao range) já reimplantado pelo Samuel diretamente.

### 2. ~~Correções de robustez no Codigo.gs~~ ✅ Feito em 22/04/2026 (sessão tarde)
Corrigir os 3 bugs críticos diretamente no `Codigo.gs`:

**Fix 1 — AtrasoRealDias com texto:**
```js
// Trocar leitura direta por:
var atraso = parseInt(e['AtrasoRealDias ◄ EDITAR']) || 0;
```

**Fix 2 — D0 inválida:**
```js
// Após ler D0, validar antes de calcular:
var d0 = new Date(p['D0 (Data Abertura)']);
if (isNaN(d0.getTime())) continue; // pula processo com data inválida
```

**Fix 3 — StatusEtapa fora do dropdown:**
```js
// No normalizeStatus, adicionar fallback:
return statusMap[s] || 'pendente';
```

**Fix 4 — Processo sem etapas:**
```js
// No render(), antes de desenhar barra do processo:
if (p.inicio === null || p.fim === null) return;
```

### 3. ~~Botões de escala temporal no Gantt~~ ✅ Feito em 22/04/2026 (sessão tarde)
Implementado no `AppsScript_index.html`. **Aguarda republicação pelo Samuel.**
Detalhes do que foi feito:
- CSS: `.escala-btn` + `.active-escala` (visual idêntico aos botões de status)
- HTML: grupo "Escala" na filter-bar com botões Mês / Trimestre / Ano
- JS: variável `escalaAtiva`, função `getCellW()`, `barX()`/`barW()` adaptados, cabeçalho do Gantt por escala, célula `.mo-cell` com largura dinâmica, linha "Hoje" reposicionada, função `setEscala()`

### 4. PRÓXIMA ETAPA — A definir
Adicionar 3 botões de visualização — **Mês / Trimestre / Ano** — que o usuário escolhe conforme necessidade. Ficam posicionados no canto superior direito do Gantt, como controles de zoom.

**Layout dos botões:**
```
TODOS  ANDAMENTO  ATRASADO  PLANEJAMENTO        MÊS  TRIMESTRE  ANO
```
Ou integrado à barra de filtros, separado por um divisor visual.

**Como funciona cada modo:**

| Modo | CELL_W | Cabeçalho | Quando usar |
|---|---|---|---|
| Mês | 70px | Todos os meses (Jan, Fev, Mar...) | Range ≤ 18 meses |
| Trimestre | 45px | Só Jan/Abr/Jul/Out | Range de 1–4 anos |
| Ano | 90px por ano | Só o ano (2024, 2025, 2026...) | Range > 4 anos |

**O que muda no código (`index.html`):**

1. Adicionar variável global `var escalaAtiva = 'mes';`
2. `CELL_W` vira função: `getCellW()` retorna 70, 45 ou 90 conforme `escalaAtiva`
3. Cabeçalho de meses:
   - Modo Mês: renderiza todos os meses (comportamento atual)
   - Modo Trimestre: só renderiza Jan/Abr/Jul/Out — os outros meses têm `display:none` ou largura 0
   - Modo Ano: uma célula por ano, largura fixa de 90px
4. `barX()` e `barW()`:
   - Mês e Trimestre: mesma lógica atual, só `CELL_W` muda — barras se adaptam automaticamente
   - Ano: requer ajuste — 1 célula = 12 meses, então `barX = Math.floor((idx - rangeStart) / 12) * 90`
5. Botões com estilo `active` igual aos botões de status (mesmo CSS `.status-btn`)
6. Ao clicar num botão: atualiza `escalaAtiva` → chama `applyFilters()` → tudo redesenha

**Detalhe do modo Ano (único que requer lógica diferente):**
```js
// barX no modo ano:
function barX(moIdx, rangeStart) {
  if (escalaAtiva === 'ano') {
    return Math.floor((moIdx - rangeStart) / 12) * CELL_W + 4;
  }
  return (moIdx - rangeStart) * CELL_W + 4;
}
// barW no modo ano:
function barW(ini, fim) {
  if (escalaAtiva === 'ano') {
    return (Math.ceil((fim - ini + 1) / 12)) * CELL_W - 8;
  }
  return (fim - ini + 1) * CELL_W - 8;
}
```

**Estimativa:** 30–40 min para Mês + Trimestre | +30 min para Ano

### ~~4. Logo oficial do CPII~~ ✅ Concluído em 22/04/2026
PNG do brasão convertido para base64 e substituído no HTML pelo Samuel diretamente.

### [HISTÓRICO] O que mudou na planilha v2 (já implementado)

**Aba `🏛 Processos`** — mudanças de estrutura:
- Removidas: colunas `Nivel`, `Tipo`, `RespFaseInterna`, `RespFaseExterna`
- Renomeada: `NProcessoSEI` → `N° SUAP` (agora na coluna B, antes de Objeto)
- `ProcessoID` continua existindo mas está **oculta** (coluna A) — o código ainda a usa para relacionar com etapas
- `TemIRP` agora retorna `"Sim"` ou `"Não"` (antes era `TRUE`/`FALSE`)
- Cabeçalho real na **linha 3** (linhas 1-2 são título e aviso)
- Ordem das colunas: `ProcessoID | N° SUAP | Objeto | Modalidade | D0 (Data Abertura) | Link SUAP | Tem IRP? | Status`

**Aba `🗓 Etapas`** — mudanças de estrutura:
- Removida: coluna `EtapaID` — substituída pelo `ProcessoID` (oculto, col A)
- Cabeçalho real na **linha 2** (linha 1 é título)
- Dados começam na **linha 3**
- Entre cada bloco de etapas há uma **linha separadora** onde col A contém o texto do separador e colunas B-I são `None` — o código deve pular essas linhas (detectar por `row[1] is None`)
- Colunas editáveis agora têm sufixo `◄ EDITAR` nos cabeçalhos: `AtrasoRealDias ◄ EDITAR`, `MotivoAtraso ◄ EDITAR`, `StatusEtapa ◄ EDITAR`
- `StatusEtapa` agora tem valores: `Não iniciada`, `Em andamento`, `Concluída`, `Atrasada`, `Não se aplica`
- Ordem das colunas: `ProcessoID | Ord. | Etapa | Fase | Agente Responsável | Prazo (dias) | AtrasoRealDias ◄ EDITAR | MotivoAtraso ◄ EDITAR | StatusEtapa ◄ EDITAR`

### Adaptações necessárias no Codigo.gs

1. **Leitura de processos:** buscar cabeçalho por `ProcessoID` (já funciona), mas atualizar mapeamento de campos:
   - `p['N° SUAP']` em vez de `p['NProcessoSEI']`
   - `p['D0 (Data Abertura)']` em vez de `p['D0_DataAbertura']`
   - `p['Link SUAP']` em vez de `p['LinkSUAP']`
   - `p['Tem IRP?']` com valor `'Sim'`/`'Não'` em vez de `TRUE`/`FALSE`
   - `p['Objeto']` — igual, só mudou de posição (sem impacto no código)

2. **Leitura de etapas:** buscar cabeçalho por `ProcessoID` (linha 2), dados a partir da linha 3:
   - Pular linhas separadoras: `if (!rowE[1]) continue;` (col B = Ordem, será null nas separadoras)
   - Mapear `e['Etapa']` em vez de `e['NomeEtapa']`
   - Mapear `e['Prazo (dias)']` em vez de `e['PrazoBaseDias']`
   - Mapear `e['Agente Responsável']` em vez de `e['Agente']`
   - Mapear `e['AtrasoRealDias ◄ EDITAR']` (agora sem fallback, nome fixo)
   - Mapear `e['MotivoAtraso ◄ EDITAR']` (agora sem fallback, nome fixo)
   - Mapear `e['StatusEtapa ◄ EDITAR']` (agora sem fallback, nome fixo)
   - `normalizeStatus` já contempla os valores novos — verificar se `'Não se aplica'` está mapeado

3. **N° SUAP no retorno JSON:** incluir `suap_num: p['N° SUAP']` no objeto de processo retornado, para exibição no tooltip/card do painel

---

### O que o painel faz
- Exibe o cronograma de contratações do Colégio Pedro II / SEL (Setor de Licitações)
- Lê dados diretamente de uma planilha no Google Sheets
- Mostra 4 KPIs: Total de processos, Em andamento, Atrasados, Em planejamento
- Exibe um Gantt interativo com todas as etapas de cada processo
- Cada barra do Gantt tem cor por modalidade (PE = azul escuro, CD = dourado, CC = verde escuro)
- Linha vertical laranja indica "Hoje"
- Botão "+" em cada processo expande as etapas individuais com barras de prazo e realizado
- Tooltip ao passar o mouse mostra status, motivo do atraso e link do SUAP
- Filtro por status (Todos / Andamento / Atrasado / Planejamento) e busca por texto
- Botão "Atualizar" recarrega os dados da planilha sem recarregar a página

### Onde fica cada coisa

| O quê | Onde |
|---|---|
| Planilha de dados | Google Sheets — `CronogramaContratacoes_CPII_GoogleSheets` (conta Google do Samuel) |
| Código do servidor | Google Apps Script — projeto "Painel Gantt CPII v1" → arquivo `Codigo.gs` |
| HTML do painel | Google Apps Script — projeto "Painel Gantt CPII v1" → arquivo `index.html` |
| Cópias locais dos arquivos | Pasta `Dashboard - LIC` no Desktop do Samuel |
| Guia de uso e configuração | `GUIA_AppsScript_PainelGantt.md` (pasta Dashboard - LIC) |

### Arquivos locais relevantes (pasta Dashboard - LIC)

| Arquivo | Função |
|---|---|
| `AppsScript_Codigo.gs` | Código do servidor — **desatualizado**, precisa ser reescrito na próxima sessão |
| `AppsScript_index.html` | HTML completo do painel — atualizado e funcional |
| `GUIA_AppsScript_PainelGantt.md` | Passo a passo completo para configurar do zero |
| `CronogramaContratacoes_CPII_v2.xlsx` | ✅ Nova planilha reestruturada (versão final — usar esta) |
| `CronogramaContratacoes_CPII_GoogleSheets.xlsx` | Planilha antiga — descontinuada, não usar |

---

## 📋 COMO FUNCIONA A ARQUITETURA (para qualquer IA entender)

### Fluxo de dados
```
Google Sheets (planilha) → Codigo.gs (servidor) → index.html (painel visual)
```

1. O usuário acessa a URL pública do Web App
2. O `Codigo.gs` serve o `index.html` via função `doGet()`
3. O `index.html` carrega no browser e chama `google.script.run.getDados()`
4. O `Codigo.gs` lê a planilha Google Sheets e retorna um JSON com todos os processos e etapas já calculados
5. O `index.html` recebe o JSON e renderiza o Gantt, KPIs e filtros

### Estrutura da planilha Google Sheets (v2 — após reestruturação de 21/04/2026)

**Aba `🏛 Processos`** (somente leitura para a equipe):
- Linha 1: título decorativo
- Linha 2: aviso "Esta aba é somente leitura"
- Linha 3: cabeçalho real com as colunas (nessa ordem):
  - `ProcessoID` — ex: `SEL-2026-001` (**coluna oculta**, chave interna)
  - `N° SUAP` — ex: `23040.001002/2026-01` (identificador visível para a equipe)
  - `Objeto` — descrição do que está sendo contratado
  - `Modalidade` — ex: `Pregão Eletrônico`, `Contratação Direta`, `Concorrência`
  - `D0 (Data Abertura)` — data de início do processo (DD/MM/AAAA)
  - `Link SUAP` — URL do processo no sistema SUAP
  - `Tem IRP?` — `"Sim"` ou `"Não"` (se tem Intenção de Registro de Preços)
  - `Status` — ex: `Em andamento`, `Planejamento`

**Aba `🗓 Etapas`** (editável pela equipe — apenas colunas com ◄ EDITAR):
- Linha 1: título decorativo
- Linha 2: cabeçalho real com as colunas (nessa ordem):
  - `ProcessoID` — ex: `SEL-2026-001` (**coluna oculta**, chave de ligação)
  - `Ord.` — número da etapa (1, 2, 3...)
  - `Etapa` — nome da etapa
  - `Fase` — Interna, Externa ou Contratual
  - `Agente Responsável` — setor (ex: DECOF/DIAD, Equipe de planejamento, SEL/SEPMA)
  - `Prazo (dias)` — prazo conforme Portaria 638/2026 (não editar)
  - `AtrasoRealDias ◄ EDITAR` — número de dias de atraso real
  - `MotivoAtraso ◄ EDITAR` — texto explicando o motivo do atraso
  - `StatusEtapa ◄ EDITAR` — dropdown: `Não iniciada`, `Em andamento`, `Concluída`, `Atrasada`, `Não se aplica`
- Entre cada bloco de etapas há uma **linha separadora** (col A = texto "N° SUAP: xxx | Objeto", colunas B-I = vazias) — o código deve pular essas linhas detectando `row[1] == null`

### Lógica de cálculo de datas (Codigo.gs)

As datas são calculadas **em cascata** a partir de `D0 (Data Abertura)`:
- Cada etapa começa onde a anterior terminou
- `DataInicio_etapa = cursor_acumulado`
- `cursor += PrazoBaseDias + AtrasoRealDias`
- `DataFim_etapa = cursor - 1 dia`
- O atraso de uma etapa **empurra automaticamente** todas as etapas seguintes

### Prazos por etapa (Portaria 638/2026 do CPII)

| Etapa | Prazo |
|---|---|
| Designação da equipe | 5 dias |
| ETP + Mapa de Riscos + Pesquisa de Preços | 45 dias |
| Minuta do Termo de Referência | 10 dias |
| IRP — Intenção de Registro de Preços (só se SRP) | 15 dias |
| Adequações finais | 10 dias |
| Versão final do TR | 10 dias |
| Envio ao SEL/SEPMA | 3 dias |
| Fase externa — Contratação Direta | 30 dias |
| Fase externa — Pregão Eletrônico | 90 dias |
| Fase externa — Concorrência | 100 dias |

> **Nota:** A fase "Assinatura contrato / Ata (ARP)" aparece na planilha mas está **fora do escopo do painel** — é responsabilidade do Setor de Contratos, não do SEL.

### Status e cores

| Status | Cor no Gantt | Condição |
|---|---|---|
| Atrasado | Vermelho | Qualquer etapa com `AtrasoRealDias > 0` |
| Em andamento | Azul claro | Tem etapa com `StatusEtapa = Em andamento` e sem atraso |
| Em planejamento | Dourado | Nenhuma etapa iniciada |
| Concluído | Verde | Todas as etapas com `StatusEtapa = Concluída` |

---

## ⚠️ ATENÇÃO — Codigo.gs DESATUALIZADO (painel quebrado até a próxima sessão)

O `Codigo.gs` atual ainda lê a estrutura antiga da planilha. Não funciona com a v2. A próxima sessão deve começar obrigatoriamente pela reescrita do `Codigo.gs`. Ver seção "PRÓXIMA SESSÃO" acima para a lista detalhada de adaptações.

### Como republicar após qualquer alteração no Apps Script
1. Abrir https://script.google.com → projeto "Painel Gantt CPII v1"
2. Fazer a alteração desejada no `Codigo.gs` ou `index.html`
3. Salvar (Ctrl+S)
4. Clicar em **Implantar → Gerenciar implantações**
5. Clicar no lápis ✏️ da implantação existente
6. Em "Versão", selecionar **Nova versão**
7. Clicar em **Implantar**
8. Testar a URL pública em aba anônima

---

## 📌 DECISÕES INSTITUCIONAIS (não alterar sem validar com a chefia)

- **Sem nomes de pessoas físicas** em nenhum visual — usar apenas o setor (ex: "Setor Requisitante", "DECOF/DIAD")
- **Simulador de atraso** (slider interativo): cancelado — poderia confundir dados reais com simulações
- **Documentos de fase interna** (ETP, TR, etc.): sempre usar modelos AGU com formatação original
- **Escopo do painel:** vai até o fim da Fase Externa — não inclui fase contratual

---

## 🗂️ HISTÓRICO RESUMIDO DO PROJETO

| Data | O que aconteceu |
|---|---|
| Jan–Mar/2026 | Levantamento de requisitos, definição dos processos e etapas |
| 15/04/2026 | Início da construção no Power BI Desktop via MCP |
| 16/04/2026 | Reunião com o diretor — aprovação do escopo e ajustes visuais |
| 19/04/2026 | Tentativa de painel HTML dentro do Power BI — descontinuada por limitações do iframe |
| 20/04/2026 | Decisão de migrar para Google Apps Script + Google Sheets |
| 21/04/2026 | Painel publicado e funcionando — bug de leitura de colunas corrigido |
| 21/04/2026 (tarde) | Planilha reestruturada (v2): colunas desnecessárias removidas, N° SUAP visível, separadores entre processos, dropdown de status, formatação condicional. Codigo.gs ainda não atualizado. |

---

## 🔧 REFERÊNCIAS TÉCNICAS

- **URL do Web App:** começa com `https://script.google.com/macros/s/AKfycby...` (Samuel tem o link completo)
- **Conta Google usada:** conta pessoal/institucional do Samuel
- **Projeto Apps Script:** "Painel Gantt CPII v1"
- **Planilha Google Sheets:** `CronogramaContratacoes_CPII_GoogleSheets`
- **Processos atrasados em 21/04:** SEL-2026-001 (IRP +11 dias) e SEL-2026-010 (ETP +2 dias)
- **Processos com IRP:** SEL-2026-001, SEL-2026-012, SEL-2026-013 (9 etapas cada)
- **Backup local (Power BI):** `Dashboard de processos.pbix` — descontinuado, não usar
