# Aadhaar OCR System - Frontend

This is the React client interface for the Aadhaar OCR System, built with **Vite** and **TypeScript**.

---

## Technical Architecture
- **Vite:** Next-generation build tool for swift compilation.
- **Axios:** Handles HTTP requests with the Express backend.
- **Lucide Icons:** Provides sleek, modern icons.
- **Custom CSS Design System:** Fully styled in `src/index.css` implementing:
  - Responsive layouts using CSS Flexbox and Grid.
  - A modern dark-theme space palette (`radial-gradient`).
  - Glassmorphic container panels.
  - Interactive laser scan line animations.

---

## Directory structure
- `src/App.tsx`: Handles application state (files, loading spinners, errors, results, and history selection logs).
- `src/index.css`: Configures structural borders, buttons, scrollbars, and laser animation keyframes.
- `src/main.tsx`: Mounts the React component tree.

---

## Setup & Execution

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Vite developer server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Preview the production build locally:
   ```bash
   npm run preview
   ```
