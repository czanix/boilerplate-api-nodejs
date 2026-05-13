# Czanix Boilerplate — API Node.js

> Express + TypeScript + MongoDB. O backend que funciona para 90% dos projetos que não precisam de SQL relacional desde o dia um.

[![Node.js](https://img.shields.io/badge/Node.js-22%20LTS-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-007ACC?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat&logo=mongodb&logoColor=white)](https://mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tech Reference](https://img.shields.io/badge/Czanix-Tech%20Reference-gold)](https://czanix.com/pt/stack)

---

## Quando usar este boilerplate (e quando não usar)

**Use quando:**
- Dados são semi-estruturados ou mudam de schema frequentemente
- Você precisa de prototipação rápida com flexibilidade de modelo
- O domínio é mais documento do que relação (catálogos, logs, eventos)
- Scale horizontal é prioridade desde o início

**Não use quando:**
- Precisa de JOINs complexos e integridade referencial forte → use o [boilerplate-api (PostgreSQL)](https://github.com/czanix/boilerplate-api)
- Dados financeiros com transações ACID rigorosas
- Relatórios analíticos pesados (MongoDB não é warehouse)

Saber **quando não usar** é tão importante quanto saber usar. [Trade-offs completos →](https://czanix.com/pt/stack/tradeoffs)

---

## Estrutura

```
src/
├── domain/                          # Zero dependências externas
│   ├── entities/
│   │   └── product.entity.ts        # Regras de negócio puras
│   ├── repositories/
│   │   └── product.repository.ts    # Interface
│   └── result.ts                    # Result<T> — sem throw
│
├── application/                     # Casos de uso
│   ├── use-cases/
│   │   ├── create-product.usecase.ts
│   │   └── search-products.usecase.ts
│   └── dtos/
│
├── infrastructure/                  # MongoDB + Redis
│   ├── database/
│   │   ├── connection.ts            # MongoClient singleton
│   │   ├── indexes.ts               # Índices declarativos
│   │   └── schemas/
│   │       └── product.schema.ts    # Validação no nível do banco
│   ├── repositories/
│   │   └── mongo-product.repository.ts
│   └── cache/
│       └── redis.ts
│
└── presentation/
    ├── controllers/
    │   └── product.controller.ts
    ├── middlewares/
    │   ├── auth.middleware.ts
    │   └── security-headers.middleware.ts
    └── validators/
        └── product.validator.ts
```

---

## Início rápido

```bash
# 1. Clone
git clone https://github.com/czanix/boilerplate-api-nodejs.git meu-projeto
cd meu-projeto

# 2. Dependências
npm install

# 3. Ambiente
cp .env.example .env

# 4. MongoDB + Redis
docker compose up -d

# 5. Seed (opcional)
npm run db:seed

# 6. Desenvolvimento
npm run dev
```

---

## Result Pattern

```typescript
type Result<T, E = string> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

// Uso
const result = await createProduct.execute(input);

if (!result.ok) {
  return res.status(422).json({ error: result.error });
}

return res.status(201).json(result.value);
```

---

## MongoDB — índices que importam

```typescript
// indexes.ts — declarados explicitamente, não por acidente
await db.collection('products').createIndexes([
  // Busca por categoria — o mais comum
  {
    key: { category: 1, createdAt: -1 },
    name: 'ix_products_category_recent',
  },
  // Full-text search nativo
  {
    key: { name: 'text', description: 'text' },
    name: 'ix_products_text',
    weights: { name: 10, description: 1 },
  },
  // TTL para dados temporários
  {
    key: { expiresAt: 1 },
    name: 'ix_products_ttl',
    expireAfterSeconds: 0,
  },
]);
```

**Regra:** Todo query que faz `find()` precisa de índice correspondente. Sem exceção. `explain()` é obrigatório antes de ir para produção.

---

## Schema Validation (MongoDB 7.0+)

```typescript
await db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'category', 'price', 'publicId'],
      properties: {
        publicId:  { bsonType: 'string', description: 'UUID para exposição' },
        name:      { bsonType: 'string', minLength: 1, maxLength: 200 },
        category:  { bsonType: 'string', enum: ['food', 'beverage', 'other'] },
        price:     { bsonType: 'decimal', minimum: 0 },
        deletedAt: { bsonType: ['date', 'null'] },
      },
    },
  },
});
```

**MongoDB sem schema validation é MySQL sem constraints.** Você acha que é flexibilidade até a primeira inconsistência em produção.

---

## Segurança

```typescript
app.use(helmet({
  contentSecurityPolicy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'RATE_LIMIT_EXCEEDED' },
});

app.use('/auth/login', authLimiter);
```

---

## Testes

```bash
npm test                    # Unit tests
npm run test:integration    # Com MongoDB real (Testcontainers)
npm run test:coverage       # Coverage report
```

---

## Architecture Decision Records (ADRs)

Decisões arquiteturais documentadas com contexto, motivo e trade-offs:

- [ADR-001: INT/BIGINT PK + UUID público](docs/adrs/001-bigint-pk-uuid-public.md)
- [ADR-002: Result Pattern vs Exceptions](docs/adrs/002-result-pattern-over-exceptions.md)
- [ADR-003: Clean Architecture com limites pragmáticos](docs/adrs/003-clean-architecture-boundaries.md)
- [ADR-004: Princípios de Modelagem de Dados](docs/adrs/004-database-design-principles.md)
- [ADR-005: Partitioning para Tabelas de Alto Volume](docs/adrs/005-table-partitioning.md)
- [ADR-006: Connection Pooling e Pool Sizing](docs/adrs/006-connection-pooling.md)
- [ADR-007: VACUUM, Autovacuum e Bloat Prevention](docs/adrs/007-vacuum-autovacuum.md)
- [ADR-008: Read Replicas e Separação de Leitura/Escrita](docs/adrs/008-read-replicas.md)
- [ADR-009: Observabilidade e Testes de Carga](docs/adrs/009-observability-load-testing.md)
- [ADR-010: LLMOps, Agentes e Resiliência Extrema (Top 0.01%)](docs/adrs/010-top-tier-engineering.md)

---

## Referência técnica

- [Guia de Backend & Arquitetura](https://czanix.com/pt/stack/backend)
- [NoSQL & Cloud Database](https://czanix.com/pt/stack/dados)
- [Catálogo de Trade-offs](https://czanix.com/pt/stack/tradeoffs)

---

## Licença

MIT — use, adapte, melhore. Se ajudou, [deixa uma estrela](https://github.com/czanix/boilerplate-api-nodejs) ⭐

---

<div align="center">
<sub>Desenvolvido e mantido por <a href="https://czanix.com">Cesar Zanis</a> — Czanix</sub>
</div>
