// ════════════════════════════════════════════════════════════════════════
// PAINEL GANTT DE CONTRATAÇÕES — Colégio Pedro II
// Arquivo: Codigo.gs  (servidor do Google Apps Script)
// Versão:  23/04/2026
//
// ── O QUE ESTE ARQUIVO FAZ ──────────────────────────────────────────────
// Este é o "back-end" do painel. Ele roda nos servidores do Google e tem
// duas responsabilidades:
//   1. Servir a página HTML do painel quando alguém acessa a URL pública
//   2. Ler os dados da planilha Google Sheets e devolvê-los ao painel
//      já processados (datas calculadas, status, % de execução etc.)
//
// ── COMO ADAPTAR PARA OUTRA UNIDADE ────────────────────────────────────
//   1. Crie uma cópia da planilha CronogramaContratacoes_CPII_v2.xlsx
//      e importe-a para o Google Sheets da nova unidade
//   2. Cole este Codigo.gs e o index.html em um novo projeto Apps Script
//      vinculado à planilha da nova unidade
//   3. Ajuste apenas os textos institucionais no index.html (nome da
//      unidade, endereço, ramais)
//   4. Publique como Web App (Implantar → Novo Web App)
//
// ── ESTRUTURA ESPERADA DA PLANILHA ─────────────────────────────────────
//   Aba "🏛 Processos":
//     Linha 1 → título decorativo (ignorada)
//     Linha 2 → aviso "somente leitura" (ignorada)
//     Linha 3 → cabeçalho real (deve conter "ProcessoID")
//     Linha 4+ → dados dos processos
//
//   Aba "🗓 Etapas":
//     Linha 1 → título decorativo (ignorada)
//     Linha 2 → cabeçalho real (deve conter "ProcessoID")
//     Linha 3+ → dados das etapas
//     Entre blocos de etapas há linhas separadoras (coluna B vazia)
// ════════════════════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════════════════
// CONSTANTES GLOBAIS
// ════════════════════════════════════════════════════════════════════════
// ANO_BASE: ano de referência do índice de meses usado pelo Gantt.
// Jan/ANO_BASE = índice 0, Fev/ANO_BASE = 1, Jan/(ANO_BASE+1) = 12, ...
// Esta constante TAMBÉM existe no index.html (precisa ser atualizada nos
// dois lugares se um dia precisar mudar — ex: 2028 em diante).
var ANO_BASE = 2026;


// ════════════════════════════════════════════════════════════════════════
// MENU CUSTOMIZADO — aparece na barra da planilha ao abrir
//
// A função onOpen() é executada automaticamente toda vez que alguém abre
// a planilha. Ela cria o menu "📊 Painel SEL" com atalhos para as
// principais ações, evitando que a equipe precise abrir o editor de código.
// ════════════════════════════════════════════════════════════════════════

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 Painel SEL')
    .addItem('🌐 Abrir Painel (dashboard)', 'abrirPainel')
    .addItem('➕ Novo Processo', 'novoProcesso')
    .addSeparator()
    .addSubMenu(ui.createMenu('⏰ Trigger Diário')
      .addItem('Instalar (atualiza todo dia às 5h)', 'instalarTriggerDiario')
      .addItem('Desinstalar', 'desinstalarTriggerDiario'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🔔 Detector de Atraso')
      .addItem('Instalar (avisa ao preencher DataRealizacao)', 'instalarTriggerOnEdit')
      .addItem('Desinstalar', 'desinstalarTriggerOnEdit'))
    .addSeparator()
    .addItem('📅 Preencher datas vazias com hoje', 'preencherDataRealizacaoHoje')
    .addToUi();

  // Garante que a coluna DataRealizacao exiba datas no formato DD/MM/YYYY
  // a cada abertura da planilha — evita datas "invertidas" por localidade.
  try { formatarColunaDatas(); } catch(e) {}
}


// ════════════════════════════════════════════════════════════════════════
// FORMATAR COLUNA DE DATAS — formatarColunaDatas()
//
// Aplica o formato de exibição DD/MM/YYYY em toda a coluna
// "DataRealizacao◄ EDITAR" da aba Etapas.
//
// Por que isso é necessário:
//   O Google Sheets pode exibir datas no formato MM/DD/AAAA dependendo da
//   configuração regional da conta do usuário. Aplicar setNumberFormat()
//   força a exibição correta em DD/MM/YYYY para todos na planilha,
//   independentemente da localidade configurada.
//
// Chamada automaticamente por:
//   - onOpen()                    → ao abrir a planilha
//   - preencherDataRealizacaoHoje() → ao preencher datas em lote
// ════════════════════════════════════════════════════════════════════════
function formatarColunaDatas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var wsEtapas = null;
  ss.getSheets().forEach(function(s) {
    var nome = s.getName().replace(/\s/g, '').toLowerCase();
    if (nome.indexOf('etapa') >= 0) wsEtapas = s;
  });
  if (!wsEtapas) return;

  var dados = wsEtapas.getDataRange().getValues();
  if (!dados.length) return;
  var header = dados[0].map(function(h) { return String(h).trim(); });
  var colDR  = header.indexOf('DataRealizacao◄ EDITAR');
  if (colDR < 0) return;

  var lastRow = wsEtapas.getLastRow();
  if (lastRow > 1) {
    // Aplica DD/MM/YYYY em toda a coluna (a partir da linha 2, pulando o cabeçalho)
    wsEtapas.getRange(2, colDR + 1, lastRow - 1, 1).setNumberFormat('DD/MM/YYYY');
  }
}

// Abre o painel (dashboard) em uma nova aba do navegador
function abrirPainel() {
  var url = 'https://script.google.com/macros/s/AKfycbxlFw7HNHnjx8NwEF9LTrcr4-tXXwgVXk4yTqFPpGs/dev';
  var html = HtmlService.createHtmlOutput(
    '<script>window.open("' + url + '", "_blank");google.script.host.close();</script>'
  ).setWidth(200).setHeight(50);
  SpreadsheetApp.getUi().showModalDialog(html, 'Abrindo painel...');
}

// Invalida o cache e confirma para o usuário
function atualizarDadosPainel() {
  invalidarCache();
  getDados();
  SpreadsheetApp.getUi().alert('Dados atualizados com sucesso!\n\nO painel já reflete as alterações mais recentes da planilha.');
}


// ── PONTO DE ENTRADA DO WEB APP ──────────────────────────────────────────
// Esta função é chamada automaticamente pelo Google quando alguém acessa
// a URL pública do painel. Ela retorna o arquivo index.html como página web.
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Painel de Contratações — CPII / SEL')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    // ALLOWALL permite que o painel seja embutido em iframes (ex: sites internos)
}


// ── HELPER: inclui arquivos HTML externos (útil se o projeto tiver CSS/JS separados)
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


