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
        updateStatistics2025();
        initializeCharts2025();
        populateTable2025();
        initializePrognosisChart();
        
        showLoader(false);
    } catch (error) {
        console.error('Feil ved oppstart:', error);
        document.getElementById('error-message').textContent = 
            'Kunne ikke laste inn data. Vennligst prøv igjen senere.';
        showLoader(false);
    }
});

// Oppdaterer statistikkene for 2025
function updateStatistics2025() {
    // Beregn statistikk for 2025
    const stats = generateStatistics(data2025);
    
    // Oppdater statistikk på 2025-siden
    document.getElementById('total-oppvarming-2025').textContent = 
        `${stats.totalOppvarming.toLocaleString('nb-NO')} kWh`;
    document.getElementById('total-sparing-2025').textContent = 
        `${stats.totalSpart.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kWh`;
    document.getElementById('prosent-sparing-2025').textContent = 
        `${stats.besparelsesProsent.toLocaleString('nb-NO', { maximumFractionDigits: 1 })}%`;
    document.getElementById('total-kostnadsbesparelse-2025').textContent = 
        `${stats.totalKostnadSpart.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kr`;
}

// Initialiserer grafer for 2025
function initializeCharts2025() {
    // Energiforbruksgraf
    const ctxEnergy = document.getElementById('energy-chart-2025').getContext('2d');
    new Chart(ctxEnergy, {
        type: 'bar',
        data: {
            labels: data2025.map(m => m.måned),
            datasets: [
                {
                    label: 'Oppvarming uten varmepumpe (kWh)',
                    data: data2025.map(m => m.oppvarming),
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Oppvarming med varmepumpe (kWh)',
                    data: data2025.map(m => m.medVarmepumpe),
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
    
    // Besparelsesgraf
    const ctxSavings = document.getElementById('savings-chart-2025').getContext('2d');
    new Chart(ctxSavings, {
        type: 'line',
        data: {
            labels: data2025.filter(m => m.estimertSpartKostnad !== null).map(m => m.måned),
            datasets: [
                {
                    label: 'Estimert kostnadsbesparelse (kr)',
                    data: data2025.filter(m => m.estimertSpartKostnad !== null).map(m => m.estimertSpartKostnad),
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
    
    // Strømprisgraf
    const ctxPrice = document.getElementById('price-chart-2025').getContext('2d');
    new Chart(ctxPrice, {
        type: 'line',
        data: {
            labels: data2025.filter(m => m.strømpris !== null).map(m => m.måned),
            datasets: [
                {
                    label: 'Strømpris (kr/kWh)',
                    data: data2025.filter(m => m.strømpris !== null).map(m => m.strømpris),
                    backgroundColor: 'rgba(241, 196, 15, 0.2)',
                    borderColor: 'rgba(241, 196, 15, 1)',
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
                        text: 'Pris (kr/kWh)'
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
                                    maximumFractionDigits: 3 
                                }) + ' kr/kWh';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Fyller tabellen med data for 2025
function populateTable2025() {
    const tableBody = document.getElementById('data-table-body-2025');
    tableBody.innerHTML = '';
    
    let totalOppvarming = 0;
    let totalMedVarmepumpe = 0;
    let totalSpart = 0;
    let totalStrompris = 0;
    let totalKostnadSpart = 0;
    let validMonths = 0;
    
    data2025.forEach((month, index) => {
        if (month.oppvarming !== null) {
            // Beregn akkumulert besparelse
            const accumulated = calculateAccumulatedSavings(data2025, index);
            
            // Sumering for footer
            totalOppvarming += month.oppvarming;
            totalMedVarmepumpe += month.medVarmepumpe;
            totalSpart += month.spartStrøm;
            totalStrompris += month.strømpris;
            totalKostnadSpart += month.estimertSpartKostnad;
            validMonths++;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${month.måned}</td>
                <td>${formatValue(month.oppvarming)}</td>
                <td>${formatValue(month.medVarmepumpe)}</td>
                <td>${formatValue(month.spartStrøm)}</td>
                <td>${formatValue(month.strømpris, 'kr')}</td>
                <td>${formatValue(month.estimertSpartKostnad, 'kr')}</td>
                <td>${formatValue(accumulated, 'kr')}</td>
            `;
            
            tableBody.appendChild(row);
        } else {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${month.måned}</td>
                <td colspan="6" class="empty-cell">Ingen data registrert enda</td>
            `;
            
            tableBody.appendChild(row);
        }
    });
    
    // Oppdater tabellfooter
    document.getElementById('sum-oppvarming-2025').textContent = 
        formatValue(totalOppvarming);
    document.getElementById('sum-med-varmepumpe-2025').textContent = 
        formatValue(totalMedVarmepumpe);
    document.getElementById('sum-spart-2025').textContent = 
        formatValue(totalSpart);
    document.getElementById('avg-strompris-2025').textContent = 
        formatValue(validMonths > 0 ? totalStrompris / validMonths : 0, 'kr');
    document.getElementById('sum-kostnad-spart-2025').textContent = 
        formatValue(totalKostnadSpart, 'kr');
    document.getElementById('total-akkumulert-2025').textContent = 
        formatValue(totalKostnadSpart, 'kr');
}

// Initialiserer prognosegraf
function initializePrognosisChart() {
    const ctx = document.getElementById('prognosis-chart-2025').getContext('2d');
    
    // Få måneder som mangler data i 2025
    const remainingMonths = data2025
        .filter(month => month.oppvarming === null)
        .map(month => month.måned);
    
    // Få tilsvarende data fra 2024 for prognose
    const prognoseData = remainingMonths.map(month => {
        const matchingMonth = data2024.find(m => m.måned === month);
        return matchingMonth ? matchingMonth.oppvarming : null;
    });
    
    const prognoseVarmepumpeData = remainingMonths.map(month => {
        const matchingMonth = data2024.find(m => m.måned === month);
        return matchingMonth ? matchingMonth.medVarmepumpe : null;
    });
    
    // Få faktiske data fra 2025 for historikk
    const actualMonths = data2025
        .filter(month => month.oppvarming !== null)
        .map(month => month.måned);
        
    const actualData = data2025
        .filter(month => month.oppvarming !== null)
        .map(month => month.oppvarming);
        
    const actualVarmepumpeData = data2025
        .filter(month => month.oppvarming !== null)
        .map(month => month.medVarmepumpe);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: [...actualMonths, ...remainingMonths],
            datasets: [
                {
                    label: 'Faktisk forbruk uten varmepumpe (kWh)',
                    data: [...actualData, ...Array(remainingMonths.length).fill(null)],
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'Faktisk forbruk med varmepumpe (kWh)',
                    data: [...actualVarmepumpeData, ...Array(remainingMonths.length).fill(null)],
                    backgroundColor: 'rgba(39, 174, 96, 0.7)',
                    borderColor: 'rgba(39, 174, 96, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'Prognosert forbruk uten varmepumpe (kWh)',
                    data: [...Array(actualMonths.length).fill(null), ...prognoseData],
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    borderColor: 'rgba(231, 76, 60, 0.7)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'Prognosert forbruk med varmepumpe (kWh)',
                    data: [...Array(actualMonths.length).fill(null), ...prognoseVarmepumpeData],
                    backgroundColor: 'rgba(39, 174, 96, 0.2)',
                    borderColor: 'rgba(39, 174, 96, 0.7)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3,
                    fill: false
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
                        text: 'Energiforbruk (kWh)'
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
}


