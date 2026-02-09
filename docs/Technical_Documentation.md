# Dokumentacja techniczna — Rippa

Zawiera opis architektury, najważniejszych plików, endpointów oraz kroków uruchomienia projektu lokalnie i w produkcji.

## 1. Stos technologiczny
- Frontend: Next.js 16 (App Router), React 19, TypeScript
- Backend: Next.js server routes + Prisma / PostgreSQL
- ORM: Prisma Client
- Hosting: Vercel (zalecane)
- Dodatki: lucide-react, framer-motion

## 2. Struktura repozytorium (najważniejsze ścieżki)
- `app/` — strony i układy aplikacji (App Router)
  - `app/admin/` — panel administracyjny
  - `app/products/`, `app/models/` — widoki produktów
- `components/` — komponenty współdzielone (`LoadingScreen.tsx`, `Navbar.tsx`, `Footer.tsx`)
- `lib/` — pomocnicze moduły (np. `db.ts`, `auth.ts`, `mailer.ts`)
- `prisma/` — schemat Prisma i migracje
- `api/` — API routes (również w `app/api/`)

## 3. Kluczowe pliki i co w nich znaleźć
- `components/LoadingScreen.tsx` — jednolity komponent ładowania. Parametry:
  - `message?: string`
  - `fullScreen?: boolean` (domyślnie `true`). Ustaw `fullScreen=false` dla inline loaderów, żeby uniknąć czarnego boxa.
- `lib/db.ts` — inicjalizacja połączenia z bazą, memoizacja `initializeDatabase()` i skrypt tworzący indeksy (wykonywany przy starcie, ale lepiej uruchomić migracje poza runtime).
- `app/api/models/route.ts` oraz `app/api/models/[id]/route.ts` — główne endpointy pobierające listę modeli i szczegóły. Zoptymalizowane: batch fetch, Promise.all oraz nagłówki `Cache-Control` dla publicznych odczytów.
- `app/api/admin/contacts/route.ts` — endpoint zwracający listę zgłoszeń; ogranicza pola i wymusza maksymalny rozmiar strony (paginacja).

## 4. Najważniejsze endpointy (przykłady)
- GET `/api/models` — lista modeli (opcje: `?all=true`).
- GET `/api/models/{id}` — szczegóły modelu.
- POST `/api/models` — dodaj model (admin).
- PUT/PATCH/DELETE `/api/admin/models/...` — admin API do zarządzania modelami.
- GET `/api/categories` — lista kategorii.
- GET/POST `/api/admin/contacts` — lista i zarządzanie zgłoszeniami.
- POST `/api/upload` — upload plików (zdjęcia, pliki do pobrania).

## 5. Baza danych i migracje
- Schemat Prisma: `prisma/schema.prisma`.
- Migracje znajdują się w `prisma/migrations/`.
- Uruchom migracje w środowisku produkcyjnym:

```bash
npx prisma migrate deploy
```

- Lokalnie możesz użyć:

```bash
npx prisma migrate dev
node prisma/seed.js  # lub `npm run prisma:seed` jeśli zdefiniowane
```

## 6. Uruchomienie lokalne
1. Skopiuj `.env.example` do `.env` i uzupełnij zmienne (DATABASE_URL, NEXTAUTH_SECRET, SMTP_* jeśli potrzebne).
2. Zainstaluj zależności:

```bash
npm install
```

3. Wygeneruj klienta Prisma (jeśli nie automatycznie):

```bash
npx prisma generate
```

4. Uruchom migracje (lokalnie):

```bash
npx prisma migrate dev
```

5. Uruchom aplikację deweloperską:

```bash
npm run dev
```

6. Budowanie produkcyjne:

```bash
npm run build
npm run start
```

## 7. Zmiany wydajnościowe i dobre praktyki
- Unikać N+1: używamy batch fetch (`WHERE modelId = ANY($1)`) oraz mapowania wyników do Map dla O(1) lookup.
- Memoizacja inicjalizacji DB (`initializeDatabase()`), ale długoterminowo lepiej wykonywać DDL/migracje poza ścieżkami requestów.
- Dodano indeksy na kolumnach często filtrowanych (`ContactSubmission.createdAt`, `Model.updatedAt`, `Model.categoryId`, `Model.featured`, `Model.visible`).
- Endpointy publiczne mają `Cache-Control` (s-maxage/stale-while-revalidate) — przyspiesza odczyty przez CDN.

## 8. Najczęściej używane polecenia
- Build: `npm run build`
- Dev: `npm run dev`
- Prisma generate: `npx prisma generate`
- Deploy migrations (prod): `npx prisma migrate deploy`

## 9. Wskazówki do deployu na Vercel
- Ustaw zmienne środowiskowe w panelu Vercel zgodnie z `.env` (DATABASE_URL, NEXTAUTH_SECRET, SMTP_*).
- Upewnij się, że migracje są zastosowane (użyj `npx prisma migrate deploy` lub manualnego procesu migracji przed deployem).

## 10. Dalsze ulepszenia (rekomendacje)
- Dodanie endpointu `GET /api/admin/contacts/{id}` aby pobierać pełną treść zgłoszenia na żądanie.
- Krótkoterminowy cache (Redis) dla statystyk dashboardu.
- Monitorowanie APM i alerty wydajności.

---

Plik ten można rozbudować o: diagramy architektury, listę wszystkich migracji, postman kolekcję z endpointami, lub skrypt do lokalnego seedowania danych. Potrzebujesz, żeby dodać któreś z tych elementów?