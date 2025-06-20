// Globale variabler
let data2023 = [];
let data2024 = [];
let data2025 = [];
let varmepumpeCOP = 5.0; // Standard COP-verdi
let debounceTimer; // For å forhindre for mange oppdateringer ved COP-endring

// Mapper for månedsnavn til numerisk verdi for sortering
const månedTilNummer = {
    'Januar': '01', 'Februar': '02', 'Mars': '03', 'April': '04',
    'Mai': '05', 'Juni': '06', 'Juli': '07', 'August': '08',
    'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
};

// Funksjon for å hente månedens numeriske verdi fra månedsnavn
function getMånedNummer(månedNavn) {
    // Fjern årstall fra månedsnavn (f.eks. "Januar 2023" -> "Januar")
    const baseMåned = månedNavn.split(' ')[0];
    return månedTilNummer[baseMåned] || '00';
}

// Laster inn data ved oppstart
document.addEventListener('DOMContentLoaded', async () => {
    // Initialiser navigasjon
    initNavigation();
    
    try {
        showLoader(true);
        
        // Last inn data fra JSON-filer
        try {            console.log("Common.js: Starter datahenting");
            data2023 = await fetchData('data/data2023.json');
            console.log("Common.js: Data 2023 lastet, antall måneder:", data2023.length);
            data2024 = await fetchData('data/data2024.json');
            console.log("Common.js: Data 2024 lastet, antall måneder:", data2024.length);
            data2025 = await fetchData('data/data2025.json');
            console.log("Common.js: Data 2025 lastet, antall måneder:", data2025.length);
        } catch (fetchError) {
            console.error("Common.js: Feil ved datahenting:", fetchError);
            throw fetchError;
        }
        
        // La script.js håndtere innlasting for forsiden
        if (!window.location.pathname.includes('index.html') && !window.location.pathname.endsWith('/')) {
            showLoader(false);
        }
    } catch (error) {
        console.error('Common.js: Feil ved oppstart:', error);
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = 'Kunne ikke laste inn data. Vennligst prøv igjen senere.';
            errorElement.style.display = 'block';
        }
        showLoader(false);
    }
});

// Henter data fra JSON-filer
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        // Beregn dynamiske verdier basert på COP
        return data.map(month => {
            if (month.oppvarming === null || month.strømpris === null) {
                return month;
            }
            
            // Kalkuler dynamiske verdier basert på COP
            const medVarmepumpe = month.oppvarming / varmepumpeCOP;
            const spartStrøm = month.oppvarming - medVarmepumpe;
            const estimertSpartKostnad = spartStrøm * month.strømpris;
            
            return {
                ...month,
                medVarmepumpe,
                spartStrøm,
                estimertSpartKostnad
            };
        });
    } catch (error) {
        console.error('Feil ved henting av data:', error);
        throw error;
    }
}

// Initialiserer navigasjonsbar
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Lukk menyen når et link klikkes
        document.querySelectorAll('.nav-item').forEach(n => {
            n.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    } else {
        console.warn('Kunne ikke initialisere hamburger-meny - elementer mangler');
    }
    
    // Initialiser temabytte-funksjonalitet
    initThemeSwitch();
    
    // Initialiser COP-kontroller
    initCOPControl();
}

// Funksjon for å håndtere temabytte (dark/light mode)
function initThemeSwitch() {
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const themeIcon = document.querySelector('.theme-icon i');
    
    if (!toggleSwitch) return; // Gå ut hvis bryteren ikke finnes
    
    // Sjekk om brukeren har en foretrukket temainnstilling
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        toggleSwitch.checked = true;
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
    
    // Funksjonen som bytter tema
    function switchTheme(e) {
        if (e.target.checked) {
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        }    
    }
    
    // Legg til event listener for temabryteren
    toggleSwitch.addEventListener('change', switchTheme, false);
}

// Formaterer verdier for visning
function formatValue(value, unit = '') {
    if (value === null || value === undefined || value === '') {
        return '<span class="empty-cell">Ikke tilgjengelig</span>';
    }
    
    const formattedValue = typeof value === 'number' 
        ? value.toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : value;
    
    return unit ? `${formattedValue} ${unit}` : formattedValue;
}

