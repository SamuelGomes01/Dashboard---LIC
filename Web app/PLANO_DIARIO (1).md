# Plano de Trabalho — Sistema de Contratações CPII
> Atualizado em: 31/05/2026 — AppSEL com trigger 10h30, novas regras de e-mail e documentação para GitHub

---

## ✅ ESTADO ATUAL DO SISTEMA

### Planilha: `CronogramaContratacoes_CPII_v4_CAPACIDADE_FASES.xlsx`
- **Abas ativas:** 🏛 Processos · 🗓 Etapas · 📊 Capacidade · Instruções · Matriz de Pontuação · Prioridades GUT
- **Aba Capacidade:** duas tabelas lado a lado (Fase Interna | Fase Externa) + registro unificado abaixo
- **Aba Processos:** inclui coluna `EmailRequisitante` e `Setor Requisitante`
- **Aba Etapas:** coluna `StatusEtapa ◄ EDITAR` com valores: `Não iniciada` · `Em andamento` · `Concluída` · `Aguardando requisitante` · `Suspenso/Paralisado` · `Não se aplica`

### Arquivos do App (Google Apps Script)
| Arquivo | Status |
|---|---|
| `AppSEL_Codigo.gs` | ✅ Versão atual — back-end completo |
| `AppSEL_index.html` | ✅ Versão atual — app dos servidores |
| `AppsScript_Codigo.gs` | ⚠️ Versão antiga do painel público — manter separado |
| `AppsScript_index.html` | ⚠️ Versão antiga do painel público — manter separado |

---

## 🗺️ ROADMAP

```
FASE 1 ✅ CONCLUÍDA  → Painel responsivo para mobile (leitura pública)
FASE 2 ✅ CONCLUÍDA  → App interno dos servidores + alertas por e-mail
FASE 3 (futura)     → Portal de campi / replicação para outros setores
```

---

## 📌 FASE 2 — App interno dos servidores [✅ v2.1 — 30/05/2026]

### Arquivos: `AppSEL_index.html` + `AppSEL_Codigo.gs`

### Funcionalidades implementadas

#### Autenticação e equipe
- **Login dinâmico:** botões carregados do GS (via `getServidoresApp()`), com cache no `localStorage`
- **Gerenciamento de equipe** (aba Config, só chefes): add/editar/remover servidores, cor de avatar, flag `isChefe`
- **Servidores persistidos** no PropertiesService (`SEL_SERVIDORES_JSON`)
- **Trocar usuário:** corrigido — não usa `location.reload()` (quebrava no GAS), manipula DOM diretamente

#### Aba Etapas (lista principal)
- Cards de processos com: badge de status, N° SUAP, nome, setor requisitante, barra de progresso, etapa atual
- **Badge do servidor clicável:** abre bottom sheet para trocar responsável — suporta até 2 servidores (fase interna + fase externa para PE/Concorrência); atualiza Capacidade e coluna Agente na aba Etapas via `atribuirResponsaveisApp()`
- **Badge persistente:** fallback via coluna `Agente Responsável` da aba Etapas quando processo não está na Capacidade
- **Transição automática de fase:** ao concluir a última etapa interna, Capacidade inativa a linha de fase interna (Ativo = Não) e o badge troca para o servidor externo
- **Filtro por servidor:** considera servidor ativo da fase atual (fase interna ativa → filtra por `servidor`; fase externa ativa → filtra por `servidorExt`)
- **Ícone de alerta ⚠:** canto superior direito dos cards com prazo vencido; ausente em Aguardando/Suspenso
- **Banner dinâmico:** no filtro "Todos" mostra aviso geral + prompt de trigger se não instalado; no filtro individual mostra mensagem personalizada (chefes: versão de equipe; servidor: versão pessoal)
- Processos "A iniciar" (status `planejamento`) **removidos da aba Etapas** — aparecem apenas na aba Fila
- Fundo do app em cinza neutro `#e8ecf0`

