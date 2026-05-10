# Restful Booker Web

React/Vite web interface for managing Restful-Booker reservations.

## Run

Start the backend API first:

```bash
cd ../app-code
npm install
npm start
```

Then start the web app:

```bash
npm install
npm run dev
```

Default API base URL is `/api`, proxied by Vite to `http://localhost:3001`. To use another API, create `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:3001
```

## Features

- Login gate: users enter `admin` / `password123` before entering the dashboard.
- Dashboard page with navigation cards for each Restful-Booker API capability.
- Booking list page with filters by first name, last name, checkin, and checkout.
- Mock dataset with more than 20 bookings for rich UI testing.
- Booking detail drawer with full update, partial patch, and delete actions after admin login.
- New booking form using `POST /booking`.
- Admin login using `POST /auth` with `admin` / `password123`.
- Health indicator using `GET /ping`.
