let currentData = [];
let sortDirection = {};
let initialData = [];
let selectionMode = false;

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
            document.getElementById('selectButton').addEventListener('click', function() {
                selectionMode = !selectionMode;
                this.textContent = selectionMode ? 'Unselect' : 'Select';
                this.style.backgroundColor = selectionMode ? '#697096' : '#344e41';
                this.style.color = 'white';
                this.style.border = '2px solid #FFFFFF';

                if (!selectionMode) {
                    // Clear all selections when exiting selection mode
                    const selectedRows = document.querySelectorAll('.table tbody tr');
                    selectedRows.forEach(row => {
                        if (row.isSelected) {
                            row.style.backgroundColor = '';
                            row.isSelected = false;
                        }
                    });
                    document.getElementById('selectedCount').textContent = 0; // Reset selected count
                }
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
        row.isSelected = false; // Initialize selection state
        row.addEventListener('click', () => {
            if (selectionMode) {
                if (row.isSelected) {
                    // Deselect the row
                    row.style.backgroundColor = '';
                    row.isSelected = false;
                } else {
                    // Check how many rows are currently selected
                    const selectedRows = Array.from(tableBody.querySelectorAll('tr')).filter(r => r.isSelected);
                    if (selectedRows.length < 25) {
                        // Select the row
                        row.style.backgroundColor = '#697096';
                        row.isSelected = true;
                    } else {
                        alert('You can select up to 25 rows only.');
                    }
                }
                // Update selected count
                const selectedRows = Array.from(tableBody.querySelectorAll('tr')).filter(r => r.isSelected);
                document.getElementById('selectedCount').textContent = selectedRows.length;
            } else {
                // Non-selection mode
                const currentlySelected = tableBody.querySelector('.selected');
                if (currentlySelected) {
                    currentlySelected.classList.remove('selected');
                }
                row.classList.add('selected');
                updateTopSection(song);
            }
        });
        tableBody.appendChild(row);
    });
}

function toggleSortDirection(columnIndex) {
    sortDirection[columnIndex] = sortDirection[columnIndex] === 'desc' ? 'asc' : 'desc';
}

function sortTableByColumn(columnIndex) {
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
    currentData.sort((a, b) => {
        if (isNumericSort) {
            return sortDirection[columnIndex] === 'asc' ? sortNumerically(a, b, sortKey) : sortNumerically(b, a, sortKey);
        } else {
            return sortDirection[columnIndex] === 'asc' ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
        }
    });
    populateTable(currentData);
}

function sortNumerically(a, b, key) {
    if (key === 'Duration') {
        return convertDurationToSeconds(a[key]) - convertDurationToSeconds(b[key]);
    } else if (key === 'ReleaseDate') {
        return parseInt(a[key].substring(0, 4)) - parseInt(b[key].substring(0, 4));
    } else if (key === 'Views') {
        return a[key] - b[key];
    }
    return 0;
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
    document.getElementById('topTitle').textContent = song.Title;
    document.getElementById('topArtist').textContent = song.Artist;
    document.getElementById('topAlbum').textContent = song.Album;
    document.getElementById('topImage').src = song.CoverImage;
    updateYouTubeLink(song.youtube_url);
}

function updateYouTubeLink(youtube_url) {
    const youtubeLink = document.getElementById('youtubeLink');
    if (youtubeLink) {
        youtubeLink.href = youtube_url || "https://www.youtube.com";
    }
}