// ════════════════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL — getDados()
//
// Chamada pelo painel via: google.script.run.getDados()
// Lê a planilha, calcula todas as datas em cascata e devolve um objeto
// JSON com a lista de processos e suas etapas já prontos para exibição.
//
// Retorno em caso de sucesso:
//   { processos: [...], geradoEm: "2026-04-22T..." }
//
// Retorno em caso de erro:
//   { erro: "mensagem descritiva do problema" }
// ════════════════════════════════════════════════════════════════════════
function getDados() {
  try {
    // ── Cache: evita reler a planilha inteira a cada acesso ─────────────
    // O CacheService armazena o JSON por 120 segundos. Se múltiplos
    // usuários abrirem o painel ao mesmo tempo, apenas a primeira chamada
    // lê a planilha — as demais recebem o cache instantaneamente.
    // Para forçar atualização imediata, use invalidarCache().
    var cache = CacheService.getScriptCache();
    var cached = cache.get('dados_painel');
    if (cached) {
      try { return JSON.parse(cached); }
      catch(e) { /* cache corrompido — segue para leitura normal */ }
    }

    // Acessa a planilha vinculada ao projeto Apps Script
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // ── Localiza as abas pelo nome ──────────────────────────────────────
    // Usa expressão regular para encontrar mesmo que tenha emoji no nome
    // ex: "🏛 Processos" ou simplesmente "Processos" — ambos funcionam
    var wsProc = null, wsEtapas = null;
    ss.getSheets().forEach(function(s) {
      var n = s.getName();
      if (/processo/i.test(n))  wsProc   = s;   // aba de processos
      if (/etapa/i.test(n))     wsEtapas = s;   // aba de etapas
    });

    // Se não encontrar as abas, devolve erro descritivo
    if (!wsProc || !wsEtapas) {
      var abas = ss.getSheets().map(function(s){ return s.getName(); }).join(', ');
      return { erro: 'Abas não encontradas. Abas disponíveis: [' + abas + ']' };
    }

    // ── Lê e mapeia a aba de Processos ───────────────────────────────────
    // Lê todos os dados da aba de uma vez (mais eficiente que linha a linha)
    var dadosProc = wsProc.getDataRange().getValues();

    // Detecta dinamicamente a linha do cabeçalho real (contém "ProcessoID")
    // Isso garante que linhas decorativas (título, aviso) sejam ignoradas
    var hProcIdx = -1;
    for (var hi = 0; hi < dadosProc.length; hi++) {
      if (dadosProc[hi].join('|').indexOf('ProcessoID') >= 0) { hProcIdx = hi; break; }
    }
    if (hProcIdx < 0) return { erro: 'Cabeçalho "ProcessoID" não encontrado na aba de Processos.' };

    // Monta array com os nomes das colunas (ex: ['ProcessoID','N° SUAP','Objeto',...])
    var hProc = dadosProc[hProcIdx].map(function(h){ return String(h).trim(); });

    // Transforma cada linha em um objeto { coluna: valor }
    // ex: { ProcessoID: 'SEL-2026-001', 'N° SUAP': '23040.001/2026', ... }
    var processos = [];
    for (var i = hProcIdx + 1; i < dadosProc.length; i++) {
      var row = dadosProc[i];
      if (!row[0]) continue;   // ignora linhas completamente vazias
      var obj = {};
      hProc.forEach(function(h, idx){ obj[h] = row[idx]; });
      processos.push(obj);
    }

    // ── LOG DIAGNÓSTICO — ProcessoID + D0 de cada processo (remover após confirmar) ──
    processos.forEach(function(p) {
      var d0raw = p['D0 (Data Abertura)'];
      var tipo  = d0raw instanceof Date ? 'Date(UTC: ' + d0raw.toISOString() + ')' : typeof d0raw + '=' + d0raw;
      Logger.log('[DIAG] PID=' + p['ProcessoID'] + ' | Objeto=' + String(p['Objeto']).substring(0,30) + ' | Modal=' + p['Modalidade'] + ' | D0raw=' + tipo);
    });

    // ── Lê e mapeia a aba de Etapas ──────────────────────────────────────
    var dadosEtap = wsEtapas.getDataRange().getValues();

    // Detecta a linha do cabeçalho da aba de etapas (mesma lógica)
    var hEtapIdx = -1;
    for (var hj = 0; hj < dadosEtap.length; hj++) {
      if (dadosEtap[hj].join('|').indexOf('ProcessoID') >= 0) { hEtapIdx = hj; break; }
    }
    if (hEtapIdx < 0) return { erro: 'Cabeçalho "ProcessoID" não encontrado na aba de Etapas.' };

    var hEtap = dadosEtap[hEtapIdx].map(function(h){ return String(h).trim(); });
    var etapas = [];
    for (var j = hEtapIdx + 1; j < dadosEtap.length; j++) {
      var rowE = dadosEtap[j];
      if (!rowE[0]) continue;                              // ignora linha vazia
      if (rowE[1] === null || rowE[1] === '') continue;   // ignora linhas separadoras
      // As linhas separadoras têm texto na coluna A (ex: "N° SUAP: 23040...")
      // mas a coluna B (Ord.) está vazia — é esse o sinal para pular
      var objE = {};
      hEtap.forEach(function(h, idx){ objE[h] = rowE[idx]; });
      etapas.push(objE);
    }

    // ── Agrupa etapas por ProcessoID ─────────────────────────────────────
    // Cria um dicionário: { 'SEL-2026-001': [etapa1, etapa2,...], ... }
    var etapasPorProc = {};
    etapas.forEach(function(e) {
      var pid = String(e['ProcessoID'] || '').trim();
      if (!etapasPorProc[pid]) etapasPorProc[pid] = [];
      etapasPorProc[pid].push(e);
    });

    // Ordena as etapas de cada processo pelo número de ordem (coluna "Ord.")
    Object.keys(etapasPorProc).forEach(function(pid) {
      etapasPorProc[pid].sort(function(a, b){
        return Number(a['Ord.'] || 0) - Number(b['Ord.'] || 0);
      });
    });

    // ── Processa cada processo ────────────────────────────────────────────
    var resultado = processos.map(function(p) {
      var pid      = String(p['ProcessoID']       || '').trim();
      var suapNum  = String(p['N° SUAP']          || '').trim();
      var modal    = String(p['Modalidade']        || '').trim();
      var d0raw    = p['D0 (Data Abertura)']       || null;  // data de abertura (D0)
      var linkSuap = String(p['Link SUAP']         || '#').trim();
      var temIRP   = String(p['Tem IRP?']          || 'Não').trim();
      var d0       = parseDateValue(d0raw);  // converte para objeto Date
      // FIX: se D0 for inválida, pula o processo para evitar datas absurdas no Gantt
      if (!d0) {
        Logger.log('AVISO: Processo ' + pid + ' ignorado — D0 inválida ou vazia ("' + d0raw + '").');
        return null;
      }
      var etps     = etapasPorProc[pid] || [];

      // FIX: processo sem nenhuma etapa cadastrada — pula para evitar NaN no Gantt
      if (!etps.length) {
        Logger.log('AVISO: Processo ' + pid + ' ignorado — sem etapas cadastradas na aba Etapas.');
        return null;
      }

      // ── Filtra etapas fora do escopo do SEL ────────────────────────────
      // "Assinatura contrato / Ata (ARP)" é responsabilidade do Setor de
      // Contratos, não do SEL — por isso é excluída do painel
      var etpsFiltradas = etps.filter(function(e) {
        var nomeEtapa = String(e['Etapa'] || '').toLowerCase().trim();
        return nomeEtapa.indexOf('assinatura') < 0 && nomeEtapa.indexOf('arp') < 0;
      });

      // ── Calcula datas em cascata (lógica central do sistema) ───────────
      // Cada etapa começa exatamente onde a anterior terminou.
      // Se uma etapa tem atraso (AtrasoRealDias > 0), todas as seguintes
      // são empurradas para frente automaticamente.
      //
      // Exemplo com D0 = 01/Jan/2026:
      //   Etapa 1: prazo 5 dias, atraso 0 → Jan/2026 a Jan/2026
      //   Etapa 2: prazo 45 dias, atraso 11 → Jan/2026 a Mar/2026 (11 dias a mais)
      //   Etapa 3: começa em Mar/2026 (já empurrada pelo atraso anterior)
      var cursor = d0 ? new Date(d0.getTime()) : new Date();

      var etapasCalc = etpsFiltradas.map(function(e) {
        var nome        = String(e['Etapa']                         || '').trim();
        var base        = parseInt(e['Prazo (dias)'])               || 0;  // prazo previsto na Portaria 638/2026
        var motivo      = String(e['MotivoAtraso ◄ EDITAR']        || '').trim();
        var status      = normalizeStatus(String(e['StatusEtapa ◄ EDITAR'] || '').trim());
        var agente      = String(e['Agente Responsável']            || '').trim();
        var fase        = String(e['Fase']                          || '').trim();
        // DataRealizacao: data real de conclusão da etapa (preenchida pela equipe).
        // Substitui AtrasoRealDias — o atraso é calculado automaticamente
        // comparando esta data com a data de término prevista (fimSemAtraso).
        // Se não preenchida, assume-se que a etapa ainda está no prazo original.
        var realizacaoRaw = e['DataRealizacao◄ EDITAR'] || null;
        var dataRealizacao = realizacaoRaw ? parseDateValue(realizacaoRaw) : null;

        // Data de início desta etapa = posição atual do cursor
        var ini = new Date(cursor.getTime());

        // Fim previsto puro (sem atraso): base em dias úteis a partir de ini
        var fimSemAtraso = adicionarDiasUteis(new Date(ini.getTime()), base);

        // Calcula atraso em dias úteis comparando DataRealizacao com o fim previsto.
        //   > 0 → realizou depois do prazo (atraso)
        //   ≤ 0 → realizou no prazo ou adiantado → sem atraso
        // Para etapas não concluídas (sem DataRealizacao), atraso = 0;
        // o painel calculará "atrasado há X dias" dinamicamente a partir de hoje.
        var atraso = 0;
        if (dataRealizacao && base > 0) {
          atraso = contarDiasUteis(fimSemAtraso, dataRealizacao);
          if (atraso < 0) atraso = 0; // adiantamento → sem atraso registrado
        }

        // Avança o cursor:
        //   - Se DataRealizacao preenchida: cursor avança até ela (data real de saída)
        //   - Caso contrário: avança pelo prazo base + atraso (lógica anterior)
        if (dataRealizacao && base > 0) {
          cursor = new Date(dataRealizacao.getTime());
        } else {
          cursor = adicionarDiasUteis(new Date(cursor.getTime()), base + atraso);
        }

        // Data de fim = posição do cursor após avançar
        var fim = new Date(cursor.getTime());

        // Converte datas para índices de mês (Jan/2026 = 0, Fev/2026 = 1, ...)
        var prazoIni     = dateToMonthIdx(ini);
        var prazoFim     = dateToMonthIdx(fim);           // fim real (com ou sem atraso)
        var prazoFimBase = dateToMonthIdx(fimSemAtraso);  // fim previsto puro (sem atraso)
        var realFim      = atraso > 0 ? prazoFim : prazoFimBase;

        return {
          nome:         nome,
          agente:       agente,       // setor responsável (ex: DECOF/DIAD, SEL/SEPMA)
          fase:         fase,         // Interna, Externa ou Contratual
          status:       status,       // ok | andamento | aguardando | paralisado | planejamento | naoaplica
          prazo_ini:    prazoIni,     // mês de início previsto
          prazo_fim:    prazoFimBase, // mês de fim original (sem atraso — prazo puro da Portaria)
          real_ini:     prazoIni,     // mês de início real (igual ao previsto — início não atrasa)
          real_fim:     realFim,      // mês de fim real (pode ser > prazo_fim se houver atraso)
          dias:         atraso,       // dias de atraso calculados (DataRealizacao - fimSemAtraso)
          motivo:       motivo,       // justificativa do atraso
          realizacao_iso: dataRealizacao ? (dataRealizacao.getFullYear() + '-' + String(dataRealizacao.getMonth()+1).padStart(2,'0') + '-' + String(dataRealizacao.getDate()).padStart(2,'0')) : null,
          // ISO da data de início e fim — usado no tooltip para calcular
          // "Começa em X dias" / "Vence em X dias" / "Atrasado há X dias"
          ini_iso:      ini.getFullYear() + '-' + String(ini.getMonth()+1).padStart(2,'0') + '-' + String(ini.getDate()).padStart(2,'0'),
          // fim_iso = prazo puro da Portaria 638/2026 (sem atraso) — usado em "Prazo 638/2026" no tooltip de etapa.
          // NÃO usar 'fim' aqui — quando DataRealizacao está preenchida, 'fim' == DataRealizacao,
          // fazendo "Prazo 638/2026" e "Realizado" exibirem a mesma data no tooltip.
          fim_iso:      fimSemAtraso.getFullYear() + '-' + String(fimSemAtraso.getMonth()+1).padStart(2,'0') + '-' + String(fimSemAtraso.getDate()).padStart(2,'0'),
          // fim_real_iso = data real de saída da etapa (com atraso se houver) — usado no "Período" do processo.
          fim_real_iso: fim.getFullYear() + '-' + String(fim.getMonth()+1).padStart(2,'0') + '-' + String(fim.getDate()).padStart(2,'0')
        };
      });

      // ── Calcula range (mês inicial e final) do processo inteiro ────────
      var todosIni = etapasCalc.map(function(e){ return e.prazo_ini; }).filter(function(x){ return x !== null; });
      var todosFim = etapasCalc.map(function(e){ return e.real_fim !== null ? e.real_fim : e.prazo_fim; }).filter(function(x){ return x !== null; });
      var inicio   = todosIni.length ? Math.min.apply(null, todosIni) : 0;
      var fim2     = todosFim.length ? Math.max.apply(null, todosFim) : 0;

      // ── Calcula % de execução ───────────────────────────────────────────
      // Considera concluída qualquer etapa com status "ok" (Concluída na planilha)
      var concluidas = etapasCalc.filter(function(e){ return e.status === 'ok'; }).length;
      var execucao   = etapasCalc.length ? Math.round((concluidas / etapasCalc.length) * 100) : 0;

      // ── Determina status geral do processo ─────────────────────────────
      // Ordem de prioridade: atrasado > aguardando > paralisado > andamento > concluído > planejamento
      //
      // "aguardando": processo parado aguardando ação do setor requisitante
      // "paralisado": interrupção por fato extraordinário, sem prazo de retomada
      // Ambos são distintos de "atrasado" — não há culpa do SEL, mas o processo
      // não avança. Os dias acumulados nessas etapas entram no cascateamento normalmente.
      var temAtrasada   = etapasCalc.some(function(e){ return e.dias > 0; });
      var temAndamento  = etapasCalc.some(function(e){ return e.status === 'andamento'; });
      var temAguardando = etapasCalc.some(function(e){ return e.status === 'aguardando'; });
      var temParalisado = etapasCalc.some(function(e){ return e.status === 'paralisado'; });
      var statusBase    = normalizeStatus(String(p['Status'] || '').trim());
      var statusGeral;
      if (temAtrasada)                          statusGeral = 'atrasado';
      else if (temAguardando)                   statusGeral = 'aguardando';
      else if (temParalisado)                   statusGeral = 'paralisado';
      else if (temAndamento)                    statusGeral = 'andamento';
      else if (execucao === 100)                statusGeral = 'ok';
      else if (statusBase === 'planejamento')   statusGeral = 'planejamento';
      else                                      statusGeral = statusBase || 'planejamento';

      // ── Pega o motivo de atraso mais recente com conteúdo ──────────────
      var motivos    = etapasCalc.filter(function(e){ return e.motivo; }).map(function(e){ return e.motivo; });
      var motivoProc = motivos.length ? motivos[motivos.length - 1] : '';

      // ── Monta o objeto final do processo ───────────────────────────────
      // Datas ISO da 1ª etapa (início do processo) e última (fim do processo)
      // usadas no tooltip para exibir o intervalo com dia exato (DD/MM – DD/MM)
      var procIniIso = etapasCalc.length ? etapasCalc[0].ini_iso : null;
      // Para o "Período" do processo usamos fim_real_iso (data real com atraso),
      // não fim_iso (prazo puro) — queremos mostrar até quando o processo realmente durou.
      var procFimIso = etapasCalc.length ? etapasCalc[etapasCalc.length - 1].fim_real_iso : null;

      return {
        id:         pid,
        num:        suapNum || pid,  // exibe N° SUAP se disponível; senão usa ProcessoID
        pid:        pid,             // chave interna usada para relacionar etapas
        nome:       String(p['Objeto'] || pid).trim(),  // descrição do objeto contratado
        status:     statusGeral,     // atrasado | aguardando | paralisado | andamento | ok | planejamento
        inicio:     inicio,          // índice do mês de início (para posicionar no Gantt)
        fim:        fim2,            // índice do mês de término (para posicionar no Gantt)
        ini_iso:    procIniIso,      // data de início exata (YYYY-MM-DD) — para o tooltip DD/MM – DD/MM
        fim_iso:    procFimIso,      // data de fim exata (YYYY-MM-DD) — para o tooltip DD/MM – DD/MM
        execucao:   execucao,        // percentual de conclusão (0 a 100)
        previsao:   absToLabel(fim2),// texto legível do mês de término (ex: "Ago/2026")
        suap:       linkSuap || '#', // URL do processo no SUAP
        motivo:     motivoProc,      // motivo de atraso exibido no tooltip
        modalidade: modalAbrev(modal), // PE | CD | CC
        temIRP:     temIRP === 'Sim',  // true se tiver Intenção de Registro de Preços
        etapas:     etapasCalc       // array com todas as etapas calculadas
      };
    }).filter(function(p){ return p !== null && p.etapas.length > 0; });
    // Remove processos sem etapas (ex: linha vazia ou processo sem dados)
    // e processos retornados como null (D0 inválida — ver guard acima)

    var retorno = { processos: resultado, geradoEm: new Date().toISOString() };

    // ── Salva no cache por 120 segundos ──────────────────────────────────
    // O limite do CacheService é 100 KB por chave. Se o JSON for maior,
    // simplesmente não cacheia (o painel funciona igual, só mais lento).
    try {
      var json = JSON.stringify(retorno);
      if (json.length < 100000) cache.put('dados_painel', json, 120);
    } catch(e) { /* ignora erro de cache — não impede o funcionamento */ }

    return retorno;

  } catch(err) {
    // Captura qualquer erro inesperado e devolve mensagem descritiva
    return { erro: 'Erro interno: ' + err.message + ' — ' + err.stack };
  }
}


