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