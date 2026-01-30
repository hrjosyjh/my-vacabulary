# GEMINI.md - Context for AI Agent

## Project Overview
**Name:** my-vacabulary
**Type:** Web Application (React + Vite)
**Purpose:** An English vocabulary learning tool tailored for Korean students (CSAT/Sooneung focus). It allows users to view word cards, mark words as memorized, and track progress.
**Key Features:**
- **Vocabulary Cards:** Displays word, pronunciation, meaning, and examples (EN/KO).
- **Progress Tracking:** Memorization checklist with visual feedback and a progress dashboard.
- **Persistence:** Uses `localStorage` to save learning progress across sessions.
- **Filtering:** Filter words by status (All, Learning, Memorized).

## Tech Stack
- **Framework:** React 19 (via Vite)
- **Language:** JavaScript (ESModules)
- **Styling:** Tailwind CSS 4, PostCSS
- **Icons:** Lucide React
- **Package Manager:** npm (inferred from `package-lock.json`)

## Key Commands
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server. |
| `npm run build` | Builds the application for production. |
| `npm run preview` | Previews the production build locally. |
| `npm run lint` | Runs ESLint to check for code quality issues. |

## Project Structure
- **`src/`**: Source code directory.
  - **`App.jsx`**: Main application component containing core logic, state management, and UI layout.
  - **`main.jsx`**: Application entry point.
  - **`data/words.js`**: Contains the `vocabulary` array, which serves as the data source for the application.
  - **`index.css`**: Global styles and Tailwind imports.
- **`public/`**: Static assets.
- **`vite.config.js`**: Vite configuration.
- **`tailwind.config.js`**: Tailwind CSS configuration.

## Development Conventions
- **Data Management:** New words should be added to the `vocabulary` array in `src/data/words.js`. Each entry requires a unique `id`.
- **Styling:** Use Tailwind CSS utility classes directly in JSX. Global theme adjustments should be made cautiously as they are not centralized in a config file (per README).
- **State Persistence:** The app relies on `localStorage`. To reset data, use `localStorage.clear()` in the browser console or the UI reset button.
- **Linting:** Adhere to ESLint rules defined in `eslint.config.js`.

## Notes for AI
- When modifying data, ensure the `id` in `src/data/words.js` is unique and sequential.
- The project uses Tailwind v4 (implied by `@tailwindcss/postcss` and typical v4 setups, though explicit version check might be needed if using specific v3 features).
- All user-facing text should be in Korean as per the target audience (Korean students).
