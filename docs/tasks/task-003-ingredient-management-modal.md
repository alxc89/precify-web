# Task 003: Modal de Gestão de Ingredientes e Histórico de Preços

Este checklist monitora a implementação da modal principal de ingrediente e da modal secundária de preços.

## Checklist de Execução
- [x] Mapear os contratos gerados de `managed ingredient` e histórico de preços para models locais da feature.
- [x] Criar um service da feature para encapsular leitura de gestão do ingrediente, criação/edição de ingrediente e operações de preço por escopo.
- [x] Criar estado para abertura da modal em modo `novo ingrediente` e `editar ingrediente`.
- [x] Integrar o botão `Novo Ingrediente` e a ação `Editar` da tabela para abrir a modal principal.
- [x] Implementar a modal principal com formulário de `Nome`, `Categoria`, `Unidade Base`, `Preço Atual` e `Status`.
- [x] Implementar a regra de `Preço Atual` como campo somente leitura, priorizando entry ativa de `store` e depois de `organization`.
- [x] Exibir o controle de `Status` apenas em modo edição.
- [x] Implementar a ação de desativação lógica do ingrediente a partir da modal principal.
- [x] Preparar a ação de reativação do ingrediente para quando o contrato de backend estiver disponível.
- [x] Implementar a listagem de histórico com colunas `Preço`, `Origem`, `Válido Inicial`, `Validade Final`, `Status` e `Ações`.
- [x] Implementar o botão `Novo preço` na seção de histórico.
- [x] Implementar o menu de ações da linha do histórico com `Editar` e `Desativar`.
- [x] Implementar a modal de preço em modo `novo preço` e `editar preço`.
- [x] Implementar os campos `Origem`, `Unidade de Compra`, `Quantidade Comprada`, `Quantidade Convertida`, `Valor Pago`, `Custo por Unidade Base`, `Fornecedor`, `Observação`, `Válido Inicial` e `Validade Final`.
- [x] Calcular `Custo por Unidade Base` automaticamente a partir de `purchasePrice / convertedBaseQuantity`.
- [x] Integrar a criação e edição de price entries usando o escopo correto (`organization` ou `store`).
- [x] Integrar a desativação lógica de price entries usando o escopo correto.
- [x] Atualizar a listagem e o preço atual do ingrediente após salvar ou desativar uma entry.
- [x] Criar testes unitários para a resolução do preço atual, modos da modal, histórico e ações de preço.

---
*Referência Técnica:* [docs/specs/003-ingredient-management-modal.md](../specs/003-ingredient-management-modal.md)
*Dependência:* [docs/specs/004-auth-session-bootstrap.md](../specs/004-auth-session-bootstrap.md)
*Status Atual:* **Implementado no frontend, com reativação do ingrediente aguardando endpoint dedicado no backend**
