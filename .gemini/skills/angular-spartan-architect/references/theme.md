# Design System: Precify Food (HSL Tokens)

Este documento define a verdade única para cores e estilos no projeto.

## 🎨 Paleta de Cores (HSL)
As cores devem ser implementadas como variáveis CSS no `:root` ou `.dark`.

| Variável | Light Mode | Dark Mode | Aplicação |
| :--- | :--- | :--- | :--- |
| `--primary` | `158 64% 25%` | `158 64% 45%` | Cor principal da marca (Emerald) |
| `--accent` | `24 95% 60%` | `24 95% 60%` | Chamadas de ação e botões (Orange) |
| `--background` | `0 0% 100%` | `158 60% 6%` | Fundo principal |
| `--foreground` | `158 60% 15%` | `156 20% 95%` | Texto principal |
| `--success` | `142 76% 36%` | `142 76% 36%` | Estados de sucesso |
| `--warning` | `38 92% 50%` | `38 92% 50%` | Estados de alerta |
| `--destructive` | `0 84% 60%` | `0 84% 60%` | Erros e ações críticas |

## 📐 Superfícies e Efeitos
- **Border Radius:** `0.75rem` (12px) padrão.
- **Shadows:** Utilizar sombras baseadas na cor primária com opacidade reduzida.
- **Gradients:**
  - `primary`: `linear-gradient(135deg, hsl(158 64% 25%), hsl(158 64% 35%))`
  - `accent`: `linear-gradient(135deg, hsl(24 95% 60%), hsl(24 95% 70%))`

## 📱 Mobile-First
- Evitar grids densos.
- Usar `flex-col` no mobile e `flex-row` apenas a partir do breakpoint `md`.
- Componentes como diálogos devem ser convertidos em `bottom sheets` no mobile quando aplicável.
