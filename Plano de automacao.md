# Plano Redondo: Automação e Migração da Capacidade

## Resumo
A capacidade será organizada por processo e responsável, com migração assistida dos processos atuais e automação para os novos. O código não dependerá dos prints diretamente: você primeiro ajustará os nomes na planilha, e o script usará esses dados para vincular cada linha ao `ProcessoID`.

## Estrutura da Planilha
- Preparar a aba `📊 Capacidade` com colunas padronizadas:
  - `ProcessoID`
  - `Processo / Objeto`
  - `Servidor`
  - `Modalidade`
  - `Fase da Carga`
  - `Ativo`
  - pontuações da matriz
  - `Total`
  - `Observação`
- Adicionar/usar uma coluna de responsáveis na base dos processos para migração, com no máximo 2 nomes por processo.
- Manter apenas servidores atuais na capacidade: `AMANDA`, `BEATRIZ`, `BRUNO`, `SAMUEL`.
- Ignorar `IGOR`; se ele aparecer sozinho, marcar o processo como `REVISAR`.

## Migração dos Processos Atuais
- Criar função `Preparar Migração de Capacidade`.
- O script vai gerar uma prévia, sem apagar nada:
  - vincula cada processo ao `ProcessoID`;
  - identifica responsáveis;
  - calcula pontuação;
  - marca ambiguidades como `REVISAR`.
- Após conferência, rodar `Aplicar Migração de Capacidade`:
  - cria as novas linhas por processo;
  - adiciona notas nas células de `Servidor` ou `Total` explicando a pontuação;
  - deixa as linhas antigas fora da soma.
- Depois da validação visual, as linhas antigas por categoria poderão ser apagadas.

## Regras de Negócio
- Pregão:
  - processos novos terão responsável interno e externo diferentes;
  - fase interna começa ativa;
  - fase externa só ativa após conclusão da etapa 7.
- Demais modalidades:
  - apenas um responsável;
  - responsável externo = `N/A`;
  - sem virada automática.
- Processos atuais:
  - se tiverem 2 responsáveis válidos, dividir a carga igualmente;
  - se tiverem 1 responsável válido, carga integral para ele;
  - edições manuais posteriores serão respeitadas.

## Automação
- `novoProcesso()` passará a criar automaticamente as linhas de capacidade.
- `Sincronizar Capacidade`:
  - muda apenas `Ativo` e `Fase da Carga`;
  - não sobrescreve servidor, pontos ou observações já editados.
- `Concluir Processo`:
  - desativa a carga do `ProcessoID`;
  - invalida o cache do painel.
- As notas de célula explicarão a composição da pontuação, incluindo divisão quando houver 2 responsáveis.

## Proteções
- Setup idempotente: não duplica colunas nem fórmulas.
- Prévia obrigatória antes de aplicar migração.
- Linhas `REVISAR` não entram automaticamente na soma.
- KPI de capacidade soma apenas `Ativo = "Sim"`.
- Nenhuma linha antiga será apagada pelo primeiro passo; apagamento fica para depois da conferência.

## Testes
- Testar tudo primeiro em cópia da planilha real.
- Conferir processos com 1 responsável.
- Conferir processos com 2 responsáveis.
- Conferir casos com `IGOR`.
- Validar notas nas células.
- Validar que edições manuais não são sobrescritas.
- Conferir KPI antes e depois de apagar as linhas antigas.

## Assumptions
- O teto válido é 8 pontos por servidor.
- A capacidade final deve ficar por nome de processo, não por categoria.
- O script deve ajudar na migração, mas manter a planilha fácil de editar manualmente.
- Prints servem como referência humana; a fonte usada pelo script será a planilha ajustada.
