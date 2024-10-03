let currentData = [];
let initialData = [];
let displayedData = [];
let sortDirection = {};

document.addEventListener('DOMContentLoaded', function() {
    loadData('Global');
    setUpCountryDropdown();
});

function loadData(country) {
    const jsonFile = `DATABASES/SPOTIFY/SP_${country}.json`;

    Promise.all([
        fetch(jsonFile).then(response => response.json()),
        fetch('DATABASES/SPOTIFY/TS.json').then(response => response.json()),
        fetch('DATABASES/SPOTIFY/UF.json').then(response => response.json())
    ])
        .then(([spData, tsData, ufData]) => {
            currentData = mergeDataBySongID(spData, tsData, ufData);
            initialData = [...currentData];
            sortTableByPosition(currentData);
            displayedData = [...currentData];
            populateTable(displayedData);
            setUpEventListeners();
        })
        .catch(error => console.error('Error loading JSON files:', error));
}

function setUpCountryDropdown() {
    const countrySelect = document.getElementById('countrySelect');
    const countryOptions = document.getElementById('countryOptions');

    countrySelect.addEventListener('click', () => {
        countryOptions.style.display = countryOptions.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.dropdown-container')) {
            countryOptions.style.display = 'none';
        }
    });

    countryOptions.addEventListener('click', (event) => {
        if (event.target.matches('div')) {
            countrySelect.value = event.target.textContent.trim();
            countryOptions.style.display = 'none';
            const selectedCountry = event.target.getAttribute('value');
            filterByCountry(selectedCountry);
        }
    });
}

function filterByCountry(countryCode) {
    loadData(countryCode);
}

function mergeDataBySongID(spData, tsData, ufData) {
    return spData.map(spEntry => {
        const tsEntry = tsData.find(ts => ts.SongID === spEntry.SongID) || {};
        const ufEntry = ufData.find(uf => uf.SongID === spEntry.SongID) || {};
        return { ...spEntry, ...tsEntry, ...ufEntry };
    });
}

function setUpEventListeners() {
    document.getElementById('searchInput').addEventListener('input', performSearch);
    document.getElementById('homeButton').addEventListener('click', resetTableToInitialState);

    document.getElementById('homeButton').addEventListener('click', function() {
        document.getElementById('searchInput').value = '';
        resetTableToInitialState();
    });

    const headers = document.querySelectorAll('th');
    headers.forEach((header, index) => {
        sortDirection[index] = 'asc';
        header.onclick = () => {
            toggleSortDirection(index);
            sortTableByColumn(index, currentData);
        };
    });
}

function toggleSortDirection(columnIndex) {
    sortDirection[columnIndex] = sortDirection[columnIndex] === 'asc' ? 'desc' : 'asc';
}

function sortTableByColumn(columnIndex, data) {
    const sortKey = ['#', 'Position', 'Title', 'Album', 'Duration', 'ReleaseDate', 'Genre'][columnIndex];
    const isNumericSort = ['Position', 'Duration', 'ReleaseDate'].includes(sortKey);

    data.sort((a, b) => {
        const comparison = isNumericSort ? sortNumerically(a, b, sortKey) : (a[sortKey] || "").localeCompare(b[sortKey] || "");
        return sortDirection[columnIndex] === 'desc' ? -comparison : comparison;
    });

    populateTable(data);
}

function sortNumerically(a, b, key) {
    if (key === 'Duration') return convertDurationToSeconds(a[key]) - convertDurationToSeconds(b[key]);
    if (key === 'ReleaseDate') return parseInt(a[key] || 0) - parseInt(b[key] || 0);
    return a[key] - b[key];
}

function sortTableByPosition(data) {
    data.sort((a, b) => a.Position - b.Position);
}

function populateTable(data) {
    const tableBody = document.querySelector('.table tbody');
    tableBody.innerHTML = '';
    data.forEach((song, index) => {
        const row = document.createElement('tr');
        row.songData = song;
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${song.Position || 'N/A'}</td>
            <td>
                <div class="title-artist">
                    <span class="song-title">${song.Title || 'Not Available'}</span><br>
                    <span class="song-artist">${song.Artist || 'Not Available'}</span>
                </div>
            </td>
            <td>${song.Album || 'Not Available'}</td>
            <td>${song.Duration || 'Not Available'}</td>
            <td>${song.ReleaseDate ? song.ReleaseDate.substring(0, 4) : 'Not Available'}</td>
            <td>${song.Genre || 'Not Available'}</td>
        `;
        row.addEventListener('click', () => selectSingleRow(row, tableBody));
        tableBody.appendChild(row);
    });
}

function selectSingleRow(row, tableBody) {
    const currentlySelected = tableBody.querySelector('.selected');
    if (currentlySelected) {
        currentlySelected.classList.remove('selected');
    }
    row.classList.add('selected');
    updateTopSection(row.songData);
}

function updateTopSection(song) {
    document.getElementById('topTitle').textContent = song.Title;
    document.getElementById('topArtist').textContent = song.Artist;
    document.getElementById('topAlbum').textContent = song.Album;
    document.getElementById('topImage').src = song.CoverImage || 'images/default_cover.png';
}

function resetTableToInitialState() {
    currentData = [...initialData];
    sortTableByPosition(currentData);
    displayedData = [...currentData];
    populateTable(displayedData);
}

function performSearch() {
    const category = document.getElementById('searchCategory').value.toLowerCase();
    const searchText = document.getElementById('searchInput').value.trim().toLowerCase();

    displayedData = initialData.filter(song => {
        if (category === 'title' && song.Title.toLowerCase().includes(searchText)) return true;
        if (category === 'artist' && song.Artist.toLowerCase().includes(searchText)) return true;
        if (category === 'album' && song.Album && song.Album.toLowerCase().includes(searchText)) return true;
        if (category === 'genre' && song.Genre && song.Genre.toLowerCase().includes(searchText)) return true;
        return false;
    });

    sortTableByPosition(displayedData);
    populateTable(displayedData);
}

function convertDurationToSeconds(duration) {
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
}
