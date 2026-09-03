# GOLD Card System

Sistem de carduri de loialitate pentru coffee shop.
200 de carduri GOLD — 1 desert mic sau 1 cafea simplă gratis pe săptămână, timp de 1 an.

## Ce face

- **Înregistrare** (`/register`) — Gold Desk: atribuie card, fotografiază clientul, verifică condiții, colectează consimțământ GDPR
- **Scanare** (`/scan`) — Staff: scanează QR-ul de pe card, verifică eligibilitatea, confirmă oferta
- **Admin** (`/admin`) — Aprobă carduri pending, vezi statistici, blochează/deblochează

## Deploy în 15 minute

### 1. Supabase (baza de date)

1. Du-te la [supabase.com](https://supabase.com) → New Project
2. Alege un nume și o parolă, regiunea EU West
3. Așteaptă ~2 min să se creeze
4. Du-te la **SQL Editor** → New Query
5. Copiază conținutul din `supabase/migration.sql` → Run
6. Du-te la **Settings → API** → copiază:
   - Project URL (`https://xxxxx.supabase.co`)
   - `anon` public key

### 2. Vercel (hosting)

1. Push acest proiect pe GitHub (repo privat)
2. Du-te la [vercel.com](https://vercel.com) → New Project → Import repo
3. La Environment Variables, adaugă:
   - `NEXT_PUBLIC_SUPABASE_URL` = URL-ul de la Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key-ul
   - `NEXT_PUBLIC_BASE_URL` = URL-ul Vercel (ex: `https://gold.vercel.app`)
4. Deploy

### 3. Generează QR-urile pentru carduri

```bash
cp .env.local.example .env.local
# Editează .env.local cu valorile tale

npm install
npm run generate-qr
```

Deschide `qr-codes/print-sheet.html` în browser → Print.
Fiecare QR se lipește pe spatele cardului PVC corespunzător.

### 4. Carduri PVC

Comandă 200 carduri PVC personalizate (dimensiune credit card):
- Față: logo, "GOLD CARD", "GOLD-XXX" (număr unic)
- Spate: QR generat + condiții de utilizare
- Tipografii recomandate: Vistaprint, MOO, PrintBoss

## PIN-uri default (SCHIMBĂ-LE)

| Rol   | PIN  |
|-------|------|
| Admin | 9999 |
| Staff 1 | 1111 |
| Staff 2 | 2222 |

Schimbă-le direct în Supabase → Table Editor → `staff`.

## Flux zilnic

1. Clientul prezintă cardul fizic
2. Staff-ul deschide `/scan` pe telefon
3. Scanează QR-ul → apare poza clientului + status
4. Dacă ELIGIBIL → alege "Cafea simplă" sau "Desert mic" → Confirmă
5. Clientul primește produsul gratuit + plătește restul comenzii

## Reguli de business

- **Reset:** Luni la 00:00 (săptămână calendaristică ISO)
- **Condiție:** Gratuit doar cu o comandă plătită în aceeași vizită
- **Netransferabil:** Poza la scanare previne împrumutul
- **Durată:** 12 luni de la activare

## Structura proiectului

```
├── supabase/migration.sql    ← Schema bazei de date
├── scripts/generate-qr-codes.mjs  ← Generator QR pentru print
├── src/
│   ├── app/
│   │   ├── page.jsx          ← Login cu PIN
│   │   ├── register/         ← Formular înregistrare (Gold Desk)
│   │   ├── scan/             ← Scanare QR + Redemption
│   │   ├── admin/            ← Panou administrare
│   │   └── r/[token]/        ← Redirect QR → scan
│   └── lib/supabase.js       ← Client Supabase + helpers
```
