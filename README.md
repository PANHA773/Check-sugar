# Cambo Sugar Scan

Full-stack admin dashboard for managing sugar content in food products in Cambodia.

Tech stack:
- Backend: Node.js, Express, MongoDB
- Frontend: React, Tailwind CSS
- Language/UI: Khmer-first labels

## Features (MVP)
- Admin dashboard UI
- Create, edit, delete product records
- Search products by barcode, name, or brand
- Dashboard summary cards (total, low, medium, high sugar)
- User management (create, edit, delete, block, role)
- Sugar risk level classification (`Low`, `Medium`, `High`)
- Khmer-friendly labels for Cambodia users

## Project Structure

```text
cambo/
  server/
  client/
```

## 1) Run Backend

```bash
cd server
npm install
copy .env.example .env
# edit MONGO_URI if needed
npm run dev
```

Backend default: `http://localhost:5000`

## 2) Run Frontend

```bash
cd client
npm install
npm run dev
```

Frontend default: `http://localhost:5173`

## 3) Run Flutter User App (Mobile MVP)

```bash
cd mobile_user_app
flutter pub get
flutter run
```

For Android emulator, backend URL default is `http://10.0.2.2:5000/api`.
For real device, pass your machine IP:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:5000/api
```

Flutter pages included:
- Home Page
- Scan Page (barcode + vibration/sound)
- Result Page
- Manual Add Page
- History Page

Flutter networking:
- Uses `dio` as HTTP client
- Uses backend APIs for register/login and barcode lookup

## 4) Deploy Frontend to Netlify (GitHub Repo)

This repo includes `netlify.toml` configured for the React app in `client/`.

### Netlify build setup
- Base directory: `client`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`

### Required Netlify environment variable
- `VITE_API_URL=https://your-backend-domain.com/api`

### Deploy steps
1. Open: `https://app.netlify.com/start/repos/PANHA773/Check-sugar`
2. Select your repo and create site.
3. In Netlify Site Settings -> Environment Variables, add `VITE_API_URL`.
4. Deploy.

### Backend CORS for Netlify
In your backend `.env`, set `CLIENT_URL` to include your Netlify URL (comma-separated supported):

```env
CLIENT_URL=http://localhost:5173,https://your-netlify-site.netlify.app
```

## API Endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products?q=&page=&limit=`
- `GET /api/products/stats/summary`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/products/barcode/:barcode`
- `GET /api/users?q=&page=&limit=`
- `GET /api/users/stats/summary`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/sugar-score/:sugarPer100g`

## Sugar Level Rule (per 100g)
- `<= 5g`: Low sugar
- `> 5g and <= 22.5g`: Medium sugar
- `> 22.5g`: High sugar