// ── INVALIDAR CACHE ──────────────────────────────────────────────────────
// Chamada pelo botão "Atualizar" do painel ou pelo menu da planilha.
// Remove o cache forçando a próxima chamada de getDados() a reler a planilha.
function invalidarCache() {
  CacheService.getScriptCache().remove('dados_painel');
  return { ok: true };
}


// ════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES (helpers)
// ════════════════════════════════════════════════════════════════════════

// Converte um valor de célula em objeto Date JavaScript.
// Aceita três formatos:
//   - Objeto Date nativo do Google Sheets
//   - String no formato brasileiro "DD/MM/AAAA"
//   - String no formato ISO "AAAA-MM-DD"
function parseDateValue(val) {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    // O Google Sheets armazena datas internamente em UTC (meia-noite).
    // No Brasil (UTC-3) isso causa um shift de -3h, fazendo "01/03/2026 00:00 UTC"
    // virar "28/02/2026 21:00 BRT" — um dia antes, às vezes um mês antes.
    // Corrição: recria o Date usando getUTCFullYear/Month/Date para forçar
    // o ano/mês/dia corretos independente do fuso.
    return new Date(val.getUTCFullYear(), val.getUTCMonth(), val.getUTCDate());
  }
  var s = String(val).trim();
  // Formato DD/MM/AAAA (padrão brasileiro)
  var m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  // Fallback: tenta parsear como string genérica
  var d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// Converte uma data em índice de mês absoluto.
