# clone-tabnews

Guia rapido para rodar e acessar o projeto localmente.

## Acesso rapido

- Web (porta 3000): http://localhost:3000
- API base: http://localhost:3000/api/v1
- MailCatcher (porta 1080): http://localhost:1080

## Links da API

- Status: http://localhost:3000/api/v1/status
- Migrations: http://localhost:3000/api/v1/migrations
- Sessions: http://localhost:3000/api/v1/sessions
- User (usuario autenticado): http://localhost:3000/api/v1/user
- Users: http://localhost:3000/api/v1/users
- User por username: http://localhost:3000/api/v1/users/:username

## Comandos do projeto (package.json)

### Setup inicial

```bash
npm install
```

### Execucao e testes

```bash
npm run dev
npm test
npm run posttest
npm run test:watch
npm run test:e2e
```

### Servicos locais

```bash
npm run services:up
npm run services:wait:database
npm run services:stop
npm run services:down
```

### Migrations

```bash
npm run migrations:create -- <nome-da-migration>
npm run migrations:up
npm run migrations:down
```

### Lint e formatacao

```bash
npm run lint:prettier:check
npm run lint:prettier:fix
npm run lint:eslint:check
```
