# Validação — Controle de vencimentos financeiros

## Escopo entregue

O Financeiro agora permite registrar a data de competência ou vencimento e marcar cada receita ou despesa como **Pendente** ou **Liquidado**. A agenda financeira agrupa apenas os lançamentos pendentes, apresentando quantidade e valor em atraso, além dos valores com vencimento nos próximos sete dias. Registros anteriores que não possuem esses campos continuam disponíveis e são tratados como liquidados, evitando alertas retroativos indevidos.

## Verificações técnicas

A classificação de vencimentos recebeu testes para atraso, janela de sete dias e compatibilidade com registros legados. A checagem TypeScript foi concluída sem erros, dez arquivos de teste executaram com **26 testes aprovados**, e o build de produção foi aprovado. Permanece somente o aviso não bloqueador referente ao bundle JavaScript acima de 500 kB.

## Verificação visual

Em desktop, os três cartões financeiros, a agenda de vencimentos e a tabela com vencimento e situação foram exibidos sem sobreposição. Em 390 × 844 pixels, os cartões e indicadores foram reorganizados em uma coluna, mantendo os controles legíveis; a tabela segue em contêiner com rolagem horizontal para preservar todas as colunas de registros financeiros.

## Verificação do domínio publicado

Nas duas primeiras consultas a `https://nocorehub-jcf6ltmc.manus.space/financeiro` após o checkpoint `e22f23d3`, o domínio ainda apresentou a versão anterior do Financeiro, sem a agenda e sem as colunas de vencimento e situação. A segunda consulta chegou a mostrar o estado de carregamento da nova sessão, mas a interface anterior permaneceu visível. A confirmação de propagação permanece pendente e será repetida após o próximo ciclo de publicação automática.

Após a publicação do checkpoint `c9f8a150`, uma nova consulta seguida da conclusão do carregamento da sessão continuou exibindo o cabeçalho antigo **Receitas e despesas persistentes para acompanhar seu saldo operacional** e a tabela sem vencimento e situação. A confirmação da versão no domínio permanente continua pendente; a implementação local já permanece validada pela checagem de tipos, testes e build.

Uma nova abertura com o parâmetro de revisão `?rev=c9f8a150` confirmou o bundle publicado atual: o Financeiro apresentou o cabeçalho atualizado, a Agenda financeira, os cartões de atrasos e próximos sete dias, além das colunas **Vencimento** e **Situação**. A propagação do controle de vencimentos no domínio permanente está confirmada.
