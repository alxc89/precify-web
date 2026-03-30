# Spec 001: Setup e Fundação do Projeto

## Objetivo
Preparar o ambiente Angular Standalone com as ferramentas de UI e integração necessárias para o Precify Food.

## Requisitos de Infraestrutura
1.  **Framework:** Angular v17+ (Standalone).
2.  **Tailwind CSS:** Instalar e configurar as variáveis HSL em `src/styles.css` (conforme `docs/ARCHITECTURE.md`).
3.  **Spartan UI:** Configurar a base (Headless Radix + Tailwind Wrapper).
4.  **Lucide Angular:** Instalar e configurar ícones.
5.  **OpenAPI:** Configurar o script `npm run api:generate` no `package.json` para apontar para o `swagger.json` da API.

## Estrutura de Pastas Inicial
- `src/app/core/`
- `src/app/shared/`
- `src/app/features/`
- `src/app/design-system/`

## Critérios de Aceite
- [ ] O comando `ng serve` deve rodar sem erros.
- [ ] O arquivo `tailwind.config.ts` deve conter a paleta de cores HSL personalizada.
- [ ] Um componente de teste simples usando `hlm-button` (Spartan UI) deve exibir o botão com a cor primária Emerald.
