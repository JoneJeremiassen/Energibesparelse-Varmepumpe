// Laster inn data ved oppstart
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Vis en lastemeldingsmelding
        showLoader(true);
        document.getElementById('loader').setAttribute('aria-label', 'Laster energidata...');
        
        // Vent til data er ferdig lastet
        const checkDataLoaded = async () => {
            // Vent på at dataene skal lastes inn hvis de ikke allerede er lastet
            if (data2023.length === 0 || data2024.length === 0 || data2025.length === 0) {
                try {
                    console.log('Starter lasting av data...');
                    
                    if (data2023.length === 0) {
                        // Hent rådata
                        console.log('Laster data for 2023...');
                        const rawData2023 = await fetchRawData('data/data2023.json');
                        
                        // Fjern eventuelle duplikate måneder (filtrer basert på unik måned)
                        const uniqueMonths = new Set();
                        const filteredData = rawData2023.filter(item => {
                            if (uniqueMonths.has(item.måned)) {
                                console.log(`Fjerner duplikat måned: ${item.måned}`);
                                return false;
                            }
                            uniqueMonths.add(item.måned);
                            return true;
                        });
                        
                        // Beregn dynamiske verdier basert på COP
                        data2023 = calculateDerivedValues(filteredData);
                        console.log("Ferdig med å laste data2023:", data2023.length, "måneder");
                    }                    if (data2024.length === 0) {
                        console.log('Laster data for 2024...');
                        const rawData2024 = await fetchRawData('data/data2024.json');
                        data2024 = calculateDerivedValues(rawData2024);
                        console.log("Ferdig med å laste data2024:", data2024.length, "måneder");
                    }
                    if (data2025.length === 0) {
                        console.log('Laster data for 2025...');
                        const rawData2025 = await fetchRawData('data/data2025.json');
                        data2025 = calculateDerivedValues(rawData2025);
                        console.log("Ferdig med å laste data2025:", data2025.length, "måneder");
                    }
                } catch (error) {
                    console.error("Feil ved datahenting:", error);
                    throw error;
                }
            }
        };
        
        try {
            await checkDataLoaded();
            console.log('Alle data er lastet inn, fortsetter med oppdatering av UI...');
        } catch (loadError) {
            console.error('Feil ved lasting av data:', loadError);
            document.getElementById('error-message').textContent = 
                `Feil ved lasting av data: ${loadError.message}`;
            document.getElementById('error-message').style.display = 'block';
        }
        
        // Kontroller at data faktisk er lastet - tillater å vise data selv om ikke alle datasett er tilgjengelige
        let missingData = [];
        if (data2023.length === 0) missingData.push("2023");
        if (data2024.length === 0) missingData.push("2024");
        if (data2025.length === 0) missingData.push("2025");
        
        if (missingData.length > 0) {
            console.warn(`Mangler data for år: ${missingData.join(", ")}`);
            document.getElementById('error-message').textContent = 
                `Merk: Kunne ikke laste inn data for ${missingData.join(", ")}. Viser tilgjengelige data.`;
            document.getElementById('error-message').style.display = 'block';
        }
        
        // Fortsett så lenge vi har noen data å vise
        if (data2023.length > 0 || data2024.length > 0 || data2025.length > 0) {
            // Initialiser UI
            updateStatistics();
            initializeSummaryChart();
            
            // Skjul loader og vis innhold
            showLoader(false);
        } else {
            console.error("Ingen data tilgjengelig etter lasting");
            document.getElementById('error-message').textContent = 
                'Kunne ikke laste inn noen data. Vennligst prøv igjen senere.';
            document.getElementById('error-message').style.display = 'block';
            showLoader(false);
        }
    } catch (error) {
        console.error('Feil ved oppstart:', error);
        document.getElementById('error-message').textContent = 
            'Kunne ikke laste inn data. Vennligst prøv igjen senere.';
        document.getElementById('error-message').style.display = 'block';
        showLoader(false);
    }
});

