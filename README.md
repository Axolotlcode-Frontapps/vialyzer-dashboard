# React Template con TypeScript, Vite y TailwindCSS

## 📦 Configuración del Proyecto

### Prerrequisitos

- Node.js (22.x o superior)
- pnpm package manager

### Scripts Disponibles

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Previsualizar build de producción
pnpm serve

# Ejecutar pruebas
pnpm test

# Lint del código
pnpm lint

# Lint y auto-fix
pnpm lint:fix

# Formatear código
pnpm format
```

## 🚀 Estructura del Proyecto

```
src/
├── contexts/          # Proveedores de contexto (auth, theme, formularios)
├── hooks/             # Custom React hooks
├── lib/               # Utilidades y esquemas (zod, helpers)
│   └── schemas/       # Validaciones y tipos (ej: auth)
├── routes/            # Definición de rutas y páginas
├── ui/                # Componentes UI reutilizables
│   ├── shared/        # Componentes compartidos (botón, input, card, etc)
│   ├── auth/          # Componentes de autenticación
│   ├── layout/        # Componentes de layout y navegación
│   └── styles/        # Estilos globales (Tailwind, animaciones)
└── main.tsx           # Configuración de providers
```

## ⚙️ Tecnologías

- [React 19](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [@tanstack/react-router](https://tanstack.com/router)
- [@tanstack/react-query](https://tanstack.com/query)
- [@tanstack/react-form](https://tanstack.com/form)
- [Shadcn](https://www.radix-ui.com/)
- [Zod](https://zod.dev/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

## 🛠️ Herramientas de Desarrollo

- TypeScript strict mode
- ESLint con reglas para React
- Prettier para formateo de código
- Alias de paths (`@/*` apunta a `src`)

## 🏗️ Proceso de Build

El proceso de build utiliza Vite para el bundle de producción:

1. `vite build`: Genera el bundle de producción

La salida se genera en el directorio `dist/`.