// Beregner akkumulert besparelse
function calculateAccumulatedSavings(data, monthIndex) {
    let accumulated = 0;
    
    for (let i = 0; i <= monthIndex; i++) {
        if (data[i].estimertSpartKostnad !== null) {
            accumulated += data[i].estimertSpartKostnad;
        }
    }
    
    return accumulated;
}



// Viser eller skjuler lasteskjerm
function showLoader(show) {
    const loader = document.getElementById('loader');
    const content = document.getElementById('content');
    const errorMessage = document.getElementById('error-message');
    
    if (show) {
        if (loader) {
            loader.style.display = 'block';
            loader.setAttribute('aria-label', 'Laster data...');
        } else {
            console.warn('Kunne ikke vise loader - element mangler');
        }
        
        if (content) {
            content.style.display = 'none';
        }
        
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    } else {
        if (loader) {
            loader.style.display = 'none';
        }
        
        if (content) {
            content.style.display = 'block';
            
            // Legg til fade-in effekt når innholdet vises på nytt
            content.classList.add('fade-in-fast');
            setTimeout(() => {
                content.classList.remove('fade-in-fast');
            }, 500);
        } else {
            console.warn('Kunne ikke vise innhold - element mangler');
        }
    }
}

// Genererer statistikk
function generateStatistics(data, year) {
    // Beregn totalverdier
    let totalOppvarming = 0;
    let totalMedVarmepumpe = 0;
    let totalSpart = 0;
    let totalKostnadSpart = 0;
    let availableMonths = 0;
    
    data.forEach(month => {
        if (month.oppvarming !== null) {
            totalOppvarming += month.oppvarming;
            totalMedVarmepumpe += month.medVarmepumpe;
            totalSpart += month.spartStrøm;
            totalKostnadSpart += month.estimertSpartKostnad;
            availableMonths++;
        }
    });
    
    // Beregn gjennomsnittlig besparelse
    const avgSavings = availableMonths > 0 ? totalKostnadSpart / availableMonths : 0;
    const besparelsesProsent = totalOppvarming > 0 
        ? (totalSpart / totalOppvarming) * 100 
        : 0;
    
    // Returner statistikk
    return {
        totalOppvarming,
        totalMedVarmepumpe,
        totalSpart,
        totalKostnadSpart,
        avgSavings,
        besparelsesProsent,
        availableMonths
    };
}

