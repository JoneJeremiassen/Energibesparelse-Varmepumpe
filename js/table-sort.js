// Funksjon for å sortere tabellen basert på kolonne
function sortTable(columnIndex) {
    const table = document.querySelector('.comparison-table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const headerRow = table.querySelector('thead tr');
    const headers = headerRow.querySelectorAll('th');
    
    // Sjekk gjeldende sorteringsretning før vi fjerner klassene
    const currentHeader = headers[columnIndex];
    const wasAscending = currentHeader.classList.contains('sorted-asc');
    const wasDescending = currentHeader.classList.contains('sorted-desc');
    
    // Fjern sorteringsindikatorer fra alle overskrifter
    headers.forEach(header => {
        header.classList.remove('sorted-asc', 'sorted-desc');
    });
    
    // Bestem sorteringsretning basert på tidligere tilstand
    // Hvis kolonnen allerede var sortert stigende, sort synkende.
    // Hvis kolonnen var sortert synkende eller ikke sortert, sort stigende.
    const isAscending = wasAscending ? false : true;
    
    // Legg til sorteringsindikator
    currentHeader.classList.add(isAscending ? 'sorted-asc' : 'sorted-desc');
    
    // Sorter radene
    rows.sort((rowA, rowB) => {
        let cellA = rowA.querySelectorAll('td')[columnIndex].textContent.trim();
        let cellB = rowB.querySelectorAll('td')[columnIndex].textContent.trim();
        
        // Spesialhåndtering for tallverdier (effekt, pris, etc.)
        if (columnIndex === 1) { // Effekt
            cellA = parseFloat(cellA.replace('kW', '').replace('(ved -25°C)', '').replace('(ved -15°C)', '').trim());
            cellB = parseFloat(cellB.replace('kW', '').replace('(ved -25°C)', '').replace('(ved -15°C)', '').trim());
        } else if (columnIndex === 2) { // SCOP
            cellA = parseFloat(cellA.replace('*', ''));
            cellB = parseFloat(cellB.replace('*', ''));
        } else if (columnIndex === 4) { // dB
            cellA = parseInt(cellA.replace('dB', '').replace('*', '').trim());
            cellB = parseInt(cellB.replace('dB', '').replace('*', '').trim());
        } else if (columnIndex === 5) { // Pris
            cellA = parseInt(cellA.replace(/\D/g, ''));
            cellB = parseInt(cellB.replace(/\D/g, ''));
        } else if (columnIndex === 3) { // Energiklasse
            // Sorter energiklasse (A+++, A++, A+, A, osv.)
            const energyOrder = {'A+++': 1, 'A++': 2, 'A+': 3, 'A': 4, 'B': 5, 'C': 6, 'D': 7};
            cellA = energyOrder[cellA.replace('*', '')] || 999;
            cellB = energyOrder[cellB.replace('*', '')] || 999;
        }
        
        // Sammenlign og sorter
        if (cellA < cellB) {
            return isAscending ? -1 : 1;
        } else if (cellA > cellB) {
            return isAscending ? 1 : -1;
        }
        return 0;
    });
    
    // Fjern eksisterende rader og legg til sorterte rader
    rows.forEach(row => tbody.appendChild(row));
    
    // Legg til klasse for å indikere at tabellen er sortert
    tbody.classList.add('sorted');
}

// Legg til filtrering
function initTableSorting() {
    const table = document.querySelector('.comparison-table');
    if (!table) return;
    
    const headers = table.querySelectorAll('thead th');
    
    // Definer hvilke kolonner som skal være sorterbare (0-basert indeks)
    // 0 = Modell, 1 = Effekt, 2 = SCOP, 3 = Energiklasse, 4 = dB, 5 = Pris, 6 = Forhandler
    const sortableColumns = [1, 2, 3, 4, 5]; // Kun effekt, SCOP, energiklasse, dB og pris
    
    headers.forEach((header, index) => {
        // Sjekk om denne kolonnen skal være sorterbar
        if (sortableColumns.includes(index)) {
            // Legg til sortable-klasse
            header.classList.add('sortable');
            
            // Legg til sorteringsikon
            const sortIcon = document.createElement('span');
            sortIcon.className = 'sort-icon';
            sortIcon.innerHTML = ' <i class="fas fa-sort"></i>';
            header.appendChild(sortIcon);
            
            // Gjør overskrifter klikkbare
            header.addEventListener('click', () => {
                sortTable(index);
                
                // Oppdater ikonene
                const allIcons = table.querySelectorAll('.sort-icon i');
                allIcons.forEach(icon => {
                    icon.className = 'fas fa-sort';
                });
                
                const currentIcon = header.querySelector('.sort-icon i');
                if (header.classList.contains('sorted-asc')) {
                    currentIcon.className = 'fas fa-sort-up';
                } else if (header.classList.contains('sorted-desc')) {
                    currentIcon.className = 'fas fa-sort-down';
                }
            });
        }
    });
}

// Kjør initTableSorting når siden er lastet
document.addEventListener('DOMContentLoaded', () => {
    initTableSorting();
});