#### Aba Fila (nova)
- Combina processos sem D0 + processos com D0 mas status `planejamento`
- **Simulação detalhada por etapa:** painel expansível por processo com tabela de todas as etapas (início e conclusão de cada fase), calculada em cascata com dias úteis e feriados nacionais
- **D0 ajustável por processo:** date picker por card — ao mudar a data, a tabela de etapas atualiza em tempo real
- **Reordenação:** setas ▲▼ para definir prioridade
- **Seleção múltipla:** checkboxes para iniciar 1 ou mais processos simultaneamente
- **Atribuição de responsáveis:** fase interna + fase externa (PE), mesmo modal colorido
- **Botão "Iniciar":** define D0 na planilha e grava Agente nas etapas via `iniciarProcessos()`
- Badge numérico na nav indicando quantidade na fila

#### Detalhe do processo (modal)
- Etapas N/A (IRP sem IRP, Assinatura contrato) **ocultadas** do modal
- Aviso azul no passo 3 da conclusão quando for a última etapa da fase interna (informa handoff e remoção de pontos da Capacidade)
- Toast de handoff ao concluir: "Fase interna concluída! [Servidor ext] assume a fase externa."
- Nomes das etapas atualizados: "Adequações finais dos documentos e envio à Procuradoria", "Versão final do TR e demais documentos aprovados", "Envio ao SEL/SEPMA (Recebimento de processo, cadastro e publicação da licitação)"
- Assinatura contrato/Ata (ARP) → `Não se aplica` automaticamente (função `migrarNomesEtapas()` para processos existentes, `cadastrarProcesso()` para novos)

#### Navegação
- **Config** movida para menu dropdown no canto superior direito (user-chip ⋮)
- **Aba Fila** adicionada como segunda posição na nav
- **Histórico** movido para última posição na nav
- Ordem final: Etapas | Fila | Capacidade | Histórico

- Filtros por modalidade (PE/CD) e por servidor

#### Detalhe do processo (modal)
- Lista de etapas com status colorido, prazo, motivo de atraso, cadeado de histórico
- **Concluir etapa:** fluxo guiado de 3 passos (data → atraso/motivo → confirmação)
- **⚙ Status (sem concluir):** botão ao lado de "Concluir" → bottom sheet com opções Em andamento / Aguardando requisitante / Suspenso — salva direto na planilha via `atualizarStatusEtapa()`
- **E-mail do requisitante:** botão no rodapé do modal para adicionar/editar o email do setor (verde = cadastrado, âmbar = faltando)
- **Link SUAP:** botão no rodapé, oculto se não cadastrado

#### Aba Capacidade
- Cards por servidor com barra de utilização (verde/âmbar/vermelho)
- Lista de processos ativos por fase (Interna/Fase Externa), nome completo com quebra vertical
- Botão ✏️ Pontuar por processo (só chefes) — modal guiado de pontuação
- Botão ✉️ por processo **removido** da Capacidade (agora está no modal de Etapas)

#### Aba Config
- Sessão (logado como / trocar usuário)
- **Equipe do SEL** (novo): gerenciar servidores — add/editar/remover, paleta de 8 cores, flag chefe
- E-mails dos servidores (cada um edita o próprio)
- Trigger de avisos automáticos (instalar/confirmar)

#### Avisos por e-mail (`enviarAvisosPrazo`)
- **Trigger diário às 10h30**
- **3 dias úteis** de antecedência (era 4)
- **Dois tipos de aviso:**
  - Prazo próximo (vence em ≤ 3 dias úteis)
  - Prazo vencido (deadline passou, etapa não concluída)
- **Destinatários por tipo de processo/status:**
  - Processo regular em andamento: Chefia do SEL + Servidor responsável + Setor requisitante
  - Processo da chefia (servidor = chefe ou sem servidor): Chefia + Setor requisitante
  - Aguardando requisitante: somente setor requisitante, se houver `EmailRequisitante`
  - Suspenso/Paralisado: não envia e-mail
- **Não envia para:** processos concluídos (`ok`), em planejamento/sem início (`planejamento`) ou suspensos/paralisados
- Suporta novo formato de retorno `{processos, filaPrevisao}` de `getEtapasParaApp()`

