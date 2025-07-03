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
- **Informativ SCOP-slider**: Med fargegradient, markeringer, og informasjonspopup for bedre forståelse.
- **Årsbaserte Dataoversikter**: Separate sider for energidata fra 2023, 2024 og 2025.
- **Sammenligning av Varmepumper**: Side som sammenligner ulike varmepumpetilbud med pris, effekt, lydnivå og andre spesifikasjoner.
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
├── tilbud-varmepumper.html # Side for sammenligning av varmepumpetilbud
├── css/
│   └── style.css           # Hovedstilark
├── js/
│   ├── common.js           # Felles funksjoner og globale variabler
│   ├── script.js           # JavaScript for forsiden
│   ├── data2023.js         # JavaScript for 2023-siden
│   ├── data2024.js         # JavaScript for 2024-siden
│   ├── data2025.js         # JavaScript for 2025-siden
│   └── table-sort.js       # Sorteringsfunksjonalitet for varmepumpetabellen
└── data/
    ├── data2023.json       # Energidata for 2023
    ├── data2024.json       # Energidata for 2024
    └── data2025.json       # Energidata for 2025
```

## Installasjon og Oppsett

Prosjektet krever ingen installasjon eller konfigurasjon av server, da det er bygget med ren front-end teknologi.

For å sette opp prosjektet lokalt:

1. Klon repositoriet:
   ```bash
   git clone https://github.com/JoneJeremiassen/Energibesparelse-Varmepumpe.git
   ```

2. Naviger til prosjektmappen:
   ```bash
   cd Energibesparelse-Varmepumpe
   ```

3. Åpne `index.html` i en nettleser.

Alternativt kan du hoste filene på en hvilken som helst webserver eller hosting-plattform som støtter statiske nettsider (GitHub Pages, Netlify, Vercel, etc.).

## Bruk

1. **Hovedside**: Gir en oversikt over samlet energibesparelse for perioden 2023-2025
2. **Årsvisninger**: Navigér til de spesifikke årssidene for detaljert data for hvert år
3. **SCOP-justering**: Bruk slideren for å justere varmepumpens effektivitet og se hvordan det påvirker besparelsene
4. **Varmepumpesammenligning**: Se sammenligning av ulike varmepumper og deres spesifikasjoner
5. **Sortering**: Klikk på kolonneoverskrifter i tabeller for å sortere dataene
6. **Mørk/lys modus**: Bytt mellom lys og mørk modus med bryteren i toppmenyens høyre hjørne

## Datastruktur

Prosjektet bruker følgende datastruktur i JSON-filene:

```json
[
  {
    "måned": "Januar 2023",
    "oppvarming": 476,
    "strømpris": 1.67
  },
  ...
]
```

Hvor:
- `måned`: Navn på måned og år
- `oppvarming`: Faktisk strømforbruk til oppvarming i kWh
- `strømpris`: Gjennomsnittlig strømpris for måneden i NOK per kWh

Øvrige verdier beregnes dynamisk basert på brukerens valgte SCOP-verdi.

## Beregninger

Hovedberegningene i systemet er:

1. **Oppvarming med varmepumpe**: 
   ```
   medVarmepumpe = oppvarming / varmepumpeCOP
   ```

2. **Energibesparelse**:
   ```
   besparelse = oppvarming - medVarmepumpe
   ```

3. **Kostnadsbesparelse**:
   ```
   kostnadsbesparelse = besparelse * strømpris
   ```

## Tilpasninger

Prosjektet kan tilpasses på flere måter:

1. **Legge til nye år**: Kopier eksisterende årsfil (HTML og JS) og endre årstall
2. **Nye data**: Legg til nye datapunkter i JSON-filene
3. **Design**: Tilpass farger og stiler i CSS-filen
4. **Nye varmepumper**: Utvid varmepumpetabellen med flere modeller

## Bidrag

Bidrag til prosjektet er velkomne! For å bidra:

1. Fork repositoriet
2. Opprett en ny branch for din funksjonalitet (`git checkout -b funksjonalitet/amazing-feature`)
3. Commit endringene dine (`git commit -m 'Legg til ny funksjonalitet'`)
4. Push til branchen (`git push origin funksjonalitet/amazing-feature`)
5. Åpne en Pull Request

## Lisens

Dette prosjektet er lisensiert under MIT-lisensen - se [LICENSE](LICENSE) filen for detaljer.

---

Utviklet med ❤️ for energieffektivisering og bærekraft.

---

## Tekniske detaljer

### Nøkkelfunksjoner i kodebasen

Her er en oversikt over noen av de viktigste funksjonene i applikasjonen:

#### I `common.js`:

- `initCOPControl()`: Setter opp SCOP-slideren med events, tooltips og visual feedback
- `recalculateData()`: Beregner alle dataavledede verdier basert på gjeldende COP
- `updateCharts()`: Oppdaterer alle grafer på gjeldende side
- `cacheJSON()`: Implementerer caching av JSON-data for bedre ytelse
- `handleResponsiveness()`: Håndterer responsive justeringer basert på skjermstørrelse

#### I `dataXXXX.js`:

- `createCharts()`: Lager års-spesifikke grafer og visualiseringer
- `updateTables()`: Oppdaterer tabellvisninger med beregnet data
- `calculateYearlyTotals()`: Regner sammen årlige totaler

For å få en dypere forståelse av hvordan applikasjonen fungerer, se kommentarene i koden og eksperimenter med å endre COP-verdier for å se hvordan dataene oppdateres i sanntid.