// A escala começa em Jan/ANO_BASE = 0.
// Exemplos (com ANO_BASE=2026): Fev/2026 = 1, Dez/2026 = 11, Jan/2027 = 12.
// Esse índice é usado no Gantt para posicionar as barras horizontalmente.
function dateToMonthIdx(d) {
  if (!d || isNaN(d.getTime())) return null;
  return (d.getFullYear() - ANO_BASE) * 12 + d.getMonth();
}

// Converte um índice de mês absoluto em texto legível (ex: 7 → "Ago/2026")
// Usado nos tooltips e na coluna "Previsão" do painel
function absToLabel(idx) {
  if (idx === null || idx === undefined) return '—';
  var MOS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  var y = ANO_BASE + Math.floor(idx / 12);
  return MOS[((idx % 12) + 12) % 12] + '/' + y;
}

// Converte os valores da coluna "StatusEtapa ◄ EDITAR" da planilha
// para chaves internas usadas no código JavaScript do painel.
// Isso permite que a equipe use linguagem natural na planilha
// sem depender de valores exatos.
//
// Mapeamento:
//   "Em andamento"          → 'andamento'   (exibido em azul)
//   "Concluída"             → 'ok'          (exibido em verde com ✓)
//   "Não iniciada"          → 'planejamento'(exibido em cinza)
//   "Não se aplica"         → 'naoaplica'   (etapa pulada, ex: IRP quando não é SRP)
//   "Aguardando requisitante" → 'aguardando' (processo parado; dependemos do setor requisitante)
//   "Paralisado"            → 'paralisado'  (interrupção por fato extraordinário; retomada sem prazo)
function normalizeStatus(s) {
  if (!s) return 'planejamento';
  var lower = s.toLowerCase().trim();
  var map = {
    'em andamento':              'andamento',
    'concluída':                 'ok',
    'concluida':                 'ok',
    // 'no prazo' era sinônimo antigo de 'concluída' — removido para evitar
    // contradição visual quando AtrasoRealDias > 0. Se a etapa tem atraso
    // mas ainda está acontecendo, o status correto é 'Em andamento'.
    'não iniciada':              'planejamento',
    'nao iniciada':              'planejamento',
    'não se aplica':             'naoaplica',
    'nao se aplica':             'naoaplica',
    'planejamento':              'planejamento',
    'em planejamento':           'planejamento',
    'pendente':                  'pendente',
    'aguardando requisitante':   'aguardando',
    'paralisado':                'paralisado'
  };
  return map[lower] || 'planejamento';
}

// ════════════════════════════════════════════════════════════════════════
// TRIGGER DIÁRIO — Atualização automática dos dados
//
// O trigger roda todos os dias no horário configurado (padrão: entre 5h–6h).
// Ele invalida o cache e força uma nova leitura da planilha, garantindo que
// o painel já esteja com dados frescos quando a equipe acessar de manhã.
//
// Para instalar:  execute instalarTriggerDiario() uma única vez
// Para remover:   execute desinstalarTriggerDiario()
// ════════════════════════════════════════════════════════════════════════

// Função executada pelo trigger — invalida cache e relê a planilha
function atualizacaoDiaria() {
  invalidarCache();
  getDados();
  Logger.log('Atualização diária concluída em ' + new Date().toISOString());
}

// Instala o trigger para rodar todo dia entre 5h–6h
function instalarTriggerDiario() {
  // Remove triggers anteriores para evitar duplicação
  desinstalarTriggerDiario();
  ScriptApp.newTrigger('atualizacaoDiaria')
    .timeBased()
    .everyDays(1)
    .atHour(5)
    .create();
  Logger.log('Trigger diário instalado com sucesso.');
  SpreadsheetApp.getUi().alert('Trigger diário instalado! O painel será atualizado automaticamente todo dia às 5h–6h.');
}

// Remove todos os triggers da função atualizacaoDiaria
function desinstalarTriggerDiario() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) {
    if (t.getHandlerFunction() === 'atualizacaoDiaria') {
      ScriptApp.deleteTrigger(t);
    }
  });
  Logger.log('Trigger(s) diário(s) removido(s).');
}

// ── Trigger installable para detector de atraso ──────────────────────────
// O onEdit simples não permite abrir diálogos (prompt/alert).
// Por isso usamos um trigger "installable" que chama onEditAtraso(),
// que tem permissões completas de UI.
// ── Preenche DataRealizacao vazia com data de hoje em todas as etapas ────
// Facilita o uso: célula com data já abre o calendário no primeiro clique.
// Só preenche células VAZIAS — não sobrescreve datas já registradas.
function preencherDataRealizacaoHoje() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var wsEtapas = null;
  ss.getSheets().forEach(function(s) {
    if (/etapa/i.test(s.getName())) wsEtapas = s;
  });
  if (!wsEtapas) { SpreadsheetApp.getUi().alert('Aba de Etapas não encontrada.'); return; }

  var dados = wsEtapas.getDataRange().getValues();
  var hIdx = -1;
  for (var i = 0; i < dados.length; i++) {
    if (dados[i].join('|').indexOf('ProcessoID') >= 0) { hIdx = i; break; }
  }
  if (hIdx < 0) return;

  var header = dados[hIdx].map(function(h) { return String(h).trim(); });
  var colDR = header.indexOf('DataRealizacao◄ EDITAR');
  if (colDR < 0) { SpreadsheetApp.getUi().alert('Coluna "DataRealizacao◄ EDITAR" não encontrada.'); return; }

  var hoje = new Date();
  var count = 0;
  for (var r = hIdx + 1; r < dados.length; r++) {
    var pid = String(dados[r][0] || '').trim();
    if (!pid) continue; // separador
    var val = dados[r][colDR];
    if (!val || val === '' || val === 0) {
      var cell = wsEtapas.getRange(r + 1, colDR + 1);
      cell.setValue(hoje);
      cell.setNumberFormat('DD/MM/YYYY');
      count++;
    }
  }
  // Garante formato DD/MM/YYYY em toda a coluna após o preenchimento em lote
  try { formatarColunaDatas(); } catch(e) {}

  SpreadsheetApp.getUi().alert(
    count + ' célula' + (count !== 1 ? 's' : '') + ' preenchida' + (count !== 1 ? 's' : '') +
    ' com a data de hoje.\n\nAo clicar em qualquer uma delas, o calendário abrirá automaticamente.\nSubstitua pela data real de conclusão quando a etapa terminar.'
  );
}

