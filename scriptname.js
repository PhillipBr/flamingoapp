let currentData = [];
let sortDirection = {};
let initialData = [];
let selectionMode = false;

document.addEventListener('DOMContentLoaded', function() {
    // Load JSON files and merge data
    Promise.all([
        fetch('DATABASES/AR.json').then(response => response.json()),
        fetch('DATABASES/TS.json').then(response => response.json()),
        fetch('DATABASES/UF.json').then(response => response.json())
    ])
        .then(([arData, tsData, ufData]) => {
            currentData = mergeDataBySongID(arData, tsData, ufData);
            initialData = [...currentData];
            populateTable(currentData);
            setUpEventListeners();
        })
        .catch(error => console.error('Error loading JSON files:', error));
});

// Function to merge the three JSON datasets based on SongID
function mergeDataBySongID(arData, tsData, ufData) {
    return tsData.map(tsEntry => {
        const arEntry = arData.find(ar => ar.SongID === tsEntry.SongID) || {};
        const ufEntry = ufData.find(uf => uf.SongID === tsEntry.SongID) || {};
        return { ...tsEntry, ...arEntry, ...ufEntry };
    });
}

// Setup all event listeners for buttons and search input
function setUpEventListeners() {
    document.getElementById('searchButton').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            performSearch();
        }
    });

    document.getElementById('homeButton').addEventListener('click', function() {
        document.getElementById('searchInput').value = '';
        resetTableToInitialState();
    });

    document.getElementById('selectButton').addEventListener('click', function() {
        selectionMode = !selectionMode;
        this.textContent = selectionMode ? 'Unselect' : 'Select';
        this.style.backgroundColor = selectionMode ? '#697096' : '#344e41';
        this.style.color = 'white';
        this.style.border = '2px solid #FFFFFF';

        const createPlaylistButton = document.getElementById('createPlaylistButton');
        createPlaylistButton.style.display = selectionMode ? 'inline-block' : 'none';
    });

    const headers = document.querySelectorAll('th');
    headers.forEach((header, index) => {
        header.addEventListener('click', () => {
            resetHeaderStyles(headers);
            header.classList.add('active-header');
            toggleSortDirection(index);
            sortTableByColumn(index);
        });
    });
}

// Reset table to initial state
function resetTableToInitialState() {
    currentData = [...initialData];
    populateTable(currentData);
    resetHeaderStyles(document.querySelectorAll('th'));
}

// Search function adapted from MySQL query logic
function performSearch() {
    const category = document.getElementById('searchCategory').value.toLowerCase(); // Search category
    const searchText = document.getElementById('searchInput').value.trim().toLowerCase(); // Search text

    const filteredData = initialData.filter(song => {
        if (category === 'title' && song.Title.toLowerCase().includes(searchText)) {
            return true;
        }
        if (category === 'artist' && song.Artist.toLowerCase().includes(searchText)) {
            return true;
        }
        if (category === 'album' && song.Album && song.Album.toLowerCase().includes(searchText)) {
            return true;
        }
        if (category === 'genre' && song.Genre && song.Genre.toLowerCase().includes(searchText)) {
            return true;
        }
        return false;
    });

    populateTable(filteredData);
    resetHeaderStyles(document.querySelectorAll('th'));
}

// Populate table with song data
function populateTable(data) {
    const tableBody = document.querySelector('.table tbody');
    tableBody.innerHTML = '';

    data.forEach((song, index) => {
        const row = document.createElement('tr');
        row.songData = song;

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="title-artist">
                    <span class="song-title">${song.Title || 'Not Available'}</span><br>
                    <span class="song-artist">${song.Artist || 'Not Available'}</span>
                </div>
            </td>
            <td>${song.Album || 'Not Available'}</td>
            <td>${formatViews(song.Views) || 'Not Available'}</td>
            <td>${song.Duration || 'Not Available'}</td>
            <td>${song.ReleaseDate ? song.ReleaseDate.substring(0, 4) : 'Not Available'}</td>
            <td>${song.Genre || 'Not Available'}</td>
        `;

        row.isSelected = false;
        row.addEventListener('click', () => {
            if (selectionMode) {
                toggleSelection(row);
            } else {
                selectSingleRow(row, tableBody);
                updateTopSection(song);
            }
        });

        tableBody.appendChild(row);
    });
}

// Toggle the selection of a row
function toggleSelection(row) {
    if (row.isSelected) {
        row.style.backgroundColor = '';
        row.isSelected = false;
    } else {
        const selectedRows = Array.from(document.querySelector('.table tbody').querySelectorAll('tr')).filter(r => r.isSelected);
        if (selectedRows.length < 25) {
            row.style.backgroundColor = '#697096';
            row.isSelected = true;
        } else {
            alert('You can select up to 25 rows only.');
        }
    }
    const selectedRows = Array.from(document.querySelector('.table tbody').querySelectorAll('tr')).filter(r => r.isSelected);
    document.getElementById('selectedCount').textContent = selectedRows.length;
}

// Select a single row and update the top section
function selectSingleRow(row, tableBody) {
    const currentlySelected = tableBody.querySelector('.selected');
    if (currentlySelected) {
        currentlySelected.classList.remove('selected');
    }
    row.classList.add('selected');
}

// Update the top section with the selected song data
function updateTopSection(song) {
    document.getElementById('topTitle').textContent = song.Title;
    document.getElementById('topArtist').textContent = song.Artist;
    document.getElementById('topAlbum').textContent = song.Album;
    document.getElementById('topImage').src = song.CoverImage || 'images/default_cover.png';
    updateYouTubeLink(song.youtube_url);
}

// Update the YouTube link in the top section
function updateYouTubeLink(youtube_url) {
    const youtubeLink = document.querySelector('.icons a[href*="youtube"]');
    youtubeLink.href = youtube_url || "https://www.youtube.com";
}

// Reset header styles
function resetHeaderStyles(headers) {
    headers.forEach(h => h.classList.remove('active-header'));
}

// Toggle sorting direction
function toggleSortDirection(columnIndex) {
    sortDirection[columnIndex] = sortDirection[columnIndex] === 'desc' ? 'asc' : 'desc';
}

// Sort table based on the selected column
function sortTableByColumn(columnIndex) {
    const sortKey = ['#', 'Title', 'Album', 'Views', 'Duration', 'ReleaseDate', 'Genre'][columnIndex];
    const isNumericSort = ['Views', 'Duration', 'ReleaseDate'].includes(sortKey);

    currentData.sort((a, b) => {
        const comparison = isNumericSort ? sortNumerically(a, b, sortKey) : a[sortKey].localeCompare(b[sortKey]);
        return sortDirection[columnIndex] === 'desc' ? -comparison : comparison;
    });

    populateTable(currentData);
}

// Numeric sort helper function
function sortNumerically(a, b, key) {
    if (key === 'Duration') return convertDurationToSeconds(a[key]) - convertDurationToSeconds(b[key]);
    if (key === 'ReleaseDate') return parseInt(a[key].substring(0, 4)) - parseInt(b[key].substring(0, 4));
    return a[key] - b[key];
}

// Convert duration to seconds
function convertDurationToSeconds(duration) {
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
}

// Format views count
function formatViews(number) {
    if (number >= 1e9) return (number / 1e9).toFixed(2) + ' B';
    if (number >= 1e6) return (number / 1e6).toFixed(1) + ' M';
    return number.toString();
}
