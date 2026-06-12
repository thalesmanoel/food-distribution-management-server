# Food Distribution Management Server

Backend de um sistema para gestao de distribuicao de alimentos.

O projeto foi desenvolvido com NestJS, TypeScript, TypeORM e PostgreSQL. A API
centraliza cadastros de usuarios, clientes, fornecedores, produtos, pedidos e
movimentacoes de estoque, com autenticacao JWT, validacao global de dados e
historico auditavel das alteracoes de saldo.

Este documento descreve o estado atual da implementacao. Comportamentos e
inconsistencias conhecidas estao registrados ao final.

## Sumario

- [Visao geral](#visao-geral)
- [Stack](#stack)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Configuracao do ambiente](#configuracao-do-ambiente)
- [Execucao](#execucao)
- [Scripts disponiveis](#scripts-disponiveis)
- [Banco de dados e migrations](#banco-de-dados-e-migrations)
- [Autenticacao e Swagger](#autenticacao-e-swagger)
- [Padrao de resposta](#padrao-de-resposta)
- [Modelo de dados](#modelo-de-dados)
- [Regras de estoque](#regras-de-estoque)
- [Endpoints](#endpoints)
- [Paginacao e filtros](#paginacao-e-filtros)
- [Inconsistencias conhecidas](#inconsistencias-conhecidas)
- [Testes](#testes)

## Visao geral

A API oferece recursos para:

- Gerenciar usuarios internos.
- Autenticar usuarios ativos com email e senha.
- Gerenciar clientes e fornecedores.
- Gerenciar produtos vinculados a fornecedores.
- Consultar o saldo disponivel de cada produto.
- Registrar pedidos com itens, descontos, status e total calculado.
- Movimentar estoque de forma transacional e auditavel.
- Consultar o historico paginado de entradas, saidas, reservas, separacoes,
  cancelamentos, devolucoes, ajustes e baixas.

A aplicacao usa uma arquitetura modular do NestJS. Cada dominio principal
possui modulo, controller, service, entidades TypeORM e DTOs quando aplicavel.
Os services usam `Repository<T>` injetado pelo TypeORM; nao existem classes de
repository customizadas.

## Stack

- Node.js
- NestJS 11
- TypeScript
- TypeORM 0.3
- PostgreSQL
- JWT para autenticacao
- bcrypt para hash e comparacao de senhas
- class-validator e class-transformer para validacao de DTOs
- Swagger
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
  stock-movements/
    dtos/
    entities/
    enums/
    interfaces/
  suppliers/
  users/
test/
```

Principais responsabilidades:

- `src/main.ts`: inicializa a aplicacao, o Swagger e o `ValidationPipe` global.
- `src/app.module.ts`: registra os modulos da aplicacao.
- `src/db/db.module.ts`: configura a conexao PostgreSQL via TypeORM.
- `src/db/typeOrm.migration-config.ts`: datasource usado pela CLI do TypeORM.
- `src/auth`: login, JWT, guard global e rotas publicas.
- `src/commons`: entidade base, DTOs comuns, paginacao e helpers de banco.
- `src/stock-movements`: saldo, historico e auditoria de estoque.
- `src/users`, `src/customers`, `src/suppliers`, `src/products`, `src/orders`:
  modulos de dominio.

O `ValidationPipe` global usa:

- `whitelist: true`
- `forbidNonWhitelisted: true`
- `transform: true`

## Configuracao do ambiente

Crie um arquivo `.env` na raiz com base no `.env.example`.

```env
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
JWT_EXPIRES_IN=1d
ENVIRONMENT=
```

Variaveis:

| Variavel | Descricao |
| --- | --- |
| `DB_HOST` | Host do PostgreSQL. |
| `DB_PORT` | Porta do PostgreSQL. |
| `DB_USERNAME` | Usuario do banco. |
| `DB_PASSWORD` | Senha do banco. |
| `DB_NAME` | Nome do banco de dados. |
| `JWT_SECRET` | Chave usada para assinar tokens JWT. Se ausente, o codigo usa `change-me-in-env`. |
| `JWT_EXPIRES_IN` | Tempo de expiracao do token. Padrao: `1d`. |
| `ENVIRONMENT` | Declarada no `.env.example`, mas nao e consumida atualmente. |
| `PORT` | Opcional. Porta HTTP; o codigo usa `3000` quando ausente. |

## Execucao

Instale as dependencias e execute as migrations:

```bash
npm install
npm run migration:run
```

Inicie a aplicacao em desenvolvimento:

```bash
npm run dev
```

Tambem existe um `docker-compose.yml` com PostgreSQL 17 e a API:

```bash
docker compose up --build
```

## Scripts disponiveis

| Script | Descricao |
| --- | --- |
| `npm run build` | Compila o projeto NestJS. |
| `npm run start` | Inicia a aplicacao. |
| `npm run dev` | Inicia em modo watch. |
| `npm run start:debug` | Inicia em modo debug com watch. |
| `npm run start:prod` | Executa `dist/main`. |
| `npm run lint` | Executa ESLint com correcao automatica. |
| `npm run format` | Formata os arquivos TypeScript com Prettier. |
| `npm run test` | Executa testes unitarios. |
| `npm run test:watch` | Executa testes unitarios em modo watch. |
| `npm run test:cov` | Executa testes com cobertura. |
| `npm run test:e2e` | Executa testes end-to-end. |
| `npm run migration:create --name=NomeDaMigration` | Cria uma migration vazia. |
| `npm run migration:generate --name=NomeDaMigration` | Gera migration a partir das entidades. |
| `npm run migration:run` | Executa migrations pendentes. |
| `npm run migration:revert` | Reverte a ultima migration executada. |

## Banco de dados e migrations

A aplicacao usa PostgreSQL com TypeORM.

Configuracoes principais:

- `autoLoadEntities: true`.
- `synchronize: false`; o schema deve ser evoluido por migrations.
- Entidades carregadas explicitamente em `src/db/typeOrm.migration-config.ts`.
- IDs gerados com UUID.
- Valores monetarios usam `decimal(10,2)` com transformer para `number`.

As migrations versionadas criam:

- Extensao `uuid-ossp`.
- Tabelas `users`, `customers`, `suppliers`, `products`, `orders`,
  `order_items` e `stock_movements`.
- Coluna `products.stock_quantity`.
- Enums de status de pedido, tipo de desconto e movimentacao de estoque.
- Chaves estrangeiras, indices, unicidade e checks de integridade.

## Autenticacao e Swagger

O `AuthModule` registra `JwtAuthGuard` como guard global com `APP_GUARD`.
Todas as rotas exigem JWT por padrao.

Rotas publicas:

- `POST /auth/login`
- `POST /users`

Para acessar as demais rotas:

```http
Authorization: Bearer <accessToken>
```

Payload do token:

```json
{
  "sub": "uuid-do-usuario",
  "email": "usuario@email.com"
}
```

O Swagger fica disponivel em:

```text
/api/docs
```

Os decorators Swagger estao mais completos no modulo de usuarios. Os demais
endpoints aparecem no documento gerado, mas possuem menos metadados.

## Padrao de resposta

As controllers retornam:

```json
{
  "message": "Mensagem da operacao",
  "data": {}
}
```

Exclusoes retornam `data: null`. Listagens paginadas retornam a estrutura de
paginacao dentro de `data`.

Erros usam exceptions do NestJS:

- `400 Bad Request`: validacao, direcao incompativel ou estoque insuficiente.
- `401 Unauthorized`: credenciais ou token invalidos.
- `404 Not Found`: recurso inexistente.
- `409 Conflict`: duplicidade tratada pelo service.

## Modelo de dados

### Campos base

Todas as entidades herdam de `AppBaseEntity`:

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
| `password` | `varchar(255)` | Obrigatorio; armazenado com hash bcrypt. |
| `is_active` | `boolean` | Padrao `true`; propriedade TypeScript `isActive`. |

Relacionamentos relevantes:

- Pedidos referenciam usuarios responsaveis.
- Movimentacoes podem referenciar um usuario responsavel.
- Movimentacoes com usuario impedem a exclusao desse usuario no banco.

### Customers

Tabela: `customers`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `name` | `varchar(255)` | Obrigatorio. |
| `email` | `varchar(255)` | Obrigatorio e unico. |
| `cnpj` | `varchar(20)` | Obrigatorio e unico. |
| `phone` | `varchar(20)` | Obrigatorio. |
| `address` | `varchar(255)` | Obrigatorio. |
| `description` | `text` | Nullable na entidade. |

Um cliente pode ser referenciado por pedidos.

### Suppliers

Tabela: `suppliers`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `name` | `varchar(255)` | Obrigatorio. |
| `cnpj` | `varchar(20)` | Obrigatorio e unico. |
| `phone` | `varchar(20)` | Obrigatorio. |
| `email` | `varchar(255)` | Obrigatorio e unico. |
| `description` | `text` | Nullable na entidade. |
| `address` | `varchar(255)` | Obrigatorio. |

Um fornecedor pode ser referenciado por produtos.

### Products

Tabela: `products`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `name` | `varchar(255)` | Obrigatorio. |
| `sku` | `varchar(255)` | Obrigatorio e unico. |
| `description` | `text` | Nullable na entidade. |
| `price` | `decimal(10,2)` | Obrigatorio. |
| `stock_quantity` | `int` | Padrao `0`, nunca negativo; propriedade TypeScript `stockQuantity`. |
| `supplier_id` | `uuid` | Fornecedor vinculado. |

Relacionamentos:

- Muitos produtos pertencem a um fornecedor.
- Itens de pedido referenciam produtos.
- Movimentacoes de estoque referenciam produtos com `ON DELETE RESTRICT`.

O saldo nao pode ser atualizado pelo DTO de `PUT /products/:id`. Entradas,
saidas e ajustes devem passar por `POST /stock-movements`.

### Orders

Tabela: `orders`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `total` | `decimal(10,2)` | Calculado na criacao. |
| `status` | `enum` | Padrao da entidade: `pending`; obrigatorio no DTO atual. |
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
- Um pedido possui muitos itens com cascade de insert/update.
- Movimentacoes podem referenciar pedido e item de pedido.

### Order Items

Tabela: `order_items`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `discount` | `decimal(10,2)` | Padrao `0`. |
| `type_discount` | `enum` | Padrao `none`; propriedade TypeScript `typeDiscount`. |
| `is_bonus` | `boolean` | Padrao `false`; propriedade TypeScript `isBonus`. |
| `quantity` | `int` | Obrigatorio no banco. |
| `price` | `decimal(10,2)` | Obrigatorio. |
| `product_id` | `uuid` | Produto vendido. |
| `order_id` | `uuid` | Pedido vinculado. |

Tipos de desconto:

- `percentage`
- `fixed_amount`
- `none`

Ao excluir um pedido, seus itens sao excluidos em cascata.

### Stock Movements

Tabela: `stock_movements`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `product_id` | `uuid` | Produto movimentado; obrigatorio. |
| `quantity` | `int` | Inteiro positivo. |
| `type` | `enum` | Tipo da movimentacao. |
| `direction` | `enum` | `in` ou `out`. |
| `origin` | `enum` | Origem operacional. |
| `previous_balance` | `int` | Saldo antes da movimentacao. |
| `resulting_balance` | `int` | Saldo depois da movimentacao; nunca negativo. |
| `order_id` | `uuid` | Opcional; fica `NULL` se o pedido for excluido. |
| `order_item_id` | `uuid` | Opcional; fica `NULL` se o item for excluido. |
| `responsible_user_id` | `uuid` | Opcional; usuario responsavel. |
| `source_reference_id` | `varchar(255)` | Referencia externa ou ID preservado da origem. |
| `operation_key` | `varchar(255)` | Opcional e unico; usado contra duplicidade. |
| `notes` | `text` | Observacoes opcionais. |
| `metadata` | `jsonb` | Dados auxiliares opcionais. |
| `occurred_at` | `timestamp` | Data e hora da movimentacao. |

Tipos de movimentacao:

- `entry`
- `exit`
- `adjustment`
- `reservation`
- `separation`
- `cancellation`
- `return`
- `write_off`
- `other`

Direcoes:

- `in`
- `out`

Origens:

- `order`
- `purchase`
- `manual_adjustment`
- `return`
- `cancellation`
- `inventory`
- `other`

Constraints e relacionamentos:

- Quantidade deve ser positiva; saldo anterior e saldo resultante nao podem
  ser negativos.
- O saldo resultante deve corresponder matematicamente a direcao e quantidade.
- `operation_key` e unica quando informada.
- Produto e usuario responsavel usam `ON DELETE RESTRICT`.
- Pedido e item usam `ON DELETE SET NULL`; `source_reference_id` preserva a
  referencia textual.

## Regras de estoque

### Registro transacional

O `StockMovementsService` altera o saldo do produto e grava o historico dentro
da mesma transacao.

Durante a movimentacao:

1. A operacao e validada.
2. Duplicidade por `operation_key` e verificada.
3. O produto e carregado com bloqueio pessimista.
4. Pedido, item e usuario relacionados sao validados quando informados.
5. O novo saldo e calculado.
6. Produto e historico sao persistidos na mesma transacao.

Uma falha em qualquer etapa desfaz toda a operacao.

### Compatibilidade entre tipo e direcao

| Tipos | Direcao obrigatoria |
| --- | --- |
| `entry`, `cancellation`, `return` | `in` |
| `exit`, `reservation`, `separation`, `write_off` | `out` |
| `adjustment`, `other` | `in` ou `out` |

Regras adicionais:

- Saidas maiores que `stockQuantity` sao rejeitadas.
- Origem `order` exige `order_id`.
- `order_item_id` exige `order_id`.
- O item informado deve pertencer ao pedido e ao produto informados.
- No endpoint manual, `responsible_user_id` vem do JWT e nao do body.
- Nao existem endpoints de update ou delete para movimentacoes.

### Integracao com pedidos

A criacao de pedido e as movimentacoes correspondentes usam uma unica
transacao. Se nao houver saldo para todos os itens, o pedido inteiro e
desfeito.

Mapeamento do status informado na criacao:

| Status do pedido | Movimentacao gerada |
| --- | --- |
| `pending`, `accepted` | `reservation` / `out` |
| `processing` | `separation` / `out` |
| `completed`, `delivered` | `exit` / `out` |
| `cancelled`, `rejected` | Nenhuma movimentacao |

Ao excluir um pedido que teria movimentado estoque, o sistema cria uma
movimentacao `cancellation` / `in` para cada item antes da exclusao.

Os itens sao ordenados por produto antes dos bloqueios para reduzir risco de
deadlock em pedidos concorrentes.

## Endpoints

Todas as rotas, exceto as marcadas como publicas, exigem JWT.

### Auth

#### `POST /auth/login`

Publica. Autentica um usuario ativo.

```json
{
  "email": "admin@email.com",
  "password": "123456"
}
```

### Users

#### `POST /users`

Publica. Cria um usuario.

```json
{
  "name": "Admin",
  "email": "admin@email.com",
  "password": "123456",
  "isActive": true
}
```

O service verifica duplicidade de nome e email antes de salvar.

#### `GET /users`

Lista usuarios sem expor senhas. Possui paginacao e busca.

#### `GET /users/:id`

Busca usuario sem expor a senha.

#### `PUT /users/:id`

Atualiza usuario. Consulte as inconsistencias atuais do `UpdateUserDto`.

#### `DELETE /users/:id`

Remove usuario quando nao existem relacionamentos que impeçam a exclusao.

### Customers

#### `POST /customers`

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

Email e CNPJ sao verificados contra duplicidade.

#### `GET /customers`

Lista todos os clientes sem paginacao.

#### `GET /customers/:id`

Busca cliente por ID.

#### `PUT /customers/:id`

Atualiza cliente usando `Partial<Customer>` diretamente.

#### `DELETE /customers/:id`

Remove cliente quando nao esta protegido por relacionamentos.

### Suppliers

#### `POST /suppliers`

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

Email e CNPJ sao verificados contra duplicidade.

#### `GET /suppliers`

Lista todos os fornecedores sem paginacao.

#### `GET /suppliers/:id`

Busca fornecedor por ID.

#### `PUT /suppliers/:id`

Atualiza fornecedor usando `Partial<Supplier>` diretamente.

#### `DELETE /suppliers/:id`

Remove fornecedor quando nao esta protegido por produtos relacionados.

### Products

#### `POST /products`

Body definido atualmente pelo `CreateProductDto`:

```json
{
  "name": "Arroz Tipo 1 5kg",
  "sku": "ARR-5KG-001",
  "description": "Pacote de arroz tipo 1",
  "price": 29.9,
  "supplierId": "uuid-do-fornecedor"
}
```

O saldo inicial e `0`. Consulte a inconsistencia conhecida entre `supplierId`
e `supplier_id`.

#### `GET /products`

Lista todos os produtos, incluindo `stockQuantity`.

#### `GET /products/:id`

Busca produto por ID.

#### `PUT /products/:id`

Campos aceitos:

```json
{
  "name": "Novo nome",
  "sku": "NOVO-SKU",
  "description": "Nova descricao",
  "price": 35.5,
  "supplier_id": "uuid-do-fornecedor"
}
```

`stockQuantity` nao e aceito. Use uma movimentacao de estoque.

#### `DELETE /products/:id`

Remove produto quando nao existem itens ou movimentacoes relacionados.

### Orders

#### `POST /orders`

Cria pedido, calcula o total e movimenta estoque conforme o status.

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

Calculo atual:

```text
total = soma((price * quantity) - discount)
```

`typeDiscount` e armazenado, mas o calculo trata `discount` como valor absoluto
independentemente de `percentage` ou `fixed_amount`.

#### `GET /orders`

Lista pedidos com seus itens, sem paginacao.

#### `GET /orders/:id`

Busca pedido com seus itens.

#### `DELETE /orders/:id`

Devolve o estoque movimentado, registra cancelamentos e remove pedido/itens.

Nao existe endpoint para atualizar o status de um pedido.

### Stock Movements

#### `POST /stock-movements`

Registra uma movimentacao manual e usa o usuario autenticado como responsavel.

Exemplo de entrada:

```json
{
  "product_id": "uuid-do-produto",
  "quantity": 100,
  "type": "entry",
  "direction": "in",
  "origin": "purchase",
  "source_reference_id": "NF-123",
  "operation_key": "purchase:NF-123:item:1",
  "notes": "Entrada da compra",
  "metadata": {
    "document": "NF-123"
  }
}
```

Exemplo de ajuste de saida:

```json
{
  "product_id": "uuid-do-produto",
  "quantity": 2,
  "type": "adjustment",
  "direction": "out",
  "origin": "manual_adjustment",
  "operation_key": "inventory:2026-06-11:product:uuid"
}
```

#### `GET /stock-movements`

Lista movimentacoes em ordem decrescente de `occurred_at`, com produto, pedido
e item quando ainda relacionados.

Filtros aceitos:

| Parametro | Descricao |
| --- | --- |
| `page` | Pagina; padrao `1`. |
| `limit` | Registros por pagina; padrao `10`, maximo `100`. |
| `product_id` | Filtra por produto. |
| `order_id` | Filtra por pedido ainda relacionado. |
| `responsible_user_id` | Filtra pelo usuario responsavel. |
| `type` | Filtra pelo tipo. |
| `direction` | Filtra por `in` ou `out`. |
| `origin` | Filtra pela origem. |
| `occurred_from` | Data/hora ISO inicial. |
| `occurred_to` | Data/hora ISO final. |

#### `GET /stock-movements/:id`

Busca uma movimentacao com produto, pedido e item relacionados.

## Paginacao e filtros

O utilitario `paginate` aplica:

- `skip`: `(page - 1) * limit`
- `take`: `limit`
- retorno de `total`, `page`, `limit`, `previousPage`, `nextPage` e
  `totalPages`

Paginacao implementada atualmente:

- `GET /users`
- `GET /stock-movements`

Formato:

```json
{
  "message": "Recursos encontrados com sucesso",
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

Filtros de usuarios:

```http
GET /users?page=1&limit=10&identifier=email&search=admin
```

Filtros de movimentacoes:

```http
GET /stock-movements?page=1&limit=20&product_id=<uuid>&direction=out
```

## Inconsistencias conhecidas

As observacoes abaixo refletem o codigo atual e devem ser consideradas ao
consumir ou evoluir a API.

### DTOs opcionais sem `@IsOptional()`

Alguns campos marcados com `?` no TypeScript possuem validators, mas nao usam
`@IsOptional()`. Com o `ValidationPipe` atual, eles podem ser exigidos em
runtime:

- `CreateUserDto.isActive`
- `UpdateUserDto.name`, `email` e `isActive`
- `CreateCustomerDto.description`
- `CreateSupplierDto.description`
- `CreateOrderItemDto.discount`, `typeDiscount` e `isBonus`

### Atualizacao de usuario

`UpdateUserDto.isActive` usa `@IsEmail()` apesar de o service e a entidade
esperarem um boolean. O endpoint `PUT /users/:id` nao consegue atualizar esse
campo corretamente no estado atual.

### Produto e fornecedor

`CreateProductDto` recebe `supplierId`, enquanto a entidade e a coluna usam
`supplier_id`. O service repassa o DTO diretamente ao repository, sem mapear
esses nomes. Isso pode causar falha de persistencia por `supplier_id` ausente.

O `UpdateProductDto` usa corretamente `supplier_id`.

### Campos nullable versus validacao

- `Customer.description` e `Supplier.description` sao nullable nas entidades,
  mas seus DTOs de criacao podem exigir o campo por falta de `@IsOptional()`.
- `Product.description` e nullable na entidade, mas obrigatorio no
  `CreateProductDto`.
- `CreateProductDto.price` e opcional apenas no tipo TypeScript, mas possui
  `@IsNumber()` e corresponde a uma coluna obrigatoria.

### Updates sem DTO dedicado

Clientes e fornecedores usam `Partial<Entity>` diretamente nos controllers e
services. Nao existe DTO dedicado para controlar campos permitidos e validacao
de update nesses modulos.

### Filtros de usuarios

O service aceita `isActive` na lista de filtros, mas aplica `ILIKE` a todos os
campos. Em PostgreSQL, usar `ILIKE` diretamente sobre boolean pode falhar.

### Filtros de movimentacoes

`StockMovementQueryDto` herda `search` e `identifier` de `PaginationQueryDto`,
mas o service de movimentacoes nao aplica esses dois campos.

### Pedidos e estoque

- Nao existe endpoint de alteracao de status. As movimentacoes automaticas sao
  determinadas apenas pelo status informado na criacao e pela exclusao.
- `CreateOrderItemDto.quantity` usa `@IsNumber()`, mas nao usa `@IsInt()` nem
  `@IsPositive()`. O banco espera inteiro e o service de estoque exige inteiro
  positivo quando o pedido gera movimentacao.
- Reservas e separacoes reduzem diretamente `stockQuantity`. Nao existe saldo
  fisico separado de saldo reservado/disponivel.
- Nao existe entidade de deposito, lote, validade ou localizacao. O saldo e
  global por produto.
- Nao existe entidade de compra; entradas de compra usam `source_reference_id`.

## Testes

Comandos:

```bash
npm run test
npm run test:e2e
npm run test:cov
```

O Jest resolve imports `src/...` por `moduleNameMapper`.

Existem specs para controllers e services. Os testes de movimentacao cobrem:

- Entrada e atualizacao do saldo.
- Rejeicao de saida maior que o saldo.
- Duplicidade por `operation_key`.
- Compatibilidade entre tipo e direcao.
- Reserva gerada por pedido.
- Pedido rejeitado sem movimentacao.
- Saida para pedido criado como entregue.
- Devolucao de saldo antes da exclusao do pedido.