function instalarTriggerOnEdit() {
  desinstalarTriggerOnEdit(); // evita duplicação
  ScriptApp.newTrigger('onEditAtraso')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();
  SpreadsheetApp.getUi().alert(
    '🔔 Detector de atraso instalado!\n\n' +
    'A partir de agora, sempre que você preencher a coluna "DataRealizacao◄ EDITAR"\n' +
    'com uma data posterior ao prazo previsto, um aviso será exibido pedindo o motivo do atraso.'
  );
}

function desinstalarTriggerOnEdit() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) {
    if (t.getHandlerFunction() === 'onEditAtraso') {
      ScriptApp.deleteTrigger(t);
    }
  });
}


// ════════════════════════════════════════════════════════════════════════
// NOVO PROCESSO — Insere processo + etapas padrão automaticamente
//
// Ao executar, pede via prompt apenas: N° SUAP, Objeto, Modalidade, D0 e IRP.
// O ProcessoID é GERADO AUTOMATICAMENTE no formato SEL-AAAA-NNN, onde:
//   AAAA = ano atual do sistema
//   NNN  = próximo número sequencial disponível para aquele ano (001, 002…)
//
// Depois insere:
//   1. Uma linha na aba Processos com esses dados
//   2. Um bloco de etapas padrão (Portaria 638/2026) na aba Etapas
//
// OBSERVAÇÃO: o setor responsável NÃO é mais perguntado aqui porque,
// segundo a nova modelagem, pode variar por etapa. Fica como
// "A definir" inicialmente e deve ser editado manualmente na planilha.
// ════════════════════════════════════════════════════════════════════════

function novoProcesso() {
  var ui = SpreadsheetApp.getUi();

  // ── Coleta dados via prompts (ProcessoID gerado automaticamente) ─────
  var suapResp = ui.prompt('Novo Processo', 'N° SUAP (ex: 23040.009/2026):', ui.ButtonSet.OK_CANCEL);
  if (suapResp.getSelectedButton() !== ui.Button.OK) return;
  var suap = suapResp.getResponseText().trim();

  var objResp = ui.prompt('Novo Processo', 'Objeto (descrição resumida):', ui.ButtonSet.OK_CANCEL);
  if (objResp.getSelectedButton() !== ui.Button.OK) return;
  var objeto = objResp.getResponseText().trim();

  var modalResp = ui.prompt('Novo Processo', 'Modalidade:\n1 = Pregão Eletrônico\n2 = Contratação Direta\n3 = Concorrência\n\nDigite 1, 2 ou 3:', ui.ButtonSet.OK_CANCEL);
  if (modalResp.getSelectedButton() !== ui.Button.OK) return;
  var modalNum = modalResp.getResponseText().trim();
  var modalidades = { '1': 'Pregão Eletrônico', '2': 'Contratação Direta', '3': 'Concorrência' };
  var modalidade = modalidades[modalNum] || 'Pregão Eletrônico';

  var d0Resp = ui.prompt('Novo Processo', 'Data de abertura D0 (DD/MM/AAAA):', ui.ButtonSet.OK_CANCEL);
  if (d0Resp.getSelectedButton() !== ui.Button.OK) return;
  var d0str = d0Resp.getResponseText().trim();
  var d0 = parseDateValue(d0str);
  if (!d0) { ui.alert('Data inválida. Use o formato DD/MM/AAAA.'); return; }

  var irpResp = ui.prompt('Novo Processo', 'Tem IRP (Intenção de Registro de Preços)?\nDigite Sim ou Não:', ui.ButtonSet.OK_CANCEL);
  if (irpResp.getSelectedButton() !== ui.Button.OK) return;
  var temIRP = /sim/i.test(irpResp.getResponseText()) ? 'Sim' : 'Não';

  // Setor fica "A definir" — a equipe preenche depois na planilha
  // (pode variar por etapa, então não faz sentido perguntar uma vez só)
  var setor = 'A definir';

  // ── Localiza as abas ─────────────────────────────────────────────────
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var wsProc = null, wsEtapas = null;
  ss.getSheets().forEach(function(s) {
    var n = s.getName();
    if (/processo/i.test(n))  wsProc   = s;
    if (/etapa/i.test(n))     wsEtapas = s;
  });
  if (!wsProc || !wsEtapas) { ui.alert('Abas "Processos" ou "Etapas" não encontradas.'); return; }

  // ── Gera ProcessoID automaticamente ──────────────────────────────────
  // Formato: SEL-AAAA-NNN (AAAA = ano atual, NNN = sequencial 3 dígitos)
  // Varre a coluna A (ProcessoID) procurando o maior NNN já usado no ano.
  var dadosProc = wsProc.getDataRange().getValues();
  var anoAtual = new Date().getFullYear();
  var prefixo = 'SEL-' + anoAtual + '-';
  var maiorSeq = 0;
  for (var i = 0; i < dadosProc.length; i++) {
    var cell = String(dadosProc[i][0] || '').trim();
    if (cell.indexOf(prefixo) === 0) {
      var seq = parseInt(cell.substring(prefixo.length), 10);
      if (!isNaN(seq) && seq > maiorSeq) maiorSeq = seq;
    }
  }
  var pid = prefixo + String(maiorSeq + 1).padStart(3, '0');

  // ── Insere linha na aba Processos ────────────────────────────────────
  // Detecta o cabeçalho para saber a ordem das colunas
  var hProcIdx = -1;
  for (var hi = 0; hi < dadosProc.length; hi++) {
    if (dadosProc[hi].join('|').indexOf('ProcessoID') >= 0) { hProcIdx = hi; break; }
  }
  if (hProcIdx < 0) { ui.alert('Cabeçalho "ProcessoID" não encontrado na aba Processos.'); return; }
  var hProc = dadosProc[hProcIdx].map(function(h){ return String(h).trim(); });

  // Monta a linha respeitando a ordem das colunas
  var novaLinhaProc = hProc.map(function(col) {
    switch(col) {
      case 'ProcessoID':          return pid;
      case 'N° SUAP':             return suap;
      case 'Objeto':              return objeto;
      case 'Modalidade':          return modalidade;
      case 'D0 (Data Abertura)':  return d0;
      case 'Setor Requisitante':  return setor;
      case 'Status':              return 'Em planejamento';
      case 'Tem IRP?':            return temIRP;
      case 'Link SUAP':           return '';
      default:                    return '';
    }
  });
  wsProc.appendRow(novaLinhaProc);

  // ── Insere bloco de etapas padrão na aba Etapas ──────────────────────
  // Etapas fixas da Portaria 638/2026, com prazos em dias
  var etapasPadrao = [
    { ord: 1, etapa: 'Designação da equipe de planejamento',     prazo: 5,   fase: 'Interna', agente: setor },
    { ord: 2, etapa: 'ETP + Mapa de Riscos + Pesquisa de Preços', prazo: 45, fase: 'Interna', agente: setor },
    { ord: 3, etapa: 'Minuta do TR',                              prazo: 10, fase: 'Interna', agente: setor },
    { ord: 4, etapa: 'IRP (se SRP)',                               prazo: 15, fase: 'Interna', agente: setor },
    { ord: 5, etapa: 'Adequações finais',                          prazo: 10, fase: 'Interna', agente: setor },
    { ord: 6, etapa: 'Versão final do TR',                         prazo: 10, fase: 'Interna', agente: setor },
    { ord: 7, etapa: 'Envio ao SEL',                               prazo: 3,  fase: 'Interna', agente: setor },
    { ord: 8, etapa: 'Fase Externa (' + modalidade + ')',          prazo: faseExternaDias(modalidade), fase: 'Externa', agente: 'SEL/SEPMA' }
  ];

  // Se não tem IRP, marca a etapa 4 como "Não se aplica"
  var statusIRP = temIRP === 'Sim' ? 'Não iniciada' : 'Não se aplica';

  // Detecta cabeçalho da aba Etapas
  var dadosEtap = wsEtapas.getDataRange().getValues();
  var hEtapIdx = -1;
  for (var hj = 0; hj < dadosEtap.length; hj++) {
    if (dadosEtap[hj].join('|').indexOf('ProcessoID') >= 0) { hEtapIdx = hj; break; }
  }
  if (hEtapIdx < 0) { ui.alert('Cabeçalho "ProcessoID" não encontrado na aba Etapas.'); return; }
  var hEtap = dadosEtap[hEtapIdx].map(function(h){ return String(h).trim(); });

  // ── Insere linha separadora visual (mesmo padrão da planilha) ────────
  // Formato: "  N° SUAP: 23040.001002/2026-01   |   Descrição do objeto"
  // A coluna A tem o texto, demais colunas ficam vazias.
  // O getDados() já ignora essas linhas (coluna B vazia = separador).
  var textoSeparador = '  N° SUAP: ' + (suap || '—') + '   |   ' + objeto;
  var linhaSeparadora = hEtap.map(function(col, idx) {
    return idx === 0 ? textoSeparador : '';
  });
  wsEtapas.appendRow(linhaSeparadora);

  // Aplica formatação visual na linha separadora (fundo cinza, negrito)
  var ultimaLinha = wsEtapas.getLastRow();
  var rangeSep = wsEtapas.getRange(ultimaLinha, 1, 1, hEtap.length);
  rangeSep.setBackground('#E8F0FE');
  rangeSep.setFontWeight('bold');
  rangeSep.setFontSize(10);
  rangeSep.setFontColor('#1F3864');
  wsEtapas.getRange(ultimaLinha, 1, 1, 1).merge();

  // ── Insere as 8 etapas padrão ─────────────────────────────────────────
  var linhasEtapas = etapasPadrao.map(function(ep) {
    return hEtap.map(function(col) {
      switch(col) {
        case 'ProcessoID':                return pid;
        case 'Ord.':                      return ep.ord;
        case 'Etapa':                     return ep.etapa;
        case 'Prazo (dias)':              return ep.prazo;
        case 'DataRealizacao◄ EDITAR':    return new Date();  // data de hoje — já abre calendário no 1º clique
        case 'AtrasoRealDias ◄ EDITAR':   return 0;   // coluna legada — mantida para compatibilidade
        case 'MotivoAtraso ◄ EDITAR':     return '';
        case 'StatusEtapa ◄ EDITAR':      return ep.ord === 4 ? statusIRP : 'Não iniciada';
        case 'Agente Responsável':        return ep.agente;
        case 'Fase':                      return ep.fase;
        default:                          return '';
      }
    });
  });

  // ── Localiza a coluna StatusEtapa para aplicar formatação condicional ──
  // As regras de formatação condicional da planilha não se propagam
  // automaticamente para linhas novas. Por isso, replicamos as cores
  // programaticamente com setBackground() em cada linha inserida.
  var colStatusIdx = hEtap.indexOf('StatusEtapa ◄ EDITAR');
  // Mapa de cores por status (deve espelhar as regras da planilha)
  var COR_STATUS = {
    'Não iniciada':          { bg: '#E8EAED', fg: '#3C4043' },   // cinza claro
    'Em andamento':          { bg: '#E6F4EA', fg: '#1E6E42' },   // verde claro
    'Concluída':             { bg: '#D2E3FC', fg: '#1A4D8C' },   // azul claro
    'Aguardando requisitante':{ bg: '#FDE8D8', fg: '#8C3D0F' },  // laranja claro
    'Paralisado':            { bg: '#EDD9F5', fg: '#5D2080' },   // roxo claro
    'Não se aplica':         { bg: '#F8F9FA', fg: '#9AA0A6' }    // cinza muito claro
  };

  // Índice da coluna DataRealizacao (para aplicar formato de data)
  var colDataRealizIdx = hEtap.indexOf('DataRealizacao◄ EDITAR');

  // Adiciona as linhas de etapas à aba e aplica formatação visual
  linhasEtapas.forEach(function(linha) {
    wsEtapas.appendRow(linha);
    var ultimaLinhaEtapa = wsEtapas.getLastRow();
    var rangeEtapa = wsEtapas.getRange(ultimaLinhaEtapa, 1, 1, hEtap.length);

    // Estilo base: fonte padrão para todas as colunas da etapa
    rangeEtapa.setFontSize(10);
    rangeEtapa.setFontWeight('normal');

    // Formata a célula DataRealizacao como data DD/MM/AAAA
    // Isso garante que o valor Date() apareça legível e que o
    // calendário abra no primeiro clique ao editar a célula.
    if (colDataRealizIdx >= 0) {
      wsEtapas.getRange(ultimaLinhaEtapa, colDataRealizIdx + 1)
        .setNumberFormat('DD/MM/YYYY');
    }

    // Cor de fundo + cor do texto baseada no StatusEtapa
    if (colStatusIdx >= 0) {
      var statusVal = linha[colStatusIdx];
      var cor = COR_STATUS[statusVal];
      if (cor) {
        rangeEtapa.setBackground(cor.bg);
        rangeEtapa.setFontColor(cor.fg);
      }
    }
  });

  // Invalida o cache para que o painel reflita o novo processo
  invalidarCache();

  ui.alert('Processo "' + pid + '" criado com sucesso!\n\n' +
           '• ProcessoID gerado automaticamente: ' + pid + '\n' +
           '• 1 linha adicionada na aba Processos\n' +
           '• ' + etapasPadrao.length + ' etapas adicionadas na aba Etapas\n\n' +
           'IMPORTANTE: o "Agente Responsável" das etapas ficou como "A definir".\n' +
           'Edite manualmente na aba Etapas conforme o setor de cada etapa.\n\n' +
           'O painel já vai exibir o novo processo na próxima atualização.');
}

