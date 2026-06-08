# Plano de Trabalho — Sistema de Contratações CPII
> Atualizado em: 05/06/2026 (noite) - App Gestao: central por perfil, modo offline, menu do Painel e PWA sem avisos nativos

---

## SESSAO 05/06/2026 (noite) - APP GESTAO: CENTRAL, OFFLINE E MENU DO PAINEL

**Decisao revisada:** foi removida a permissao de notificacao nativa do navegador/aparelho. O App Gestao continua instalavel como PWA no celular e no computador, mas sem pedir autorizacao para avisos do sistema. A estrategia final fica mais limpa: e-mails diarios uteis + Central de Notificacoes interna.

**Ajustes aplicados no App Gestao:**
- Removido o fluxo `Ativar avisos no aparelho`, incluindo pedido de permissao do navegador, registro de dispositivo PWA, aba `__pwa_dispositivos`, e-mail de ativacao e tratamento de clique em notificacao no service worker.
- O PWA permanece instalavel via `manifest.json` + `sw.js`; o cache do service worker foi atualizado para `app-gestao-reitoria-v4`.
- Menu lateral reorganizado na ordem final: `Trocar usuario` -> `Painel de Contratacoes` -> `Configuracoes`.
- Link do Painel de Contratacoes foi movido para o menu do usuario, evitando aperto no topo em telas mobile. A URL ficou configuravel em `config.js` por `painelUrl`.
- Ajuste posterior no link do Painel: o clique agora abre somente uma nova aba, mantendo o App Gestao aberto na aba atual.
- O item `Painel de Contratacoes` passou a usar o mesmo icone SVG do Painel publico, para facilitar a identificacao visual.
- Adicionado modo offline: quando nao houver conexao, o app abre em consulta somente leitura com os ultimos dados salvos no aparelho; acoes de gravacao ficam bloqueadas ate a conexao voltar.

**Regra final da Central de Notificacoes:**
- Servidor comum ve alertas somente dos seus processos, para etapas vencidas ou com prazo proximo.
- Se o processo/etapa estiver em `Aguardando requisitante`, esse alerta nao aparece para o servidor comum.
- Chefia ve a central completa da equipe, incluindo casos em `Aguardando requisitante`, pois pode cobrar o setor requisitante quando necessario.
- Etapa vencida nao some da central apenas por estar `Em andamento`; ela permanece ate ser concluida.
- Processos em planejamento/fila/retorno continuam fora da central operacional de prazos, como antes.

**Regra final dos e-mails:**
- Avisos normais de prazo continuam indo ao servidor responsavel e a chefia conforme a regra ja existente.
- Nos casos de `Aguardando requisitante`, o e-mail vai para a chefia e para o requisitante, mas nao para o servidor comum.

**Validacao realizada:**
- `index.html`, `config.js`, `sw.js` e `apps-script/Code.gs` compilaram sem erro nos scripts.
- `git diff --check` passou no repositorio do App Gestao.
- Teste simulado confirmou a regra: chefe recebe alerta normal + aguardando requisitante + processos da equipe; servidor comum recebe apenas o alerta proprio que nao esta aguardando requisitante.
- Nao foi possivel validar visualmente pelo navegador nesta sessao porque a ferramenta de navegador nao estava disponivel no ambiente; a validacao ficou concentrada em sintaxe, regras e consistencia dos arquivos.

**Publicacao necessaria (Samuel):**
1. Publicar no GitHub Pages: `index.html`, `config.js` e `sw.js`.
2. Colar/publicar nova versao do `apps-script/Code.gs` no Apps Script do App Gestao.
3. Testar no celular e no PC: login, menu lateral, abrir Painel de Contratacoes, central do servidor comum, central da chefia e comportamento offline.

**Observacao:** a secao anterior sobre "avisos do aparelho no PWA" fica superada por esta decisao posterior. O instalavel permanece; apenas a notificacao nativa do navegador foi retirada.

---

## SESSAO 05/06/2026 (noite) — NOTA TECNICA RSC/TAE DOS PROJETOS

**Demanda:** elaborar nova nota tecnica considerando que o projeto ficou mais robusto, com pesquisa aprofundada sobre o RSC-PCCTAE dos TAEs e conhecimento geral dos dois projetos: App Gestao/AppSEL e Painel de Contratacoes.

**Pesquisa normativa realizada:**
- Confirmada a instituicao do RSC-PCCTAE pela Lei nº 15.367/2026, que alterou a Lei nº 11.091/2005.
- Confirmado que o RSC-PCCTAE e voltado ao reconhecimento de saberes e competencias nao necessariamente derivados de diplomacao formal, com uso para fins de Incentivo a Qualificacao.
- A lei preve seis grupos de requisitos: GT/comissoes; projetos institucionais/gestao/inovacao; premiacao; responsabilidades tecnico-administrativas/especializadas; funcoes/cargos; producao e difusao de conhecimento tecnico.
- Ate 05/06/2026, nao foi localizado decreto federal definitivo de regulamentacao; a nota deixa claro que pontuacao e procedimento dependem do decreto e de norma interna/CRSC.

**Nota tecnica criada:**
- Arquivo: `NOTA_TECNICA_RSC_TAE_SISTEMA_CONTRATACOES_CPII.md`.
- Word gerado: `NOTA_TECNICA_RSC_TAE_SISTEMA_CONTRATACOES_CPII_COMPLETA.docx`.
- Estrutura: finalidade, contexto institucional, descricao dos dois projetos, robustez tecnica, base normativa, matriz de aderencia ao RSC, comprovantes recomendados e minuta de texto para memorial.
- A nota recebeu quadros especificos de mapeamento funcional do App Gestao e do Painel, incluindo Fila, Etapas, Capacidade, Historico, Central de Notificacoes, notificacoes por e-mail, PWA/avisos no aparelho, Gantt, KPIs, filtros e leitura publica somente leitura.

**Caderno de evidencias visuais:**
- Arquivo Word criado: `CADERNO_PRINTS_FUNCOES_APP_GESTAO_E_PAINEL.docx`.
- Pasta de prints: `prints_apps/`.
- Conteudo: login, aba Etapas, Central de Notificacoes, pagina textual sobre notificacoes por e-mail, aba Fila, simulacao de etapas, Capacidade, Historico, Detalhe do processo, menu de instalacao/avisos PWA, Painel publico com KPIs/Gantt e processo expandido no Painel.
- Validacao: pacote `.docx` conferido internamente, com `word/document.xml` presente; caderno possui 11 imagens embutidas.

**Enquadramento RSC recomendado:**
- Requisito II — Projetos institucionais, gestao e inovacao: aderencia muito forte.
- Requisito IV — Responsabilidades tecnico-administrativas e/ou especializadas: aderencia forte, principalmente com declaracao/ato/e-mails de responsabilidade.
- Requisito VI — Producao, prospeccao e difusao de conhecimento tecnico: aderencia forte, com README, checklist, plano diario, notas tecnicas, codigo e orientacoes de replicacao.
- Requisito I — GT/comissao/similar: possivel, se houver portaria, despacho, ata, e-mail formal ou declaracao de participacao/designacao.
- Requisito III e V: somente incluir se houver comprovante proprio de premiacao ou funcao/cargo.

**Recomendacao pratica:** tratar App Gestao e Painel como uma solucao institucional integrada, destacando inovacao na gestao de contratacoes, seguranca por separacao de permissoes, automacao de prazos/e-mails, visualizacao gerencial e possibilidade de replicacao por campus/unidade. Para anexos, usar prints com dados sensiveis tarjados e juntar declaracao da chefia sobre finalidade, autoria, uso e impacto.

---

## SESSAO 05/06/2026 (noite) — APP GESTAO: AVISOS DO APARELHO NO PWA (SUPERADO POR DECISAO POSTERIOR)

**Melhoria solicitada:** apos transformar o App Gestao em PWA instalavel, permitir uma notificacao/confirmacao quando o servidor instala ou abre o app instalado no Android, iPhone ou Windows.

**Ajuste aplicado no App Gestao:**
- Menu do usuario ganhou a acao `Ativar avisos no aparelho`, disponivel tambem para servidor comum (nao fica preso a aba Config, que e restrita a chefia).
- O app detecta modo instalado/standalone (`display-mode` e `navigator.standalone` no iOS), alem dos eventos `beforeinstallprompt` e `appinstalled` em navegadores Chromium.
- Quando o navegador oferece prompt nativo de instalacao, o menu muda para fluxo de instalacao; depois da instalacao, o app agenda a ativacao dos avisos.
- A permissao de notificacao so e pedida apos acao direta do usuario. Se autorizada, o app mostra uma notificacao local de confirmacao: `Avisos do App Gestao estao ativos neste aparelho`.
- O `sw.js` passou a tratar clique em notificacao (`notificationclick`), focando/abrindo o App Gestao. Cache do service worker subiu para `app-gestao-reitoria-v2`.
- O `manifest.json` ganhou `id` estavel (`https://decofcp2-afk.github.io/app_gestao-reitoria/`), importante para identidade do PWA, especialmente em iOS/iPadOS.

