# Little Royals teacher app

Flutter app for teachers at Little Royals Kindergarten & Primary School. It talks to the Nest API in `../backend`.

## What it does

- Sign in (or open as the demo teacher)
- Clock in and out (Kampala)
- Mark today’s Baby–P7 register P / A / L / E (and mark a class present)
- See end-of-term and mid-term papers created on the web app
- Browse pupils and open a report-card PDF
- Log a sickbay visit
- Read the term calendar

It does not yet enter subject marks, show a real timetable, or message parents — those APIs do not exist.

## Run

Start Postgres and the API first:

```bash
cd ../backend && npm run start:dev
```

Then from this folder:

```bash
flutter pub get
flutter run
```

## API URL

| Client | Base URL |
| --- | --- |
| Android emulator | `http://10.0.2.2:3000/api` |
| iOS simulator | `http://127.0.0.1:3000/api` |
| Physical phone | `http://<your-computer-LAN-IP>:3000/api` |

The login screen lets you change the URL. Demo teacher: `teacher@littleroyals.ac.ug` and any password of 4+ characters.

Android cleartext HTTP is enabled so the emulator can reach a local API. Do not ship that setting to a production store build that only uses HTTPS.
