// Globale variabler
let data2024 = [];
let data2025 = [];

// Laster inn data ved oppstart
document.addEventListener('DOMContentLoaded', async () => {
    // Initialiser navigasjon
    initNavigation();
    
    try {
        showLoader(true);
        
        // Last inn data fra JSON-filer
        try {
            console.log("Common.js: Starter datahenting");
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
        return await response.json();
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