**Backend / Apps Script:**
- Criada a rota publica permitida `registrarDispositivoPwaApp`.
- Ao ativar/registrar, o Apps Script cria/atualiza a aba oculta `__pwa_dispositivos`, com servidor, matricula, identificador local do aparelho, plataforma, modo de exibicao, permissao e suporte a Push API.
- O registro e atualizado por par `Matricula + DeviceId`, evitando duplicar linha a cada abertura.
- Quando a permissao muda para `granted` pela primeira vez naquele aparelho, a chefia recebe e-mail informando que o servidor autorizou avisos do App Gestao no dispositivo.

**Decisao tecnica importante:** esta entrega habilita notificacao local de confirmacao + registro/e-mail de ativacao. Ainda NAO e envio push remoto automatico de prazos com o app fechado. Para isso, sera preciso uma etapa propria de Web Push com VAPID/servidor emissor (ou servico externo), gravando `PushSubscription` e disparando mensagens a partir da regra atual de prazos.

**Validacao local:**
- `manifest.json` parseado com sucesso.
- `sw.js`, `apps-script/Code.gs` e os 3 scripts embutidos do `index.html` compilaram via `vm.Script`.
- `git diff --check` passou.
- Preview local em `http://127.0.0.1:4177/index.html` carregou a tela de login sem erros de console e com o novo item de menu presente no DOM.

**Publicacao necessaria (Samuel):**
1. Publicar no GitHub Pages: `index.html`, `manifest.json` e `sw.js`.
2. Colar o `apps-script/Code.gs` atualizado no Apps Script do App Gestao e implantar nova versao.
3. Testar em Android/Windows: abrir no Chrome/Edge, instalar pelo prompt/menu, entrar no app e ativar avisos.
4. Testar em iPhone: iOS 16.4+, adicionar a Tela de Inicio, abrir pelo icone instalado, entrar no app e ativar avisos pelo menu do usuario.
5. Conferir se a aba oculta `__pwa_dispositivos` foi criada e se a chefia recebeu o e-mail na primeira autorizacao.

---

## SESSAO 05/06/2026 (noite) — APP GESTAO: 3 FUNCOES NOVAS (NOTIFICACOES, DETALHE NA FILA, DRAG-AND-DROP)

Tres funcionalidades implementadas no App Gestao, todas AGUARDANDO REPUBLICACAO no GitHub Pages + Apps Script (Implantar -> Nova versao).

**1. Central de Notificacoes (sininho no topo).**
- Sininho com badge de contagem no cabecalho. Painel com duas abas clicaveis — Vencidos e Prazos proximos — no estilo de filtro da aba Capacidade.
- AGRUPAMENTO POR PROCESSO em PILHA (estilo "Instants/stories" do Instagram): quando um processo tem varias etapas na mesma categoria, elas viram uma pilha de cartas empilhadas com contador "+N", em vez de varios itens soltos. 1 notificacao = item simples (clica e abre o detalhe). 2+ = pilha: o primeiro toque expande, e com a pilha aberta clicar em qualquer etapa abre o detalhe do processo. Isso evita o "amontoado" quando um processo tem muitas etapas vencendo.
- Backend: nova rota `getAlertasApp` reusa EXATAMENTE a mesma varredura dos e-mails (`enviarAvisosPrazo`: proximos = vence em ate 3 dias uteis; vencidos = prazo estourado), mas RETORNA a lista em vez de enviar e-mail. Garante paridade com os avisos por e-mail sem duplicar a regra de prazo. Vale para chefe e servidor comum.
- Clicar numa notificacao leva direto ao detalhe do processo (modal com as etapas) — via novo helper `abrirProcessoPorId_`.

**2. Botao "Abrir detalhe" na Fila — so processos RETORNADOS.**
- No painel expandido do card da fila, botao "Abrir detalhe do processo" aparece apenas para RETORNADOS (que ja tem etapas reais). Processos A INICIAR / SEM D0 nao ganham o botao, pois so possuem etapas simuladas, ja exibidas inline. Reusa a funcao de detalhe existente.

**3. Drag-and-drop na Fila (alca, persistente, so chefia).**
- Alca de arrastar (simbolo de pegada) no card da fila, visivel so para a chefia. Arrasta so pela alca; o resto do card continua expandindo as etapas. Usa SortableJS (CDN, degrada para as setas se nao carregar). Funciona igual no celular e no PC.
- A ordem manual e SALVA na planilha (nova coluna `OrdemFila` na aba Processos) via nova rota `salvarOrdemFilaApp` (restrita a chefia). As setas tambem passam a salvar. A ordem sobrevive ao recarregar.
- IMPORTANTE: a ordem manual sobrescreve a ordenacao automatica por prioridade. Avisar a chefia.

**Validacao:** logica das funcoes novas testada isoladamente com Node (sintaxe + execucao: badge somando certo, agrupamento por data, ordenacao da fila com itens sem ordem ao fim, persistencia enviando o array de IDs). O mount do shell voltou a servir versoes truncadas dos arquivos (problema ja conhecido) — `node --check` no arquivo inteiro foi impossivel pelo terminal; a integridade foi confirmada pela ferramenta de arquivos (autoritativa), que localizou todas as funcoes intactas.

**4. Escopo da central por perfil (correcao).** O perfil comum estava vendo TODAS as notificacoes. Corrigido: servidor comum ve so os processos onde e o responsavel (mesmo criterio do e-mail); o chefe continua vendo tudo da equipe. So no backend (Code.gs).

**5. E-mails de aviso agrupados por processo.** Antes o sistema mandava 1 e-mail por etapa vencida — um processo com 5 etapas gerava 5 e-mails. Agora manda 1 e-mail por processo, com uma tabela das etapas (Etapa, Responsavel, Situacao, Prazo). Cada servidor recebe so as etapas dele; a chefia recebe as etapas que dependem do SEL. Vencidos e prazos proximos seguem separados (mantendo os dois horarios). Muito mais sustentavel de analisar. So no backend (Code.gs).

**6. Ajustes de texto e destinatarios dos e-mails.** (a) Nome no e-mail passou a ser "Gestao de Etapas - SEL" (cabecalho e assinatura). (b) Etapas marcadas como "Aguardando requisitante" deixam de gerar e-mail para os servidores de licitacoes e para a chefia — vao SOMENTE para o setor requisitante (nao faz sentido cobrar a equipe por algo que esta na mao do requisitante). (c) O e-mail do setor requisitante nao lista mais os responsaveis internos do SEL (nomes que nao dizem nada a ele) e passou a usar linguagem de cobranca, deixando claro que o atraso posterga o prazo final do processo. So no backend (Code.gs).

**Publicacao necessaria (Samuel):**
1. Criar a coluna `OrdemFila` na aba "🏛 Processos" (cabecalho exatamente "OrdemFila", pode ser a ultima coluna, deixar vazia — o app preenche no 1o arraste).
2. Colar `apps-script/Code.gs` e `index.html` atualizados no repositorio do App Gestao (GitHub Pages) e no Apps Script.
3. Implantar -> Nova versao.
4. Testar: sininho + clique abrindo o detalhe; pilha por processo; perfil comum vendo so o que e dele; botao detalhe nos retornados; arrastar pela alca no celular e no PC; e-mail de aviso chegando agrupado por processo.

---

## SESSAO 04/06/2026 (tarde) — APP GESTAO COMO PWA INSTALAVEL

**Melhoria solicitada:** permitir que o App Gestao seja instalado/baixado no celular como o Dashboard Financeiro, abrindo em tela cheia/standalone pelo Edge ou Chrome.

**Ajuste aplicado no App Gestao:**
- Criado `manifest.json` com `display: standalone` e `display_override` incluindo `fullscreen`.
- Criado `sw.js` para registrar o app como PWA e cachear apenas arquivos estaticos locais.
- Adicionados icones PNG `icons/icon-192.png` e `icons/icon-512.png`, baseados na identidade visual do `icon.svg`.
- `index.html` passou a apontar para o manifest, apple-touch-icon PNG e registrar o service worker.
- Viewport ajustado com `viewport-fit=cover` para melhor uso de area segura em app instalado.
- `og:url` corrigido para `https://decofcp2-afk.github.io/app_gestao-reitoria/`.