// Helper: retorna os dias da fase externa por modalidade
function faseExternaDias(modalidade) {
  if (/direta|dispensa|inexig/i.test(modalidade)) return 30;
  if (/concorrência|concorrencia/i.test(modalidade)) return 100;
  return 90; // Pregão Eletrônico (padrão)
}


// ════════════════════════════════════════════════════════════════════════
// DIAS ÚTEIS — cálculo de datas excluindo fins de semana e feriados
//
// adicionarDiasUteis(data, qtdDias) avança a data ignorando:
//   - Sábados e domingos
//   - Feriados nacionais FIXOS (não variam de ano para ano)
//
// Feriados MÓVEIS (Carnaval, Sexta-feira Santa, Corpus Christi) NÃO estão
// incluídos pois variam a cada ano. Se quiser adicioná-los no futuro,
// inclua as datas no array FERIADOS_MOVEIS para o ano desejado.
//
// Feriados municipais do Rio de Janeiro também NÃO estão incluídos por
// padrão — adicionar manualmente se necessário.
// ════════════════════════════════════════════════════════════════════════

// Feriados nacionais FIXOS no formato "MM-DD" (valem para qualquer ano)
var FERIADOS_FIXOS = [
  '01-01', // Confraternização Universal
  '04-21', // Tiradentes
  '05-01', // Dia do Trabalho
  '09-07', // Independência do Brasil
  '10-12', // Nossa Senhora Aparecida
  '11-02', // Finados
  '11-15', // Proclamação da República
  '11-20', // Consciência Negra (Lei 14.759/2023)
  '12-25'  // Natal
];

// Verifica se uma data é feriado nacional fixo
function isFeriadoFixo(d) {
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  var dd = String(d.getDate()).padStart(2, '0');
  return FERIADOS_FIXOS.indexOf(mm + '-' + dd) >= 0;
}

// Verifica se uma data é dia útil (não é sáb/dom e não é feriado fixo)
function isDiaUtil(d) {
  var dow = d.getDay(); // 0=Dom, 6=Sáb
  return dow !== 0 && dow !== 6 && !isFeriadoFixo(d);
}

// Avança uma data em N dias úteis.
// Exemplo: adicionarDiasUteis(sex 18/04, 5) → sex 25/04 (pula 19/04 Páscoa não,
//   mas pula sáb 19 e dom 20 → seg 21 = Tiradentes (feriado, pula) →
//   ter 22, qua 23, qui 24, sex 25 = 4 úteis... assim por diante)
// Se qtdDias = 0, retorna a própria data (sem avançar).
function adicionarDiasUteis(dataBase, qtdDias) {
  var d = new Date(dataBase.getTime());
  var restante = qtdDias;
  while (restante > 0) {
    d.setDate(d.getDate() + 1);
    if (isDiaUtil(d)) restante--;
  }
  return d;
}


