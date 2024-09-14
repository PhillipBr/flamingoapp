let currentData = [];
let sortDirection = {};
let initialData = [];

document.addEventListener('DOMContentLoaded', function() {
    fetch('https://app-637f919d-127a-4d06-831c-b9ca4ab90e14.cleverapps.io/api/songs')
        .then(response => response.json())
        .then(data => {
            currentData = data;
            initialData = [...data];
            populateTable(data);
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
            const headers = document.querySelectorAll('th');
            headers.forEach((header, index) => {
                header.addEventListener('click', () => {
                    resetHeaderStyles(headers);
                    header.classList.add('active-header');
                    toggleSortDirection(index);
                    sortTableByColumn(index);
                });
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

function resetHeaderStyles(headers) {
    headers.forEach(h => h.classList.remove('active-header'));
}

function performSearch() {
    const category = document.getElementById('searchCategory').value.toLowerCase();
    const searchText = document.getElementById('searchInput').value.trim();
    const queryParams = new URLSearchParams({ [category]: searchText });

    fetch(`https://app-637f919d-127a-4d06-831c-b9ca4ab90e14.cleverapps.io/api/songs?${queryParams.toString()}`)
        .then(response => response.json())
        .then(data => {
            currentData = data;
            populateTable(data);
            resetHeaderStyles(document.querySelectorAll('th'));
        })
        .catch(error => console.error('Error fetching data:', error));
}

function resetTableToInitialState() {
    currentData = [...initialData];
    populateTable(currentData);
    resetHeaderStyles(document.querySelectorAll('th'));
}

function populateTable(data) {
    const tableBody = document.querySelector('.table tbody');
    tableBody.innerHTML = '';

    data.forEach((song, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="title-artist">
                    <span class="song-title">${song.Title}</span><br>
                    <span class="song-artist">${song.Artist}</span>
                </div>
            </td>
            <td>${song.Album || 'Not Available'}</td>
            <td>${formatViews(song.Views) || 'Not Available'}</td>
            <td>${song.Duration || 'Not Available'}</td>
            <td>${song.ReleaseDate ? song.ReleaseDate.substring(0, 4) : 'Not Available'}</td>
            <td>${song.Genre || 'Not Available'}</td>
        `;
        row.addEventListener('click', () => {
            const currentlySelected = tableBody.querySelector('.selected');
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
            }
            row.classList.add('selected');
            updateTopSection(song);
        });
        tableBody.appendChild(row);
    });
}

function toggleSortDirection(columnIndex) {
    if (sortDirection[columnIndex] === 'desc') {
        sortDirection[columnIndex] = 'asc';
    } else {
        sortDirection[columnIndex] = 'desc';
    }
}

function sortTableByColumn(columnIndex) {
    if (columnIndex === 0) {
        document.getElementById('searchInput').value = '';
        currentData = [...initialData];
        populateTable(currentData);
        resetHeaderStyles(document.querySelectorAll('th'));
    } else {
        let sortKey;
        const isNumericSort = [3, 4, 5].includes(columnIndex);
        switch (columnIndex) {
            case 1: sortKey = 'Title'; break;
            case 2: sortKey = 'Album'; break;
            case 3: sortKey = 'Views'; break;
            case 4: sortKey = 'Duration'; break;
            case 5: sortKey = 'ReleaseDate'; break;
            case 6: sortKey = 'Genre'; break;
        }
        if (sortDirection[columnIndex] === 'desc') {
            currentData.sort((a, b) => isNumericSort ? sortNumerically(a, b, sortKey) : b[sortKey].localeCompare(a[sortKey]));
        } else {
            currentData.sort((a, b) => isNumericSort ? sortNumerically(b, a, sortKey) : a[sortKey].localeCompare(b[sortKey]));
        }
        populateTable(currentData);
    }
}

function sortNumerically(a, b, key) {
    if (key === 'Duration') {
        return convertDurationToSeconds(a[key]) - convertDurationToSeconds(b[key]);
    } else if (key === 'ReleaseDate') {
        return parseInt(a[key].substring(0, 4)) - parseInt(b[key].substring(0, 4));
    }
    return a[key] - b[key];
}

function convertDurationToSeconds(duration) {
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
}

function formatViews(number) {
    if (number >= 1e9) {
        return (number / 1e9).toFixed(2) + ' B';
    } else if (number >= 1e6) {
        return (number / 1e6).toFixed(1) + ' M';
    } else {
        return number.toString();
    }
}

function updateTopSection(song) {
    console.log(song); 
    document.getElementById('topTitle').textContent = song.Title;
    document.getElementById('topArtist').textContent = song.Artist;
    document.getElementById('topAlbum').textContent = song.Album;
    document.getElementById('topImage').src = song.CoverImage;
    updateYouTubeLink(song.youtube_url);
}

function updateYouTubeLink(youtube_url) {
    const youtubeLink = document.getElementById('youtubeLink');
    if (youtubeLink) {
        if (youtube_url) {
            youtubeLink.href = youtube_url;
        } else {
            youtubeLink.href = "https://www.youtube.com"; 
        }
    }
}
