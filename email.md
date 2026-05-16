# Envio de email via Telnet (SMTP local)

Exemplo de envio manual de email para o servidor SMTP local (MailCatcher na porta `1025`).

```bash
telnet localhost 1025
Trying ::1...
Connected to localhost.
Escape character is '^]'.
220 EventMachine SMTP Server
HELO
250 Ok EventMachine SMTP Server
MAIL FROM:<testeenvio@email.com>
250 Ok
RCPT TO:<emaildestinatario@email.com>
250 Ok
DATA
354 Send it
Subject: Teste por Telnet

Corpo do email.
.
250 Message accepted
```

## Comentando o fluxo

- `telnet localhost 1025`: abre conexao TCP com o servidor SMTP local.
- `220 EventMachine SMTP Server`: banner inicial do servidor, indicando que esta pronto.
- `HELO`: comando SMTP de apresentacao do cliente.
- `250 Ok EventMachine SMTP Server`: servidor confirmou o `HELO`.
- `MAIL FROM:<testeenvio@email.com>`: define o remetente da mensagem.
- `250 Ok`: remetente aceito.
- `RCPT TO:<emaildestinatario@email.com>`: define o destinatario da mensagem.
- `250 Ok`: destinatario aceito.
- `DATA`: inicia o envio do conteudo do email (cabecalhos + corpo).
- `354 Send it`: servidor autorizou o envio dos dados da mensagem.
- `Subject: Teste por Telnet`: cabecalho de assunto.
- linha em branco: separa cabecalhos do corpo do email.
- `Corpo do email.`: conteudo da mensagem.
- `.`: encerra os dados do email (terminador SMTP).
- `250 Message accepted`: mensagem aceita para entrega/captura.

## Versao completa (com EHLO e QUIT)

```bash
telnet localhost 1025
220 EventMachine SMTP Server
EHLO localhost
250 Ok EventMachine SMTP Server
MAIL FROM:<testeenvio@email.com>
250 Ok
RCPT TO:<emaildestinatario@email.com>
250 Ok
DATA
354 Send it
Subject: Teste por Telnet com EHLO

Corpo do email com encerramento correto da sessao.
.
250 Message accepted
QUIT
221 Bye
```

- `EHLO`: versao estendida do `HELO`; em servidores modernos e o comando mais comum.
- `QUIT`: encerra a sessao SMTP de forma explicita e limpa.
