// Globale variabler
let data2023 = [];
let data2024 = [];
let data2025 = [];
let varmepumpeCOP = 5.0; // Standard SCOP-verdi
let debounceTimer; // For å forhindre for mange oppdateringer ved SCOP-endring

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
    
    // Initialiser responsivitet
    handleResponsiveness();
    
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
        // Beregn dynamiske verdier basert på SCOP
        return data.map(month => {
            if (month.oppvarming === null || month.strømpris === null) {
                return month;
            }
            
            // Kalkuler dynamiske verdier basert på SCOP
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

// Cache for rådata fra JSON-filer
const rawDataCache = {
    'data/data2023.json': null,
    'data/data2024.json': null,
    'data/data2025.json': null
};

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
    
    // Initialiser temabytte-funksjonalitet FØRST
    initThemeSwitch();
    
    // Markér aktiv navigasjonslink
    updateActiveNavigation();
    
    // Initialiser SCOP-kontroller ETTER temabytte
    initSCOPControl();
}

// Setter aktiv klasse på navigasjonslenker basert på gjeldende side
function updateActiveNavigation() {
    const path = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-links .nav-item');
    
    // Fjern aktiv klasse fra alle elementer først
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Sett aktiv klasse basert på gjeldende side
    if (path.includes('data2023.html')) {
        document.querySelector('.nav-item a[href*="data2023.html"]').parentElement.classList.add('active');
    } else if (path.includes('data2024.html')) {
        document.querySelector('.nav-item a[href*="data2024.html"]').parentElement.classList.add('active');
    } else if (path.includes('data2025.html')) {
        document.querySelector('.nav-item a[href*="data2025.html"]').parentElement.classList.add('active');
    } else if (path.includes('tilbud-varmepumper.html')) {
        document.querySelector('.nav-item a[href*="tilbud-varmepumper.html"]').parentElement.classList.add('active');
    }
    // Hvis ingen av sidene matcher (eller vi er på index.html), setter vi ingen nav-item som aktiv
    // siden logoen nå fungerer som hjemknapp
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
            // Fjern display: none inline-stil og legg til loading-klasse i stedet
            if (content.style.display === 'none') {
                content.style.removeProperty('display'); // Fjern inline style
            }
            content.classList.add('content-loading');
        }
        
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    } else {
        if (loader) {
            loader.style.display = 'none';
        }
        
        if (content) {
            // Vis innholdet og fjern loading-klassen
            content.style.display = 'block';
            content.classList.remove('content-loading');
            
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

// Funksjon for å håndtere SCOP-innstillinger
function initSCOPControl() {
    // Sjekk om det finnes en lagret SCOP-verdi
    const storedSCOP = localStorage.getItem('varmepumpeSCOP') || localStorage.getItem('varmepumpeCOP'); // Backward compatibility
    if (storedSCOP) {
        varmepumpeCOP = parseFloat(storedSCOP); // Vi beholder variabelnavnet for kompatibilitet
    }
    
    // Finn SCOP-kontrolleren eller opprett den hvis den ikke finnes
    let scopContainer = document.querySelector('.scop-control-container');
    
    if (!scopContainer) {
        // Opprett SCOP-kontroller hvis den ikke finnes
        scopContainer = document.createElement('div');
        scopContainer.className = 'scop-control-container';
        
        // Plassering: Vi flytter SCOP-slideren FØR theme-switch-wrapper
        const navContainer = document.querySelector('.nav-container');
        const themeSwitch = document.querySelector('.theme-switch-wrapper');
        
        if (navContainer && themeSwitch) {
            navContainer.insertBefore(scopContainer, themeSwitch);
        } else if (navContainer) {
            navContainer.appendChild(scopContainer);
        } else {
            console.warn('Kunne ikke finne .nav-container for å legge til SCOP-kontrollen');
            return; // Avslutt funksjonen hvis navContainer ikke finnes
        }
    }    // Opprett innholdet i SCOP-kontrolleren
    scopContainer.innerHTML = `
        <div class="scop-control">
            <div class="scop-header">
                <label for="scop-slider">SCOP: <span id="scop-value">${varmepumpeCOP.toFixed(1)}</span></label>
                <div class="scop-control-buttons">                    <button id="reset-scop" title="Tilbakestill til standard verdi (5.0)">
                        <i class="fas fa-undo"></i>
                    </button>                    <div class="scop-info-tooltip">
                        <i class="fas fa-info-circle"></i>
                        <span class="tooltip-text">SCOP (Seasonal Coefficient of Performance) angir varmepumpens gjennomsnittlige effektivitet over en hel oppvarmingssesong. Typiske verdier: 1,5-3 = lav, 3-4,5 = middels, 4,5-6 = høy effektivitet. De fleste varmepumper har SCOP over 1,5, og under dette er besparelsene minimale.</span>
                    </div>
                </div>
            </div>
            <div class="slider-container">
                <input type="range" id="scop-slider" min="1.5" max="6" step="0.1" value="${varmepumpeCOP}">
                <div class="slider-labels">
                    <span>1.5</span>
                    <span>3.5</span>
                    <span>6.0</span>
                </div>
            </div>
        </div>
    `;
    
    // Legg til event listeners
    const scopSlider = document.getElementById('scop-slider');
    const scopValue = document.getElementById('scop-value');
    const resetSCOP = document.getElementById('reset-scop');
    const infoIcon = document.querySelector('.scop-info-tooltip i');    // Sørg for at informasjonsikonet fungerer med både hover og klikk (for mobile enheter)
    if (infoIcon) {
        infoIcon.addEventListener('click', (e) => {
            const tooltipContainer = e.currentTarget.closest('.scop-info-tooltip');
            tooltipContainer.classList.toggle('active');
            e.stopPropagation();
        });
        
        // Lukk tooltip når man klikker hvor som helst ellers på siden
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.scop-info-tooltip')) {
                const tooltipContainers = document.querySelectorAll('.scop-info-tooltip');
                tooltipContainers.forEach(container => {
                    container.classList.remove('active');
                });
            }
        });
    }

    if (scopSlider && scopValue) {
        scopSlider.addEventListener('input', (e) => {            const newSCOP = parseFloat(e.target.value);
            varmepumpeCOP = newSCOP; // Beholder variabelnavnet for kompatibilitet
            scopValue.textContent = newSCOP.toFixed(1);
            localStorage.setItem('varmepumpeSCOP', newSCOP.toString());
            
            // Vis en mini-loader ved SCOP-verdien
            scopValue.innerHTML = `<span class="scop-updating">${newSCOP.toFixed(1)}</span>`;
            
            // Lagre nåværende scroll-posisjon
            const scrollPosition = window.scrollY || document.documentElement.scrollTop;
            
            // Debounce - venter med å oppdatere til slideren stopper
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                // Oppdater dataene med ny SCOP-verdi
                await recalculateData();
                // Oppdater SCOP-visningen når dataene er klare
                scopValue.textContent = newSCOP.toFixed(1);
                
                // Gjenopprett scroll-posisjon etter oppdatering
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'auto' // 'auto' istedenfor 'smooth' for å unngå synlig bevegelse
                });
            }, 300);
        });
    }    if (resetSCOP) {        resetSCOP.addEventListener('click', () => {
            varmepumpeCOP = 5.0;
            if (scopSlider) scopSlider.value = "5.0";
            if (scopValue) {
                scopValue.innerHTML = `<span class="scop-updating">5.0</span>`;
            }
            localStorage.setItem('varmepumpeSCOP', "5.0");
            
            // Lagre nåværende scroll-posisjon
            const scrollPosition = window.scrollY || document.documentElement.scrollTop;
            
            // Vis loading indikator og oppdater data
            setTimeout(async () => {
                // Oppdater dataene med ny SCOP-verdi
                await recalculateData();
                if (scopValue) scopValue.textContent = "5.0";
                
                // Gjenopprett scroll-posisjon etter oppdatering
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'auto'
                });
            }, 10);
        });    }
}

