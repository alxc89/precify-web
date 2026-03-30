---
name: spec-to-code-implementer
description: Especialista em traduzir especificações técnicas (docs/specs/) em código Angular Standalone, seguindo os padrões de arquitetura definidos para o Precify Food.
---

# Spec to Code Implementer

Use esta skill para transformar documentos de especificação em implementações reais de software.

## 🚀 Fluxo de Implementação
1.  **Análise da Spec:** Leia o arquivo em `docs/specs/` correspondente à tarefa. Identifique endpoints, componentes e regras de negócio.
2.  **Preparação de Boilerplate:** Use os templates em [templates.md](references/templates.md) para gerar a estrutura inicial.
3.  **Arquitetura:**
    - Componentes em `features/`.
    - Serviços (Facades) para lógica de negócio.
    - Tipos mapeados das interfaces geradas pela API.
4.  **Implementação de UI:** Utilize a skill `angular-spartan-architect` para garantir o visual correto.
5.  **Testes e Validação:** Crie testes unitários com Vitest antes de dar a tarefa como concluída.

## 📐 Padrões Obrigatórios
- **Signals:** Use para estado local de UI.
- **RxJS:** Use em Services para fluxos assíncronos e transformações de dados.
- **Standalone:** Nunca use `NgModule`.

---
*Templates Disponíveis:* [templates.md](references/templates.md)