// Funksjon for å håndtere COP-innstillinger
function initCOPControl() {
    // Sjekk om det finnes en lagret COP-verdi
    const storedCOP = localStorage.getItem('varmepumpeCOP');
    if (storedCOP) {
        varmepumpeCOP = parseFloat(storedCOP);
    }
    
    // Finn COP-kontrolleren eller opprett den hvis den ikke finnes
    let copContainer = document.querySelector('.cop-control-container');
    
    if (!copContainer) {
        // Opprett COP-kontroller hvis den ikke finnes
        copContainer = document.createElement('div');
        copContainer.className = 'cop-control-container';
        
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            navContainer.appendChild(copContainer);
        } else {
            console.warn('Kunne ikke finne .nav-container for å legge til COP-kontrollen');
            return; // Avslutt funksjonen hvis navContainer ikke finnes
        }
    }    // Opprett innholdet i COP-kontrolleren
    copContainer.innerHTML = `
        <div class="cop-control">
            <div class="cop-header">
                <label for="cop-slider">COP: <span id="cop-value">${varmepumpeCOP.toFixed(1)}</span></label>
                <div class="cop-control-buttons">                    <button id="reset-cop" title="Tilbakestill til standard verdi (5.0)">
                        <i class="fas fa-undo"></i>
                    </button>                    <div class="cop-info-tooltip">
                        <i class="fas fa-info-circle"></i>
                        <span class="tooltip-text">COP (Coefficient of Performance) angir hvor effektiv varmepumpen er. Typiske verdier: 1-2 = lav, 3-4 = middels, 5-6 = høy effektivitet.</span>
                    </div>
                </div>
            </div>
            <div class="slider-container">
                <input type="range" id="cop-slider" min="1" max="6" step="0.1" value="${varmepumpeCOP}">
                <div class="slider-labels">
                    <span>1.0</span>
                    <span>3.0</span>
                    <span>6.0</span>
                </div>
            </div>
        </div>
    `;
    
    // Legg til event listeners
    const copSlider = document.getElementById('cop-slider');
    const copValue = document.getElementById('cop-value');
    const resetCOP = document.getElementById('reset-cop');
    const infoIcon = document.querySelector('.cop-info-tooltip i');    // Sørg for at informasjonsikonet fungerer med både hover og klikk (for mobile enheter)
    if (infoIcon) {
        infoIcon.addEventListener('click', (e) => {
            const tooltipContainer = e.currentTarget.closest('.cop-info-tooltip');
            tooltipContainer.classList.toggle('active');
            e.stopPropagation();
        });
        
        // Lukk tooltip når man klikker hvor som helst ellers på siden
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.cop-info-tooltip')) {
                const tooltipContainers = document.querySelectorAll('.cop-info-tooltip');
                tooltipContainers.forEach(container => {
                    container.classList.remove('active');
                });
            }
        });
    }

    if (copSlider && copValue) {
        copSlider.addEventListener('input', (e) => {
            const newCOP = parseFloat(e.target.value);
            varmepumpeCOP = newCOP;
            copValue.textContent = newCOP.toFixed(1);
            localStorage.setItem('varmepumpeCOP', newCOP.toString());
            
            // Vis en mini-loader ved COP-verdien
            copValue.innerHTML = `<span class="cop-updating">${newCOP.toFixed(1)}</span>`;
            
            // Debounce - venter med å oppdatere til slideren stopper
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                // Oppdater dataene med ny COP-verdi
                await recalculateData();
                // Oppdater COP-visningen når dataene er klare
                copValue.textContent = newCOP.toFixed(1);
            }, 300);
        });
    }    if (resetCOP) {
        resetCOP.addEventListener('click', () => {
            varmepumpeCOP = 5.0;
            if (copSlider) copSlider.value = "5.0";
            if (copValue) {
                copValue.innerHTML = `<span class="cop-updating">5.0</span>`;
            }
            localStorage.setItem('varmepumpeCOP', "5.0");
              // Vis loading indikator og oppdater data
            setTimeout(async () => {
                // Oppdater dataene med ny COP-verdi
                await recalculateData();
                if (copValue) copValue.textContent = "5.0";
            }, 10);
        });    }
}

// Oppdaterer alle data med ny COP-verdi
async function recalculateData() {
    try {
        showLoader(true);
        
        // Last inn dataene på nytt fra JSON
        let rawData2023, rawData2024, rawData2025;
        
        try {
            rawData2023 = await fetchRawData('data/data2023.json');
            data2023 = calculateDerivedValues(rawData2023);
            console.log("Data 2023 rekalkukert med ny COP:", varmepumpeCOP);
        } catch (error) {
            console.error('Feil ved rekalkukering av 2023-data:', error);
        }
        
        try {
            rawData2024 = await fetchRawData('data/data2024.json');
            data2024 = calculateDerivedValues(rawData2024);
            console.log("Data 2024 rekalkukert med ny COP:", varmepumpeCOP);
        } catch (error) {
            console.error('Feil ved rekalkukering av 2024-data:', error);
        }
        
        try {
            rawData2025 = await fetchRawData('data/data2025.json');
            data2025 = calculateDerivedValues(rawData2025);
            console.log("Data 2025 rekalkukert med ny COP:", varmepumpeCOP);
        } catch (error) {
            console.error('Feil ved rekalkukering av 2025-data:', error);
        }
        
        // Oppdater UI avhengig av hvilken side vi er på
        const path = window.location.pathname;
        
        try {
            // Oppdater spesifikke sider
            if (path.includes('data2023.html')) {
                if (typeof updateStatistics2023 === 'function') updateStatistics2023();
                if (typeof initializeCharts2023 === 'function') initializeCharts2023();
                if (typeof populateTable2023 === 'function') populateTable2023();
            } else if (path.includes('data2024.html')) {
                if (typeof updateStatistics2024 === 'function') updateStatistics2024();
                if (typeof initializeCharts2024 === 'function') initializeCharts2024();
                if (typeof populateTable2024 === 'function') populateTable2024();
            } else if (path.includes('data2025.html')) {
                if (typeof updateStatistics2025 === 'function') updateStatistics2025();
                if (typeof initializeCharts2025 === 'function') initializeCharts2025();
                if (typeof populateTable2025 === 'function') populateTable2025();
            } else if (path.includes('index.html') || path.endsWith('/') || path.endsWith('\\')) {
                if (typeof updateStatistics === 'function') updateStatistics();
                if (typeof initializeSummaryChart === 'function') {
                    // Fjern den eksisterende chart først for å unngå duplisering
                    const chartElement = document.getElementById('summary-chart');
                    if (chartElement) {
                        const existingChart = Chart.getChart(chartElement);
                        if (existingChart) {
                            existingChart.destroy();
                        }
                        initializeSummaryChart();
                    }
                }
            }
            
            // Oppdater alle grafer ved å trigge en window resize event - dette får chart.js til å re-render
            window.dispatchEvent(new Event('resize'));
            
            console.log("UI er oppdatert med ny COP-verdi:", varmepumpeCOP);
        } catch (uiError) {
            console.error('Feil ved oppdatering av UI etter rekalkukering:', uiError);
        }
        
        showLoader(false);
    } catch (error) {
        console.error('Feil ved oppdatering av data:', error);
        showLoader(false);
    }
}

