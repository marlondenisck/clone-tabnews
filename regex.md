# Regex de substituição

Regex usada na pesquisa:

```regex
(toEqual\(\{[^}]*\r?\n)(\s*)(password\s*:.*)
```

Substituição usada:

```text
$1$2$3\n$2features: [],
```

## O que cada parte faz

### Padrão de busca

- `toEqual\(\{` captura o início do bloco `toEqual({`.
- `[^}]*` consome qualquer conteúdo até encontrar a primeira `}`.
- `\r?\n` cobre quebra de linha em Unix e Windows.
- `(\s*)` captura a indentação da linha seguinte.
- `(password\s*:.*)` captura a linha que começa com `password:` e todo o restante dela.

### Grupos de captura

- `$1` = todo o trecho antes da linha do `password`, incluindo a quebra de linha.
- `$2` = a indentação da linha original.
- `$3` = a linha do `password` inteira.

### Substituição

- `$1$2$3` mantém o trecho original capturado.
- `\n` adiciona uma nova linha.
- `$2features: [],` insere `features: [],` com a mesma indentação do `password`.

## Efeito prático

Esse replace adiciona o campo `features: []` logo abaixo de `password:` dentro do objeto passado para

```
expect(responseBody).toEqual({
    id: responseBody.id,
    username: "testuser",
    email: "testuser@example.com",
    password: responseBody.password,
    features: [],
    created_at: responseBody.created_at,
    updated_at: responseBody.updated_at,
  });
```

, preservando a indentação do arquivo.