#### Funções GS adicionadas/atualizadas nesta fase
| Função | Descrição |
|---|---|
| `getServidoresApp()` | Retorna lista dinâmica de servidores do PropertiesService |
| `salvarServidoresApp(lista)` | Persiste lista de servidores no PropertiesService |
| `salvarEmailProcesso(pid, email)` | Grava EmailRequisitante na aba Processos |
| `trocarServidor(pid, servidor)` | Atualiza responsável na aba Capacidade |
| `atualizarStatusEtapa(linha, status)` | Grava StatusEtapa na aba Etapas sem concluir |
| `salvarPontuacaoCap(params)` | Grava pontuação guiada na aba Capacidade |
| `salvarOutrosCap(params)` | Grava campo "Outros" na aba Capacidade |
| `getCapacidadeApp()` | Enriquecido com `pid` e `emailR` por processo |
| `getEtapasParaApp()` | Retorna `{processos, filaPrevisao}` com `etapasPrazos` e `servidor/servidorExt` por processo; fallback de badge via Agente |
| `enviarAvisosPrazo()` | E-mails de atraso incluem etapa, dias de atraso e nova data de conclusão do processo |
| `atribuirResponsaveisApp(params)` | Atribui até 2 servidores (int+ext), atualiza Capacidade e Agente nas Etapas |
| `verificarTriggerAvisos()` | Informa se trigger diário está instalado (usado no banner) |
| `iniciarProcessos(params)` | Define D0 e Agente para processos selecionados da fila |
| `_verificarTransicaoFase_()` | Detecta fim da fase interna e inativa linha de Capacidade |
| `migrarNomesEtapas()` | Renomeia etapas e marca Assinatura como N/A em processos existentes |
| `getEmails()` | Usa lista dinâmica de servidores |
| `salvarEmail(servidor, email)` | Sem mais lista hardcoded de servidores válidos |

---

## 📌 FASE 3 — Portal de campi / replicação [FUTURA]

### Objetivo
Criar uma página inicial que funciona como portal de entrada, com cards para cada campus do CPII. Ao clicar num campus, abre o painel ou o app daquele campus.

### Estrutura técnica planejada
```
?page=painel   → painel público atual (só leitura, Fase 1)
?page=app      → interface dos servidores (Fase 2)
?page=home     → portal de campi (Fase 3)
```

### Campi do CPII
Reitoria · São Cristóvão I/II/III · Maracanã · Tijuca I/II · Humaitá I/II · Engenho Novo I/II · Realengo I/II · Niterói · Centro · Duque de Caxias · Nova Iguaçu · Angra dos Reis · Petrópolis

---

## 📋 DECISÕES INSTITUCIONAIS VIGENTES

- **Sem nomes de pessoas físicas** em nenhum visual público — usar apenas o setor
- **Simulador de atraso** (slider): cancelado permanentemente
- **Documentos fase interna** (ETP, TR etc.): sempre usar modelos AGU com formatação original
- **Escopo do painel:** vai até fim da Fase Externa — fase contratual fora do escopo
- **Segregação de funções** (Portaria 638/2026, art. 42): servidor da fase interna NÃO conduz fase externa do mesmo processo
- **Chefes do setor** (flag `isChefe`): acesso para pontuar processos, gerenciar equipe e trocar responsável

---

## 🔧 REFERÊNCIAS TÉCNICAS

| Item | Detalhe |
|---|---|
| Conta Google | Conta pessoal/institucional do Samuel |
| Projeto Apps Script | "Painel Gantt CPII v1" (ou similar) |
| Planilha atual | `CronogramaContratacoes_CPII_v4_CAPACIDADE_FASES.xlsx` |
| Pasta local | `Dashboard - LIC/Web app/` no Desktop do Samuel |
| Email da chefia | Configurar `CHEFIA_EMAIL` no topo de `AppSEL_Codigo.gs` |

