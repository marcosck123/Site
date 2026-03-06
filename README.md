<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/4b3b503d-387f-40b5-8a0d-724e926df762

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Configure Firebase variables in `.env.local` (see `.env.example`).
4. Run the app:
   `npm run dev`

## Firebase Auth (criação de conta)

A criação de conta/login usa **Firebase Authentication (email/senha)** através de `createUserWithEmailAndPassword` e `signInWithEmailAndPassword`.

Para funcionar corretamente, configure no `.env.local`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Se essas variáveis não estiverem preenchidas, o app agora exibe aviso e bloqueia autenticação com mensagem de configuração ausente.