**Decisao de seguranca:** o service worker nao cacheia respostas do Apps Script. Chamadas a `script.google.com` e `script.googleusercontent.com` seguem sempre pela rede, evitando dados operacionais antigos ou sensiveis no cache do PWA.

**Validacao local:** `manifest.json` parseado com sucesso; `sw.js`, `index.html` e `apps-script/Code.gs` compilaram em `vm.Script`; icones PNG foram gerados e conferidos visualmente; `git diff --check` passou.

**Publicacao necessaria:** subir para o GitHub Pages os novos arquivos `manifest.json`, `sw.js`, pasta `icons/` e o `index.html` atualizado. Depois abrir o App Gestao no Edge/Chrome mobile e usar `Adicionar a tela inicial`/`Instalar app`.

---

## SESSAO 04/06/2026 (tarde) — E-MAIL DO REQUISITANTE EM PROCESSOS CONCLUIDOS

**Ajuste aplicado:** no detalhe do processo do App Gestao, o botao `Adicionar/Editar e-mail do requisitante` passa a ficar oculto quando o processo estiver concluido. Processos concluidos nao geram novos avisos por e-mail, entao manter essa acao visivel poderia sugerir uma utilidade operacional que nao existe.

**Escopo:** alteracao somente visual no `index.html` do App Gestao. O botao de acesso/insercao de link SUAP permanece disponivel, pois ainda e util para consulta.

**Validacao local:** o JavaScript embutido do `index.html` compilou com sucesso em `vm.Script`.

**Publicacao necessaria:** publicar o `index.html` atualizado no GitHub Pages.

---

## SESSAO 04/06/2026 (tarde) — CORRECAO EDGE MOBILE NO PAINEL E APP GESTAO

**Problema observado:** no Microsoft Edge para celular, o Painel de Contratacoes e o App Gestao exibiam erro ao carregar a resposta do Apps Script, enquanto os mesmos links funcionavam no Chrome mobile. O Dashboard Financeiro funcionava no Edge mobile mesmo usando Apps Script.

**Diagnostico atual:** a causa mais provavel nao e a meta tag `maximum-scale=1`, porque o Painel usa viewport normal e falha mesmo assim. A diferenca tecnica relevante e a camada de comunicacao: Painel e App Gestao usavam JSONP direto, injetando `<script src="https://script.google.com/...">`; o Dashboard Financeiro usa `fetch`. Os endpoints dos dois Apps Scripts respondem em JSON comum com CORS liberado e redirecionam para `script.googleusercontent.com`, o que combina com bloqueio do Edge mobile ao carregar script de terceiro.

**Ajuste aplicado com cautela no Painel:** o `index.html` do Painel foi alterado para tentar primeiro `fetch` com JSON comum e manter JSONP como fallback. Como o Painel e somente leitura, esse teste nao grava nem altera dados da planilha.

**Validacao do Painel:** Samuel publicou/testou no Edge mobile e confirmou que resolveu.

**Ajuste aplicado no App Gestao:** o `index.html` do App Gestao recebeu a mesma estrategia: primeiro `fetch` com JSON comum; JSONP antigo permanece como fallback. Para reduzir risco operacional, o fallback automatico foi limitado a login/leituras (`get*`, `verificar*`, `validar*`). Chamadas de gravacao nao sao repetidas automaticamente caso o `fetch` falhe, evitando duplicidade em acoes como concluir, regredir, iniciar processo ou salvar configuracoes.

**Validacao local:** o JavaScript embutido do App Gestao compilou com sucesso em `vm.Script`; `git diff --check` passou. Nao houve alteracao no `apps-script/Code.gs`.

**Pendente Samuel:** publicar o `index.html` atualizado do App Gestao no GitHub Pages e testar no Edge mobile: login, carregar Etapas, abrir Capacidade e fazer uma acao simples controlada somente depois de confirmar que as leituras carregaram.

---

## SESSAO 04/06/2026 (tarde) — LINK SUAP EDITAVEL PELO APP GESTAO

**Melhoria solicitada:** quando um processo for aberto nos detalhes do App Gestao, se ele ja tiver `Link SUAP`, o botao deve continuar servindo para acessar o processo. Se nao tiver link cadastrado, o mesmo local deve permitir inserir o link depois, em qualquer fase do processo.

**Ajuste aplicado:**
- No `index.html` do App Gestao, o botao do rodape do detalhe do processo agora mostra `Acessar processo no SUAP` quando ha URL valida.
- Se o processo estiver sem link (`#` ou vazio), o botao aparece como `Inserir link do processo no SUAP` e abre um dialogo para colar a URL.
- A tela valida URLs iniciadas por `http://` ou `https://`, salva localmente no processo aberto e atualiza o botao imediatamente.
- No `apps-script/Code.gs`, foi criada a funcao `salvarLinkSuapProcessoApp`, liberada na API publica do App Gestao, gravando a coluna `Link SUAP` da aba `Processos`.
- A permissao segue logica parecida com o e-mail do requisitante: exige usuario logado, mas nao depende de fase especifica. Assim, o link pode ser preenchido depois e passa a servir tanto no App Gestao quanto no Painel apos recarregar os dados.

**Validacao local:** `index.html` e `apps-script/Code.gs` do App Gestao compilaram com sucesso em `vm.Script`; `git diff --check` passou.

**Publicacao necessaria:** atualizar o `index.html` do App Gestao no GitHub Pages e colar/publicar nova versao do `apps-script/Code.gs` no Apps Script do App Gestao. Testar abrindo um processo sem link, inserir URL do SUAP, salvar, reabrir o processo e confirmar que o botao passa a acessar o SUAP.

---

## SESSAO 04/06/2026 (tarde) — AJUSTE DOS AVISOS POR E-MAIL

**Problema observado:** os avisos automaticos estavam sendo enviados tanto pela conta pessoal (`casar70`) quanto pela conta institucional da DECOF. A causa era a existencia de dois acionadores para `enviarAvisosPrazo`: um pertencente ao usuario pessoal e outro pertencente a outro usuario/conta.

**Decisao operacional:** em producao, os acionadores de aviso devem ser instalados somente pela conta institucional da DECOF. O remetente dos e-mails no Apps Script e a conta que possui/executa o acionador; o codigo nao consegue transformar um acionador pessoal em envio institucional.

**Acoes aplicadas:**
- Samuel excluiu o acionador pessoal (`Pertence a: Eu`) no Apps Script.
- `apps-script/Code.gs` do App Gestao passou a criar acionadores semanais apenas de segunda a sexta-feira, separados em dois lotes: prazos proximos por volta de 10h30 e etapas vencidas por volta de 14h.
- Quando houver e-mail do requisitante cadastrado, ele acompanha o lote correspondente: 10h30 nos avisos de prazo proximo e 14h nos avisos de etapa vencida.
- `enviarAvisosPrazo()` ganhou trava interna: mesmo se algum acionador for criado incorretamente no fim de semana, a rotina retorna sem enviar e-mail aos sabados e domingos.
- Tela de Configuracoes, README e checklist foram atualizados para orientar que o acionador deve ser instalado/reinstalado pela conta DECOF.

**Publicacao necessaria:** colar o `apps-script/Code.gs` atualizado no Apps Script do App Gestao, salvar, implantar nova versao e clicar em `Reinstalar trigger` estando logado na conta DECOF. Depois conferir em `Acionadores` que nao ha acionador restante da conta pessoal.

**Validacao feita pelo Samuel:** trigger reinstalado e teste de e-mail executado com sucesso pela conta institucional `decof.cp2@gmail.com`. A tela de Config confirmou o teste enviado, e o e-mail recebido saiu pelo remetente institucional. Com isso, a duplicidade de disparo pela conta pessoal foi resolvida na pratica.

**Proxima recomendacao:** propor ao diretor um piloto operacional de 1 a 2 meses na Reitoria antes de expandir para outros campi. Durante o piloto, observar principalmente: carregamento no Chrome/Edge/celular, login e recuperacao de senha, conclusao/regressao de etapas, retorno para fila, capacidade, avisos por e-mail, prazos com feriados e qualidade dos dados preenchidos pelos usuarios.

---

## 🐛 SESSAO 04/06/2026 (tarde) — CORRECAO DO TIMEOUT pos-feriados ("Tempo esgotado ao comunicar com o Apps Script")

**Sintoma:** depois da atualizacao que adicionou os feriados municipais (aba `Calendario` + leitura do calendario nos scripts), TANTO o Painel de Contratacoes (DECOF-LIC) QUANTO o App Gestao passaram a exibir `Erro ao carregar: Tempo esgotado ao comunicar com o Apps Script`.

