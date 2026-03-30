# Diretrizes do Projeto: Precify Food (Angular Edition)

Este documento define as regras de ouro para o desenvolvimento do frontend. **Siga estas diretivas rigorosamente.**

## 🛠️ Stack Tecnológica
- **Framework:** Angular (Standalone Components apenas).
- **Estilização:** Tailwind CSS (Tokens em HSL).
- **UI Kit:** [Spartan UI](https://www.spartan.ng/) (Primitives) + Angular CDK.
- **Ícones:** Lucide Angular.
- **API:** Cliente gerado via OpenAPI Generator (`typescript-angular`).
- **Testes:** Vitest (Unit) e Playwright (E2E).

## 📐 Padrões de Código e Estado
1.  **Estado Local:** Use **Signals** (`signal`, `computed`, `effect`) para estados de UI e reatividade simples.
2.  **Estado Global/Domínio:** Use **Services + RxJS** (Facades). O estado complexo e fluxos assíncronos pertencem aos Services.
3.  **Componentes:** Sempre `standalone: true`. Evite `NgModule` a todo custo.
4.  **API Strategy:** Não consuma o cliente gerado diretamente nas Features. Crie **Adapters/Facades** no `core/` ou na própria `feature/` para isolar a lógica da API.

## 🎨 Design System (Tokens HSL)
As cores devem ser referenciadas via variáveis CSS para suporte a Temas (Light/Dark).
- **Primary:** `158 64% 25%` (Emerald) | **Accent:** `24 95% 60%` (Orange).
- **Radius:** `0.75rem`.
- **Mobile-First:** Priorize layouts que funcionem em telas pequenas; tabelas densas devem ser evitadas ou adaptadas para cards no mobile.

## 📁 Estrutura de Pastas
- `src/app/core/`: Auth, Session, Interceptors, Guards, API Generated Client.
- `src/app/shared/`: Componentes visuais atômicos, Directives, Pipes.
- `src/app/features/`: Módulos de negócio (ex: `ingredients`, `products`).
- `src/app/design-system/`: Wrappers do Spartan UI e definições de tema.

---
*Para detalhes de arquitetura e roadmap, consulte a pasta `/docs`.*
