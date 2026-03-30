# Roadmap de Execução: Precify Web (Angular)

Este documento define as fases de desenvolvimento para a migração e implementação do novo frontend.

## 🏁 Fase 1: Fundação (Base do Projeto)
- [ ] Criar novo repositório `precify-web`.
- [ ] Setup Inicial: Angular Standalone + Tailwind CSS.
- [ ] Configuração de Temas: CSS Variables em HSL.
- [ ] Integração UI Kit: Spartan UI + Lucide Angular.
- [ ] Configuração OpenAPI: Script de geração de cliente.
- [ ] Infraestrutura Core:
  - `AuthInterceptor` e `ErrorInterceptor`.
  - `SessionService` para gestão de estado global.
  - `AuthGuard` e `GuestGuard`.

## 🔒 Fase 2: Sessão e Contexto (Autenticação)
- [ ] Fluxo de Login: Integração com `/api/v1/auth/login`.
- [ ] Fluxo de Troca de Senha Obrigatória.
- [ ] Bootstrap de Sessão: Integração com `/api/v1/auth/session`.
- [ ] Shell do Sistema: Sidebar (Desktop) e Bottom Sheet (Mobile).
- [ ] Context Switcher: Seletor de Organização/Loja global no Shell.

## 📦 Fase 3: Módulos de Domínio (Features)
- [ ] **Ingredientes:** Listagem, Categorias e Gestão de Preços.
- [ ] **Produtos:** Catálogo da Organização e Ficha Técnica.
- [ ] **Loja:** Gestão de sortimento local.

## 🧪 Fase 4: Qualidade e Refinamento
- [ ] Cobertura de testes unitários em serviços críticos (`Auth`, `Session`).
- [ ] Fluxos E2E com Playwright para os caminhos críticos (Login, CRUD Ingredientes).
- [ ] Refinamento Mobile-First em todos os diálogos e listagens.

---
## 💡 Critérios de Aceite Arquitetural
- O app deve ser independente de backend local para rodar (mock ou dev server).
- Nenhuma funcionalidade deve usar `NgModule`.
- O estado de UI deve ser gerenciado via Signals para performance.
- O código deve estar 100% tipado (strict mode).
