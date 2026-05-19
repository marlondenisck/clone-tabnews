# Padrão de Features: ação:objeto:modificador

Todas as features do sistema devem seguir o padrão:

    ação:objeto:modificador

## Exemplos
- create:blog:post
- read:blog:post
- update:blog:post
- delete:blog:post
- read:user:activation_token
- create:user:session

## Orientações
- Sempre que criar ou modificar uma feature, utilize esse formato.
- Caso o modificador não seja necessário, utilize apenas ação:objeto.
- Documente novas features seguindo esse padrão.

## Aplicação
- Este padrão deve ser seguido em todos os lugares onde features são definidas, verificadas ou documentadas.
- Ao criar endpoints, permissões, ou regras de acesso, utilize sempre esse formato para facilitar manutenção e entendimento.
