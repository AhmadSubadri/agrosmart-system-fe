# API Reference — KawalTani (frontend summary)

Ringkasan endpoint yang dipanggil oleh frontend beserta contoh payload/response. Sesuaikan `NEXT_PUBLIC_API_URL` dan `API_BE_DETEKSI_FASE` di lingkungan Anda.

## Environment variables

- `NEXT_PUBLIC_API_URL` — base URL backend utama (dipakai untuk sebagian besar endpoint).
- `API_BE_DETEKSI_FASE` — base URL service deteksi fase (dipakai oleh fitur CV).

> Catatan: beberapa file masih menggunakan hardcoded `http://localhost:8000` (lihat `src/app/(app)/chatbot/riwayat-chat/riwayatChat.tsx`). Gantilah ke `NEXT_PUBLIC_API_URL` untuk konsistensi.

---

## Auth

- POST `/api/login`
  - Full URL: `${NEXT_PUBLIC_API_URL}/api/login`
  - Auth: no
  - Content-Type: `application/json`
  - Payload example:

```json
{
  "user_name": "alice",
  "user_pass": "secret"
}
```

- Response example (success):

```json
{
  "token": "<jwt-or-bearer-token>",
  "user": { "id": 1, "name": "Alice" }
}
```

Client behavior: token disimpan di `localStorage` dengan key `token`.

---

## Site / Lahan

- GET `/api/site`
  - Full URL: `${NEXT_PUBLIC_API_URL}/api/site`
  - Auth: Bearer token
  - Response: `{ data: [ { site_id, site_name, ... } ] }`

- GET `/api/site/:id`
  - Full URL: `${NEXT_PUBLIC_API_URL}/api/site/:id`
  - Auth: Bearer token

- PUT `/api/site/:id`
  - Full URL: `${NEXT_PUBLIC_API_URL}/api/site/:id`
  - Auth: Bearer token
  - Payload example:

```json
{
  "site_name": "Lahan A",
  "lat": -7.123,
  "lng": 112.345,
  "description": "Catatan"
}
```

---

## Tanaman (Plant)

- GET `/api/tanaman`
- GET `/api/tanaman/:id`
- PUT `/api/tanaman/:id` — update tanaman
  - Auth: Bearer token
  - Payload example:

```json
{
  "name": "Padi IR64",
  "varietas": "IR64",
  "notes": "Catatan tambahan"
}
```

---

## Sensor

- GET `/api/sensor?site_id={siteId}`
  - Full URL: `${NEXT_PUBLIC_API_URL}/api/sensor?site_id=${siteId}`
  - Auth: Bearer token
- GET `/api/sensor/:id`
- PUT `/api/sensor/:id` — update sensor
  - Payload example:

```json
{
  "name": "Sensor A",
  "type": "tds",
  "ds_id": "abcd1234"
}
```

---

## Riwayat / Reporting

- GET `/api/riwayat` — ambil riwayat (dipakai oleh `riwayatClient`)
- GET `/api/riwayat2` — variant dipakai di UI
- GET `/api/area-options?site_id={siteId}` — opsi area untuk filter
  - Auth: Bearer token

---

## Profil

- GET `${NEXT_PUBLIC_API_URL}/api/profile` — ambil profil (Auth required)
- PUT/POST `${NEXT_PUBLIC_API_URL}/api/profile` — update profil
  - Example payload:

```json
{
  "full_name": "Nama",
  "email": "user@example.com",
  "phone": "08123456789"
}
```

---

## Realtime

- Di `src/app/(app)/realtime/page.tsx` terdapat panggilan ke endpoint realtime (gunakan `NEXT_PUBLIC_API_URL`). Periksa file untuk path spesifik (bisa berupa WebSocket atau polling GET).

---

## Deteksi Fase Padi (Computer Vision)

- POST `${API_BE_DETEKSI_FASE}/deteksi-fase/`
  - Auth: biasanya no (tergantung implementasi backend deteksi)
  - Body: `FormData` dengan key `file` (image)
  - Example (fetch):

```js
const form = new FormData();
form.append("file", file);
const res = await fetch(`${API_BE_DETEKSI_FASE}/deteksi-fase/`, {
  method: "POST",
  body: form,
});
const result = await res.json();
```

- Example response:

```json
{
  "fase": "fase_v2",
  "confidence": 0.91
}
```

---

## Chatbot (AI)

- POST `${NEXT_PUBLIC_API_URL}/api/chat/new`
  - Create new conversation
  - Body example:

```json
{ "message": "Halo", "name_chat": null }
```

- POST `${NEXT_PUBLIC_API_URL}/api/chat/send`
  - Send message to existing conversation
  - Body example:

```json
{ "message": "Bagaimana kondisi padi saya?", "name_chat": "Obrolan 2026-02-21" }
```

- GET `${NEXT_PUBLIC_API_URL}/api/chat/history/{name_chat}` — ambil riwayat percakapan
- GET `${NEXT_PUBLIC_API_URL}/api/chat/names` — daftar nama chat

Note: `src/app/(app)/chatbot/riwayat-chat/riwayatChat.tsx` masih memanggil beberapa URL hardcoded:

- DELETE `http://localhost:8000/api/chat/history/{name_chat}`
- PUT `http://localhost:8000/api/chat/rename-chat/{oldTitle}`

Gantilah ke `${NEXT_PUBLIC_API_URL}` untuk produksi.

---

## Contoh helper fetch (copy-paste)

```ts
const API = process.env.NEXT_PUBLIC_API_URL;
const token = localStorage.getItem("token");
const headers: HeadersInit = { "Content-Type": "application/json" };
if (token) headers.Authorization = `Bearer ${token}`;

const res = await fetch(`${API}/api/site`, { headers });
const json = await res.json();
```

---
