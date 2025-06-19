// Laster inn data ved oppstart
document.addEventListener('DOMContentLoaded', async () => {
    try {
        showLoader(true);
        
        // Last inn data fra JSON-filer hvis ikke allerede lastet
        if (data2024.length === 0) {
            // Hent rådata
            const rawData = await fetchRawData('data/data2024.json');
            
            // Beregn dynamiske verdier basert på COP
            data2024 = calculateDerivedValues(rawData);
        }
        
        // Initialiser UI
        updateStatistics2024();
        initializeCharts2024();
        populateTable2024();
        
        showLoader(false);
    } catch (error) {
        console.error('Feil ved oppstart:', error);
        document.getElementById('error-message').textContent = 
            'Kunne ikke laste inn data. Vennligst prøv igjen senere.';
        showLoader(false);
    }
});

// Oppdaterer statistikkene for 2024
function updateStatistics2024() {
    // Beregn statistikk for 2024
    const stats = generateStatistics(data2024);
    
    // Oppdater statistikk på 2024-siden
    document.getElementById('total-oppvarming-2024').textContent = 
        `${stats.totalOppvarming.toLocaleString('nb-NO')} kWh`;
    document.getElementById('total-sparing-2024').textContent = 
        `${stats.totalSpart.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kWh`;
    document.getElementById('prosent-sparing-2024').textContent = 
        `${stats.besparelsesProsent.toLocaleString('nb-NO', { maximumFractionDigits: 1 })}%`;
    document.getElementById('total-kostnadsbesparelse-2024').textContent = 
        `${stats.totalKostnadSpart.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kr`;
}

// Initialiserer grafer for 2024
function initializeCharts2024() {
    // Energiforbruksgraf
    const ctxEnergy = document.getElementById('energy-chart-2024').getContext('2d');
    new Chart(ctxEnergy, {
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
    
    // Besparelsesgraf
    const ctxSavings = document.getElementById('savings-chart-2024').getContext('2d');
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
    
    // Strømprisgraf
    const ctxPrice = document.getElementById('price-chart-2024').getContext('2d');
    new Chart(ctxPrice, {
        type: 'line',
        data: {
            labels: data2024.map(m => m.måned),
            datasets: [
                {
                    label: 'Strømpris (kr/kWh)',
                    data: data2024.map(m => m.strømpris),
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

// Fyller tabellen med data for 2024
function populateTable2024() {
    const tableBody = document.getElementById('data-table-body-2024');
    if (!tableBody) {
        console.error('Table body for 2024 not found');
        return;
    }
    
    tableBody.innerHTML = '';
    
    let totalOppvarming = 0;
    let totalMedVarmepumpe = 0;
    let totalSpart = 0;
    let totalStrompris = 0;
    let totalKostnadSpart = 0;
    let validMonths = 0;
    
    // Legg til informasjon om nåværende COP-verdi
    const tableInfo = document.querySelector('.table-info');
    if (tableInfo) {
        tableInfo.innerHTML = `<p>Beregnet med varmepumpe COP: <strong>${varmepumpeCOP.toFixed(1)}</strong></p>`;
    } else {
        // Opprett informasjonselement hvis det ikke finnes
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
            const infoElement = document.createElement('div');
            infoElement.className = 'table-info';
            infoElement.innerHTML = `<p>Beregnet med varmepumpe COP: <strong>${varmepumpeCOP.toFixed(1)}</strong></p>`;
            tableContainer.insertBefore(infoElement, tableContainer.firstChild);
        }
    }
    
    data2024.forEach((month, index) => {
        if (month.oppvarming !== null) {
            // Beregn akkumulert besparelse
            const accumulated = calculateAccumulatedSavings(data2024, index);
            
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
        }
    });
    
    // Oppdater tabellfooter
    document.getElementById('sum-oppvarming-2024').textContent = 
        formatValue(totalOppvarming);
    document.getElementById('sum-med-varmepumpe-2024').textContent = 
        formatValue(totalMedVarmepumpe);
    document.getElementById('sum-spart-2024').textContent = 
        formatValue(totalSpart);
    document.getElementById('avg-strompris-2024').textContent = 
        formatValue(validMonths > 0 ? totalStrompris / validMonths : 0, 'kr');
    document.getElementById('sum-kostnad-spart-2024').textContent = 
        formatValue(totalKostnadSpart, 'kr');
    document.getElementById('total-akkumulert-2024').textContent = 
        formatValue(totalKostnadSpart, 'kr');
}

// Initialiserer sammenligningsgraf
function initializeComparisonChart() {
    // Denne funksjonen er deaktivert
    console.log("Sammenligning med nasjonale gjennomsnitt er deaktivert.");
}


