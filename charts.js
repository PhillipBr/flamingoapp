document.addEventListener('DOMContentLoaded', function() {
    loadChartData();
    openTab('itunes'); // Default to open the iTunes tab
});

// Load data for each chart table (iTunes, Apple Music, Deezer, Shazam, Billboard)
function loadChartData() {
    const jsonFile = 'DATABASES/daily_table.json';
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            const currentDate = new Date();
            const formattedDate = `${currentDate.getDate()} of ${currentDate.toLocaleString('default', { month: 'long' })} of ${currentDate.getFullYear()}`;

            createTable('itunes-chart', data.iTunes, 50, 'itunes-table', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/2048px-Apple_Music_icon.svg.png', formattedDate);
            createTable('appleMusic-chart', data["Apple Music"], 50, 'apple-music-table', 'https://www.citypng.com/public/uploads/preview/hd-apple-itunes-music-round-white-icon-transparent-background-701751694974721aets5ghsqq.png', formattedDate);
            createTable('deezer-chart', data.Deezer, 50, 'deezer-table', 'https://brandlogo.org/wp-content/uploads/2024/05/Deezer-Logo-Icon-300x300.png.webp', formattedDate);
            createTable('shazam-chart', data.Shazam, 50, 'shazam-table', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Shazam_icon.svg/2048px-Shazam_icon.svg.png', formattedDate);
            createTable('billboard-chart', data.Billboard, 50, 'billboard-table', 'https://www.billboard.com/wp-content/uploads/media/billboard-logo-b-20-billboard-1548.jpg?w=1024', formattedDate);
        })
        .catch(error => console.error('Error loading chart data:', error));
}

// Helper function to create chart tables
function createTable(containerId, platformData, limit, tableClass, iconUrl, date) {
    const tableContainer = document.getElementById(containerId);

    const table = document.createElement('table');
    table.className = `trends-table ${tableClass}`;

    // Add table header with icon and date
    const headerRow = document.createElement('tr');
    headerRow.className = 'table-header';
    headerRow.innerHTML = `
        <th colspan="2">
            <img src="${iconUrl}" alt="Platform logo" class="platform-icon" />
            <span>${tableClass.split('-')[0].toUpperCase()} Chart</span>
            <span class="table-header-date">${date}</span>
        </th>
    `;
    table.appendChild(headerRow);

    // Add table rows for platform data
    platformData.slice(0, limit).forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="width: 5%; color: white;">${item.Position}</td>
            <td style="width: 95%; color: white;">${item.Title} - ${item.Artist}</td>
        `;
        table.appendChild(row);
    });

    tableContainer.appendChild(table);
}

// Function to open tabs and display the selected chart
function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[onclick="openTab('${tabName}')"]`).classList.add('active');
}
