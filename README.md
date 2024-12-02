# Maturitní Četba - Kontrola Výběru Knih k Maturitě

Tento projekt poskytuje jednoduchou webovou aplikaci pro kontrolu výběru maturitní četby. Uživatelé mohou procházet seznam knih, vybrat až 20 knih dle požadavků k maturitě a vygenerovat si seznam ve formátu PDF. Aplikace zahrnuje funkcionalitu notifikací, které uživatele upozorní, pokud překročí limit pro výběr knih.

[Navštivte aplikaci Maturitní Četba](https://maturitni-cetba.vercel.app)

## Obsah

- [O aplikaci](#o-aplikaci)
- [Funkcionality](#funkcionality)
- [Použití](#použití)
- [Instalace](#instalace)
- [Technologie](#technologie)
- [Struktura Projektu](#struktura-projektu)
- [Autor](#autor)

## O aplikaci

Aplikace "Maturitní Četba" byla vytvořena pro studenty, kteří se připravují na maturitu a potřebují si vybrat knihy dle maturitních pravidel. Tento projekt zahrnuje seznam českých a světových knih s možností filtrování a výběru.

## Funkcionality

- **Vyhledávání knih:** Možnost vyhledávání knih podle názvu.
- **Výběr knih:** Výběr až 20 knih pro maturitu s upozorněním při dosažení limitu.
- **Generování PDF:** Možnost stáhnout seznam vybraných knih ve formátu PDF.
- **Notifikace:** Upozornění pro uživatele, když překročí maximální počet knih nebo jinak poruší pravidla.

## Použití

1. Navštivte aplikaci [zde](https://maturitni-cetba.vercel.app).
2. Procházejte seznam dostupných knih a kliknutím je přidávejte do svého výběru.
3. Když dosáhnete limitu 20 knih, zobrazí se notifikace.
4. Po výběru požadovaného seznamu klikněte na tlačítko pro export do PDF.

## Instalace

Pokud chcete aplikaci spustit lokálně, postupujte následovně:

1. Naklonujte si repozitář:
   ```bash
   https://github.com/itsarnie/MaturitniCetba.git
   cd maturitni-cetba
   ```
  
2. Otevřete `index.html` spolu se zbytkem soubroů ve složce v prohlížeči nebo spusťte jednoduchý HTTP server jako například [node.js](https://nodejs.org/en) nebo extension na Visual Studio Code -> [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).

## Technologie

- **HTML, CSS, JavaScript** - Struktura, stylování a funkcionalita aplikace.
- **Vercel** - Nasazení aplikace.
- **pdfMake** - Generování PDF dokumentů.

## Struktura Projektu

- **index.html** - Hlavní HTML soubor aplikace.
- **styles.css** - CSS soubor obsahující stylování aplikace.
- **main.js** - JavaScript soubor s funkcionalitou aplikace.
- **data.json** - JSON soubor s daty knih pro maturitu.

## Autor

Tento projekt vytvořil Matěj Ričl, EP4., **Střední průmyslová škola a Vyšší odborná škola Kladno**.

