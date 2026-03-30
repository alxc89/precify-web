# Task 002: Implementação de Login e Sessão

Este checklist monitora o progresso da Fase 2 (Sessão e Autenticação).

## Checklist de Execução
- [x] Criar a estrutura `core/auth/` e `core/session/`.
- [x] Implementar `AuthService` para chamada do endpoint `/api/v1/auth/login`.
- [x] Implementar `SessionService` (Angular Signals) para gestão de estado do usuário.
- [x] Criar `AuthInterceptor` para injetar o JWT nas chamadas da API.
- [x] Criar `ErrorInterceptor` para tratar `401 Unauthorized` e `ProblemDetails`.
- [x] Implementar `AuthGuard` e `GuestGuard`.
- [x] Criar a Feature `auth` (Login Component) com Spartan UI.
- [x] Configurar rotas protegidas em `app.routes.ts`.

---
*Referência Técnica:* [docs/specs/002-auth-login.md](../specs/002-auth-login.md)
*Status Atual:* **Concluído**
