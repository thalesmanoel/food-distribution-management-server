# Food Distribution Management Server

Backend de um sistema CRM para gestao de pedidos de uma empresa de distribuicao de alimentos.

O projeto foi desenvolvido com NestJS, TypeScript, TypeORM e PostgreSQL. A API centraliza cadastros de usuarios, clientes, fornecedores, produtos e pedidos, com autenticacao JWT e validacao global de dados de entrada.

## Sumario

- [Visao geral](#visao-geral)
- [Stack](#stack)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Configuracao do ambiente](#configuracao-do-ambiente)
- [Scripts disponiveis](#scripts-disponiveis)
- [Banco de dados e migrations](#banco-de-dados-e-migrations)
- [Autenticacao e autorizacao](#autenticacao-e-autorizacao)
- [Padroes de resposta](#padroes-de-resposta)
- [Modelo de dados](#modelo-de-dados)
- [Endpoints](#endpoints)
- [Paginacao e filtros](#paginacao-e-filtros)
- [Testes](#testes)

## Visao geral

A API atende ao dominio de distribuicao de alimentos, oferecendo recursos para:

- Gerenciar usuarios internos do CRM.
- Autenticar usuarios ativos com email e senha.
- Gerenciar clientes atendidos pela distribuidora.
- Gerenciar fornecedores.
- Gerenciar produtos vinculados a fornecedores.
- Registrar pedidos com itens, descontos, status e valor total calculado.

A aplicacao usa uma arquitetura modular do NestJS. Cada dominio principal possui modulo, controller, service, entidade TypeORM e DTOs proprios.

## Stack

- Node.js
- NestJS 11
- TypeScript
- TypeORM 0.3
- PostgreSQL
- JWT para autenticacao
- bcrypt para hash e comparacao de senhas
- class-validator e class-transformer para validacao de DTOs
- Jest e Supertest para testes

## Estrutura do projeto

```text
src/
  app.module.ts
  main.ts
  auth/
    decorators/
    dtos/
    guards/
    interfaces/
  commons/
    base/
    database/
    dtos/
    interfaces/
    utils/
  customers/
  db/
    migrations/
  orders/
    dtos/
    entities/
    enums/
  products/
  suppliers/
  users/
test/
```

Principais responsabilidades:

- `src/main.ts`: inicializa a aplicacao e configura o `ValidationPipe` global.
- `src/app.module.ts`: registra os modulos da aplicacao.
- `src/db/db.module.ts`: configura a conexao PostgreSQL via TypeORM.
- `src/auth`: login, JWT, guard global e rotas publicas.
- `src/commons`: entidades base, DTOs comuns, paginacao e helpers de banco.
- `src/users`, `src/customers`, `src/suppliers`, `src/products`, `src/orders`: modulos de dominio.

## Configuracao do ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`.

```env
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
JWT_EXPIRES_IN=1d
```

Variaveis:

| Variavel | Descricao |
| --- | --- |
| `DB_HOST` | Host do PostgreSQL. |
| `DB_PORT` | Porta do PostgreSQL. |
| `DB_USERNAME` | Usuario do banco. |
| `DB_PASSWORD` | Senha do banco. |
| `DB_NAME` | Nome do banco de dados. |
| `JWT_SECRET` | Chave usada para assinar tokens JWT. |
| `JWT_EXPIRES_IN` | Tempo de expiracao do token. Padrao atual: `1d`. |

Instale as dependencias:

```bash
npm install
```

Execute a aplicacao em desenvolvimento:

```bash
npm run dev
```

Por padrao, a API sobe na porta definida em `PORT` ou em `3000` quando `PORT` nao estiver configurada.

## Scripts disponiveis

| Script | Descricao |
| --- | --- |
| `npm run build` | Compila o projeto NestJS. |
| `npm run start` | Inicia a aplicacao. |
| `npm run dev` | Inicia a aplicacao em modo watch. |
| `npm run start:debug` | Inicia em modo debug com watch. |
| `npm run start:prod` | Executa a versao compilada em `dist/main`. |
| `npm run lint` | Executa ESLint com correcao automatica. |
| `npm run format` | Formata arquivos TypeScript com Prettier. |
| `npm run test` | Executa testes unitarios. |
| `npm run test:e2e` | Executa testes end-to-end. |
| `npm run test:cov` | Executa testes com cobertura. |
| `npm run migration:create --name=NomeDaMigration` | Cria uma migration vazia em `src/db/migrations`. |
| `npm run migration:generate --name=NomeDaMigration` | Gera migration a partir das entidades. |
| `npm run migration:run` | Executa migrations pendentes. |
| `npm run migration:revert` | Reverte a ultima migration executada. |

## Banco de dados e migrations

A aplicacao usa PostgreSQL com TypeORM.

Configuracoes principais:

- `autoLoadEntities: true` no modulo da aplicacao.
- `synchronize: false`, portanto o schema deve ser evoluido por migrations.
- Entidades carregadas explicitamente em `src/db/typeOrm.migration-config.ts` para geracao e execucao de migrations pela CLI.

As migrations atuais criam:

- Extensao `uuid-ossp`.
- Tabela `users`.
- Tabelas `customers`, `suppliers`, `products`, `orders` e `order_items`.
- Enums de status de pedido e tipo de desconto.
- Chaves estrangeiras entre pedidos, clientes, usuarios, produtos, fornecedores e itens.

## Autenticacao e autorizacao

O modulo `AuthModule` registra um guard global com `APP_GUARD`. Isso significa que as rotas sao protegidas por JWT por padrao.

Rotas marcadas com `@Public()` ficam acessiveis sem token:

- `POST /auth/login`
- `POST /users`

Para acessar as demais rotas, envie o token no header:

```http
Authorization: Bearer <accessToken>
```

Payload assinado no token:

```json
{
  "sub": "uuid-do-usuario",
  "email": "usuario@email.com"
}
```

## Padroes de resposta

As controllers retornam o formato comum:

```json
{
  "message": "Mensagem da operacao",
  "data": {}
}
```

Para operacoes de exclusao, `data` retorna `null`.

Erros sao tratados pelas exceptions do NestJS, como:

- `401 Unauthorized` para credenciais invalidas ou token ausente/invalido.
- `404 Not Found` para recursos inexistentes.
- `409 Conflict` para violacao de unicidade tratada na camada de service.
- `400 Bad Request` para falhas de validacao.

## Modelo de dados

Todas as entidades principais herdam de `AppBaseEntity`:

| Campo | Tipo | Descricao |
| --- | --- | --- |
| `id` | `uuid` | Identificador gerado automaticamente. |
| `created_at` | `timestamp` | Data de criacao. |
| `updated_at` | `timestamp` | Data da ultima atualizacao. |

### Users

Tabela: `users`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `name` | `varchar(255)` | Obrigatorio. |
| `email` | `varchar(255)` | Obrigatorio e unico. |
| `password` | `varchar(255)` | Obrigatorio. Armazenado com hash bcrypt. |
| `is_active` | `boolean` | Padrao `true`. |

### Customers

Tabela: `customers`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `name` | `varchar(255)` | Obrigatorio. |
| `email` | `varchar(255)` | Obrigatorio e unico. |
| `cnpj` | `varchar(20)` | Obrigatorio e unico. |
| `phone` | `varchar(20)` | Obrigatorio. |
| `address` | `varchar(255)` | Obrigatorio. |
| `description` | `text` | Opcional. |

### Suppliers

Tabela: `suppliers`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `name` | `varchar(255)` | Obrigatorio. |
| `cnpj` | `varchar(20)` | Obrigatorio e unico. |
| `phone` | `varchar(20)` | Obrigatorio. |
| `email` | `varchar(255)` | Obrigatorio e unico. |
| `description` | `text` | Opcional. |
| `address` | `varchar(255)` | Obrigatorio. |

### Products

Tabela: `products`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `name` | `varchar(255)` | Obrigatorio. |
| `sku` | `varchar(255)` | Obrigatorio e unico. |
| `description` | `text` | Opcional. |
| `price` | `decimal(10,2)` | Obrigatorio. |
| `supplier_id` | `uuid` | Fornecedor vinculado. |

Relacionamento:

- Muitos produtos pertencem a um fornecedor.

### Orders

Tabela: `orders`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `total` | `decimal(10,2)` | Calculado na criacao do pedido. |
| `status` | `enum` | Padrao `pending`. |
| `customer_id` | `uuid` | Cliente do pedido. |
| `user_id` | `uuid` | Usuario responsavel pelo pedido. |

Status aceitos:

- `pending`
- `accepted`
- `processing`
- `completed`
- `delivered`
- `cancelled`
- `rejected`

Relacionamentos:

- Um pedido pertence a um cliente.
- Um pedido pertence a um usuario.
- Um pedido possui muitos itens.

### Order Items

Tabela: `order_items`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `discount` | `decimal(10,2)` | Padrao `0`. |
| `type_discount` | `enum` | Padrao `none`. |
| `is_bonus` | `boolean` | Padrao `false`. |
| `quantity` | `int` | Obrigatorio. |
| `price` | `decimal(10,2)` | Obrigatorio. |
| `product_id` | `uuid` | Produto vendido. |
| `order_id` | `uuid` | Pedido vinculado. |

Tipos de desconto aceitos:

- `percentage`
- `fixed_amount`
- `none`

Ao excluir um pedido, seus itens sao excluidos em cascata.

## Endpoints

Todas as rotas, exceto as marcadas como publicas, exigem JWT.

### Auth

#### `POST /auth/login`

Publica. Autentica um usuario ativo.

Body:

```json
{
  "email": "admin@email.com",
  "password": "123456"
}
```

Resposta:

```json
{
  "message": "Login realizado com sucesso",
  "data": {
    "accessToken": "jwt-token",
    "user": {
      "id": "uuid",
      "name": "Admin",
      "email": "admin@email.com",
      "isActive": true
    }
  }
}
```

### Users

#### `POST /users`

Publica. Cria um usuario.

Body:

```json
{
  "name": "Admin",
  "email": "admin@email.com",
  "password": "123456",
  "isActive": true
}
```

Regras:

- `email` deve ser valido.
- `password` deve ter no minimo 6 caracteres.
- Senha e armazenada com hash bcrypt.
- Nome e email sao verificados contra duplicidade na camada de service.

#### `GET /users`

Lista usuarios com paginacao.

Query params:

| Parametro | Padrao | Descricao |
| --- | --- | --- |
| `page` | `1` | Pagina atual. |
| `limit` | `10` | Registros por pagina. Maximo `100`. |
| `search` | - | Texto de busca. |
| `identifier` | - | Campo filtrado: `name`, `email` ou `isActive`. |

#### `GET /users/:id`

Busca usuario por `id`.

#### `PUT /users/:id`

Atualiza usuario.

Body aceito pelo DTO atual:

```json
{
  "name": "Novo nome",
  "email": "novo@email.com",
  "isActive": true
}
```

#### `DELETE /users/:id`

Remove usuario por `id`.

### Customers

#### `POST /customers`

Cria cliente.

Body:

```json
{
  "name": "Mercado Central",
  "email": "compras@mercadocentral.com",
  "cnpj": "12345678000199",
  "phone": "11999999999",
  "address": "Rua Exemplo, 123",
  "description": "Cliente recorrente"
}
```

Regras:

- Email e CNPJ sao unicos.

#### `GET /customers`

Lista todos os clientes.

#### `GET /customers/:id`

Busca cliente por `id`.

#### `PUT /customers/:id`

Atualiza cliente.

#### `DELETE /customers/:id`

Remove cliente.

### Suppliers

#### `POST /suppliers`

Cria fornecedor.

Body:

```json
{
  "name": "Fornecedor Alimentos LTDA",
  "cnpj": "98765432000188",
  "phone": "11988888888",
  "email": "contato@fornecedor.com",
  "description": "Fornecedor de produtos secos",
  "address": "Avenida Distribuicao, 500"
}
```

Regras:

- Email e CNPJ sao unicos.

#### `GET /suppliers`

Lista todos os fornecedores.

#### `GET /suppliers/:id`

Busca fornecedor por `id`.

#### `PUT /suppliers/:id`

Atualiza fornecedor.

#### `DELETE /suppliers/:id`

Remove fornecedor.

### Products

#### `POST /products`

Cria produto.

Body definido no DTO atual:

```json
{
  "name": "Arroz Tipo 1 5kg",
  "sku": "ARR-5KG-001",
  "description": "Pacote de arroz tipo 1",
  "price": 29.9,
  "supplierId": "uuid-do-fornecedor"
}
```

Regras:

- `sku` deve ser unico.
- Produto pertence a um fornecedor.

#### `GET /products`

Lista todos os produtos.

#### `GET /products/:id`

Busca produto por `id`.

#### `PUT /products/:id`

Atualiza produto.

#### `DELETE /products/:id`

Remove produto.

### Orders

#### `POST /orders`

Cria pedido com itens.

Body:

```json
{
  "customer_id": "uuid-do-cliente",
  "user_id": "uuid-do-usuario",
  "status": "pending",
  "items": [
    {
      "product_id": "uuid-do-produto",
      "quantity": 10,
      "price": 29.9,
      "discount": 5,
      "typeDiscount": "fixed_amount",
      "isBonus": false
    }
  ]
}
```

Calculo atual do total:

```text
total = soma((price * quantity) - discount)
```

Observacao: o campo `typeDiscount` e armazenado, mas o calculo atual trata `discount` como valor absoluto, independentemente de ser `percentage` ou `fixed_amount`.

#### `GET /orders`

Lista pedidos com seus itens.

#### `GET /orders/:id`

Busca pedido por `id` com seus itens.

#### `DELETE /orders/:id`

Remove pedido. Os itens vinculados sao removidos em cascata.

## Paginacao e filtros

O utilitario `paginate` aplica:

- `skip`: `(page - 1) * limit`
- `take`: `limit`
- retorno de `total`, `page`, `limit`, `previousPage`, `nextPage` e `totalPages`

No codigo atual, a paginacao esta implementada no endpoint `GET /users`.

Exemplo:

```http
GET /users?page=1&limit=10&identifier=email&search=admin
```

Resposta paginada:

```json
{
  "message": "Usuarios encontrados com sucesso",
  "data": {
    "data": [],
    "total": 0,
    "page": 1,
    "limit": 10,
    "previousPage": null,
    "nextPage": null,
    "totalPages": 0
  }
}
```

## Testes

Comandos:

```bash
npm run test
npm run test:e2e
npm run test:cov
```

O projeto possui arquivos `.spec.ts` gerados para controllers e services, alem de um teste e2e em `test/app.e2e-spec.ts`.

