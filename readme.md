# Smartplan Anskaffelse Web

A React application for procurement management, built with Vite and Material-UI. Handles tenders, projects, supplier invitations, bids, contracts, and compliance.

<img width="1561" height="916" alt="1" src="https://github.com/user-attachments/assets/1d8c24eb-59b1-4131-93d2-d061795a25fe" />

---

## How This Website Works / Slik fungerer nettstedet

### English

Smartplan Anskaffelse Web is a **digital tendering and procurement system** for the Norwegian construction industry. It digitises the full process from tender creation to signed contract.

**Main flow:**
1. **Senders** (project owners, advisors) create **projects** and **tenders**, upload documents, and **invite suppliers**.
2. **Receivers** (suppliers/contractors) see **invitations**, read tender documents, **ask questions** in a shared Q&A, and **submit bids** before the deadline.
3. After the deadline, senders **compare bids**, award the contract, send **award letters** and start a **standstill period** (10 days).
4. During standstill, **complaints** can be raised. Afterwards, the **contract** is generated, signed digitally, and stored.

**Important aspects:**
- **Roles**: Users register as sender (client/advisor) or receiver (supplier). Admin users have full access.
- **Standards**: Tenders follow Norwegian contract standards (NS 8405, NS 8406, NS 8407).
- **Integrations**: Brønnøysund registry for company lookup, Firebase for auth and data.
- **Data**: Firebase Auth (login), Firestore (projects, tenders, bids), Storage (documents).

### Norsk

Smartplan Anskaffelse Web er et **digitalt anbuds- og anskaffelsessystem** for det norske bygg- og anleggsmarkedet. Hele prosessen fra anbudsopprettelse til signert kontrakt foregår digitalt.

**Hovedflyt:**
1. **Avsendere** (byggherrer, rådgivere) oppretter **prosjekter** og **anbud**, laster opp dokumenter og **inviterer leverandører**.
2. **Mottakere** (leverandører/entreprenører) ser **invitasjoner**, leser anbudsdokumenter, **stiller spørsmål** i felles Q&A-modul og **sender inn tilbud** før fristen.
3. Etter fristen sammenligner avsendere tilbud, tildeler kontrakten, sender **tildelingsbrev** og starter **ventetiden** (10 dager).
4. Under ventetiden kan det reises **klager**. Deretter **genereres kontrakten**, signeres digitalt og arkiveres.

**Viktige forhold:**
- **Roller**: Brukere registreres som avsender (byggherre/rådgiver) eller mottaker (leverandør). Admin-brukere har full tilgang.
- **Standarder**: Anbud følger norske kontraktsstandarder (NS 8405, NS 8406, NS 8407).
- **Integrasjoner**: Brønnøysundregistrene for oppslag av selskaper, Firebase for innlogging og data.
- **Data**: Firebase Auth (innlogging), Firestore (prosjekter, anbud, tilbud), Storage (dokumenter).

---

## Prerequisites

- **Node.js** 18+ (recommended: use LTS)
- **npm** 9+
- A **Firebase** project for Auth, Firestore, and Storage

## Getting Started

### Install Dependencies

```bash
npm install
```

### Environment Setup

Copy the example env file and add your Firebase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase project values. Get these from the [Firebase Console](https://console.firebase.google.com).

### Development Server

```bash
npm run dev
```

The app will be at `http://localhost:5173` with hot reload.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (alias: `npm start`) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run clean` | Remove `dist` and Vite cache |

### Linting

ESLint is used with React and React Hooks plugins. Fix issues before committing:

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix when possible
```

### Project Structure

```
src/
├── api/              # API services (auth, tender, contract, etc.)
├── components/       # React components (common, layout, features)
├── config/           # Firebase and app config
├── constants/        # Shared constants and enums
├── contexts/         # React contexts (Auth, Notifications)
├── hooks/            # Custom hooks (incl. compliance tests)
├── pages/            # Route-level page components
├── services/         # Firestore, storage, document versioning
├── styles/           # MUI theme and global styles
└── utils/            # Utility and formatter functions
```

See [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) for the full folder guide and conventions.

### Key Documentation

| Document | Description |
|----------|-------------|
| [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) | Folder structure and best practices |
| [docs/USER_ROLES.md](docs/USER_ROLES.md) | User roles (sender/receiver/admin) and permissions |
| [docs/THEME.md](docs/THEME.md) | MUI theme and styling |
| [docs/CODE_ORGANIZATION.md](docs/CODE_ORGANIZATION.md) | Code organization and file size limits |
| [docs/BUTTONS.md](docs/BUTTONS.md) | Button and UI component guidelines |
| [docs/PRODUCT.md](docs/PRODUCT.md) | Product specs and features |

### User Roles

- **Sender** – Create/manage projects and tenders, invite suppliers, award contracts
- **Receiver** – View invitations, ask questions, submit bids
- **Admin** – Full access, including user management and system tasks

Roles are checked in `ProtectedRoute` via the `requireRole` prop. See [docs/USER_ROLES.md](docs/USER_ROLES.md).

### Code Conventions

1. Keep files under 400–500 lines; split or refactor if larger.
2. Use index files for cleaner imports (`import { X } from "./components"`).
3. Put reusable logic in custom hooks under `hooks/`.
4. Use `USER_ROLES` from `src/constants/index.js` instead of hardcoding role strings.

## Tech Stack

- **React 18** – UI library
- **Vite** – Build tool and dev server
- **Material-UI (MUI) v5** – Component library
- **Emotion** – CSS-in-JS (MUI dependency)
- **Firebase** – Auth, Firestore, Storage
- **React Router** – Routing
- **jsPDF / xlsx** – PDF and Excel export

## Deployment

### Deploy to Netlify

The project is set up for Netlify. Build settings are in `netlify.toml`.

1. Push to GitHub/GitLab/Bitbucket
2. Log in at [Netlify](https://app.netlify.com)
3. Add new site → Import existing project
4. Connect the repository
5. Configure environment variables (see below)
6. Deploy

### Environment Variables (Production)

In Netlify **Site settings** → **Environment variables**, set:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

See `.env.example` for reference. Redeploy after adding or changing variables.

### Firebase Requirements

Ensure your Firebase project has:

- **Authentication** (Email/Password)
- **Firestore Database**
- **Storage**
- Security rules applied in `firestore.rules` and `storage.rules`

See the [Firebase documentation](https://firebase.google.com/docs).

<img width="1160" height="838" alt="2" src="https://github.com/user-attachments/assets/0afc7d86-d26a-4a2b-9bbf-a6b25d88ca39" />






