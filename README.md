# Sistema de Contratações CPII

Sistema em Google Sheets + Google Apps Script para acompanhar processos de contratação, prazos, capacidade da equipe e avisos automáticos por e-mail no âmbito do Colégio Pedro II.

O projeto foi criado para o Setor de Licitações da Reitoria, mas a estrutura foi pensada para que outros campi e unidades possam adaptar o modelo à sua realidade, sem banco de dados externo e sem custo adicional de licença.

## Visão Geral

O sistema tem dois módulos principais:

| Módulo | Arquivos | Uso |
|---|---|---|
| App interno de gestão de etapas | `Web app/AppSEL_Codigo.gs` + `Web app/AppSEL_index.html` | Uso da equipe do SEL para fila, etapas, responsáveis, capacidade, histórico, configuração e e-mails |
| Painel público/Gantt | `Web app/AppsScript_Codigo_v3.gs` + `Web app/AppsScript_index.html` | Consulta gerencial e visualização do cronograma, sem edição direta dos dados |

A planilha funciona como base de dados. O Apps Script lê e atualiza as abas da planilha, calcula prazos em dias úteis, publica a interface web e executa os gatilhos automáticos.

## Principais Recursos

- Controle de processos por etapa, fase, modalidade, setor requisitante e responsável.
- Fila de processos ainda não iniciados, com simulação de D0 e previsão das etapas.
- Cálculo de prazos em dias úteis, com propagação de atrasos para as etapas seguintes.
- Troca de responsável por processo, incluindo separação entre fase interna e fase externa.
- Transição automática da fase interna para a fase externa quando aplicável.
- Registro de conclusão, motivo de atraso, status sem conclusão e histórico.
- Aba de capacidade por servidor, com pontuação guiada por complexidade.
- Gestão da equipe do setor na própria aba Config.
- Cadastro de e-mails de servidores e setores requisitantes.
- Avisos automáticos por e-mail para prazo próximo e etapa vencida.
- Painel público/Gantt para acompanhamento institucional.

## Regras Atuais de E-mail

Os avisos são enviados pela função `enviarAvisosPrazo()` no Apps Script.

- Horário padrão: por volta de **10h30**, no fuso horário do projeto Apps Script.
- Antecedência: etapas com prazo nos próximos **3 dias úteis**.
- Etapas vencidas: avisadas quando a data final da etapa já passou e ela não foi concluída.
- Processos concluídos ou ainda em planejamento não geram e-mail.
- Processos suspensos/paralisados não geram e-mail.
- Processos em `Aguardando requisitante` enviam aviso somente ao setor requisitante, se houver `EmailRequisitante` cadastrado.
- Processos em andamento enviam para servidor responsável, chefia e setor requisitante cadastrado.
- Processos sob responsabilidade da chefia enviam para chefia e setor requisitante cadastrado.
- Se o e-mail do destinatário obrigatório não estiver cadastrado, aquele envio é ignorado.

Depois de publicar uma nova versão do AppSEL, entre na aba **Config** e use **Reinstalar trigger** para atualizar o gatilho e registrar os metadados de horário/fuso. O Apps Script não garante o minuto exato do disparo, mas `atHour(10).nearMinute(30)` orienta o envio para a janela das 10h30.

## Estrutura do Repositório

```text
.
├── README.md
├── Web app/
│   ├── AppSEL_Codigo.gs
│   ├── AppSEL_index.html
│   ├── AppsScript_Codigo_v3.gs
│   ├── AppsScript_index.html
│   ├── CronogramaContratacoes_CPII (9).xlsx
│   └── PLANO_DIARIO (1).md
└── Nota_tecnica_Painel_CPII_v4.docx
```

Arquivos de planilha, documentos e nomes podem variar entre versões locais. Antes de publicar no GitHub, revise dados reais, links internos, e-mails pessoais e documentos administrativos que não devam ficar públicos.

## Abas da Planilha

As abas centrais esperadas pelo AppSEL são:

| Aba | Finalidade |
|---|---|
| `Processos` | Dados gerais do processo, como `ProcessoID`, `N° SUAP`, objeto, modalidade, D0, setor requisitante, e-mail do requisitante e link SUAP |
| `Etapas` | Etapas do cronograma, fase, agente responsável, prazo, status, motivo de atraso e data de realização |
| `Capacidade` | Carga por servidor, fase, processo ativo, modalidade e pontuação |
| `ConfigSEL` | Aba auxiliar criada/atualizada pelo sistema para persistir equipe e configurações úteis ao painel |
| `Histórico` | Registro auxiliar de alterações e justificativas |

