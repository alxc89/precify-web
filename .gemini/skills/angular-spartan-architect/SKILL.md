---
name: angular-spartan-architect
description: Especialista em UI para o projeto Precify Food. Use quando for criar ou modificar componentes Angular usando Spartan UI, Tailwind CSS e o Design System com tokens HSL.
---

# Angular Spartan Architect

Siga estas instruções para garantir que a UI do Precify Food seja consistente, acessível e mobile-first.

## 🏗️ Implementação de Componentes
1.  **Spartan UI Primitives:** Sempre use os componentes [Spartan UI](https://www.spartan.ng/) como base (Radix UI ported to Angular).
2.  **Tailwind CSS:** Aplique estilos visuais usando Tailwind. Nunca use CSS inline ou arquivos de estilo pesados; prefira classes utilitárias que referenciem nossos tokens HSL.
3.  **Tokens HSL:** Consulte [theme.md](references/theme.md) para a lista exata de cores e variáveis.
4.  **Acessibilidade:** Certifique-se de que todos os componentes interativos tenham estados de foco, labels ARIA e sigam as melhores práticas do Angular CDK.

## 📱 Diretrizes Mobile-First
- Comece o design pela menor tela.
- Use `flex flex-col` por padrão.
- Tabelas densas são proibidas em telas pequenas; converta-as em `cards` ou `lists` empilhados.

## 🚀 Fluxo de Trabalho
1.  **Identificar o Componente:** Verifique se o Spartan UI já possui o primitivo (ex: `hlm-button`, `hlm-input`).
2.  **Aplicar Tema:** Utilize as variáveis HSL (ex: `bg-primary`, `text-accent-foreground`).
3.  **Validar Mobile:** Verifique o comportamento em breakpoints `sm`, `md` e `lg`.

---
*Referência Única:* [theme.md](references/theme.md)