**Diagnostico (com evidencia real do navegador):**
- A planilha e a aba `Calendario` (16 linhas, 7 colunas) estao **integras** — nao era problema de dados, volume nem formula.
- Capturando a rede do Painel ao vivo: a rota `route=painel.capacidade` respondeu **200 OK**, mas `route=painel.dados` ficou **pendente / sem retorno** (timeout). A diferenca: `painel.dados` monta a **cascata de datas** (dias uteis + feriados) e `painel.capacidade` nao.
- **Causa-raiz:** a funcao que le o municipio do calendario (`calMunicipio_()` no Painel / `_calMunicipio_()` no App Gestao) chamava `PropertiesService.getScriptProperties().getProperty(...)` **ANTES** da verificacao de cache, ou seja, **a cada chamada de `isDiaUtil()` / `_isFer_()`**. Como a cascata percorre dia a dia dezenas de processos por varios meses, isso disparava **dezenas de milhares** de leituras do PropertiesService por requisicao — lento e com cota — estourando o tempo de execucao do Apps Script. Os dois apps quebraram juntos porque os dois ganharam esse mesmo codigo de calendario na mesma atualizacao.

**Correcao aplicada (minima e identica nos dois projetos):**
- Memoizado o municipio em variavel de modulo (`CALENDARIO_MUNICIPIO_MEMO` / `_CALENDARIO_MUNICIPIO_MEMO`): o `getProperty` passa a rodar **no maximo uma vez por execucao**, em vez de uma vez por dia iterado. Comportamento dos prazos e feriados permanece **identico**; muda so o desempenho.
- Arquivos: `painel-contratacoes-decof/.../apps-script/Code.gs` e `app_gestao-reitoria/.../apps-script/Code.gs`.
- Sintaxe validada (`node --check`) sobre a reconstrucao a partir do HEAD do git + a edicao: **OK** nos dois.

**Observacao tecnica:** durante a edicao, o espelho de leitura do shell (mount) ficou servindo um snapshot desatualizado/truncado dos arquivos; a ferramenta de arquivos (autoritativa) confirmou que os dois arquivos estao **integros**, com a edicao aplicada e o final de `getCapacidade()` / da ultima funcao preservado. `node --check` foi feito sobre a versao reconstruida do git HEAD para nao depender do mount.

**Publicacao necessaria (Samuel):**
- Colar o `apps-script/Code.gs` do **Painel** no Apps Script do Painel → salvar → **Implantar nova versao** (Gerenciar implantacoes).
- Colar o `apps-script/Code.gs` do **App Gestao** no Apps Script do App Gestao → salvar → **Implantar nova versao**.
- Testar: abrir o Painel (deve carregar a tabela/Gantt) e abrir o App Gestao (aba Etapas) sem o erro de tempo esgotado.

**CONFIRMADO pelo Samuel:** correcao do timeout funcionou apos republicar. ✅

**Ajuste de UI no App Gestao (mesma sessao):** o motivo de atraso aparecia cortado no card da etapa — estava truncado em **90 caracteres** (`et.motivo.substring(0,90)` no `index.html`, ~linha 1604). Alinhado ao **mesmo limite do Painel (200 caracteres + `…`)**, que usa `MOTIVO_MAX = 200`. Como o motivo digitado ja e limitado a 300 chars na entrada, na pratica quase sempre aparece inteiro. So o `index.html` do App Gestao mudou; nao precisa mexer no Apps Script. Sintaxe do JS validada (`node --check`) ✅. **Pendencia Samuel:** republicar o `index.html` do App Gestao no GitHub Pages.

---

## SESSAO 03/06/2026 — Transicao preservada para GitHub Pages

**Decisoes consolidadas:**
- Painel de Contratacoes e AppSEL ficarao em **repositorios separados**, cada um com seu proprio GitHub Pages.
- Cada projeto tambem tera seu **proprio Apps Script**. A decisao foi manter scripts separados porque o AppSEL tem muitas linhas, login, escrita, e-mails, trigger e regras internas; misturar com o painel aumentaria o risco.
- O campo `Custom domain` do GitHub Pages deve ficar vazio enquanto nao houver dominio institucional real com DNS configurado. O nome amigavel sera controlado pelo nome do repositorio.

**Painel de Contratacoes — etapa concluida:**
- Repositorio institucional renomeado para `painel-contratacoes-reitoria`.
- URL esperada do GitHub Pages: `https://decofcp2-afk.github.io/painel-contratacoes-reitoria/`.
- GitHub Pages configurado em `main` + `/(root)`.
- Painel migrado para pagina estatica (`index.html`) com `config.js` apontando para a URL `/exec` do Apps Script.
- Backend do painel preparado como Apps Script somente leitura, com rotas:
  - `?route=painel.dados`
  - `?route=painel.capacidade`
- Resultado observado pelo Samuel: painel aparentemente mais rapido e sem depender do `google.script.run`/HTMLService para renderizar a tela, reduzindo incompatibilidades de navegador.
- README do painel atualizado para "Painel de Contratacoes da Reitoria", com orientacao de repositorio separado, Pages em root, Apps Script proprio, conexao com o App Gestao e dicas para adaptar para outros campi.

**App Gestao/AppSEL - transicao iniciada em pasta separada:**
- Criada e movida a pasta local do app para `C:\Users\Samuel Gomes\Desktop\app_gestao-reitoria\app_gestao-reitoria`, para virar repositorio proprio do App Gestao/AppSEL, separado do painel.
- A pasta recebeu `index.html`, `config.js`, `.gitignore`, `README.md`, `CHECKLIST_PUBLICACAO.md` e `apps-script/Code.gs`.
- O `index.html` ganhou uma ponte compativel com as chamadas atuais do app. Assim, as telas e funcoes existentes continuam usando o mesmo padrao interno, mas no GitHub Pages a ponte chama o Apps Script por JSONP.
- Login e troca obrigatoria de senha foram tratados com fluxo especial: a senha digitada nao deve ir aberta na URL; o navegador calcula hash/prova com `crypto.subtle` e o Apps Script valida por desafio temporario.
- O `Code.gs` do AppSEL ganhou rotas:
  - `?route=appsel.challenge`
  - `?route=appsel.loginProof`
  - `?route=appsel.changePasswordHash`
  - `?route=appsel.call&method=...`
