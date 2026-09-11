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

API: [http://localhost:3000/api](http://localhost:3000/api). Copy `backend/.env.example` to `backend/.env` and run Postgres (`littleroyals` database). The Angular dev server proxies `/api` to the API. See `backend/README.md`.

What shipped and when is in [CHANGELOG.md](CHANGELOG.md). Sign-ins, enrolments and generated PDFs also appear on **Permissions → Change log**.