### Arquivos locais (pasta Dashboard - LIC/Web app)
| Arquivo | Uso |
|---|---|
| `AppSEL_Codigo.gs` | ✅ Back-end atual — colar no GAS |
| `AppSEL_index.html` | ✅ Front-end atual — colar no GAS |
| `AppsScript_Codigo.gs` | ⚠️ Painel público legado — manter para referência |
| `AppsScript_index.html` | ⚠️ Painel público legado — manter para referência |
| `CronogramaContratacoes_CPII_v4_CAPACIDADE_FASES.xlsx` | ✅ Planilha atual |
| `PLANO_DIARIO (1).md` | ✅ Este arquivo |

### Como republicar após alteração
1. Abrir `https://script.google.com` → projeto do SEL
2. Colar `AppSEL_Codigo.gs` e `AppSEL_index.html` atualizados → Ctrl+S
3. Implantar → Gerenciar implantações → lápis ✏️ → Nova versão → Implantar
4. Testar em aba anônima

---

## 🗂️ HISTÓRICO RESUMIDO DO PROJETO

| Data | O que aconteceu |
|---|---|
| Jan–Mar/2026 | Levantamento de requisitos, definição dos processos e etapas |
| 15/04/2026 | Início da construção no Power BI Desktop via MCP |
| 16/04/2026 | Reunião com o diretor — aprovação do escopo e ajustes visuais |
| 19/04/2026 | Tentativa de painel HTML dentro do Power BI — descontinuada (limitações iframe) |
| 20/04/2026 | Decisão de migrar para Google Apps Script + Google Sheets |
| 21/04/2026 | Painel publicado e funcionando — bug de leitura de colunas corrigido |
| 21/04/2026 | Planilha reestruturada (v2): colunas limpas, N° SUAP visível, separadores, dropdown de status |
| 08/05/2026 | Fix KPI "Em Andamento"; painel responsivo para mobile (Fase 1 concluída) |
| 12/05/2026 | Aba Capacidade recriada com estrutura definitiva (duas tabelas) |
| 29/05/2026 | App dos servidores (Fase 2) concluído: login dinâmico, gestão de equipe, avisos por e-mail, fila de prioridades, badge clicável, ⚙ status de etapa |
| 30/05/2026 | v2.1: aba Fila com simulação detalhada por etapa + D0 ajustável; transição automática fase interna→externa; badge via fallback Agente; banner dinâmico por filtro; Config no header; Histórico à direita; nomes de etapas atualizados; Assinatura→N/A; multiselect de responsáveis |

---

## 📐 ARQUITETURA DO SISTEMA

```
Google Sheets (banco de dados)
         │
         ├── AppSEL_Codigo.gs   (back-end: lê, escreve, trigger, e-mails)
         │
         └── AppSEL_index.html  (app dos servidores — login + etapas + capacidade + config)
```

### Estrutura da planilha
**🏛 Processos** — cabeçalho linha 1. Colunas: `ProcessoID · N° SUAP · Objeto · Modalidade · D0 (Data Abertura) · Tem IRP? · Setor Requisitante · EmailRequisitante · Link SUAP`

**🗓 Etapas** — cabeçalho linha 1. Colunas: `ProcessoID · Etapa · Fase · Agente Responsável · Prazo (dias) · StatusEtapa ◄ EDITAR · MotivoAtraso ◄ EDITAR · DataRealizacao ◄ EDITAR`

**📊 Capacidade** — cabeçalho de resumo linha 17 (aprox); cabeçalho de processos identificado pelo código. Colunas: `Servidor · Objeto · ProcessoID · Ativo · Modalidade · Fase · pts11 · pts12 · pts23 · Total`

### Lógica de datas (cascata)
- `DataInicio_etapa = cursor_acumulado` (D0 + prazos anteriores)
- `DataFim_etapa = DataInicio + PrazoDias`
- Atraso de uma etapa empurra todas as seguintes automaticamente
- Etapas sem D0 → `filaPrevisao` (retornadas separadamente, sem cálculo de datas)

### StatusEtapa — valores válidos na planilha
`Não iniciada` · `Em andamento` · `Concluída` · `Aguardando requisitante` · `Suspenso/Paralisado` · `Não se aplica`

### Normalização de status no código (`_normStatus_`)
`ok` · `andamento` · `aguardando` · `paralisado` (inclui Suspenso) · `atrasado` · `na` · `pendente`

