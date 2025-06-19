// Laster inn data ved oppstart
document.addEventListener('DOMContentLoaded', async () => {
    try {
        showLoader(true);
        
        // Last inn data fra JSON-filer hvis ikke allerede lastet
        if (data2024.length === 0) {
            data2024 = await fetchData('data/data2024.json');
        }
        if (data2025.length === 0) {
            data2025 = await fetchData('data/data2025.json');
        }
        
        // Initialiser UI
        updateStatistics();
        initializeSummaryChart();
        
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
    // Beregn statistikk for 2024
    const stats2024 = generateStatistics(data2024);
    
    // Beregn statistikk for 2025
    const stats2025 = generateStatistics(data2025);
    
    // Kombiner statistikk for begge år
    const totalOppvarming = stats2024.totalOppvarming + stats2025.totalOppvarming;
    const totalSpart = stats2024.totalSpart + stats2025.totalSpart;
    const totalKostnadSpart = stats2024.totalKostnadSpart + stats2025.totalKostnadSpart;
    const besparelsesProsent = totalOppvarming > 0 
        ? (totalSpart / totalOppvarming) * 100 
        : 0;
    const availableMonths = stats2024.availableMonths + stats2025.availableMonths;
    const avgSavings = availableMonths > 0 ? totalKostnadSpart / availableMonths : 0;
    
    // Oppdater statistikk på forsiden
    document.getElementById('total-oppvarming').textContent = 
        `${totalOppvarming.toLocaleString('nb-NO')} kWh`;
    document.getElementById('total-sparing').textContent = 
        `${totalSpart.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kWh`;
    document.getElementById('prosent-sparing').textContent = 
        `${besparelsesProsent.toLocaleString('nb-NO', { maximumFractionDigits: 1 })}%`;
    document.getElementById('total-kostnadsbesparelse').textContent = 
        `${totalKostnadSpart.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kr`;
    document.getElementById('snitt-besparelse').textContent = 
        `${avgSavings.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kr`;
}

// Initialiserer sammendragsgrafen på forsiden
function initializeSummaryChart() {
    const ctx = document.getElementById('summary-chart').getContext('2d');
    
    // Beregn månedlige besparelser for 2024
    const savings2024 = data2024.map(m => m.estimertSpartKostnad);
    
    // Beregn månedlige besparelser for 2025 (tilgjengelig data)
    const savings2025 = data2025.map(m => m.estimertSpartKostnad);
    
    // Kombinere månedsnavn
    const allMonths = [...data2024.map(m => `${m.måned} 2024`), ...data2025.map(m => `${m.måned} 2025`)];
    
    // Kombinere data
    const allSavings = [...savings2024, ...savings2025];
    
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

// Håndterer tab-funksjonalitet
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            currentYear = tab.getAttribute('data-year');
            showYear(currentYear);
            updateStatistics();
            updateChart();
        });
    });
}

// Viser data for valgt år
function showYear(year) {
    const tableBody = document.getElementById('data-table-body');
    tableBody.innerHTML = '';
    
    const data = year === '2024' ? data2024 : data2025;
    
    data.forEach(month => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${year}</td>
            <td>${month.måned}</td>
            <td>${formatValue(month.oppvarming)}</td>
            <td>${formatValue(month.medVarmepumpe)}</td>
            <td>${formatValue(month.spartStrøm)}</td>
            <td>${formatValue(month.strømpris, 'kr')}</td>
            <td>${formatValue(month.estimertSpartKostnad, 'kr')}</td>
        `;
        
        tableBody.appendChild(row);
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

// Oppdaterer statistikkene øverst på siden
function updateStatistics() {
    const data = currentYear === '2024' ? data2024 : data2025;
    
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
    
    // Oppdater statistikk
    document.getElementById('total-oppvarming').textContent = 
        `${totalOppvarming.toLocaleString('nb-NO')} kWh`;
    document.getElementById('total-sparing').textContent = 
        `${totalSpart.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kWh`;
    document.getElementById('prosent-sparing').textContent = 
        `${besparelsesProsent.toLocaleString('nb-NO', { maximumFractionDigits: 1 })}%`;
    document.getElementById('total-kostnadsbesparelse').textContent = 
        `${totalKostnadSpart.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kr`;
    document.getElementById('snitt-besparelse').textContent = 
        `${avgSavings.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kr`;
}

// Initialiserer Chart.js grafer
function initializeCharts() {
    const ctx = document.getElementById('energy-chart').getContext('2d');
    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data2024.map(m => m.måned),
            datasets: [
                {
                    label: 'Oppvarming uten varmepumpe (kWh)',
                    data: data2024.map(m => m.oppvarming),
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Oppvarming med varmepumpe (kWh)',
                    data: data2024.map(m => m.medVarmepumpe),
                    backgroundColor: 'rgba(39, 174, 96, 0.7)',
                    borderColor: 'rgba(39, 174, 96, 1)',
                    borderWidth: 1
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
                        text: 'Strømforbruk (kWh)'
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
                                }) + ' kWh';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
    
    // Initialize savings chart
    const ctxSavings = document.getElementById('savings-chart').getContext('2d');
    new Chart(ctxSavings, {
        type: 'line',
        data: {
            labels: data2024.map(m => m.måned),
            datasets: [
                {
                    label: 'Estimert kostnadsbesparelse (kr)',
                    data: data2024.map(m => m.estimertSpartKostnad),
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
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
                        text: 'Besparelse (kr)'
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

// Oppdaterer Chart.js grafen når året endres
function updateChart() {
    const data = currentYear === '2024' ? data2024 : data2025;
    
    chartInstance.data.datasets[0].data = data.map(m => m.oppvarming);
    chartInstance.data.datasets[1].data = data.map(m => m.medVarmepumpe);
    
    chartInstance.update();
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
