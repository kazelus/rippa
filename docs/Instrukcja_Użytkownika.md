# Instrukcja użytkownika — Panel administracyjny Rippa

Ten dokument to przewodnik dla klienta opisujący podstawowe czynności w panelu administracyjnym strony Rippa.

## 1. Dostęp i logowanie
- Wejdź na stronę panelu administracyjnego: `/admin`.
- Zaloguj się używając danych konta (email i hasło). Jeśli nie masz konta, poproś administratora o utworzenie konta.
- Po nieudanym logowaniu sprawdź poprawność adresu e‑mail i hasła.

## 2. Strona główna (Dashboard)
- Po zalogowaniu trafisz na Dashboard, gdzie zobaczysz szybkie statystyki (liczba modeli, zgłoszeń, itp.).
- Użyj linków w nagłówku, aby przejść do poszczególnych sekcji: `Modele`, `Parametry`, `Zgłoszenia`, `Ustawienia`.

## 3. Zarządzanie modelami (produkty)
Sekcja: `Modele` → lista modeli.

Dodawanie nowego modelu:
- Kliknij `Nowy model`.
- Wypełnij formularz:
  - `Podstawowe`: nazwa, opis, cena, kategoria, widoczność, oznacz jako bestseller (featured).
  - `Cechy & Parametry`: wybierz definicje cech/parametrów dla kategorii i podaj wartości.
  - `Zdjęcia`: dodaj jedno lub więcej zdjęć. Wybierz zdjęcie hero (główne).
  - `Sekcje`: dodaj bloki zawartości z tytułem i tekstem, opcjonalnie obraz.
  - `Pliki`: dodaj pliki do pobrania (np. instrukcje PDF).
  - `Warianty`: zdefiniuj grupy wariantów (np. kolor, rozmiar) i opcje z modyfikacją ceny.
  - `Akcesoria`: powiąż inne modele jako akcesoria.
- Zapisz — po udanym zapisie zostaniesz przekierowany na Dashboard.

Edycja modelu:
- Kliknij `Edytuj` przy wybranym modelu na liście (lub przejdź na `/admin/models/{id}/edit`).
- Edytuj pola jak wyżej i zapisz zmiany.
- Uwaga: podczas wczytywania formularza pokazuje się wewnętrzny (transparentny) loader — brak czarnego ekranu.

Usuwanie i kopiowanie:
- Użyj ikony kosza, aby usunąć model (potwierdzenie wymagane).
- Użyj `Kopiuj` lub `Clone`, aby utworzyć duplikat modelu — po sklonowaniu otworzy się strona edycji nowego modelu.

Widoczność i statusy:
- Możesz zmieniać widoczność modelu (widoczny/ukryty) bez usuwania.
- Oznaczanie jako `Bestsellery` pomaga filtrować i promować produkty.

## 4. Kategorie
- Sekcja: `Kategorie` → lista kategorii.
- Możesz dodać, edytować lub usunąć kategorie.
- Kategorie służą do przypisywania modeli i grupowania parametrów/cech.

## 5. Parametry i grupy parametrów
- Sekcja: `Parametry` → zarządzanie definicjami parametrów.
- Parametr zawiera: klucz, etykietę, jednostkę, typ (tekst/numeryczny/boolean/select) i opcjonalne `options` (lista wartości).
- Grupy parametrów: możesz organizować parametry w grupy (zakładki). Domyślnie grupy są zwinięte.

## 6. Zgłoszenia (wiadomości od klientów)
- Sekcja: `Zgłoszenia` → lista zgłoszeń kontaktowych.
- Lista pokazuje skrócone dane (bez pełnego tekstu wiadomości). Kliknij konkretne zgłoszenie, aby zobaczyć pełną treść (jeśli dostępne).

## 7. Ustawienia
- Sekcja: `Ustawienia` → konfiguracja kontaktu, SMTP, itd.
- SMTP: wprowadź dane serwera pocztowego, aby strona mogła wysyłać maile (kontakt, reset hasła, etc.).

## 8. Uploady i pliki
- Pliki i zdjęcia przesyłane są przez endpoint `/api/upload`.
- Maksymalny rozmiar pliku sprawdzany po stronie klienta to ~20 MB.

## 9. Najczęstsze problemy i rozwiązania
- „Nie widzę nowego modelu”: sprawdź, czy model ma `visible: true` i czy został zapisany poprawnie.
- „Błąd podczas uploadu zdjęcia”: sprawdź rozmiar pliku i status odpowiedzi z serwera.

## 10. Kontakt do wsparcia
- Jeśli potrzebujesz pomocy, przekaż zrzuty ekranu i opis problemu do zespołu developerskiego.

---

Plik ten jest podstawowym przewodnikiem dla użytkownika końcowego. Mogę rozszerzyć instrukcję o zrzuty ekranów, opis każdego pola formularza lub zrobić krótkie checklisty krok‑po‑kroku — chcesz, żeby dodać zrzuty ekranu i instrukcje krok‑po‑kroku dla `Dodaj model` i `Edytuj model`?