/*
 * contarDiasUteis(dataA, dataB) → número de dias úteis entre dataA e dataB.
 * Resultado positivo → dataB é depois de dataA (atraso).
 * Resultado negativo → dataB é antes de dataA (adiantamento).
 * Usa a mesma definição de "dia útil" de adicionarDiasUteis() (isDiaUtil).
 */
function contarDiasUteis(dataA, dataB) {
  var a = new Date(dataA.getTime());
  var b = new Date(dataB.getTime());
  var sinal = 1;
  if (a.getTime() > b.getTime()) { var tmp = a; a = b; b = tmp; sinal = -1; }
  var count = 0;
  var d = new Date(a.getTime());
  d.setDate(d.getDate() + 1); // começa no dia seguinte ao de referência
  while (d.getTime() <= b.getTime()) {
    if (isDiaUtil(d)) count++;
    d.setDate(d.getDate() + 1);
  }
  return sinal * count;
}

// Abrevia o nome da modalidade de licitação para exibição no Gantt.
// PE = Pregão Eletrônico  (barra azul escuro)
// CD = Contratação Direta (barra dourada — inclui dispensa e inexigibilidade)
// CC = Concorrência       (barra verde escuro)
// Se não reconhecer, assume PE por segurança.
function modalAbrev(m) {
  // Normaliza: remove acentos e converte para minúsculas para comparação robusta
  // (previne falha quando o Sheets importa xlsx com encoding ligeiramente diferente)
  var n = String(m || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (/prego|pregao/.test(n))               return 'PE';
  if (/direta|dispensa|inexig/.test(n))     return 'CD';
  if (/concorr/.test(n))                    return 'CC';
  return 'PE';
}


// ════════════════════════════════════════════════════════════════════════
// ONEDIT SIMPLES — Correção automática de formato de data
//
// O Google Sheets sobrescreve o formato de célula ao exibir datas usando
// o padrão regional da conta do usuário (ex: conta em inglês → MM/DD/AAAA).
// Esta função simples é acionada automaticamente pelo GAS a cada edição
// e re-aplica DD/MM/YYYY na célula da coluna DataRealizacao se for editada.
//
// Por ser um "simple trigger", não precisa ser instalado manualmente —
// o GAS executa automaticamente toda vez que há uma edição na planilha.
// ════════════════════════════════════════════════════════════════════════
function onEdit(e) {
  if (!e || !e.range) return;

  var sheet = e.range.getSheet();
  // Age apenas na aba Etapas
  var nomAba = sheet.getName().replace(/\s/g, '').toLowerCase();
  if (nomAba.indexOf('etapa') < 0) return;

  // Lê o cabeçalho para localizar a coluna DataRealizacao◄ EDITAR
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return;
  var header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var colDR = -1;
  for (var i = 0; i < header.length; i++) {
    if (String(header[i]).trim() === 'DataRealizacao◄ EDITAR') { colDR = i; break; }
  }
  if (colDR < 0) return;

  // Re-aplica DD/MM/YYYY somente se a célula editada for da coluna DataRealizacao
  if (e.range.getColumn() === colDR + 1) {
    e.range.setNumberFormat('DD/MM/YYYY');
  }
}


// ════════════════════════════════════════════════════════════════════════
// ONEDIT INSTALÁVEL — Detector automático de atraso ao preencher DataRealizacao
//
// Quando a equipe preenche a coluna "DataRealizacao◄ EDITAR" de uma etapa,
// esta função verifica automaticamente se houve atraso comparando a data
// informada com o prazo previsto (calculado em cascata a partir de D0).
//
// Se houver atraso, abre um popup pedindo o motivo e grava automaticamente
// na coluna "MotivoAtraso ◄ EDITAR" da mesma linha.
//
// DIFERENÇA do onEdit simples acima: esta função usa UI (prompt/alert),
// o que exige um trigger instalável com permissões elevadas.
// ════════════════════════════════════════════════════════════════════════

function onEditAtraso(e) {
  // Ignora edições fora da planilha ativa ou sem range definido
  if (!e || !e.range) return;

  var sheet = e.range.getSheet();
  var nomAba = sheet.getName();

  // Só age na aba de Etapas
  if (!/etapa/i.test(nomAba)) return;

  // Descobre os índices das colunas relevantes a partir do cabeçalho
  var dados = sheet.getDataRange().getValues();
  var hIdx = -1;
  for (var i = 0; i < dados.length; i++) {
    if (dados[i].join('|').indexOf('ProcessoID') >= 0) { hIdx = i; break; }
  }
  if (hIdx < 0) return;

  var header = dados[hIdx].map(function(h) { return String(h).trim(); });
  var colRealizacao = header.indexOf('DataRealizacao◄ EDITAR');
  var colMotivo     = header.indexOf('MotivoAtraso ◄ EDITAR');
  var colPrazo      = header.indexOf('Prazo (dias)');
  var colProcID     = header.indexOf('ProcessoID');
  var colStatus     = header.indexOf('StatusEtapa ◄ EDITAR');

  var colEditada = e.range.getColumn();

  // ── Bloco 1: mudança de StatusEtapa para "Aguardando requisitante" ou "Paralisado" ──
  // Pede motivo apenas se MotivoAtraso estiver vazio (não sobrescreve motivo existente).
  if (colStatus >= 0 && colEditada === colStatus + 1) {
    var novoStatus = String(e.range.getValue() || '').trim();
    var statusAlerta = ['Aguardando requisitante', 'Paralisado'];
    if (statusAlerta.indexOf(novoStatus) >= 0) {
      var linhaStatus = e.range.getRow();
      if (colMotivo >= 0) {
        var motivoAtual = String(sheet.getRange(linhaStatus, colMotivo + 1).getValue() || '').trim();
        if (!motivoAtual) {
          // Motivo vazio — pede o motivo via prompt
          var uiS = SpreadsheetApp.getUi();
          var icone = novoStatus === 'Paralisado' ? '⛔' : '⏳';
          var respS = uiS.prompt(
            icone + ' ' + novoStatus,
            'Por que a etapa está com status "' + novoStatus + '"?\n\nSeja objetivo — descreva o fato:',
            uiS.ButtonSet.OK_CANCEL
          );
          if (respS.getSelectedButton() === uiS.Button.OK) {
            var motivoS = respS.getResponseText().trim();
            if (motivoS) {
              sheet.getRange(linhaStatus, colMotivo + 1).setValue(motivoS);
              SpreadsheetApp.getActiveSpreadsheet().toast(
                'Motivo registrado para "' + novoStatus + '".',
                icone + ' Motivo salvo', 4
              );
              invalidarCache();
            }
          }
        }
        // Se motivo já preenchido — não faz nada (preserva o motivo existente)
      }
    }
    return; // encerra — edição de status não passa pelo bloco de DataRealizacao
  }

  // Só age se a célula editada for da coluna DataRealizacao
  // (colunas da planilha são 1-based, indexOf retorna 0-based)
  if (colRealizacao < 0 || colEditada !== colRealizacao + 1) return;

  // Pega o valor da célula editada
  var valorCelula = e.range.getValue();
  if (!valorCelula) return; // célula foi apagada — sem ação

  var dataRealizacao = parseDateValue(valorCelula);
  if (!dataRealizacao) return; // valor inválido — sem ação

  var linhaEtapa = e.range.getRow();

  // Precisa calcular o fim previsto da etapa para saber se houve atraso.
  // Estratégia: lê o ProcessoID desta linha, vai até a aba Processos buscar
  // D0, depois recalcula o cascateamento até esta etapa.
  var pidLinha = String(dados[linhaEtapa - 1][colProcID] || '').trim();
  if (!pidLinha) return;

  // Busca D0 na aba Processos
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var wsProc = null;
  ss.getSheets().forEach(function(s) {
    if (/processo/i.test(s.getName())) wsProc = s;
  });
  if (!wsProc) return;

  var dadosProc = wsProc.getDataRange().getValues();
  var hProcIdx = -1;
  for (var hp = 0; hp < dadosProc.length; hp++) {
    if (dadosProc[hp].join('|').indexOf('ProcessoID') >= 0) { hProcIdx = hp; break; }
  }
  if (hProcIdx < 0) return;

  var hProc = dadosProc[hProcIdx].map(function(h) { return String(h).trim(); });
  var colD0 = hProc.indexOf('D0 (Data Abertura)');
  var colPidProc = hProc.indexOf('ProcessoID');
  if (colD0 < 0 || colPidProc < 0) return;

  var d0 = null;
  for (var rp = hProcIdx + 1; rp < dadosProc.length; rp++) {
    if (String(dadosProc[rp][colPidProc] || '').trim() === pidLinha) {
      d0 = parseDateValue(dadosProc[rp][colD0]);
      break;
    }
  }
  if (!d0) return;

  // Recalcula o cascateamento até a linha editada para achar o fim previsto
  // Percorre todas as etapas do processo na ordem, acumulando o cursor
  var cursor = new Date(d0.getTime());
  var fimPrevisto = null;

  for (var re = hIdx + 1; re < dados.length; re++) {
    var rowPid = String(dados[re][colProcID] || '').trim();
    if (!rowPid) continue;          // linha separadora
    if (rowPid !== pidLinha) {
      if (fimPrevisto !== null) break; // já passou para outro processo
      continue;
    }

    var base = parseInt(dados[re][colPrazo]) || 0;

    // Para etapas anteriores à editada: usa DataRealizacao se preenchida
    if (re < linhaEtapa - 1) {
      var drAnterior = parseDateValue(dados[re][colRealizacao]);
      if (drAnterior) {
        cursor = new Date(drAnterior.getTime());
      } else {
        cursor = adicionarDiasUteis(cursor, base);
      }
    } else if (re === linhaEtapa - 1) {
      // Esta é a linha editada — calcula o fim previsto puro
      fimPrevisto = adicionarDiasUteis(new Date(cursor.getTime()), base);
      break;
    }
  }

  if (!fimPrevisto) return;

  // Compara DataRealizacao com o fim previsto
  var diasAtraso = contarDiasUteis(fimPrevisto, dataRealizacao);
  if (diasAtraso <= 0) {
    // Sem atraso — limpa motivo se havia algum antigo e avisa
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Etapa concluída dentro do prazo previsto. Nenhum atraso registrado. 💡 Dica: ao registrar um atraso futuramente, seja objetivo e direto — descreva o fato, não a justificativa.',
      '✅ Sem atraso', 6
    );
    return;
  }

  // Houve atraso — pede o motivo via prompt
  var ui = SpreadsheetApp.getUi();
  var resp = ui.prompt(
    '⚠ Atraso detectado',
    'Esta etapa terminou ' + diasAtraso + ' dia' + (diasAtraso > 1 ? 's úteis' : ' útil') +
    ' depois do prazo previsto.\n\nPor favor, informe o motivo do atraso:',
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() === ui.Button.OK) {
    var motivo = resp.getResponseText().trim();
    if (motivo) {
      // Grava o motivo na coluna MotivoAtraso da mesma linha
      sheet.getRange(linhaEtapa, colMotivo + 1).setValue(motivo);
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'Atraso de ' + diasAtraso + ' dia' + (diasAtraso > 1 ? 's úteis' : ' útil') + ' registrado com sucesso.',
        '📝 Motivo salvo', 4
      );
    }
  }

  // Invalida o cache do painel para refletir a alteração na próxima carga
  invalidarCache();
}