// Oppdaterer statistikkene øverst på siden
function updateStatistics() {
    // Sikre at det er noe data å jobbe med
    const hasData2023 = data2023 && data2023.length > 0;
    const hasData2024 = data2024 && data2024.length > 0;
    const hasData2025 = data2025 && data2025.length > 0;
    
    if (!hasData2023 && !hasData2024 && !hasData2025) {
        console.error("Mangler data for statistikkoppdatering");
        return;
    }
    
    // Beregn statistikk for hvert år
    const stats2023 = hasData2023 ? generateStatistics(data2023) : { 
        totalOppvarming: 0, totalSpart: 0, totalKostnadSpart: 0, availableMonths: 0 
    };
    const stats2024 = hasData2024 ? generateStatistics(data2024) : { 
        totalOppvarming: 0, totalSpart: 0, totalKostnadSpart: 0, availableMonths: 0 
    };    const stats2025 = hasData2025 ? generateStatistics(data2025) : { 
        totalOppvarming: 0, totalSpart: 0, totalKostnadSpart: 0, availableMonths: 0 
    };
    
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
    console.log('Initialiserer sammendragsgraf...');
    
    const chartElement = document.getElementById('summary-chart');
    if (!chartElement) {
        console.error("Kunne ikke finne summary-chart elementet");
        return;
    }
    
    // Hvis grafen allerede eksisterer, ødelegg den først
    const existingChart = Chart.getChart(chartElement);
    if (existingChart) {
        console.log('Fjerner eksisterende sammendragsgraf før ny opprettes');
        existingChart.destroy();
    }
    
    const ctx = chartElement.getContext('2d');
    if (!ctx) {
        console.error("Kunne ikke få 2d-kontekst fra canvas");
        return;
    }
    
    // Sikre at det er data å jobbe med
    const hasData2023 = data2023 && data2023.length > 0;
    const hasData2024 = data2024 && data2024.length > 0;
    const hasData2025 = data2025 && data2025.length > 0;
    
    if (!hasData2023 && !hasData2024 && !hasData2025) {
        console.error("Mangler data for grafoppdatering");
        return;
    }
    
    // Beregn månedlige besparelser for hvert år
    const savings2023 = hasData2023 ? data2023.map(m => m.estimertSpartKostnad || 0) : [];
    const savings2024 = hasData2024 ? data2024.map(m => m.estimertSpartKostnad || 0) : [];
    const savings2025 = hasData2025 ? data2025.map(m => m.estimertSpartKostnad || 0) : [];
    
    // Kombinere månedsnavn
    const allMonths = [
        ...(hasData2023 ? data2023.map(m => m.måned) : []), 
        ...(hasData2024 ? data2024.map(m => m.måned) : []), 
        ...(hasData2025 ? data2025.map(m => m.måned) : [])
    ];
    
    // Kombinere data i kronologisk rekkefølge
    // Opprett en array med alle år+måneder for sortering
    const combinedData = [];
    
    if (hasData2023) {
        data2023.forEach((month, index) => {
            // Hent år fra månedsnavn (f.eks. "Januar 2023" -> "2023")
            const år = month.måned.split(' ')[1] || '2023';
            
            combinedData.push({
                måned: month.måned,
                besparelse: savings2023[index],
                år: parseInt(år),
                sortKey: `${år}-${getMånedNummer(month.måned)}`
            });
        });
    }
    
    if (hasData2024) {
        data2024.forEach((month, index) => {
            const år = month.måned.split(' ')[1] || '2024';
            
            combinedData.push({
                måned: month.måned,
                besparelse: savings2024[index],
                år: parseInt(år),
                sortKey: `${år}-${getMånedNummer(month.måned)}`
            });
        });
    }
    
    if (hasData2025) {
        data2025.forEach((month, index) => {
            const år = month.måned.split(' ')[1] || '2025';
            
            combinedData.push({
                måned: month.måned,
                besparelse: savings2025[index],
                år: parseInt(år),
                sortKey: `${år}-${getMånedNummer(month.måned)}`
            });
        });
    }
    
    console.log('Data før sortering:', combinedData.map(d => d.måned));
    
    // Sorter dataene etter år og måned
    combinedData.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    
    console.log('Data etter sortering:', combinedData.map(d => d.måned));
    
    // Filtrer ut null-verdier
    const filteredData = combinedData.filter(item => item.besparelse !== null);
    
    // Opprett arrays for diagram
    const labels = filteredData.map(item => item.måned);
    const savingsData = filteredData.map(item => item.besparelse);
    
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

// NB: Bruker formatValue fra common.js - ikke dupliser funksjonen her

// NB: Bruker generateStatistics fra common.js - ikke dupliser funksjonen her

// NB: Bruker showLoader fra common.js - ikke dupliser funksjonen her
