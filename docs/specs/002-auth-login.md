# Spec 002: Autenticação e Gestão de Sessão

## Objetivo
Implementar o fluxo completo de login, persistência de token JWT e proteção de rotas, integrando com o endpoint `/api/v1/auth/login`.

## Detalhes da API (Backend)
- **Endpoint:** `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  { "email": "string", "senha": "string" }
  ```
  *(Nota: O campo da senha é `senha`, não `password`)*.
- **Response (200 OK):**
  ```json
  {
    "accessToken": "string",
    "expiresAt": "string",
    "mustChangePassword": boolean,
    "user": { "id": "uuid", "name": "string", "email": "string" }
  }
  ```

## Estratégia de Frontend
1. **Persistência:** O `accessToken` deve ser salvo no `sessionStorage`.
2. **Estado Global:** O `SessionService` (Angular Signal) deve armazenar o objeto `user` e o status `isAuthenticated`.
3. **Redirecionamento:** 
   - Se `mustChangePassword === true`, redirecionar para `/alterar-senha`.
   - Caso contrário, redirecionar para `/app/dashboard`.
4. **Interceptors:**
   - `AuthInterceptor`: Adiciona `Authorization: Bearer {token}` em todas as requisições para a API.
   - `ErrorInterceptor`: Captura `401 Unauthorized` e limpa a sessão, redirecionando para o login.

## Componentes de UI (Spartan UI)
- **Formulário de Login:**
  - Card centralizado.
  - Inputs para E-mail e Senha (com `hlm-input`).
  - Botão de Login (com `hlm-button`).
  - Exibição de erros via `hlm-alert` ou similar.

## Critérios de Aceite
- [ ] O formulário de login deve validar campos obrigatórios e formato de e-mail.
- [ ] Erros `400`, `401`, `403` e `500` devem exibir mensagens amigáveis conforme o campo `detail` do ProblemDetails da API.
- [ ] As rotas de `/app/*` devem ser protegidas por um `AuthGuard`.
- [ ] O token deve ser removido do `sessionStorage` ao fazer logout ou receber `401`.
