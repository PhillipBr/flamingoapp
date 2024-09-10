document.addEventListener('DOMContentLoaded', function() {
    fetch('https://app-637f919d-127a-4d06-831c-b9ca4ab90e14.cleverapps.io/api/songs')
        .then(response => response.json())
        .then(data => {
            populateTable(data);
            document.getElementById('searchButton').addEventListener('click', function() {
                performSearch(data);
            });
            document.getElementById('searchInput').addEventListener('keypress', function(event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    performSearch(data);
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

function performSearch(mergedData) {
    const searchText = document.getElementById('searchInput').value.trim().toLowerCase();
    console.log(`Searching for artist: ${searchText}`);

    if (searchText !== "") {
        const filteredData = mergedData.filter(song => {
            if (!song.Artist) {
                console.error('Missing artist in song data', song);
                return false;
            }
            return song.Artist.toLowerCase().includes(searchText);
        });
        if (filteredData.length === 0) {
            console.log("No matches found.");
        }
        populateTable(filteredData);
    } else {
        populateTable(mergedData);
    }
}

function populateTable(data) {
    const tableBody = document.querySelector('.table tbody');
    tableBody.innerHTML = ''; // Clear existing table data

    data.forEach(song => {
        const year = song.ReleaseDate ? song.ReleaseDate.substring(0, 4) : 'Not Available';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="title-artist">
                    <span class="song-title">${song.Title}</span><br>
                    <span class="song-artist">${song.Artist}</span>
                </div>
            </td>
            <td>${song.Album || 'Not Available'}</td>
            <td><b>${formatViews(song.Views) || 'Not Available'}</b></td>  <!-- Llama a formatViews aquí -->
            <td>${song.Duration || 'Not Available'}</td>
            <td>${year}</td>
            <td>${song.Genre || 'Not Available'}</td>
        `;
        // Add click listener to row for selection
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


function formatViews(number) {
    if (number >= 1e9) { // 1e9 representa mil millones (1,000,000,000)
        return (number / 1e9).toFixed(2) + ' B';
    } else if (number >= 1e6) { // 1e6 representa un millón (1,000,000)
        return (number / 1e6).toFixed(1) + ' M';
    } else {
        return number.toString(); // Devuelve el número sin formato si es menor que un millón
    }
}

function updateTopSection(song) {
    document.getElementById('topTitle').textContent = song.Title;
    document.getElementById('topArtist').textContent = song.Artist;
    document.getElementById('topAlbum').textContent = song.Album;
    document.getElementById('topImage').src = song.CoverImage;
    updateYouTubeLink(song.Title, song.Artist);
}

function updateYouTubeLink(title, artist) {
    const firstArtist = artist.split(',')[0].trim();
    const query = `${title} ${firstArtist}`;
    const apiKey = 'AIzaSyDrJAA4-3ZlydW1soK8UFz4agqSldRnAy8';
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const videoId = data.items[0].id.videoId;
                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                const youtubeLink = document.querySelector('.icons a[href*="youtube"]');
                if (youtubeLink) {
                    youtubeLink.href = videoUrl;
                }
            } else {
                console.log("No results found.");
            }
        })
        .catch(error => console.error('Error fetching YouTube data:', error));
}
