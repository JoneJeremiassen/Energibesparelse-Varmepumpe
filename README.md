# Energibesparelse med Varmepumpe

Et interaktivt webbasert verktøy for å visualisere energibesparelse ved bruk av varmepumpe over perioden 2023-2025. Dette prosjektet gir brukeren mulighet til å simulere ulike effektivitetsnivåer for varmepumper (COP - Coefficient of Performance) og se hvordan dette påvirker energiforbruk og kostnadsbesparelser. Alle data, grafer og statistikk oppdateres dynamisk når COP-verdien endres.

![Energibesparelse Varmepumpe](https://i.imgur.com/jYlcTT2.png)

## Innhold

- [Funksjonalitet](#funksjonalitet)
- [Teknologier](#teknologier)
- [Prosjektstruktur](#prosjektstruktur)
- [Installasjon og Oppsett](#installasjon-og-oppsett)
- [Bruk](#bruk)
- [Datastruktur](#datastruktur)
- [Beregninger](#beregninger)
- [Tilpasninger](#tilpasninger)
- [Bidrag](#bidrag)
- [Lisens](#lisens)

## Funksjonalitet

- **Interaktiv COP-kontroll**: Juster varmepumpens effektivitet (COP) via en slider for å se hvordan det påvirker energibesparelser.
- **Dynamisk dataoppdatering**: Alle beregninger, grafer og tabeller oppdateres automatisk når COP-verdien endres, uansett hvilken side du er på.
- **Informativ COP-slider**: Med fargegradient, markeringer, og informasjonspopup for bedre forståelse.
- **Årsbaserte Dataoversikter**: Separate sider for energidata fra 2023, 2024 og 2025.
- **Responsive Grafer**: Visualisering av energiforbruk, besparelser og kostnadsreduksjoner.
- **Detaljerte Tabeller**: Månedlige data presentert i ryddige tabeller.
- **Responsivt Design**: Fungerer på alle enheter fra desktop til mobile.
- **Tema-støtte**: Både lys og mørk modus for behagelig visning.
- **Ytelsesoptimalisering**: Caching av data og debouncing for jevn brukeropplevelse.

## Teknologier

Dette prosjektet er bygget med følgende teknologier:

- **HTML5/CSS3**: For struktur og styling
- **JavaScript (vanilla)**: For dynamisk funksjonalitet
- **Chart.js**: For grafvisualiseringer
- **Font Awesome**: For ikoner
- **JSON**: For datalagring

Løsningen krever ingen backend og kan kjøres som en statisk nettside.

## Prosjektstruktur

```
Energibesparelse-Varmepumpe/
├── index.html              # Hovedside med sammendrag
├── data2023.html           # Side for 2023-data
├── data2024.html           # Side for 2024-data
├── data2025.html           # Side for 2025-data
├── css/
│   └── style.css           # Hovedstilark
├── js/
│   ├── common.js           # Felles funksjoner og globale variabler
│   ├── script.js           # Hovedsidens spesifikke funksjonalitet
│   ├── data2023.js         # 2023-sidens spesifikke funksjonalitet
│   ├── data2024.js         # 2024-sidens spesifikke funksjonalitet
│   └── data2025.js         # 2025-sidens spesifikke funksjonalitet
└── data/
    ├── data2023.json       # Energidata for 2023
    ├── data2024.json       # Energidata for 2024
    └── data2025.json       # Energidata for 2025
```

## Installasjon og Oppsett

Denne løsningen krever ingen spesiell installasjon. Siden den er bygget med rene frontend-teknologier, kan den kjøres direkte i en nettleser.

1. **Klone eller laste ned repoet**:
   ```bash
   git clone https://github.com/ditt-brukernavn/Energibesparelse-Varmepumpe.git
   ```

2. **Åpne i en nettleser**:
   - Åpne `index.html` direkte i en nettleser, eller
   - Bruk en lokal server for å betjene filene (anbefalt for produksjonsmiljø)

3. **Alternativt, bruk en VS Code-utvidelse**:
   - Bruk "Live Server" for VS Code for enkel lokal betjening

## Bruk

### Navigasjon

- Bruk navigasjonsbaren øverst for å bytte mellom hovedsiden og årsbaserte dataoversikter.
- På mobile enheter, bruk hamburgermenyen for navigasjon.

### COP-kontroll

COP (Coefficient of Performance) er et mål på varmepumpens effektivitet.

- Bruk slideren i navigasjonsbaren til å justere COP-verdien.
- Standard COP-verdi er satt til 5.0, som er typisk for effektive varmepumper i 2025.
- COP-verdiene rangerer fra 1.0 (lav effektivitet) til 6.0 (høy effektivitet).
- Fargegradient på slideren gir visuell indikasjon på effektivitetsnivået (rød for lav, grønn for høy).
- Trykk på tilbakestill-knappen (↺) for å returnere til standard COP-verdi (5.0).
- Trykk eller hover over informasjonsikonet (i) for detaljert informasjon om COP.

Når COP-verdien endres, vil alle beregninger, grafer og tabeller oppdateres dynamisk på alle sider for å reflektere den nye effektiviteten.

### Tema

- Bruk temabryteren i navigasjonsbaren for å veksle mellom lys og mørk modus.
- Innstillingen lagres lokalt og vil beholdes mellom besøk.

## Datastruktur

Dataene for hvert år er lagret i separate JSON-filer med følgende struktur:

```json
[
  {
    "måned": "Januar 2023",
    "oppvarming": 1500,
    "strømpris": 1.45
  },
  ...
]
```

Der:
- `måned`: Navnet på måneden og året
- `oppvarming`: Strømforbruk til oppvarming i kWh
- `strømpris`: Gjennomsnittlig strømpris for måneden i kr/kWh

## Beregninger

Systemet utfører følgende nøkkelberegninger basert på COP-verdien:

1. **Strømforbruk med varmepumpe**: `oppvarming / COP`
2. **Spart strøm**: `oppvarming - (oppvarming / COP)`
3. **Estimert spart kostnad**: `spart strøm * strømpris`
4. **Akkumulert besparelse**: Summen av alle månedlige besparelser over tid

Disse beregningene oppdateres dynamisk når COP-verdien endres, og alle grafer, tabeller og statistikker oppdateres samtidig. Systemet bruker debouncing for å sikre jevn oppdatering og animasjoner som gir brukeren visuell feedback.

## Tilpasninger

### Endre standardverdier

For å endre standardverdien for COP, modifiser følgende linje i `common.js`:

```javascript
let varmepumpeCOP = 5.0; // Endre til ønsket standardverdi
```

### Tilpasse COP-slideren

For å endre COP-sliderens område eller standardverdi, modifiser følgende i HTML og CSS:

1. Endre `min`, `max` og `value` attributtene i HTML for slideren
2. Oppdater fargegrient i CSS (`.cop-slider::-webkit-slider-runnable-track`)
3. Oppdater tooltipteksten i informasjonsikonet

### Legge til nye data

For å legge til data for et nytt år:

1. Opprett en ny JSON-fil i data-mappen (f.eks. `data2026.json`)
2. Følg samme datastruktur som eksisterende JSON-filer
3. Opprett en ny HTML-fil (f.eks. `data2026.html`) basert på eksisterende årsmal
4. Opprett en ny JavaScript-fil (f.eks. `data2026.js`) for årets spesifikke funksjonalitet
5. Oppdater navigasjonslenker i alle HTML-filer for å inkludere det nye året

### Responsivitet

Systemet er designet for å fungere godt på alle enheter. For å forbedre responsiviteten ytterligere:

1. Juster breakpoints i media queries i `style.css` for å tilpasse ulike skjermstørrelser
2. Tilpass chart.js-opsjoner i de ulike `dataXXXX.js`-filene for å optimalisere grafvisning på mobile enheter
3. Modifiser `handleResponsiveness()` i `common.js` for å justere hvordan applikasjonen oppfører seg på ulike skjermstørrelser

### Ytelsesoptimalisering

Applikasjonen bruker flere teknikker for å sikre god ytelse:

- Caching av JSON-data for å unngå unødvendige nettverkskall
- Debouncing av COP-slider-hendelser for å redusere unødvendige oppdateringer
- Lazy loading av grafer og innhold
- Effektive DOM-manipulasjonsstrategier

For å ytterligere forbedre ytelsen, vurder å:

1. Implementere Service Workers for offline-støtte
2. Optimalisere bilder og andre medieressurser
3. Vurdere mer avanserte caching-strategier for data

## Endre utseende

For å endre farger og utseende, modifiser CSS-variabler i `:root`-selektoren i `style.css`:

```css
:root {
    /* Hovedfarger */
    --primary-color: #0088a9;
    --secondary-color: #1e90ff;
    --accent-color: #ffaa33;
    
    /* Bakgrunnsfarger */
    --bg-light: #f5f5f5;
    --bg-dark: #121212;
    
    /* Tekst farger */
    --text-light: #333;
    --text-dark: #f5f5f5;
    
    /* COP slider farger */
    --cop-low: #ff4d4d;
    --cop-mid: #ffcc00;
    --cop-high: #4caf50;
    
    /* Andre variabler */
    --transition-speed: 0.3s;
    --border-radius: 8px;
}
```

Modifiser disse variablene for å endre applikasjonens fargepalett og utseende konsekvent gjennom hele grensesnittet.

## Bidrag

Bidrag til prosjektet er velkomne. Følg disse trinnene for å bidra:

1. Fork repoet
2. Opprett en feature branch (`git checkout -b feature/amazing-feature`)
3. Commit endringene dine (`git commit -m 'Legg til en amazing feature'`)
4. Push til branch (`git push origin feature/amazing-feature`)
5. Åpne en Pull Request

### Koderetningslinjer

For å opprettholde kodekvalitet og konsistens, vennligst følg disse retningslinjene:

- Bruk meningsfulle variabel- og funksjonsnavn
- Kommenter komplekse beregninger og logikk
- Hold funksjoner små og fokuserte
- Skriv responsive og tilgjengelig kode
- Test endringer på forskjellige enheter og nettlesere før innsending
- Oppdater dokumentasjonen når du legger til eller endrer funksjonalitet

## Lisens

Dette prosjektet er lisensiert under [MIT Lisens](LICENSE).

---

Utviklet med ❤️ for energieffektivisering og bærekraft.

---

## Tekniske detaljer

### Nøkkelfunksjoner i kodebasen

Her er en oversikt over noen av de viktigste funksjonene i applikasjonen:

#### I `common.js`:

- `initCOPControl()`: Setter opp COP-slideren med events, tooltips og visual feedback
- `recalculateData()`: Beregner alle dataavledede verdier basert på gjeldende COP
- `updateCharts()`: Oppdaterer alle grafer på gjeldende side
- `cacheJSON()`: Implementerer caching av JSON-data for bedre ytelse
- `handleResponsiveness()`: Håndterer responsive justeringer basert på skjermstørrelse

#### I `dataXXXX.js`:

- `createCharts()`: Lager års-spesifikke grafer og visualiseringer
- `updateTables()`: Oppdaterer tabellvisninger med beregnet data
- `calculateYearlyTotals()`: Regner sammen årlige totaler

For å få en dypere forståelse av hvordan applikasjonen fungerer, se kommentarene i koden og eksperimenter med å endre COP-verdier for å se hvordan dataene oppdateres i sanntid.
