# JanaFlow — Finance Budget Tracker (React Native / Expo)

MCA Semester III · Core Elective II — Mobile App Development using React Native · EoS Hackathon (Oct 2026)

A personal-finance app with **Admin** and **Customer** roles, built with Expo and React Navigation.
Layout based on the FinWise Finance Budget Tracker Figma design, in a grey / white / black theme.
There is **no backend or database** — all data lives in memory (React Context) and resets when the app restarts.

## Run it

```bash
npm install
npx expo start          # scan the QR code with Expo Go (same Wi-Fi), or press w for web
npx expo start --tunnel # if the phone cannot connect
```

### Demo accounts

| Role     | Email                | Password    |
|----------|----------------------|-------------|
| Customer | priya@janaflow.com   | Priya@123   |
| Customer | arun@janaflow.com    | Arun@1234   |
| Admin    | admin@janaflow.com   | Admin@123   |

Admin sign-up needs the access code `FINWISE2026`.

## Rubric coverage

| Requirement | Where |
|---|---|
| Home with Sign Up & Sign In (Admin + Customer) | `src/screens/auth` — one login form, the account decides the role |
| Analysis (Admin + Customer) | `src/screens/shared/AnalysisScreen.js` — Today / Month / Year / Custom range, customer filter for admin |
| Profile & Edit Profile | `src/screens/customer/ProfileScreen.js`, `EditProfileScreen.js` |
| Transactions month-wise | `src/screens/customer/TransactionsScreen.js` |
| Categories & Category Details | `CategoriesScreen.js`, `CategoryDetailsScreen.js` (add / edit / delete) |
| Stack navigation | `src/navigation/RootStack.js` |
| Tab navigation | `src/navigation/Tabs.js` |
| Drawer navigation | `src/navigation/Drawers.js` |
| Personalised alerts on transaction changes | `src/utils/alerts.js`, `src/components/Toast.js` |
| Daily / weekly / monthly reports on Home | `ReportCard` in `src/screens/customer/HomeScreen.js` |
| Validation on every form | `src/utils/validation.js` |

## Extra features

- Calendar view (spending heat-map; admin sees all customers)
- Savings Goals with progress rings
- Spending streak card
- Dark mode
- Fingerprint / device-PIN login (`expo-local-authentication`)
- PDF report export (web: direct download with jsPDF; Android: saved to Downloads)
- shadcn-style customer dropdown and date-range filters

## Project structure

```
App.js                  fonts, providers, themed navigation container
src/context/            AppContext — in-memory users, transactions, categories, goals, alerts
src/navigation/         RootStack (stack) → Drawers (drawer) → Tabs (bottom tabs)
src/screens/auth|customer|admin|shared
src/components/         layout, form fields, charts, filters, modals
src/utils/              formatting, validation, reports, alerts, PDF, streak
src/theme.js            light / dark palettes
```

## Acknowledgement

Parts of this project were written with the help of an AI coding assistant (Claude).