- Dados sensiveis foram removidos da pasta nova: sem ID real da planilha e sem e-mail pessoal.
- Ponte do AppSEL ajustada com `apiTimeoutMs: 90000`, `referrerPolicy: no-referrer` e resposta JSONP protegida contra separadores Unicode raros vindos da planilha.
- Checklist de publicacao/testes criada dentro da pasta do AppSEL para orientar a criacao do Apps Script, GitHub Pages e validacoes em Chrome/Edge/anonima.
- Sintaxe validada localmente no runtime interno: `apps-script/Code.gs` e script interno do `index.html` passaram.
- Repositorio local atual do app confirmado em `C:\Users\Samuel Gomes\Desktop\app_gestao-reitoria\app_gestao-reitoria`.
- Novo fluxo operacional adicionado: chefia pode devolver processo em andamento para a Fila com justificativa obrigatoria, sem trocar o status real do processo/etapa.
- O retorno para fila e marcado no motivo da etapa com `RETORNO PARA FILA`; D0, status atual e etapas concluidas ficam preservados, a capacidade e desativada e os avisos de atraso deixam de ser enviados enquanto o processo estiver na fila.
- A aba Fila agora lista processos sem D0, processos em planejamento e processos marcados como retorno para fila; ao iniciar/reativar, o processo volta para `Em andamento`.
- Ajuste de usabilidade: o seletor de status da etapa ganhou botao `Voltar`, para fechar sem salvar quando o status atual ja estiver correto.
- Tratamento de legado: App Gestao e Painel passam a ignorar `DataRealizacao` e `MotivoAtraso` preenchidos manualmente em etapas que ainda nao estao `Concluida`; a celula permanece na planilha, mas nao contamina tela, calculo ou tooltip.
- Metadados e icones adicionados ao App Gestao e ao Painel para melhorar aba do navegador e preview ao compartilhar links.
- README e checklist do App Gestao atualizados para incluir o teste de retorno para fila e reativacao.
- Sessao do App Gestao ajustada para durar somente enquanto a aba do navegador estiver aberta: recarregar a pagina mantem o login, mas fechar a aba/navegador exige novo login.
- Capacidade passa a ser atualizada em segundo plano apos concluir etapa, regredir etapa ou devolver processo para fila, sem depender de recarregar a pagina.
- App Gestao ganhou tela neutra de carregamento na restauracao da sessao, evitando que a tela de login apareca rapidamente ao recarregar a pagina.
- App Gestao passa a pre-carregar a aba Capacidade logo apos login/restauracao de sessao, reduzindo a espera quando o usuario abrir a aba.
- Correcao importante da pre-carga: ao abrir a aba Capacidade, se os dados ja tiverem sido carregados em segundo plano, o app agora renderiza imediatamente os cards e processos, sem depender de trocar entre Fase Interna/Fase Externa.
- Painel reforcado para exibir motivo de atraso apenas quando vier de etapa concluida com atraso real; motivos antigos em etapas em andamento, "A verificar" e marcacoes de retorno para fila nao aparecem no tooltip.
- Validacao local feita nos dois projetos apos esses ajustes: `index.html` do App Gestao, `index.html` do Painel e respectivos `apps-script/Code.gs` passaram na checagem de sintaxe.
- Datas de etapas concluidas ajustadas para leitura mais clara: o prazo oficial continua em `Prazo 638/2026`; quando houver atraso, o Painel exibe `Periodo realizado` do dia seguinte ao vencimento ate a data realizada; quando nao houver atraso, exibe apenas `Realizado em`. No App Gestao, a exibicao atual foi mantida conforme validado em uso.
- Aba Fila do App Gestao ganhou destaque de orientacao com titulo `Gestao da fila`, explicando prioridade, D0, responsaveis, edicao de nome e inicio/reativacao.
- Chefia pode editar o nome/objeto de processos enquanto estiverem na Fila; a alteracao grava na aba Processos e reflete no App Gestao e no Painel.
- Rotulo de processos/etapas em planejamento no Painel simplificado para `A iniciar`, evitando confusao com `Fila de Prioridade`.
- Painel ajustado para expandir/recolher etapas ao clicar tambem na area do nome do processo, mantendo o botao `+` como alternativa.
- Auditoria geral de 04/06/2026: App Gestao e Painel passaram na checagem de sintaxe local; rotas/API principais conferidas; Painel segue sem dependencia de `google.script.run`.
- Correcao encontrada na auditoria: a tela de conclusao do App Gestao calculava atraso por dias corridos; foi ajustada para contar dias uteis, igual ao Apps Script e ao Painel.
- Cenarios de prazo validados localmente: prazo no mesmo dia, conclusao antecipada, sexta para segunda, fim de semana, feriado nacional fixo e avancos por dias uteis.
- Calendario de feriados oficiais implementado no App Gestao e no Painel:
  - nova aba esperada: `Calendario`;
  - a planilha do Samuel ja recebeu a aba importada como `calendario`;
  - os scripts foram ajustados para reconhecer `calendario`/`Calendario`, sem depender de maiuscula/minuscula;
  - colunas: `Data`, `Nome`, `Tipo`, `Municipio`, `AfetaPrazo`, `Fonte`, `Observacao`;
  - `Tipo` precisa conter `Feriado`;
  - `AfetaPrazo` precisa ser `Sim`;
  - `Municipio = TODOS` vale para feriados nacionais/estaduais;
  - municipio especifico vale para feriados locais da unidade.
- Criado arquivo auxiliar para importacao da aba:
  - `C:\Users\Samuel Gomes\Desktop\Dashboard - LIC\calendario-feriados-cpii-2026.csv`;
  - Samuel importou o CSV no Google Sheets, mantendo apenas a aba de calendario no arquivo principal.
- Pontos facultativos ficaram fora da regra atual. Mesmo se cadastrados como `Ponto facultativo`, o codigo ignora essas linhas para evitar distorcao nos prazos.
- Fallback preservado: se a aba `Calendario` nao existir ou estiver vazia, continuam valendo sabados, domingos e feriados nacionais fixos ja existentes.
- Configuracoes novas:
  - App Gestao: `SEL_MUNICIPIO_CALENDARIO` nas propriedades do Apps Script e `municipioCalendario` no `config.js`.
  - Painel: `PAINEL_MUNICIPIO_CALENDARIO` nas propriedades do Apps Script.
- Correcao da aba Capacidade do App Gestao: processos com nome/objeto alterado na Fila agora sao exibidos na Capacidade com o nome atual da aba Processos, mesmo que a tabela de Capacidade tenha texto antigo.
- Ao salvar novo nome pela Fila, o App tambem tenta atualizar a coluna de objeto da aba Capacidade e limpa o cache da capacidade.
- Pesquisa inicial de feriados oficiais iniciada:
  - nacionais: Gov.br/MGI;
  - estaduais do RJ: ALERJ/Lei RJ 5.645/2010 e normas relacionadas;
  - municipais: confirmar em fonte oficial da prefeitura/diario oficial de cada municipio antes de cadastrar.

**Ponto de retomada - proximos passos do App Gestao:**
- Copiar `app_gestao-reitoria/apps-script/Code.gs` para um Apps Script novo da conta DECOF.
- Configurar `SEL_SS_ID` nas propriedades do script com o ID real da planilha e, se necessario, `SEL_CHEFIA_EMAIL`.
- Configurar `SEL_MUNICIPIO_CALENDARIO` no Apps Script do App Gestao e `PAINEL_MUNICIPIO_CALENDARIO` no Apps Script do Painel, conforme municipio da unidade.
- Conferir se a aba `calendario` importada ficou preservada na planilha principal e manter apenas feriados oficiais com `AfetaPrazo = Sim`.
- Implantar o Apps Script como Web App executando como `Eu`, acesso `Qualquer pessoa`, e copiar a URL `/exec`.
- Colar a URL em `app_gestao-reitoria/config.js`.
- Publicar o repositorio separado do App Gestao no GitHub Pages em `main` + `/(root)`.
- Testar login, troca obrigatoria, recuperacao de senha, etapas, concluir etapa, regredir etapa, devolver processo para fila, reativar processo retornado, capacidade, historico, configuracoes, e-mails e avisos em dois horarios.

---

## 🛠️ SESSÃO 03/06/2026 — Login, segurança, KPI e capacidade

