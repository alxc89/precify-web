# Task 004: Bootstrap e Contexto da Sessão Autenticada

Este checklist monitora a adaptação do frontend para o novo endpoint `GET /api/v1/auth/session`.

## Checklist de Execução
- [x] Validar o contrato gerado de `SessionContextResponse`, `SessionOrganizationMembershipResponse` e `SessionStoreMembershipResponse`.
- [x] Atualizar o `SessionService` para persistir token e snapshot completo da sessão autenticada.
- [x] Adicionar signals derivados para `mustChangePassword`, `isPlatformAdmin`, `organizationMemberships`, `storeMemberships`, `currentOrganization` e `currentStore`.
- [x] Implementar restauração da sessão a partir do `sessionStorage`.
- [x] Implementar revalidação do bootstrap com `GET /api/v1/auth/session` quando existir token salvo.
- [x] Atualizar `AuthFacade.login()` para salvar o token e buscar o snapshot da sessão antes da navegação final.
- [x] Redirecionar para `/alterar-senha` com base em `mustChangePassword` vindo de `/auth/session`.
- [x] Atualizar `authGuard` para depender de sessão bootstrapada, e não apenas da presença do token.
- [x] Atualizar `guestGuard` para bloquear telas públicas quando a sessão autenticada já estiver bootstrapada.
- [x] Definir a regra de derivação do contexto corrente priorizando `storeMemberships` e derivando a organização correspondente.
- [x] Expor no `SessionService` uma API para troca futura da loja corrente.
- [x] Atualizar o topbar e demais consumidores para ler dados do snapshot de sessão em vez do `user` simplificado do login.
- [x] Garantir limpeza completa do snapshot e do token no logout e em `401 Unauthorized`.
- [x] Criar testes unitários para `SessionService`, fluxo de login, refresh da aplicação e guards.
- [x] Validar que as features autenticadas conseguem consumir `organizationId` e `storeId` a partir do `SessionService`.

---
*Referência Técnica:* [docs/specs/004-auth-session-bootstrap.md](../specs/004-auth-session-bootstrap.md)
*Status Atual:* **Concluído**
