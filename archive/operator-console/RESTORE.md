# Restore operator console

Privileged `/operator` UI (NEAR wallet NEP-413 login + contest series / official lobby actions), archived from the active app.

## Restore file layout

Copy files back to their original paths:

```text
archive/operator-console/src/pages/OperatorPage.jsx  → src/pages/OperatorPage.jsx
archive/operator-console/src/auth/passportLogin.js    → src/auth/passportLogin.js
archive/operator-console/src/auth/nearWallet.js       → src/auth/nearWallet.js
archive/operator-console/src/api/privileged.js        → src/api/privileged.js
```

Append `src/styles/operator.css` into `src/index.css` (or import it from the app entry).

## Re-wire the app

1. **`src/App.jsx`** — import `OperatorPage` and add route:

   ```jsx
   <Route
     path="/operator"
     element={
       <AppShell>
         <OperatorPage />
       </AppShell>
     }
   />
   ```

2. **`src/components/layout/AppShell.jsx`** — add nav item `{ to: "/operator", label: "Operator" }`.

3. **`src/main.jsx`** — restore Buffer polyfill (required by wallet / NEP-413):

   ```jsx
   import { Buffer } from "buffer";
   window.Buffer = window.Buffer || Buffer;
   globalThis.Buffer = globalThis.Buffer || Buffer;
   ```

4. **`package.json`** — reinstall deps listed in `package.dependencies.json`, then `npm install`.

5. **`README.md`** — restore the `/operator` routes row and “Operator console” section (see git history if needed).

NEAR env (`REACT_APP_NEAR_*`) stays in the active app for passport display-name lookup (`roditLookup`); no env restore needed for that.