- KPI público de capacidade corrigido: o AppSEL atualiza a coluna `Total` ao salvar pontuação e o painel público recalcula pelo somatório das colunas de pontos quando `Total` estiver vazio, zerado ou inconsistente.
- Regra preservada no painel público: capacidade do setor soma somente linhas `Ativo = Sim` da `Fase Interna`; carga futura não entra na barra principal.
- Login por matrícula + senha substitui a seleção simples de servidor; tentativas de login não criam conta automática.
- Senhas ficam com hash/salt no Apps Script; chefia pode cadastrar servidor, resetar senha e marcar troca obrigatória.
- Recuperação de senha por matrícula adicionada na tela de login: envia senha temporária para o e-mail cadastrado, inclusive para chefia. Se não houver e-mail cadastrado e nenhum outro chefe disponível, o dono/admin do Apps Script precisa ajustar o cadastro.
- Sessão do AppSEL não expira mais por tempo durante o trabalho; o usuário só sai ao clicar em trocar/sair ou se a matrícula for removida da equipe.
- Botão de novo processo fica oculto na tela de login e aparece apenas para chefia na aba Etapas.
- Textos de equipe atualizados para `Equipe SEL/SEPMA`.
- Capacidade: barras continuam mostrando carga ativa; cards e modais mostram reserva futura/projeção quando existir. Tetos usados: fase interna `10 pts`, fase externa `6 pts`; aviso orienta a chefia sem bloquear a atribuição.
- Segurança reforçada: ações de escrita e leituras internas exigem sessão; servidor comum segue sem acesso a Config/Fila/Histórico.
- Teste local feito no código-fonte; teste final ainda depende de publicar nova versão no Apps Script e validar em ambiente real.
- Próximo passo combinado: após validação do AppSEL em uso real, organizar os projetos com extrema calma para uma transição preservada ao GitHub Pages, mantendo separado o app interno, o painel público e tudo que já funciona hoje.

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
FASE 2.5 (planejada) → Organização dos projetos e transição preservada para GitHub Pages
FASE 3 (futura)     → Portal de campi / replicação para outros setores
```

---

## 📌 FASE 2 — App interno dos servidores [✅ v2.1 — 30/05/2026]

### Arquivos: `AppSEL_index.html` + `AppSEL_Codigo.gs`

### Funcionalidades implementadas

#### Autenticação e equipe
- **Login por matrícula e senha:** usuários carregados do cadastro da equipe, com senha temporária, troca obrigatória e recuperação por e-mail
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
- **Equipe SEL/SEPMA** (novo): gerenciar servidores — add/editar/remover, paleta de 8 cores, flag chefe
- E-mails dos servidores (cada um edita o próprio)
- Trigger de avisos automáticos (instalar/confirmar)

#### Avisos por e-mail (`enviarAvisosPrazo`)
- **Triggers de segunda a sexta: prazos proximos as 10h30 e etapas vencidas as 14h**
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
1. **Status persistente dos triggers na Config:** a aba Config agora chama `verificarTriggerAvisos()` ao abrir/recarregar. Se os acionadores existirem, o botao muda para `Reinstalar trigger` e exibe `Trigger instalado`, em vez de voltar para `Instalar trigger`.
2. **Instalação do trigger com metadados:** `instalarTriggerAvisos()` passa a registrar hora, fuso e timestamp em `PropertiesService`, permitindo diagnóstico visual na Config.
3. **Disparos agendados:** regra historica ajustada depois para dois lotes: prazos proximos perto de 10h30 e etapas vencidas perto de 14h. O Apps Script ainda pode variar alguns minutos.
4. **Teste de e-mail na Config:** novo botão `Testar e-mail` envia uma mensagem simples para o servidor logado, validando permissões do `MailApp` e o e-mail cadastrado.
5. **Banner amarelo simplificado:** no filtro `Todos`, o texto agora informa apenas a quantidade de processos com etapas vencidas; no filtro individual, não repete o nome do servidor selecionado.
6. **Regra visual alinhada ao envio:** a tela passou a considerar etapa vencida pela data final (`fim_iso`) da etapa, a mesma referência usada por `enviarAvisosPrazo()`. Isso evita a tela prometer e-mail quando o backend ainda não classificaria a etapa como vencida.
7. **Ajustes finos dos e-mails:** datas de prazo passam para `DD/MM/AAAA`; o identificador interno `SEL-AAAA-NNN` deixa de aparecer como referência principal; quando houver N° SUAP e link, o e-mail mostra o SUAP clicável; quando a etapa tiver agente genérico (`Equipe de planejamento`), o e-mail usa o responsável real da fase do processo.
8. **Texto do banner geral:** no filtro `Todos`, o aviso passa a iniciar com `Atenção:`.
9. **Pontuação guiada sem seleção visual duplicada:** o modal de pontuação da Capacidade agora seleciona apenas uma opção por grupo mesmo quando duas alternativas têm a mesma pontuação. Em Modalidade, usa o texto real do processo para distinguir `Contratação Direta/Dispensa` de `Inexigibilidade`.
10. **Regra de envio por status:** processos suspensos/paralisados não enviam e-mail; processos em `Aguardando requisitante` enviam somente ao setor requisitante cadastrado. Se o e-mail do requisitante estiver vazio, não há disparo enquanto o processo permanecer nesse status.
11. **Horario dos triggers:** regra atual usa dois horarios, 10h30 para prazos proximos e 14h para etapas vencidas.
12. **Status Suspenso normalizado:** `_normStatus_()` agora trata `Suspenso` como status parado (`paralisado` internamente), garantindo que tela e e-mails bloqueiem avisos para esses processos.
13. **Perfil visual por tipo de usuário:** chefia continua vendo Etapas, Fila, Capacidade, Histórico e Config. Servidores sem flag de chefia veem somente Etapas e Capacidade; Fila, Histórico, Config e cadastro de novo processo ficam ocultos para reduzir confusão operacional.
14. **E-mails editáveis pela chefia:** como servidores comuns não acessam mais Config, usuários com flag de chefia podem editar o e-mail de qualquer servidor na aba Config.
15. **E-mail do requisitante corrigível no processo:** o botão do rodapé do modal mostra `Editar e-mail do requisitante` quando já houver e-mail cadastrado, permitindo corrigir endereço errado ou removê-lo.
16. **Retorno à etapa anterior:** a etapa atual pode voltar para a etapa anterior aplicável, mediante justificativa obrigatória. A etapa anterior é reaberta como `Em andamento`, a atual volta para `Não iniciada`, a justificativa fica no histórico interno e a capacidade é sincronizada.
17. **Execução manual dos avisos:** chefia ganhou botão `Enviar avisos agora` na Config para rodar `enviarAvisosPrazo()` sob demanda, com confirmação, útil para testar regras reais sem esperar o próximo trigger.
18. **Filtro inicial por servidor:** ao entrar como servidor comum, a aba Etapas já abre filtrada pelo próprio nome. Chefia continua entrando em `Todos`. O usuário ainda pode mudar manualmente para `Todos` ou outro filtro.
19. **Experiência no celular / atalho como app:** `AppSEL_index.html` recebeu metatags de aplicativo móvel (`application-name`, `apple-mobile-web-app-*`, `mobile-web-app-capable`, `theme-color`) e ícone inline para melhorar o comportamento ao adicionar o Web App à tela inicial no Android/iOS. Também foi ajustado o topo para respeitar `safe-area-inset-top` em modo standalone.
20. **Texto de atraso suavizado:** removido o tom agressivo sobre permanência/apagamento do histórico. A conclusão com atraso agora pede apenas um motivo objetivo para registro no histórico do processo.
21. **Config responsiva no iPhone XR:** os botões de avisos automáticos (`Reinstalar trigger`, `Testar e-mail`, `Enviar avisos agora`) passam a quebrar linha em grade responsiva, evitando corte lateral em telas estreitas.
22. **Cards da aba Etapas simplificados:** na lista inicial, os cards deixam de mostrar N° SUAP, setor requisitante e modalidade. Permanecem status, responsável, nome do processo, percentual e etapa atual; número/classificação ficam dentro do detalhe do processo.
23. **E-mails automáticos reorganizados:** cabeçalho passa a identificar o `App de Gestão de Prazos/Tarefas - SEL`; o N° SUAP fica no assunto e aparece uma vez no corpo, na primeira menção ao processo, com link clicável quando houver URL do SUAP. O bloco lateral colorido vira apenas `Resumo do aviso`, sem repetir a mensagem principal.
24. **Novo texto padrão dos avisos:** vencidos e prazos próximos começam com `Prezado(a), atenção!`, explicam etapa, processo, prazo e contato `central@cp2.g12.br`; a assinatura fica como `App de Gestão de Prazos/Tarefas - SEL (Mensagem automática do Sistema)`.
25. **Responsável real nos e-mails:** o e-mail preserva o responsável/setor informado na etapa, seja `DECOF/DIAD` ou qualquer outro setor cadastrado, e também tenta acrescentar o servidor real da fase (`servidor`/`servidorExt`) quando cadastrado. Se o setor informado não tiver e-mail próprio configurado, o envio direto usa o e-mail do servidor da fase.
26. **Card de Etapas realinhado:** o nome do processo volta a nascer pela esquerda do card. Status e responsável ficam em uma linha de badges acima, evitando que o nome seja empurrado para a direita em telas estreitas.
27. **Verificação do Painel de Contratações:** o painel lê `MotivoAtraso ◄ EDITAR` da aba Etapas e exibe esse motivo nos tooltips/linhas quando há atraso registrado. A justificativa de regressão de etapa, por enquanto, fica apenas na aba oculta `__historico_motivos` do AppSEL e não aparece no painel público.
28. **Diálogos internos no AppSEL:** ações de editar e-mail de servidor, editar e-mail do requisitante, editar pontos fixos da Capacidade e enviar avisos agora deixam de usar caixas nativas do navegador e passam a usar o modal visual do próprio app.
29. **Capacidade mais legível:** nos processos da aba Capacidade, o badge do servidor e o status (`Ativo`/`Não iniciado`) ficam na primeira linha; o nome do processo aparece abaixo, melhorando leitura no PC e no celular.
30. **Retorno de fase corrigido:** ao voltar de uma etapa externa para a última etapa interna, a Capacidade desativa a fase externa e reativa a fase interna usando o responsável salvo na própria Capacidade quando o agente da etapa for genérico (`Equipe de planejamento`, setor etc.). O card da aba Etapas também preserva o responsável interno conhecido mesmo quando a linha interna estava inativa.
31. **Capacidade pela fase corrente real:** a lista da Capacidade passa a decidir a fase exibida pela aba Etapas. Processos ainda não iniciados aparecem na fase interna como `Não iniciado`; processos que avançaram para a externa somem da interna; processos que retornaram para a interna somem da externa.
32. **Histórico visual em etapa reaberta:** o cadeado `Motivo registrado...` deixa de aparecer em etapa reaberta/em andamento, para não confundir motivo histórico com motivo atual. O histórico continua preservado na aba própria.
33. **Painel alinhado ao AppSEL:** `AppsScript_Codigo_v3.gs` deixa de decidir a troca de fase por número fixo de etapa e passa a calcular a fase corrente pela aba Etapas, igual ao AppSEL. A sincronização da Capacidade no Painel preserva a pontuação original e usa apenas `Ativo` para contar ou não contar a carga.
34. **Capacidade pública inclui fase externa ativa:** o KPI de Capacidade do Painel e as fórmulas de resumo da aba Capacidade passam a somar todas as cargas ativas, internas ou externas, evitando subestimar a ocupação do setor quando a fase externa estiver em execução. O percentual público é calculado no servidor, sem depender de fórmula antiga da planilha.
35. **Motivo de atraso no Painel:** motivos registrados pelo AppSEL em `MotivoAtraso ◄ EDITAR` são lidos diretamente pelo Painel. A aba oculta `__historico_motivos` segue como auditoria interna do AppSEL e não alimenta o Painel público.
36. **Novo processo via AppSEL completo:** `cadastrarProcesso()` agora cria também as linhas iniciais da aba Capacidade (`Fase Interna` e, quando houver, `Fase Externa`) com `Ativo = Não` e pontuação zerada, permitindo que a chefia pontue depois e que AppSEL/Painel encontrem a carga corretamente.
37. **Cadastro novo compatível com o Painel:** ao cadastrar pelo AppSEL, o processo passa a alimentar as três bases necessárias: `Processos`, `Etapas` e `Capacidade`. Com isso, o Painel encontra o processo no Gantt/KPIs por `Processos` + `Etapas`, e a ocupação do setor passa a aparecer no KPI de Capacidade quando a carga estiver pontuada e ativa.
38. **Cadastro antigo pela planilha alinhado:** `novoProcesso()` no código do Painel também passa a criar as cargas de Capacidade como preparadas (`Ativo = Não`) e chama a sincronização logo depois. Assim, tanto cadastro pelo AppSEL quanto cadastro pela planilha seguem a mesma regra: a pontuação existe, mas só conta quando a fase realmente inicia.
39. **Ponto de parada da revisão Painel/AppSEL:** confirmado que o Painel lê o motivo de atraso pela coluna `MotivoAtraso ◄ EDITAR` da aba Etapas. Se uma etapa for reaberta, o AppSEL limpa o motivo atual daquela linha; ao concluir novamente com novo motivo, o Painel exibirá o novo texto gravado nessa coluna. O histórico interno em `__historico_motivos` não é exibido no Painel público.

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

---

## 🔍 SESSÃO 31/05/2026 (tarde) — Auditoria de comunicação AppSEL ↔ Planilha ↔ Painel

**Pedido do Samuel:** verificar se o AppSEL conversa bem com a planilha do Google e se o Painel lê/exibe corretamente; corrigir inconsistências.

**Verificação de comunicação — RESULTADO: comunicação OK.**
- Ambos os apps apontam para a mesma planilha (SS_ID `1pXdDhz...`). AppSEL usa `openById(SS_ID)`; Painel usa `getActiveSpreadsheet()` (script vinculado). Coerente.
- Nomes de abas batem: `🏛 Processos`, `🗓 Etapas`, `📊 Capacidade`. Detecção por regex `/processo/i` e `/etapa/i` — só a aba certa casa hoje.
- Cabeçalhos lidos pelo código == cabeçalhos reais da planilha (ProcessoID, N° SUAP, Objeto, Modalidade, D0, Tem IRP?, Prazo (dias), `DataRealizacao◄ EDITAR` sem espaço, `StatusEtapa ◄ EDITAR`, `MotivoAtraso ◄ EDITAR`). ✅
- Aba Capacidade: registro com cabeçalho na L15 (`Servidor ◄`/`ProcessoID`/`Ativo`), dados da L17. SUMIFS filtra `D="Sim"` + `F` (Fase Interna/Externa) somando coluna J (Total). Código localiza o registro por `Servidor`+`ProcessoID`. ✅

**🐛 CORRIGIDO (código) — `AppsScript_Codigo_v3.gs` tinha 746 bytes NUL (`\x00`) no final do arquivo** (corrupção de gravação). O JS terminava certo em `getCapacidade()`, mas o lixo binário quebraria a colagem no editor / `node --check`. NULs removidos; arquivo revalidado (`node --check` ✅). Arquivo limpo salvo na pasta. AppSEL_Codigo.gs e os dois index.html: sem NULs.

**⚠️ Inconsistências de DADOS na planilha (Samuel ajusta manualmente — NÃO é código):**
1. **Etapa órfã duplicada — SEL-2026-003, linha 19 da aba Etapas:** "Envio ao SEL/SEPMA" ord 6 com status "Em andamento", fora de posição (a correta é a L28, "Não iniciada"). Apagar a **linha 19**. É a única duplicata (mesmo ProcessoID+Ord.) da planilha.
2. **DataRealizacao anterior ao D0** (atraso fica negativo → não exibe): SEL-2026-004 etapa 1 (DR 02/03/2026 < D0 01/04/2026) e SEL-2026-011 etapa 1 (DR 31/10/2025 < D0 15/02/2026). Corrigir as datas reais.
3. **11 etapas "Concluída" sem DataRealizacao** → tooltip não mostra "Realizado em". Preencher as datas.
4. **Coluna `Ativo` da Capacidade com `Nao` (sem til):** funciona no SUMIFS (critério é `"Sim"`), mas padronizar para `Não`/`Sim` evita confusão visual.

**Obs.:** col 11 (K) da aba Etapas (linhas 3–8) contém só a legenda do dropdown de validação — texto de referência, não dado; o código lê a col 9. Inofensivo.

**Verificação final:** `node --check` ✅ nos dois `.gs` após limpeza. Estrutura da planilha 100% compatível com a leitura dos dois apps.

---

## 🔒 SESSÃO 31/05/2026 (noite) — Travas de integridade no AppSEL (concluirEtapa)

**Contexto:** planilha é backend (servidores não editam direto). Em vez de corrigir célula a célula, prevenir na origem, no app que a equipe usa.

**Implementado em `AppSEL_Codigo.gs` (aguarda republicação):**
- Novo helper `_d0DoProcesso_(pid)` — lê a D0 do processo na aba Processos via `_parseDate_`.
- **TRAVA 1 (em `concluirEtapa`):** bloqueia concluir sem `dataRealizacao` → retorna `{ok:false, erro:'Informe a data de conclusão...'}`. Garante que nenhuma etapa "Concluída" fique sem data (elimina na origem os casos de tooltip sem "Realizado em"). Também valida data inválida (`isNaN`).
- **TRAVA 2 (em `concluirEtapa`):** bloqueia `dataRealizacao` anterior ao D0 do processo → retorna erro com as duas datas em DD/MM/AAAA. Elimina o atraso negativo que o painel não exibe.
- Front (`AppSEL_index.html`) já trata `res.ok===false` exibindo `res.erro` em toast (linha ~1708/1727) — nenhuma alteração de HTML necessária.

**🐛 Recuperação:** a cópia local de `AppSEL_Codigo.gs` estava TRUNCADA (parava na linha 2046, no meio de uma string em `regredirEtapa`/reabrir). Recuperada a versão íntegra do **git HEAD** (2341 linhas, `node --check` ✅) e as travas reaplicadas sobre ela. Arquivo final: 2380 linhas, sintaxe ✅. (Mesmo padrão de corrupção de gravação do `AppsScript_Codigo_v3.gs` desta data — vale conferir se o que está publicado no Apps Script está completo.)

**Dados legados na planilha (10) — opcionais, some sozinho com o uso do app:** 2 DataRealizacao < D0 (SEL-2026-004 et.1, SEL-2026-011 et.1); 10 etapas "Concluída" sem data; 7 `Nao` sem til na col Ativo (cosmético, SUMIFS já funciona). Duplicatas e cascata de status: já corrigidas pelo Samuel. ✅

**Publicação:** colar `AppSEL_Codigo.gs` atualizado no Apps Script → salvar → Implantar nova versão.

---

## ⚙️ SESSÃO 31/05/2026 (noite·2) — Visão de fila externa + validador + constantes

**1) Fase externa "por vir" na aba Capacidade (AppSEL):**
- Esclarecimento do Samuel: ao iniciar, o processo deve mostrar na Capacidade a linha INTERNA (ativa, com servidor) + a EXTERNA (não iniciada, com servidor); ao terminar a interna, os pontos do interno saem e some a linha interna; a externa ativa; ao concluir o processo, ambas somem. Essa lógica já existia (registrosInt/registrosExt + `_verificarTransicaoFase_` + `procConcluidoCap`).
- **Bug corrigido em `getCapacidadeApp`:** o filtro `if (faseCorrenteCap[pid] && faseCorrenteCap[pid] !== faseKind) continue;` escondia a linha EXTERNA enquanto a fase corrente era interna — o gestor não via "o que vem". Trocado por `if (faseCorrenteCap[pid] === 'ext' && faseKind === 'int') continue;` — agora esconde só a INTERNA depois que a fase vira externa (interno já saiu); a EXTERNA por vir fica visível para planejar pontos.
- Simulação com a planilha (10): SEL-001 mostra Int+Ext; SEL-013 (já externo) mostra só Ext; SEL-011 (concluído) some. ✅
- Abordagem de "seção separada extPorVir" foi DESCARTADA (redundante com a lista de registros externos "Não iniciado" que já existe). Front voltou ao original.

**2) `validarPlanilha()` no menu do Painel (`AppsScript_Codigo_v3.gs`):**
- Novo item "🔎 Validar integridade da planilha" em onOpen. Função só-leitura que reporta num alert: etapas duplicadas (ProcessoID+Ord.), DataRealizacao < D0, "Concluída" sem data, status fora de cascata e células "Nao" sem acento na Capacidade. Helper `_dmy_`.

**3) Prazos da Portaria 638/2026 → constantes (`AppsScript_Codigo_v3.gs`):**
- Objeto `PORTARIA_638` no topo: `ETAPAS_INTERNAS` (5/45/10/15/10/10/3, referência dos blocos pré-formatados) e `FASE_EXTERNA` (DIRETA 30 / PREGAO 90 / CONCORRENCIA 100). `faseExternaDias()` agora lê dessas constantes.

**Travas de integridade (concluirEtapa):** mantidas (sessão anterior desta data).
**Validação:** `node --check` ✅ em AppSEL_Codigo.gs (2370 linhas) e AppsScript_Codigo_v3.gs; HTML sem resquícios, 2498 linhas.
**Publicação:** republicar AppSEL_Codigo.gs (Web App) e AppsScript_Codigo_v3.gs (script vinculado → recarregar planilha p/ menu).

---

## 🏷️ SESSÃO 31/05/2026 (noite·3) — Histórico mostra NOME do processo (não o ID)

**Pedido:** no histórico, o ProcessoID (SEL-2026-002) não faz sentido ao usuário. Exibir o nome do objeto com link SUAP clicável.
- `getHistorico` (AppSEL_Codigo.gs): enriquece cada registro com `objeto` e `suap`, lidos da aba Processos (colunas Objeto / Link SUAP) por pid. `#` tratado como vazio.
- `renderHistorico` (AppSEL_index.html): `.hist-proc` passa a exibir `h.objeto` (fallback pid); quando há SUAP, vira `<a target=_blank>` com seta ↗. ProcessoID não aparece mais.
- **Truncamento recorrente:** Edit cortou AppSEL_Codigo.gs (→2371L) E AppSEL_index.html (cópia local já estava em 2498L vs git 2794L). Reconstruídos do git HEAD via Python + shutil.copyfile e revalidados. Cuidado ao escapar unicode em string JS dentro de Python (gerou `↗` literal; corrigido para ↗).
- Final: AppSEL_Codigo.gs 2396L, AppSEL_index.html 2799L (termina em </html>), node --check ✅.

