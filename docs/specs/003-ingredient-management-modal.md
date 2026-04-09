# Spec 003: Modal de Gestão de Ingredientes e Histórico de Preços

## Objetivo
Implementar o fluxo de criação e edição de ingredientes por modal, com uma segunda modal dedicada à gestão do histórico de preços do ingrediente.

O fluxo deve permitir:
- criar ingrediente
- editar ingrediente
- desativar ingrediente a partir da modal de edição
- visualizar histórico de preços
- criar entry de preço
- editar entry de preço
- desativar entry de preço

## Escopo Funcional

### 1. Modal de Ingrediente
Esta modal será usada em dois modos:
- `novo ingrediente`
- `editar ingrediente`

Campos visíveis:
- `Nome`
- `Categoria`
- `Unidade Base`
- `Preço Atual`
- `Status`

Regras:
- `Preço Atual` é somente leitura.
- `Status` aparece somente no modo `editar`.
- o controle de status representa `Ativo` / `Desativado`
- quando o ingrediente estiver ativo, a ação de desativar executa `DELETE` lógico do ingrediente
- quando o ingrediente estiver inativo, a modal deve permitir a ação de reativar, dependendo de contrato de backend específico

### 2. Seção de Histórico na Modal de Ingrediente
Abaixo do formulário principal, a modal deve exibir uma listagem de histórico de preços com botão para adicionar nova entry.

Estrutura da listagem:
- `Preço`
- `Origem`
- `Válido Inicial`
- `Validade Final`
- `Status`
- `Ações`

Ações por linha:
- `Editar`
- `Desativar`

Botão de topo da seção:
- `Novo preço`

### 3. Modal de Preço
Esta modal será usada em dois modos:
- `novo preço`
- `editar preço`

Campos relevantes conforme contrato atual da API:
- `Origem`
- `Unidade de Compra` (`purchaseUnit`)
- `Quantidade Comprada` (`purchaseQuantity`)
- `Quantidade Convertida para Unidade Base` (`convertedBaseQuantity`)
- `Valor Pago` (`purchasePrice`)
- `Custo por Unidade Base` (`baseUnitCost`)
- `Fornecedor` (`supplier`)
- `Observação` (`note`)
- `Válido Inicial` (`validFrom`)
- `Validade Final` (`validTo`)

Regras:
- `Custo por Unidade Base` deve ser calculado automaticamente a partir de `purchasePrice / convertedBaseQuantity` e exibido como leitura.
- `Origem` é necessária para determinar o escopo da entry (`organization` ou `store`).
- em `editar preço`, a origem deve vir carregada da entry selecionada.
- em `novo preço`, a origem deve ser definida antes da submissão.

## Contexto da API

### Sessão
O frontend passará a depender de um endpoint de sessão:
- `GET /api/v1/auth/session`

Esse endpoint deve fornecer, no mínimo:
- `organizationId`
- `storeId`

Esses dados serão usados para resolver o contexto do ingrediente e do histórico de preços.

### Ingrediente
Contratos já existentes:
- `POST /api/v1/ingredientes`
- `PUT /api/v1/ingredientes/{id}`
- `DELETE /api/v1/ingredientes/{id}`

Payload atual de criação/edição:
```json
{
  "name": "string",
  "baseUnit": "string",
  "ingredientCategoryId": "uuid"
}
```

Observação:
- o `DELETE` do ingrediente é desativação lógica.

### Gestão do Ingrediente
O backend passará a expor um endpoint agregado para gestão:
- `GET /api/v1/organizacoes/{organizationId}/ingredientes/{ingredientId}/gestao?storeId={storeId}`

Contrato base esperado:
```json
{
  "id": "guid",
  "name": "Biscoito Negresco",
  "baseUnit": "kg",
  "category": {
    "id": "guid",
    "name": "Biscoitos"
  },
  "historyPrices": [
    {
      "entryId": "guid",
      "source": "organization",
      "purchaseUnit": "cx",
      "purchaseQuantity": 1,
      "convertedBaseQuantity": 1.98,
      "purchasePrice": 55.90,
      "baseUnitCost": 28.23,
      "supplier": "IB FOODS",
      "validFrom": "2026-03-27T22:50:09Z",
      "validTo": null
    },
    {
      "entryId": "guid",
      "source": "store",
      "purchaseUnit": "cx",
      "purchaseQuantity": 1,
      "convertedBaseQuantity": 2.00,
      "purchasePrice": 60.00,
      "baseUnitCost": 30.00,
      "supplier": "Fornecedor Loja",
      "validFrom": "2026-03-28T10:00:00Z",
      "validTo": null
    }
  ]
}
```

### Preços de Ingrediente
Contratos já existentes por escopo:
- organização
  - `GET /api/v1/organizacoes/{organizationId}/ingredientes/{ingredientId}/precos`
  - `POST /api/v1/organizacoes/{organizationId}/ingredientes/{ingredientId}/precos`
  - `PUT /api/v1/organizacoes/{organizationId}/ingredientes/{ingredientId}/precos/{priceEntryId}`
  - `DELETE /api/v1/organizacoes/{organizationId}/ingredientes/{ingredientId}/precos/{priceEntryId}`
