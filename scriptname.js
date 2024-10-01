let currentData = [];
let initialData = [];
let displayedData = [];
let selectionMode = false;
let sortDirection = {};

document.addEventListener('DOMContentLoaded', function() {
    Promise.all([
        fetch('DATABASES/AR.json').then(response => response.json()),
        fetch('DATABASES/TS.json').then(response => response.json()),
        fetch('DATABASES/UF.json').then(response => response.json())
    ])
        .then(([arData, tsData, ufData]) => {
            currentData = mergeDataBySongID(arData, tsData, ufData);
            initialData = [...currentData];
            sortTableByViews(currentData);
            displayedData = [...currentData];
            populateTable(displayedData);
            setUpEventListeners();
        })
        .catch(error => console.error('Error loading JSON files:', error));
});

function mergeDataBySongID(arData, tsData, ufData) {
    return tsData.map(tsEntry => {
        const arEntry = arData.find(ar => ar.SongID === tsEntry.SongID) || {};
        const ufEntry = ufData.find(uf => uf.SongID === tsEntry.SongID) || {};
        return { ...tsEntry, ...arEntry, ...ufEntry };
    });
}

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
            toggleSortDirection(index);
            sortTableByColumn(index, displayedData);
        });
    });
}

function resetTableToInitialState() {
    currentData = [...initialData];
    sortTableByViews(currentData);
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

    sortTableByViews(displayedData);
    populateTable(displayedData);
}

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

function selectSingleRow(row, tableBody) {
    const currentlySelected = tableBody.querySelector('.selected');
    if (currentlySelected) {
        currentlySelected.classList.remove('selected');
    }
    row.classList.add('selected');
}

function updateTopSection(song) {
    document.getElementById('topTitle').textContent = song.Title;
    document.getElementById('topArtist').textContent = song.Artist;
    document.getElementById('topAlbum').textContent = song.Album;
    document.getElementById('topImage').src = song.CoverImage || 'images/default_cover.png';
    updateYouTubeLink(song.youtube_url);
}

function updateYouTubeLink(youtube_url) {
    const youtubeLink = document.querySelector('.icons a[href*="youtube"]');
    youtubeLink.href = youtube_url || "https://www.youtube.com";
}

function sortTableByColumn(columnIndex, data) {
    const sortKey = ['#', 'Title', 'Album', 'Views', 'Duration', 'ReleaseDate', 'Genre'][columnIndex];
    const isNumericSort = ['Views', 'Duration', 'ReleaseDate'].includes(sortKey);

    data.sort((a, b) => {
        const comparison = isNumericSort ? sortNumerically(a, b, sortKey) : a[sortKey].localeCompare(b[sortKey]);
        return sortDirection[columnIndex] === 'desc' ? -comparison : comparison;
    });

    populateTable(data);
}

function toggleSortDirection(columnIndex) {
    sortDirection[columnIndex] = sortDirection[columnIndex] === 'desc' ? 'asc' : 'desc';
}

function sortTableByViews(data) {
    data.sort((a, b) => b.Views - a.Views);
}

function sortNumerically(a, b, key) {
    if (key === 'Duration') return convertDurationToSeconds(a[key]) - convertDurationToSeconds(b[key]);
    if (key === 'ReleaseDate') return parseInt(a[key].substring(0, 4)) - parseInt(b[key].substring(0, 4));
    return a[key] - b[key];
}

function convertDurationToSeconds(duration) {
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
}

function formatViews(number) {
    if (number >= 1e9) return (number / 1e9).toFixed(2) + ' B';
    if (number >= 1e6) return (number / 1e6).toFixed(1) + ' M';
    return number.toString();
}
