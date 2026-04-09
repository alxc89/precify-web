# Spec 004: Bootstrap e Contexto da Sessão Autenticada

## Objetivo
Implementar o bootstrap da sessão autenticada a partir do novo endpoint `GET /api/v1/auth/session`, tornando o `SessionService` a fonte central de:
- identidade do usuário
- obrigatoriedade de troca de senha
- papel global de plataforma
- memberships organizacionais
- memberships de loja
- contexto corrente de organização e loja para uso nas features

O objetivo é substituir o modelo atual, que guarda apenas `token` e `user` básico, por um snapshot de sessão mais completo e alinhado ao backend.

## Contexto da API

### Endpoint
- `GET /api/v1/auth/session`

### Semântica
O endpoint resolve o bootstrap da sessão autenticada para o frontend e retorna:
- identidade básica do usuário
- flag de troca obrigatória de senha
- papel global de plataforma
- vínculos organizacionais ativos
- vínculos de loja ativos

### Contrato Gerado
```json
{
  "user": {
    "id": "guid",
    "name": "Alex Costa",
    "email": "admin@precify.com"
  },
  "mustChangePassword": false,
  "isPlatformAdmin": false,
  "organizationMemberships": [
    {
      "organizationId": "guid",
      "name": "Precify Foods",
      "code": "PRECIFY",
      "type": "restaurant_chain",
      "role": "organization_admin"
    }
  ],
  "storeMemberships": [
    {
      "storeId": "guid",
      "name": "Loja Centro",
      "code": "CTR",
      "businessType": "restaurant",
      "organizationId": "guid",
      "organizationName": "Precify Foods",
      "organizationCode": "PRECIFY",
      "role": "store_admin"
    }
  ]
}
```

## Problema Atual
Hoje o frontend:
- persiste apenas `accessToken`
- persiste apenas `user` resumido do login
- decide autenticação somente por presença de token
- não possui `organizationId` nem `storeId`
- não consegue resolver contexto para features como gestão de ingredientes e preços

Arquivos impactados:
- [session.service.ts](/home/alex/Documentos/repos/precify-web/src/app/core/session/session.service.ts)
- [auth.facade.ts](/home/alex/Documentos/repos/precify-web/src/app/core/auth/auth.facade.ts)
- [auth.guard.ts](/home/alex/Documentos/repos/precify-web/src/app/core/auth/auth.guard.ts)
- [guest.guard.ts](/home/alex/Documentos/repos/precify-web/src/app/core/auth/guest.guard.ts)

## Estratégia de Frontend

### 1. Persistência
Persistir em `sessionStorage`:
- `accessToken`
- snapshot de sessão autenticada

O token continua sendo a credencial de autenticação.
O snapshot da sessão passa a ser a base do contexto autenticado.

### 2. Fluxo de Login
Fluxo esperado:
1. usuário envia credenciais para `POST /api/v1/auth/login`
2. frontend recebe `accessToken`
3. frontend salva o token
4. frontend chama `GET /api/v1/auth/session`
5. frontend hidrata o `SessionService`
6. se `mustChangePassword === true`, navega para `/alterar-senha`
7. caso contrário, navega para `/app/ingredientes`

Observação:
- a resposta do login deixa de ser a fonte principal do contexto do shell
- a resposta de `/auth/session` passa a ser a fonte oficial do bootstrap

### 3. Fluxo de Refresh da Página
Fluxo esperado:
1. app inicia
2. `SessionService` verifica se existe token salvo
3. se não existir token, estado permanece anônimo
4. se existir token, o frontend tenta hidratar o snapshot da sessão
5. se existir snapshot persistido, usa-o como estado inicial imediato
6. em seguida, revalida com `GET /api/v1/auth/session`
7. se a chamada falhar com `401`, limpa a sessão e redireciona para `/login`

### 4. Contexto Corrente
Como o contrato retorna listas de memberships, o frontend precisa derivar um contexto corrente.

Regras sugeridas para a primeira versão:
1. se houver `storeMemberships`, selecionar a primeira loja como `store` corrente
2. derivar `organization` corrente a partir da loja selecionada
3. se não houver loja, mas houver `organizationMemberships`, selecionar a primeira organização
4. se não houver nenhum vínculo, manter autenticação válida, mas sinalizar ausência de contexto operacional

Esse contexto derivado será a base para:
- gestão de ingredientes
- histórico de preços
- features futuras com escopo organizacional e de loja

### 5. Guards
As guards não devem depender só da existência de token.

Regras:
- `authGuard` deve permitir a rota autenticada somente quando a sessão estiver bootstrapada ou puder ser bootstrapada com sucesso
- `guestGuard` deve bloquear `/login` e `/` quando já houver sessão autenticada válida
- quando `mustChangePassword === true`, o usuário deve ser forçado para `/alterar-senha`

### 6. Logout
Ao fazer logout:
- limpar token
- limpar snapshot de sessão
- limpar contexto corrente
- navegar para `/login`

## Estado e Lógica

### SessionService
O `SessionService` deve passar a expor sinais para:
- `token`
- `sessionContext`
- `user`
- `mustChangePassword`
- `isPlatformAdmin`
- `organizationMemberships`
- `storeMemberships`
- `currentOrganization`
- `currentStore`
- `isAuthenticated`
- `isHydrated`
- `isBootstrapping`

### Métodos Esperados
- `setToken(token: string)`
- `loadSession()`
- `bootstrap()`
- `restoreFromStorage()`
- `setCurrentStore(storeId: string)`
- `clearSession()`

### Derivações Importantes
- `isAuthenticated` não deve significar apenas “tem token”
- `isAuthenticated` deve considerar existência de token e contexto bootstrapado válido
- `currentOrganization` pode ser derivada da `currentStore`
- `hasStoreContext` deve existir para features que dependem de loja

## Integração com Features
Essa sessão bootstrapada deve abastecer:
- topbar
- sidebar
- guards
- catálogo de ingredientes
- modal de gestão de ingrediente e preço

Impacto direto na spec de modal:
- o endpoint de gestão de ingrediente passa a consumir `organizationId` e `storeId` vindos do `SessionService`
- o frontend não deve mais inferir contexto fora da sessão

## Critérios de Aceite
- [ ] O frontend deve chamar `GET /api/v1/auth/session` após login bem-sucedido.
- [ ] O `SessionService` deve armazenar o snapshot completo da sessão autenticada.
- [ ] Em refresh de página, o frontend deve restaurar e revalidar a sessão quando existir token.
- [ ] O contexto corrente de organização e loja deve ser derivado a partir dos memberships retornados.
- [ ] Features autenticadas devem conseguir acessar `organizationId` e `storeId` via `SessionService`.
- [ ] Quando `mustChangePassword === true`, o usuário deve ser redirecionado para `/alterar-senha`.
- [ ] Quando `/auth/session` responder `401`, a sessão deve ser limpa e o usuário redirecionado para `/login`.
- [ ] `authGuard` e `guestGuard` devem refletir a sessão bootstrapada, e não apenas a presença do token.