---

## 🛠️ SESSÃO 30/05/2026 (tarde) — Correções na aba Fila + status + capacidade

Diagnóstico a partir de prints do Samuel (aba Fila com datas simuladas todas iguais ao D0; processo Gêneros Alimentícios mostrado como "A INICIAR" mesmo em andamento; processo de abastecimento de água não pontuando na Capacidade).

**AppSEL_Codigo.gs — corrigido:**
1. **Cascata da Fila (bug das datas iguais):** o objeto `etCalc` montado em `getEtapasParaApp()` não devolvia o campo `prazo`. Na aba Fila, `_simularEtapas_` lê `et.prazo` dos processos em planejamento (que usam `p.etapas`), então todas as etapas somavam 0 dias úteis e caíam no mesmo dia do D0 simulado. Adicionado `prazo: et.prazo` ao retorno de cada etapa. Agora a simulação respeita os prazos da Portaria 638/2026 e pula sáb/dom + feriados nacionais via `_addDU_br_`.
2. **Status "A INICIAR" em processo já iniciado:** o cálculo de `st` classificava como `planejamento` qualquer processo sem etapa explicitamente "Em andamento", mesmo já tendo etapas concluídas. Adicionada a regra `else if (concl > 0) st = 'andamento'` — processo com ao menos uma etapa concluída (e <100%) passa a ser "Em andamento". Isso tira o Gêneros Alimentícios da fila "A INICIAR".
3. **Robustez do `_normStatus_`:** trocadas as comparações exatas por `indexOf` (`conclu`, `andament`, `atras`). Agora variações de texto na planilha ("Em andamento ", "Concluída com atraso" etc.) são reconhecidas corretamente.

Sintaxe verificada com `node --check` ✅.

**Capacidade (abastecimento de água — aguardando requisitante não pontua):**
Diagnóstico inicial substituído pela correção final abaixo: a Capacidade agora sincroniza automaticamente os registros ativos/futuros a partir da aba Etapas, sem depender de ajuste manual do campo `Ativo`.

---

## 🛠️ SESSÃO 30/05/2026 (fim da sessão) — Consistência Etapas ⇄ Capacidade

**Correções finais aplicadas no app de gestão de etapas:**
1. **Capacidade sincronizada com Etapas:** registros da Capacidade passam a ser criados/ativados/desativados automaticamente conforme a etapa atual do processo.
2. **Processo aguardando requisitante continua pontuando:** se o servidor ainda é responsável pela etapa, a carga permanece ativa mesmo com status `Aguardando requisitante`.
3. **Fase externa em planejamento:** processos futuros da fase externa podem aparecer na Capacidade com badge `Não iniciado`, sem somar pontos até o handoff da fase interna.
4. **Handoff interno → externo:** ao concluir `Envio ao SEL/SEPMA`, a fase interna sai da carga e a fase externa passa a computar.
5. **Assinatura contrato/Ata (ARP):** marcada como `Não se aplica`/ignorada no app, pois pertence à gestão contratual e não ao setor de licitações.
6. **Processos concluídos ocultos da Capacidade:** processo 100% concluído não aparece mais nem como `Ativo` nem como `Não iniciado` (ex.: Medição de Decibéis).
7. **Pontuação persistente:** correção no salvamento da matriz para manter Natureza do Objeto e IRP em campos separados após recarregar.
8. **Badges ajustados:** badge `Ativo`/`Não iniciado` fica após o nome do processo, separado do badge do servidor.

---

## 🛠️ SESSÃO 30/05/2026 — E-mails + Fila + Planilha

