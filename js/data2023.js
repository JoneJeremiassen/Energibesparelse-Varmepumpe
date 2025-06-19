// Laster inn data ved oppstart
document.addEventListener('DOMContentLoaded', async () => {
    try {
        showLoader(true);
        
        // Vent til data er ferdig lastet
        if (data2023.length === 0) {
            try {
                data2023 = await fetchData('data/data2023.json');
                
                // Fjern duplikatmåneder hvis de finnes i datasettet
                // I data2023.json er det noen duplikate måneder (f.eks. Juli til Desember er duplisert)
                const uniqueMonths = new Set();
                data2023 = data2023.filter(item => {
                    if (uniqueMonths.has(item.måned)) {
                        console.log(`Fjerner duplikat måned: ${item.måned}`);
                        return false;
                    }
                    uniqueMonths.add(item.måned);
                    return true;
                });
                
                console.log(`Data 2023 lastet, antall måneder: ${data2023.length}`);
            } catch (error) {
                console.error("Feil ved lasting av 2023-data:", error);
                document.getElementById('error-message').textContent = 
                    'Kunne ikke laste inn data for 2023. Vennligst prøv igjen senere.';
                document.getElementById('error-message').style.display = 'block';
            }
        }
        
        if (data2023.length > 0) {
            updateStatistics2023();
            initializeCharts2023();
            populateTable2023();
        } else {
            document.getElementById('error-message').textContent = 
                'Ingen data tilgjengelig for 2023.';
            document.getElementById('error-message').style.display = 'block';
        }
        
        showLoader(false);
    } catch (error) {
        console.error('Feil ved oppstart av 2023-side:', error);
        document.getElementById('error-message').textContent = 
            'Kunne ikke laste inn data. Vennligst prøv igjen senere.';
        document.getElementById('error-message').style.display = 'block';
        showLoader(false);
    }
});

// Oppdaterer statistikkene for 2023
function updateStatistics2023() {
    // Beregn statistikk for 2023
    const stats = generateStatistics(data2023);
    
    // Oppdater statistikk på 2023-siden
    document.getElementById('total-oppvarming-2023').textContent = 
        `${stats.totalOppvarming.toLocaleString('nb-NO')} kWh`;
    document.getElementById('total-sparing-2023').textContent = 
        `${stats.totalSpart.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kWh`;
    document.getElementById('prosent-sparing-2023').textContent = 
        `${stats.besparelsesProsent.toLocaleString('nb-NO', { maximumFractionDigits: 1 })}%`;
    document.getElementById('total-kostnadsbesparelse-2023').textContent = 
        `${stats.totalKostnadSpart.toLocaleString('nb-NO', { maximumFractionDigits: 2 })} kr`;
}

// Initialiserer grafer for 2023
function initializeCharts2023() {
    // Energiforbruksgraf
    const ctxEnergy = document.getElementById('energy-chart-2023').getContext('2d');
    new Chart(ctxEnergy, {
        type: 'bar',
        data: {
            labels: data2023.map(m => m.måned),
            datasets: [
                {
                    label: 'Oppvarming uten varmepumpe (kWh)',
                    data: data2023.map(m => m.oppvarming),
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Oppvarming med varmepumpe (kWh)',
                    data: data2023.map(m => m.medVarmepumpe),
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
    const ctxSavings = document.getElementById('savings-chart-2023').getContext('2d');
    new Chart(ctxSavings, {
        type: 'line',
        data: {
            labels: data2023.map(m => m.måned),
            datasets: [
                {
                    label: 'Estimert kostnadsbesparelse (kr)',
                    data: data2023.map(m => m.estimertSpartKostnad),
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
    const ctxPrice = document.getElementById('price-chart-2023').getContext('2d');
    new Chart(ctxPrice, {
        type: 'line',
        data: {
            labels: data2023.map(m => m.måned),
            datasets: [
                {
                    label: 'Strømpris (kr/kWh)',
                    data: data2023.map(m => m.strømpris),
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

// Fyller tabellen med data for 2023
function populateTable2023() {
    const tableBody = document.getElementById('data-table-body-2023');
    tableBody.innerHTML = '';
    
    let totalOppvarming = 0;
    let totalMedVarmepumpe = 0;
    let totalSpart = 0;
    let totalStrompris = 0;
    let totalKostnadSpart = 0;
    let validMonths = 0;
    
    data2023.forEach((month, index) => {
        if (month.oppvarming !== null) {
            // Beregn akkumulert besparelse
            const accumulated = calculateAccumulatedSavings(data2023, index);
            
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
    document.getElementById('sum-oppvarming-2023').textContent = 
        formatValue(totalOppvarming);
    document.getElementById('sum-med-varmepumpe-2023').textContent = 
        formatValue(totalMedVarmepumpe);
    document.getElementById('sum-spart-2023').textContent = 
        formatValue(totalSpart);
    document.getElementById('avg-strompris-2023').textContent = 
        formatValue(validMonths > 0 ? totalStrompris / validMonths : 0, 'kr');
    document.getElementById('sum-kostnad-spart-2023').textContent = 
        formatValue(totalKostnadSpart, 'kr');
    document.getElementById('total-akkumulert-2023').textContent = 
        formatValue(totalKostnadSpart, 'kr');
}