---

## 🔒 SESSÃO 01/06/2026 — Sustentabilidade: painel somente leitura, capacidade interna e locks

**Pedido do Samuel:** endurecer o projeto para longo prazo, garantindo que o painel público seja apenas consulta, que toda escrita fique no AppSEL, que o KPI público de Capacidade não infle com fase externa, que existam travas contra edição simultânea e que leituras do AppSEL não façam manutenção automática silenciosa.

**1) Painel público (`AppsScript_Codigo_v3.gs`) agora é somente leitura:**
- Adicionada a flag `PAINEL_SOMENTE_LEITURA = true`.
- Menu da planilha vinculado ao painel foi reduzido para: abrir painel, atualizar cache e validar integridade. Itens de cadastro, sincronização, conclusão, migração e triggers de edição foram removidos do menu.
- Funções de escrita legadas (`novoProcesso`, `sincronizarCapacidade`, `concluirProcesso`, migrações, preenchimento de datas, triggers de edição e `onEdit/onEditAtraso`) passam a bloquear a ação com mensagem orientando uso do AppSEL.
- O painel continua podendo limpar cache (`invalidarCache`) e ler dados (`getDados`, `getCapacidade`).

**2) KPI público de Capacidade corrigido para refletir só fase interna:**
- `getCapacidade()` passa a somar apenas linhas ativas da Fase Interna e os pontos fixos internos.
- Fase Externa segue existindo e sendo planejada no AppSEL/Capacidade, mas não infla o indicador mostrado ao requisitante.
- O nível textual (`Disponível`, `Limitada`, `Máxima`) agora é calculado pelo percentual interno, evitando divergência entre cor, percentual e mensagem.
- Retorno inclui `fase: 'interna'` para deixar explícito o contrato do KPI.