// Oppdaterer alle data med ny SCOP-verdi
async function recalculateData() {
    // Lagre nåværende scroll-posisjon
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    
    try {
        showLoader(true);
        
        // Last inn dataene på nytt fra JSON
        let rawData2023, rawData2024, rawData2025;            try {
                rawData2023 = await fetchRawData('data/data2023.json');
                data2023 = calculateDerivedValues(rawData2023);
                console.log("Data 2023 rekalkukert med ny SCOP:", varmepumpeCOP);
            } catch (error) {
                console.error('Feil ved rekalkukering av 2023-data:', error);
            }
            
            try {
                rawData2024 = await fetchRawData('data/data2024.json');
                data2024 = calculateDerivedValues(rawData2024);
                console.log("Data 2024 rekalkukert med ny SCOP:", varmepumpeCOP);
            } catch (error) {
                console.error('Feil ved rekalkukering av 2024-data:', error);
            }
            
            try {
                rawData2025 = await fetchRawData('data/data2025.json');
                data2025 = calculateDerivedValues(rawData2025);
                console.log("Data 2025 rekalkukert med ny SCOP:", varmepumpeCOP);
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
            
            console.log("UI er oppdatert med ny SCOP-verdi:", varmepumpeCOP);
        } catch (uiError) {
            console.error('Feil ved oppdatering av UI etter rekalkukering:', uiError);        }
        
        showLoader(false);
        
        // Gjenopprett scroll-posisjon etter oppdatering
        window.scrollTo({
            top: scrollPosition,
            behavior: 'auto'
        });
    } catch (error) {
        console.error('Feil ved oppdatering av data:', error);
        showLoader(false);
        
        // Fortsatt gjenopprett scroll-posisjon selv om det oppstod en feil
        window.scrollTo({
            top: scrollPosition,
            behavior: 'auto'
        });
    }
}