- loja
  - `GET /api/v1/lojas/{storeId}/ingredientes/{ingredientId}/precos`
  - `POST /api/v1/lojas/{storeId}/ingredientes/{ingredientId}/precos`
  - `PUT /api/v1/lojas/{storeId}/ingredientes/{ingredientId}/precos/{priceEntryId}`
  - `DELETE /api/v1/lojas/{storeId}/ingredientes/{ingredientId}/precos/{priceEntryId}`

Observação:
- a `Origem` da entry define qual família de endpoint deve ser usada até que o backend unifique também os endpoints de escrita.

## Estado e Lógica

### 1. Abertura da Modal
- botão `Novo Ingrediente` abre a modal em modo criação
- ação `Editar` da tabela abre a modal em modo edição

### 2. Carregamento de Dados em Edição
No modo `editar`:
- buscar o snapshot de gestão do ingrediente
- preencher o formulário principal
- carregar o histórico de preços
- calcular o preço atual exibido

### 3. Regra de Preço Atual
O campo `Preço Atual` na modal do ingrediente deve usar:
1. a última entry ativa de `store`, se existir
2. senão, a última entry ativa de `organization`
3. senão, exibir `Sem preço definido`

Critério de ordenação:
- maior `validFrom` primeiro
- entries inativas não participam da resolução do preço atual

### 4. Regra de Status do Ingrediente
- no modo `novo`, não exibir controle de status
- no modo `editar`, exibir o estado atual do ingrediente
- se ativo, o botão de status executa desativação lógica
- se inativo, o botão deve executar reativação quando o backend disponibilizar o contrato correspondente

### 5. Regra da Listagem de Histórico
- ordenar por `validFrom` decrescente
- exibir `Origem` como `Organização` ou `Loja`
- exibir `Status` por entry
- permitir `Editar` e `Desativar`

### 6. Regra da Modal de Preço
- a modal de preço recebe o ingrediente pai como contexto
- no modo `novo`, a origem precisa estar definida antes de salvar
- no modo `editar`, a origem fica associada à entry existente
- `baseUnitCost` deve ser recalculado sempre que `purchasePrice` ou `convertedBaseQuantity` mudarem

## Dependências de Backend
- o endpoint `GET /api/v1/auth/session` deve disponibilizar `organizationId` e `storeId`
- o endpoint de gestão do ingrediente deve incluir informação suficiente para renderizar o status do ingrediente e das entries
- para reativação do ingrediente, o backend deve expor um contrato dedicado ou equivalente

## Ajustes Esperados no Contrato de Gestão
Para que a modal funcione sem inferência frágil, o contrato agregado de gestão deve expor também:
- `isActive` no ingrediente
- `isActive` em cada item de `historyPrices`

Exemplo desejado:
```json
{
  "id": "guid",
  "name": "Biscoito Negresco",
  "baseUnit": "kg",
  "isActive": true,
  "category": {
    "id": "guid",
    "name": "Biscoitos"
  },
  "historyPrices": [
    {
      "entryId": "guid",
      "source": "store",
      "purchaseUnit": "cx",
      "purchaseQuantity": 1,
      "convertedBaseQuantity": 2,
      "purchasePrice": 60,
      "baseUnitCost": 30,
      "supplier": "Fornecedor Loja",
      "validFrom": "2026-03-28T10:00:00Z",
      "validTo": null,
      "isActive": true
    }
  ]
}
```

## Componentes de UI
- `IngredientManagementModalComponent`
- `IngredientFormComponent`
- `IngredientPriceHistoryTableComponent`
- `IngredientPriceModalComponent`

Sugestão de responsabilidade:
- `IngredientManagementModalComponent`: shell da modal principal, título, loading e submissão
- `IngredientFormComponent`: formulário do ingrediente
- `IngredientPriceHistoryTableComponent`: listagem do histórico e ações por linha
- `IngredientPriceModalComponent`: criação/edição de entry de preço

## Critérios de Aceite
- [ ] A modal de ingrediente deve abrir em modo `novo` e `editar`.
- [ ] Em `novo`, a modal deve permitir salvar `nome`, `categoria` e `unidade base`.
- [ ] Em `editar`, a modal deve exibir `status` e permitir desativação lógica do ingrediente.
- [ ] O campo `Preço Atual` deve refletir a entry ativa mais recente, priorizando `store` sobre `organization`.
- [ ] A seção de histórico deve listar `Preço`, `Origem`, `Válido Inicial`, `Validade Final`, `Status` e `Ações`.
- [ ] O botão `Novo preço` deve abrir a modal de preço.
- [ ] A modal de preço deve calcular `Custo por Unidade Base` automaticamente.
- [ ] A ação `Editar` do histórico deve carregar a entry correta na modal de preço.
- [ ] A ação `Desativar` do histórico deve executar desativação lógica da entry no escopo correto.
- [ ] A implementação deve depender do endpoint de sessão para resolver `organizationId` e `storeId`.