## Dodaj model — instrukcja krok po kroku

Poniżej znajdziesz szczegółową instrukcję dodawania nowego modelu (produktu). W dokumencie umieszczono też miejsca na zrzuty ekranu — możesz wstawić pliki do `docs/screenshots/`.

1. Przejdź do `Modele` → kliknij przycisk `Nowy model`.
2. Sekcja `Podstawowe`:
  - `Nazwa`: wpisz nazwę modelu.
  - `Opis`: krótki opis wyświetlany w katalogu.
  - `Cena`: wartość liczby w PLN (bez formatowania), np. `123000` lub z kropkami/spacingiem — system zapisze jako tekst.
  - `Kategoria`: wybierz kategorię z listy (opcjonalne). Kategoria wpływa na dostępne parametry i cechy.
  - `Widoczność`: włącz, jeśli model ma być widoczny publicznie.
  - `Bestseller (Featured)`: zaznacz, jeśli chcesz wyróżnić model.

  ![Zrzut ekranu: Dodaj - Podstawowe](docs/screenshots/add-model-basic.png)

3. Sekcja `Cechy & Parametry`:
  - Wybierz wartości dla zdefiniowanych cech (checkbox/y, text, select) zależnie od typu cechy.
  - Wprowadź wartości parametrów (np. moc, waga) — pola mogą mieć jednostki.

  ![Zrzut ekranu: Dodaj - Cechy i Parametry](docs/screenshots/add-model-features.png)

4. Sekcja `Zdjęcia`:
  - Dodaj jedno lub więcej zdjęć (drag & drop lub wybierz pliki).
  - Po przesłaniu wybierz zdjęcie „hero” (główne) z listy przesłanych zdjęć.
  - Uwaga: maks. rozmiar pliku ~20 MB (walidacja po stronie klienta).

  ![Zrzut ekranu: Dodaj - Zdjęcia](docs/screenshots/add-model-images.png)

5. Sekcja `Sekcje`:
  - Dodaj bloki opisowe z tytułem i tekstem. Możesz także dodać obraz do sekcji.

  ![Zrzut ekranu: Dodaj - Sekcje](docs/screenshots/add-model-sections.png)

6. Sekcja `Pliki`:
  - Dodaj pliki do pobrania (np. instrukcje PDF). Po przesłaniu plik pojawi się na liście.

  ![Zrzut ekranu: Dodaj - Pliki](docs/screenshots/add-model-files.png)

7. Sekcja `Warianty`:
  - Zdefiniuj grupy wariantów (np. kolor) i ich opcje.
  - Dla każdej opcji możesz podać modyfikator ceny i zestaw nadpisanych parametrów.

  ![Zrzut ekranu: Dodaj - Warianty](docs/screenshots/add-model-variants.png)

8. Sekcja `Akcesoria`:
  - Powiąż inne modele jako akcesoria (lista wyboru) — przydatne przy upsellingu.

9. Zapisz formularz — po udanym zapisie nastąpi przekierowanie na Dashboard.

### Checklist — szybkie kroki
- Przegląd pól w `Podstawowe` (nazwa, cena, widoczność)
- Dodaj min. jedno zdjęcie + ustaw hero
- Uzupełnij cechy i parametry
- Dodaj sekcje/pliki/warianty jeśli potrzebne
- Zapisz

## Edytuj model — instrukcja krok po kroku

1. Przejdź do `Modele` → wybierz model i kliknij `Edytuj` (lub otwórz `/admin/models/{id}/edit`).
2. Formularz edycji ma te same sekcje co formularz dodawania (`Podstawowe`, `Cechy & Parametry`, `Zdjęcia`, `Sekcje`, `Pliki`, `Warianty`, `Akcesoria`).
3. Edytuj potrzebne pola i kliknij `Zapisz`.
4. Po zapisaniu zmiany zostaną zastosowane natychmiast (aplikacja przekieruje lub wyświetli potwierdzenie).

  ![Zrzut ekranu: Edytuj - Formularz](docs/screenshots/edit-model-form.png)

### Najważniejsze wskazówki przy edycji
- Jeżeli chcesz zmienić główne zdjęcie — ustaw nowe jako `hero` po przesłaniu.
- Przy zmianie wariantów sprawdź, czy mapowane ceny i nadpisane parametry są poprawne.
- Jeśli potrzebujesz przenieść model do innej kategorii, pamiętaj, że dostępne parametry/cechy mogą się zmienić.

---

Jeśli chcesz, mogę:
- Wstawić rzeczywiste zrzuty ekranu — prześlij je do `docs/screenshots/` lub pozwól, żebym zrobił zrzuty lokalnie i dodał je tutaj.
- Wygenerować PDF z instrukcją (zrobię to za chwilę).

