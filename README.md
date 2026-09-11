# Little Royals Kindergarten & Primary School

School management app for Little Royals Kindergarten & Primary School.

## Run

```bash
npm install
npm start
```

Open [http://localhost:4200/](http://localhost:4200/). Sign in with a demo role, or any email and password.

## Backend

```bash
cd backend
npm install
npm run start:dev
```

API: [http://localhost:3000/api](http://localhost:3000/api). Copy `backend/.env.example` to `backend/.env` and run Postgres (`littleroyals` database). The Angular dev server proxies `/api` to the API.

## Teacher app (Flutter)

```bash
cd mobile
flutter pub get
flutter run
```

Teachers clock in, take today’s register, browse pupils, log sickbay, and open report-card PDFs. Point the login URL at the Nest API (`http://10.0.2.2:3000/api` on the Android emulator, `http://127.0.0.1:3000/api` on the iOS simulator, or your computer’s LAN IP on a phone). Details: [mobile/README.md](mobile/README.md) and **Flutter** in [backend/README.md](backend/README.md).

What shipped and when is in [CHANGELOG.md](CHANGELOG.md) — the app list in [src/CHANGELOG.md](src/CHANGELOG.md) and the API list in [backend/CHANGELOG.md](backend/CHANGELOG.md) stay on the same dates. The dashboard What’s new card and `GET /api/releases` use that same list. Staff actions appear on **Permissions → Change log**.