// ════════════════════════════════════════════════════════════════════════
// CAPACIDADE DO SETOR — getCapacidade()
//
// Lê a aba "📊 Capacidade" da planilha e devolve ao painel o nível de
// ocupação atual do Setor de Licitações, calculado pela Matriz de
// Complexidade (Portaria 638/2026 + Manual POP CPII v1.0).
//
// Retorno em caso de sucesso:
//   {
//     pct:      0.70,           // percentual decimal (ex: 0.70 = 70%)
//     nivel:    "🟡 Limitada", // texto da célula C13 da aba Capacidade
//     mensagem: "Capacidade reduzida — ...", // texto da célula D13
//     totalPts: 28,             // pontos totais do setor
//     tetoPts:  40,             // teto total (nº servidores × 10)
//     ok: true
//   }
//
// Retorno em caso de erro (aba não encontrada ou dados ausentes):
//   { ok: false, erro: "..." }
//
// ESTRUTURA ESPERADA DA ABA "📊 Capacidade":
//   Linha 13, coluna B → % ocupado do setor (número ou fórmula =D10/E10)
//   Linha 13, coluna C → nível textual ("🟢 Disponível" | "🟡 Limitada" | "🔴 Máxima")
//   Linha 13, coluna D → mensagem descritiva
//   Linha 10, coluna D → total de pontos do setor (=SUM(D6:D9))
//   Linha 10, coluna E → teto total de pontos (=SUM(E6:E9))
// ════════════════════════════════════════════════════════════════════════
function getCapacidade() {
  try {
    // ── Cache separado para capacidade (TTL 60s — muda com mais frequência) ──
    var cache = CacheService.getScriptCache();
    var cached = cache.get('dados_capacidade');
    if (cached) {
      try { return JSON.parse(cached); } catch(e) { /* cache corrompido */ }
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Localiza a aba de Capacidade (aceita nome com ou sem emoji)
    var wsCap = null;
    ss.getSheets().forEach(function(s) {
      if (/capacidade/i.test(s.getName())) wsCap = s;
    });

    if (!wsCap) {
      return { ok: false, erro: 'Aba "Capacidade" não encontrada. Adicione a aba 📊 Capacidade à planilha.' };
    }

    // Lê o bloco de dados relevante de uma só vez (linhas 1-30 devem cobrir tudo)
    var dados = wsCap.getDataRange().getValues();

    // Linha 10 = índice 9 (0-based) → totais do setor
    // Linha 13 = índice 12 (0-based) → status de capacidade
    // Garante que o array tem linhas suficientes
    if (dados.length < 13) {
      return { ok: false, erro: 'Aba Capacidade incompleta — esperadas ao menos 13 linhas.' };
    }

    var rowTotais   = dados[9];   // linha 10 (0-based = 9)
    var rowStatus   = dados[12];  // linha 13 (0-based = 12)

    // Extrai valores calculados pelas fórmulas da planilha
    // col D (índice 3) = total de pontos; col E (índice 4) = teto
    var totalPts = Number(rowTotais[3]) || 0;
    var tetoPts  = Number(rowTotais[4]) || 40;  // fallback 40 (4 serv × 10)
    var pct      = tetoPts > 0 ? totalPts / tetoPts : 0;

    // col B (índice 1) pode ter o % já calculado pela planilha; usa como cross-check
    var pctPlanilha = Number(rowStatus[1]);
    if (!isNaN(pctPlanilha) && pctPlanilha > 0) pct = pctPlanilha;

    // col C (índice 2) = nível textual
    var nivel = String(rowStatus[2] || '').trim();
    // Se a fórmula devolveu string vazia (ex: planilha nunca foi aberta no Sheets),
    // calcula o nível aqui mesmo no servidor
    if (!nivel) {
      nivel = pct >= 0.9 ? '🔴 Máxima' : pct >= 0.6 ? '🟡 Limitada' : '🟢 Disponível';
    }

    // Mensagem orientada ao setor requisitante — calculada sempre pelo servidor
    // para garantir coerência independentemente do que estiver na célula D13.
    // Três níveis de orientação:
    //   🟢 Disponível  (< 60%) → pode encaminhar qualquer processo
    //   🟡 Limitada   (60-90%) → somente demandas prioritárias ou de baixa complexidade
    //   🔴 Máxima      (≥ 90%) → não encaminhar; aguardar orientação do SEL
    var mensagem = pct >= 0.9
      ? 'Capacidade máxima — não encaminhar novos processos; aguardar orientação do SEL'
      : pct >= 0.6
      ? 'Capacidade limitada — encaminhar somente demandas prioritárias ou de baixa complexidade'
      : 'Setor disponível — novos processos podem ser encaminhados regularmente';

    var retorno = {
      ok:       true,
      pct:      Math.round(pct * 100),  // inteiro 0-100 para facilitar o JS do painel
      nivel:    nivel,
      mensagem: mensagem,
      totalPts: totalPts,
      tetoPts:  tetoPts
    };

    // Cache por 60 segundos
    try { cache.put('dados_capacidade', JSON.stringify(retorno), 60); } catch(e) {}

    return retorno;

  } catch(err) {
    return { ok: false, erro: 'Erro em getCapacidade(): ' + err.message };
  }
}
