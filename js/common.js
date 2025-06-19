// Globale variabler
let data2023 = [];
let data2024 = [];
let data2025 = [];
let varmepumpeCOP = 5.0; // Standard COP-verdi

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
    
    if (show) {
        if (loader) loader.style.display = 'block';
        if (content) content.style.display = 'none';
    } else {
        if (loader) loader.style.display = 'none';
        if (content) content.style.display = 'block';
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
        }
    }
    
    // Opprett innholdet i COP-kontrolleren
    copContainer.innerHTML = `
        <div class="cop-control">
            <label for="cop-slider">Varmepumpe COP: <span id="cop-value">${varmepumpeCOP.toFixed(1)}</span></label>
            <input type="range" id="cop-slider" min="1" max="10" step="0.1" value="${varmepumpeCOP}">
            <button id="reset-cop" title="Tilbakestill til standard verdi (5.0)">
                <i class="fas fa-undo"></i>
            </button>
        </div>
    `;
    
    // Legg til event listeners
    const copSlider = document.getElementById('cop-slider');
    const copValue = document.getElementById('cop-value');
    const resetCOP = document.getElementById('reset-cop');
    
    if (copSlider && copValue) {
        copSlider.addEventListener('input', async (e) => {
            const newCOP = parseFloat(e.target.value);
            varmepumpeCOP = newCOP;
            copValue.textContent = newCOP.toFixed(1);
            localStorage.setItem('varmepumpeCOP', newCOP.toString());
            
            // Oppdater dataene med ny COP-verdi
            await recalculateData();
        });
    }
    
    if (resetCOP) {
        resetCOP.addEventListener('click', async () => {
            varmepumpeCOP = 5.0;
            if (copSlider) copSlider.value = "5.0";
            if (copValue) copValue.textContent = "5.0";
            localStorage.setItem('varmepumpeCOP', "5.0");
            
            // Oppdater dataene med ny COP-verdi
            await recalculateData();
        });
    }
}

// Oppdaterer alle data med ny COP-verdi
async function recalculateData() {
    try {
        showLoader(true);
        
        // Last inn dataene på nytt fra JSON
        const rawData2023 = await fetchRawData('data/data2023.json');
        const rawData2024 = await fetchRawData('data/data2024.json');
        const rawData2025 = await fetchRawData('data/data2025.json');
        
        // Beregn nye verdier basert på oppdatert COP
        data2023 = calculateDerivedValues(rawData2023);
        data2024 = calculateDerivedValues(rawData2024);
        data2025 = calculateDerivedValues(rawData2025);
        
        // Oppdater UI avhengig av hvilken side vi er på
        const path = window.location.pathname;
        
        if (path.includes('data2023.html')) {
            updateStatistics2023();
            initializeCharts2023();
            populateTable2023();
        } else if (path.includes('data2024.html')) {
            updateStatistics2024();
            initializeCharts2024();
            populateTable2024();
        } else if (path.includes('data2025.html')) {
            updateStatistics2025();
            initializeCharts2025();
            populateTable2025();
        } else if (path.includes('index.html') || path.endsWith('/')) {
            updateStatistics();
            initializeSummaryChart();
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
        return await response.json();
    } catch (error) {
        console.error('Feil ved henting av rådata:', error);
        throw error;
    }
}

// Beregner dynamiske verdier basert på COP
function calculateDerivedValues(data) {
    return data.map(month => {
        if (month.oppvarming === null || month.strømpris === null) {
            return {
                ...month,
                medVarmepumpe: null,
                spartStrøm: null,
                estimertSpartKostnad: null
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
}