O código localiza muitas colunas pelo nome do cabeçalho. Ao adaptar para outro campus, preserve os nomes principais das colunas ou ajuste o código correspondente.

## Implantação do App Interno

1. Abra a planilha no Google Sheets.
2. Acesse **Extensões > Apps Script**.
3. Atualize o arquivo principal com o conteúdo de `Web app/AppSEL_Codigo.gs`.
4. Crie ou atualize o arquivo HTML `index` com o conteúdo de `Web app/AppSEL_index.html`.
5. Salve o projeto.
6. Publique em **Implantar > Gerenciar implantações > Nova versão**.
7. Abra o Web App publicado.
8. Na aba **Config**, cadastre a equipe, revise os e-mails e instale ou reinstale o trigger diário.
9. Use **Testar e-mail** para validar permissões do `MailApp` e o e-mail do usuário logado.

## Implantação do Painel Público

O painel público usa os arquivos `AppsScript_Codigo_v3.gs` e `AppsScript_index.html`. Ele deve ser mantido separado do AppSEL quando a unidade quiser oferecer uma visualização de consulta sem recursos internos de edição.

Ao publicar o painel público, revise:

- Nome da unidade e textos institucionais.
- Logotipo e identidade visual.
- URL do Web App.
- Regras de acesso da implantação.
- Dados sensíveis que possam aparecer na consulta pública.

## Como Adaptar Para Outro Campus

1. Duplique a planilha-modelo e substitua os dados de exemplo pelos processos da unidade.
2. Configure a equipe local na aba **Config** do AppSEL.
3. Cadastre e-mails de chefia, servidores e setores requisitantes.
4. Revise modalidades, etapas e prazos usados pelo campus.
5. Ajuste feriados locais, se necessário.
6. Publique o AppSEL e reinstale o trigger.
7. Publique o painel público apenas se a unidade quiser uma consulta separada.
8. Faça testes com processo fictício antes de usar com dados reais.

## Segurança e Publicação no GitHub

Para compartilhar este projeto publicamente:

- Remova ou anonimize números reais de processo, links internos do SUAP, e-mails pessoais e justificativas sensíveis.
- Evite publicar planilhas com dados operacionais reais.
- Prefira manter uma planilha-modelo com exemplos fictícios.
- Revise documentos `.docx`, imagens e anexos antes de subir ao repositório.
- Use as permissões do Google Apps Script conforme a política da unidade: restrito à organização ou aberto apenas quando houver autorização institucional.

## Ferramentas Opcionais Para E-mail

O envio atual usa `MailApp.sendEmail()` com HTML inline, que é gratuito dentro do Google Apps Script e suficiente para os avisos do SEL.

Para melhorar a montagem visual dos e-mails sem contratar serviço pago, a unidade pode avaliar:

- **MJML**: gera HTML responsivo a partir de uma sintaxe mais simples.
- **Beefree/RGE Studio** ou **Stripo Free**: editores visuais para desenhar modelos e exportar HTML.
- **Google Docs**: pode servir como rascunho de texto institucional, com posterior adaptação manual para HTML.

Mesmo usando editor externo, o HTML final deve ser simples e com estilos inline para funcionar bem no Gmail e em outros clientes.

## Estado Atual

A versão atual prioriza o AppSEL como ferramenta de trabalho diária da equipe. O painel público permanece como módulo de consulta e referência visual.

As melhorias mais recentes incluem:

- Trigger persistente com status visível na Config.
- Horário de envio ajustado para 10h30.
- Botão de teste de e-mail.
- Regras de envio por status do processo.
- E-mails com prazo em formato brasileiro.
- Referência do processo por N° SUAP/link, evitando expor `ProcessoID` ao usuário.
- Banner de atenção mais simples na aba Etapas.
- Correção visual da pontuação guiada quando opções diferentes têm a mesma pontuação.

## Autoria

Concepção, coordenação e desenvolvimento:

**Samuel Gomes da Silva**  
Assistente em Administração - DECOF/LIC/CPII

Validação técnica:

**Amanda Carla Faria de Almeida**  
Chefe - DECOF/LIC/CPII
