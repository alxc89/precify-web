# Arquitetura Técnica do Precify Frontend

Este documento detalha as decisões técnicas, fluxos de dados e padrões de implementação do projeto Angular.

## 🧱 Princípios de Design
- **Single Page Application (SPA):** Rendering 100% client-side no MVP.
- **Standalone APIs:** Uso exclusivo de componentes, pipes e diretivas standalone.
- **Imutabilidade:** Dados vindos da API devem ser tratados como imutáveis no fluxo RxJS.

## 🚀 Fluxo de Autenticação e Sessão
O app utiliza JWT Bearer para todas as requisições autenticadas.

### 1. Login e Persistência
- Endpoint: `POST /api/v1/auth/login`.
- Armazenamento: `sessionStorage` (para isolar sessões por aba e garantir segurança).
- Reidratação: No bootstrap do app (`APP_INITIALIZER`), o `SessionService` verifica se há um token no storage.

### 2. O Endpoint de Bootstrap (`GET /api/v1/auth/session`)
Essencial para o funcionamento do Shell. A resposta deve fornecer:
- Dados do usuário (`id`, `name`, `email`).
- Permissões administrativas (`isPlatformAdmin`).
- Contexto de organizações e lojas acessíveis.

## 📡 Integração com API (OpenAPI)
1.  **Geração:** O cliente é gerado via script (`npm run api:generate`) a partir do `swagger.json`.
2.  **Isolamento:** As Features **não** importam serviços gerados diretamente. Elas usam um `DomainService` (Facade) que atua como um Adapter.
    - *Vantagem:* Se o contrato da API mudar, apenas o Adapter precisa ser ajustado.
3.  **Interceptors:** Um `AuthInterceptor` global injeta o token JWT e trata erros `401/403` redirecionando para o login.

## 🏗️ Estrutura de Domínios (Features)
Cada funcionalidade deve estar em sua própria pasta em `src/app/features/`, contendo:
- `components/`: Componentes da tela (Container e Presentational).
- `services/`: Facade de domínio (RxJS + Signals).
- `models/`: Interfaces específicas (mapeadas das interfaces geradas pela API).

## 🧩 Spartan UI e Componentes Visuais
- **Spartan UI:** Usado como a camada de "primitivos" (Headless).
- **Customização:** Estilos visuais finais (cores, sombras, espaçamento) são aplicados via Tailwind CSS usando as variáveis HSL definidas no tema.
- **Acessibilidade:** Priorizar o uso do Angular CDK para diálogos, menus e overlays para garantir que o app seja acessível.