**Notificações no AppSEL verificadas e ajustadas:**
1. **Mecanismo de envio:** `enviarAvisosPrazo()` usa `MailApp.sendEmail(..., { htmlBody })` no Google Apps Script. O disparo automático é feito por trigger diário criado no app por `instalarTriggerAvisos()`.
2. **Formatação:** e-mails HTML inline, com cabeçalho azul (`SEL/CPII`), bloco de alerta com borda colorida, assunto por tipo (`Prazo próximo` / `Etapa vencida`) e corpo diferente para servidor, chefia e setor requisitante.
3. **Destinatários:** responsável da etapa/fase atual; chefes lidos dinamicamente da equipe (`isChefe`) e seus e-mails salvos na Config; setor requisitante via `EmailRequisitante`.
4. **Correção de contagem:** `_contDU_()` agora retorna dias úteis negativos quando o prazo já venceu, permitindo que `enviarAvisosPrazo()` classifique corretamente avisos vencidos.
5. **Chefia sem constante manual:** `CHEFIA_EMAIL` virou fallback opcional. O app usa primeiro os e-mails dos servidores chefes cadastrados na Config.
6. **Contador de enviados:** só incrementa quando `MailApp.sendEmail` executa com sucesso.
7. **Texto da Config:** aviso do trigger corrigido de 4 para 3 dias úteis.

**Fila/cadastro e planilha:**
1. Cadastro de processo pode ficar sem D0; nesse caso o processo entra na Fila.
2. Ao iniciar pela Fila, o D0 escolhido é gravado na planilha e a primeira etapa aplicável passa para `Em andamento`.
3. A planilha `CronogramaContratacoes_CPII (9).xlsx` recebeu as colunas `Setor Requisitante` e `EmailRequisitante` na aba `🏛 Processos`.
4. Sintaxe do backend e do script do front validada localmente via parser JScript.

**Publicação pendente:** colar `AppSEL_Codigo.gs` e `AppSEL_index.html` atualizados no Apps Script → salvar → Implantar nova versão.

---

## 🛠️ SESSÃO 31/05/2026 — Trigger, e-mail e avisos do AppSEL

**Ajustes aplicados no app de gestão de etapas:**
1. **Status persistente do trigger na Config:** a aba Config agora chama `verificarTriggerAvisos()` ao abrir/recarregar. Se o gatilho diário existir, o botão muda para `Reinstalar trigger` e exibe `Trigger instalado`, em vez de voltar para `Instalar trigger`.
2. **Instalação do trigger com metadados:** `instalarTriggerAvisos()` passa a registrar hora, fuso e timestamp em `PropertiesService`, permitindo diagnóstico visual na Config.
3. **Disparo mais próximo das 10h30:** o trigger usa `atHour(10).nearMinute(30)`. O Apps Script ainda pode variar alguns minutos, mas a janela fica mais explícita.
4. **Teste de e-mail na Config:** novo botão `Testar e-mail` envia uma mensagem simples para o servidor logado, validando permissões do `MailApp` e o e-mail cadastrado.
5. **Banner amarelo simplificado:** no filtro `Todos`, o texto agora informa apenas a quantidade de processos com etapas vencidas; no filtro individual, não repete o nome do servidor selecionado.
6. **Regra visual alinhada ao envio:** a tela passou a considerar etapa vencida pela data final (`fim_iso`) da etapa, a mesma referência usada por `enviarAvisosPrazo()`. Isso evita a tela prometer e-mail quando o backend ainda não classificaria a etapa como vencida.
7. **Ajustes finos dos e-mails:** datas de prazo passam para `DD/MM/AAAA`; o identificador interno `SEL-AAAA-NNN` deixa de aparecer como referência principal; quando houver N° SUAP e link, o e-mail mostra o SUAP clicável; quando a etapa tiver agente genérico (`Equipe de planejamento`), o e-mail usa o responsável real da fase do processo.
8. **Texto do banner geral:** no filtro `Todos`, o aviso passa a iniciar com `Atenção:`.
9. **Pontuação guiada sem seleção visual duplicada:** o modal de pontuação da Capacidade agora seleciona apenas uma opção por grupo mesmo quando duas alternativas têm a mesma pontuação. Em Modalidade, usa o texto real do processo para distinguir `Contratação Direta/Dispensa` de `Inexigibilidade`.
10. **Regra de envio por status:** processos suspensos/paralisados não enviam e-mail; processos em `Aguardando requisitante` enviam somente ao setor requisitante cadastrado. Se o e-mail do requisitante estiver vazio, não há disparo enquanto o processo permanecer nesse status.
11. **Horário do trigger:** avisos automáticos alterados para 10h30.
12. **Status Suspenso normalizado:** `_normStatus_()` agora trata `Suspenso` como status parado (`paralisado` internamente), garantindo que tela e e-mails bloqueiem avisos para esses processos.
13. **Perfil visual por tipo de usuário:** chefia continua vendo Etapas, Fila, Capacidade, Histórico e Config. Servidores sem flag de chefia veem somente Etapas e Capacidade; Fila, Histórico, Config e cadastro de novo processo ficam ocultos para reduzir confusão operacional.
14. **E-mails editáveis pela chefia:** como servidores comuns não acessam mais Config, usuários com flag de chefia podem editar o e-mail de qualquer servidor na aba Config.
15. **E-mail do requisitante corrigível no processo:** o botão do rodapé do modal mostra `Editar e-mail do requisitante` quando já houver e-mail cadastrado, permitindo corrigir endereço errado ou removê-lo.
16. **Retorno à etapa anterior:** a etapa atual pode voltar para a etapa anterior aplicável, mediante justificativa obrigatória. A etapa anterior é reaberta como `Em andamento`, a atual volta para `Não iniciada`, a justificativa fica no histórico interno e a capacidade é sincronizada.
17. **Execução manual dos avisos:** chefia ganhou botão `Enviar avisos agora` na Config para rodar `enviarAvisosPrazo()` sob demanda, com confirmação, útil para testar regras reais sem esperar o próximo trigger.
18. **Filtro inicial por servidor:** ao entrar como servidor comum, a aba Etapas já abre filtrada pelo próprio nome. Chefia continua entrando em `Todos`. O usuário ainda pode mudar manualmente para `Todos` ou outro filtro.