// Henter rådata fra JSON-filer uten å beregne dynamiske verdier
async function fetchRawData(url) {
    // Sjekk om data allerede er i cache
    if (rawDataCache[url]) {
        console.log(`Bruker cache for ${url}`);
        return rawDataCache[url];
    }
    
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
        
        // Lagre i cache
        rawDataCache[url] = data;
        
        return data;
    } catch (error) {
        console.error('Feil ved henting av rådata:', error);
        throw error;
    }
}

// Beregner dynamiske verdier basert på SCOP
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
            
            if (month.oppvarming === null || month.oppvarming === undefined ||                month.strømpris === null || month.strømpris === undefined) {
                return {
                    ...month,
                    medVarmepumpe: null,
                    spartStrøm: null,
                    estimertSpartKostnad: null
                };
            }
            
            // Sjekk at vi ikke får negative verdier eller for lave verdier som kan gi merkelige resultater
            if (varmepumpeCOP <= 0) {
                console.warn('Ugyldig SCOP-verdi (≤ 0) - bruker standardverdi 5.0');
                varmepumpeCOP = 5.0;
            }
            
            // Ved veldig lave SCOP-verdier (nær 1.0) vil beregningene gi veldig små besparelser
            // Vi håndterer dette særskilt for å unngå fremvisning av merkelige verdier
            if (varmepumpeCOP < 1.2) {
                return {
                    ...month,
                    medVarmepumpe: month.oppvarming,
                    spartStrøm: 0,
                    estimertSpartKostnad: 0
                };
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

// Funksjon for å håndtere responsivitet og grafer på mobile enheter
function handleResponsiveness() {
    const isMobile = window.innerWidth < 768;
    
    // Justering av graf-alternativer basert på skjermstørrelse
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.size = isMobile ? 10 : 12;
        Chart.defaults.plugins.legend.labels.boxWidth = isMobile ? 10 : 15;
        Chart.defaults.plugins.legend.position = isMobile ? 'bottom' : 'top';
    }
    
    // Eventuelle andre responsivitetsendringer kan legges inn her
    
    // Re-render alle grafer
    window.dispatchEvent(new Event('resize'));
}

// Legg til lytter for vindusstørrelseendringer
window.addEventListener('resize', handleResponsiveness);