**3) Travas contra edição simultânea no AppSEL (`AppSEL_Codigo.gs`):**
- Criados helpers `_withAppLock_()` e `_withAppLockResult_()` usando `LockService.getScriptLock().tryLock(30000)`.
- Operações de escrita do AppSEL passaram a usar lock: iniciar processos, concluir etapa, cadastrar processo, migrar nomes de etapas, salvar e-mail de requisitante/servidor, trocar servidor, atualizar status, regredir etapa, salvar pontuação/outros, salvar equipe, instalar trigger e atribuir responsáveis.
- Se outra alteração estiver em andamento, o app retorna erro amigável: aguardar alguns segundos e tentar novamente.

**4) Configuração menos colada ao código:**
- `SS_ID`, e-mail fallback da chefia e e-mails fallback de servidores continuam como fallback para não quebrar a versão atual.
- O AppSEL passa a procurar primeiro no `PropertiesService`: `SEL_SS_ID`, `SEL_CHEFIA_EMAIL` e `email_fallback_<servidor_normalizado>`.
- O painel público passa a aceitar `PAINEL_WEBAPP_URL` via `PropertiesService`, com URL antiga apenas como fallback.

**5) Leitura do AppSEL sem efeitos colaterais:**
- `getEtapasParaApp()` deixou de corrigir blocos, marcar contratuais N/A e sincronizar Capacidade durante simples carregamento.
- `getCapacidadeApp()` deixou de executar correções/sincronização antes de retornar dados.
- A regra institucional foi preservada: assinatura de contrato/Ata (ARP) continua fora das atribuições do setor de licitações; novos cadastros já gravam essa etapa como `Não se aplica`, a migração manual `migrarNomesEtapas()` continua disponível, e a leitura ainda trata etapa contratual como N/A para exibição.

**Publicação necessária:**
- Republicar `AppSEL_Codigo.gs`.
- Atualizar o script vinculado do painel com `AppsScript_Codigo_v3.gs` e recarregar a planilha para o menu novo.
- No AppSEL, testar: abrir Etapas, abrir Capacidade, concluir uma etapa, salvar pontuação e reinstalar trigger.
- No Painel, testar: abrir painel, atualizar cache e confirmar que o KPI de Capacidade mostra apenas a ocupação interna.

---

## SESSÃO 01/06/2026 — Texto do banner de etapas vencidas no filtro por servidor

**Pedido do Samuel:** no filtro individual de servidor, deixar claro para quem os avisos automáticos serão enviados, com português brasileiro correto.

**Implementado em `AppSEL_index.html`:**
- Quando o servidor filtrado não é chefia, o banner informa que os avisos serão enviados à chefia e aos integrantes da equipe de planejamento.
- Quando o servidor filtrado é chefia, o banner informa que os avisos serão enviados apenas aos integrantes da equipe de planejamento.
- A frase agora respeita singular e plural: `O aviso automático será enviado...` / `Os avisos automáticos serão enviados...`.

**Publicação necessária:**
- Republicar o AppSEL para que o novo texto apareça no painel.

---

## SESSÃO 01/06/2026 — Botão de voltar no detalhe do processo

**Pedido do Samuel:** evitar que o usuário precise descobrir que o menu superior fecha o detalhe do processo.

**Implementado em `AppSEL_index.html`:**
- Adicionado botão `← Voltar` no cabeçalho do detalhe do processo.
- O botão fecha o modal e retorna para a lista anterior, usando a mesma função já existente (`fecharProc()`).
- A mudança melhora a navegação sem alterar filtros, menu inferior ou fluxo de conclusão/status das etapas.

**Publicação necessária:**
- Republicar o AppSEL para que o botão apareça aos usuários.