// Henter rådata fra JSON-filer uten å beregne dynamiske verdier
async function fetchRawData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        // Valider at data er et array
        if (!Array.isArray(data)) {
            throw new Error(`Ugyldig dataformat fra ${url}: Forventet array, fikk ${typeof data}`);
        }
        
        // Valider at hvert element har nødvendige egenskaper
        for (const item of data) {
            if (!item.hasOwnProperty('måned')) {
                console.warn(`Element mangler 'måned'-egenskap i ${url}`);
            }
            if (!item.hasOwnProperty('oppvarming')) {
                console.warn(`Element mangler 'oppvarming'-egenskap i ${url}`);
            }
            if (!item.hasOwnProperty('strømpris')) {
                console.warn(`Element mangler 'strømpris'-egenskap i ${url}`);
            }
        }
        
        return data;
    } catch (error) {
        console.error('Feil ved henting av rådata:', error);
        throw error;
    }
}

// Beregner dynamiske verdier basert på COP
function calculateDerivedValues(data) {
    if (!Array.isArray(data)) {
        console.error('Ugyldig data sendt til calculateDerivedValues: Forventet array');
        return [];
    }
    
    try {
        return data.map(month => {
            if (!month || typeof month !== 'object') {
                console.warn('Ugyldig månedsobjekt funnet i data');
                return {
                    måned: 'Ukjent',
                    oppvarming: null,
                    strømpris: null,
                    medVarmepumpe: null,
                    spartStrøm: null,
                    estimertSpartKostnad: null
                };
            }
            
            if (month.oppvarming === null || month.oppvarming === undefined || 
                month.strømpris === null || month.strømpris === undefined) {
                return {
                    ...month,
                    medVarmepumpe: null,
                    spartStrøm: null,
                    estimertSpartKostnad: null
                };            }
            
            // Sjekk at vi ikke får negative verdier eller div by zero
            if (varmepumpeCOP <= 0) {
                console.warn('Ugyldig COP-verdi (≤ 0) - bruker standardverdi 5.0');
                varmepumpeCOP = 5.0;
            }
            
            const medVarmepumpe = month.oppvarming / varmepumpeCOP;
            const spartStrøm = month.oppvarming - medVarmepumpe;
            const estimertSpartKostnad = spartStrøm * month.strømpris;
            
            return {
                ...month,
                medVarmepumpe,
                spartStrøm,
                estimertSpartKostnad
            };
        });
    } catch (error) {
        console.error('Feil ved beregning av dynamiske verdier:', error);
        return [];
    }
}
