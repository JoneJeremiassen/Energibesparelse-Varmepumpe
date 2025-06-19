// Laster inn data ved oppstart
document.addEventListener('DOMContentLoaded', async () => {
    try {
        showLoader(true);
          // Vent til data er ferdig lastet
        const checkDataLoaded = async () => {
            // Vent på at dataene skal lastes inn hvis de ikke allerede er lastet
            if (data2023.length === 0 || data2024.length === 0 || data2025.length === 0) {
                try {
                    if (data2023.length === 0) {
                        data2023 = await fetchData('data/data2023.json');
                        
                        // Fjern eventuelle duplikate måneder (filtrer basert på unik måned)
                        const uniqueMonths = new Set();
                        data2023 = data2023.filter(item => {
                            if (uniqueMonths.has(item.måned)) {
                                console.log(`Fjerner duplikat måned: ${item.måned}`);
                                return false;
                            }
                            uniqueMonths.add(item.måned);
                            return true;
                        });
                    }
                    if (data2024.length === 0) {
                        data2024 = await fetchData('data/data2024.json');
                    }
                    if (data2025.length === 0) {
                        data2025 = await fetchData('data/data2025.json');
                    }
                } catch (error) {
                    console.error("Feil ved datahenting:", error);
                    throw error;
                }
            }
        };
        
        await checkDataLoaded();
          // Kontroller at data faktisk er lastet
        if (data2023.length > 0 && data2024.length > 0 && data2025.length > 0) {
            // Initialiser UI
            updateStatistics();
            initializeSummaryChart();
        } else {
            console.error("Ingen data tilgjengelig etter lasting");
            document.getElementById('error-message').textContent = 
                'Kunne ikke laste inn data. Vennligst prøv igjen senere.';
        }
        
        showLoader(false);
    } catch (error) {
        console.error('Feil ved oppstart:', error);
        document.getElementById('error-message').textContent = 
            'Kunne ikke laste inn data. Vennligst prøv igjen senere.';
        showLoader(false);
    }
});

// Oppdaterer statistikkene øverst på siden
function updateStatistics() {
    // Sikre at det er data å jobbe med
    if (!data2023 || !data2024 || !data2025 || data2023.length === 0 || data2024.length === 0 || data2025.length === 0) {
        console.error("Mangler data for statistikkoppdatering");
        return;
    }
    
    // Beregn statistikk for alle år
    const stats2023 = generateStatistics(data2023);
    const stats2024 = generateStatistics(data2024);
    const stats2025 = generateStatistics(data2025);
    
    // Kombiner statistikk for alle år
    const totalOppvarming = stats2023.totalOppvarming + stats2024.totalOppvarming + stats2025.totalOppvarming;
    const totalSpart = stats2023.totalSpart + stats2024.totalSpart + stats2025.totalSpart;
    const totalKostnadSpart = stats2023.totalKostnadSpart + stats2024.totalKostnadSpart + stats2025.totalKostnadSpart;
    const besparelsesProsent = totalOppvarming > 0 
        ? (totalSpart / totalOppvarming) * 100 
        : 0;
    const availableMonths = stats2023.availableMonths + stats2024.availableMonths + stats2025.availableMonths;
    const avgSavings = availableMonths > 0 ? totalKostnadSpart / availableMonths : 0;
    
    // Oppdater statistikk på forsiden
    const totalOppvarmingElement = document.getElementById('total-oppvarming');
    if (totalOppvarmingElement) {
        totalOppvarmingElement.textContent = `${totalOppvarming.toLocaleString('nb-NO')} kWh`;
    }
    
    const totalSparingElement = document.getElementById('total-sparing');
    if (totalSparingElement) {
        totalSparingElement.textContent = `${totalSpart.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kWh`;
    }
    
    const prosentSparingElement = document.getElementById('prosent-sparing');
    if (prosentSparingElement) {
        prosentSparingElement.textContent = `${besparelsesProsent.toLocaleString('nb-NO', { maximumFractionDigits: 1 })}%`;
    }
    
    const totalKostnadsbesparelseElement = document.getElementById('total-kostnadsbesparelse');
    if (totalKostnadsbesparelseElement) {
        totalKostnadsbesparelseElement.textContent = `${totalKostnadSpart.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kr`;
    }
    
    const snittBesparelseElement = document.getElementById('snitt-besparelse');
    if (snittBesparelseElement) {
        snittBesparelseElement.textContent = `${avgSavings.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kr`;
    }
}

// Initialiserer sammendragsgrafen på forsiden
function initializeSummaryChart() {
    const chartElement = document.getElementById('summary-chart');
    if (!chartElement) {
        console.error("Kunne ikke finne summary-chart elementet");
        return;
    }
    
    const ctx = chartElement.getContext('2d');
    if (!ctx) {
        console.error("Kunne ikke få 2d-kontekst fra canvas");
        return;
    }
    
    // Sikre at det er data å jobbe med
    if (!data2023 || !data2024 || !data2025 || data2023.length === 0 || data2024.length === 0 || data2025.length === 0) {
        console.error("Mangler data for grafoppdatering");
        return;
    }
    
    // Beregn månedlige besparelser for hvert år
    const savings2023 = data2023.map(m => m.estimertSpartKostnad);
    const savings2024 = data2024.map(m => m.estimertSpartKostnad);
    const savings2025 = data2025.map(m => m.estimertSpartKostnad);
    
    // Kombinere månedsnavn
    const allMonths = [
        ...data2023.map(m => `${m.måned} 2023`), 
        ...data2024.map(m => `${m.måned} 2024`), 
        ...data2025.map(m => `${m.måned} 2025`)
    ];
    
    // Kombinere data
    const allSavings = [...savings2023, ...savings2024, ...savings2025];
    
    // Filtering out null values while preserving structure
    const labels = [];
    const savingsData = [];
    
    allMonths.forEach((month, index) => {
        if (allSavings[index] !== null) {
            labels.push(month);
            savingsData.push(allSavings[index]);
        }
    });
    
    // Calculate accumulated savings
    const accumulatedSavings = [];
    let runningTotal = 0;
    
    savingsData.forEach(value => {
        runningTotal += value;
        accumulatedSavings.push(runningTotal);
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Månedlig besparelse (kr)',
                    data: savingsData,
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                },
                {
                    type: 'line',
                    label: 'Akkumulert besparelse (kr)',
                    data: accumulatedSavings,
                    backgroundColor: 'rgba(39, 174, 96, 0.2)',
                    borderColor: 'rgba(39, 174, 96, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(39, 174, 96, 1)',
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Månedlig besparelse (kr)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Akkumulert besparelse (kr)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Måned'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toLocaleString('nb-NO', { 
                                    maximumFractionDigits: 2 
                                }) + ' kr';
                            }
                            return label;
                        }
                    }
                }
            }
        }
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

// Hjelpefunksjon for å generere statistikk for et bestemt år
function generateStatistics(data) {
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
    
    return {
        totalOppvarming,
        totalMedVarmepumpe,
        totalSpart,
        totalKostnadSpart,
        availableMonths
    };
}

// Viser eller skjuler lasteskjerm
function showLoader(show) {
    const loader = document.getElementById('loader');
    const content = document.getElementById('content');
    
    if (show) {
        loader.style.display = 'block';
        content.style.display = 'none';
    } else {
        loader.style.display = 'none';
        content.style.display = 'block';
    }
}