**Observação operacional:** depois de colar os arquivos no Apps Script, salvar e implantar nova versão, entrar em Config → `Reinstalar trigger` uma vez para gravar os metadados e autorizações atuais.

---

## 🛠️ SESSÃO 30/05/2026 — Painel público / Gantt

**Análise e ajustes iniciais do painel:**
1. `getDados()` não exibia processos sem D0, pois retornava `null` para D0 vazia. Agora esses processos entram como `planejamento` com `d0_simulado = true`.
2. As datas de processos sem D0 são apenas para visualização do Gantt: ficam limitadas a uma janela próxima, até 8 meses à frente do mês atual. Nada é escrito na planilha pelo painel.
3. O tooltip do processo informa quando a data é apenas previsão exibida: o início real continua sendo definido no AppSEL, na aba Fila.
4. KPI `A iniciar` passa a considerar a fila mesmo quando o filtro "Todos" oculta planejamento da lista principal.
5. `normalizeStatus()` ficou mais robusto contra variações de acento/texto (`Concluída`, `Em andamento`, `Atrasado`, `Suspenso` etc.).
6. Pontos/status das etapas no mobile reconhecem `andamento` e `atrasado` vindos do backend.
7. Sintaxe dos quatro arquivos principais validada localmente: `AppSEL_Codigo.gs`, `AppSEL_index.html`, `AppsScript_Codigo_v3.gs`, `AppsScript_index.html`.
8. Gestão de servidores reforçada no AppSEL: renomear servidor migra vínculos em Etapas/Capacidade; remover servidor com processo ativo fica bloqueado; adicionar servidor passa a refletir na capacidade do app.
9. Lista de servidores passa a ser salva também na aba oculta `ConfigSEL`, para o painel público conseguir calcular capacidade com equipe dinâmica ao copiar/adaptar o projeto para outro campus.
10. Painel público deixou de depender exclusivamente das linhas fixas AMANDA/BEATRIZ/BRUNO/SAMUEL para capacidade; agora lê `ConfigSEL` ou, em fallback, o resumo/registro da aba Capacidade.
11. Correção: o KPI público de Capacidade voltou a respeitar o percentual oficial calculado na aba Capacidade (`Ocupação interna`), usando recálculo apenas como fallback quando a planilha não trouxer o valor.
