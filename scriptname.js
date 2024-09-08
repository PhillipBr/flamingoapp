document.addEventListener('DOMContentLoaded', function() {
    fetch('https://app-637f919d-127a-4d06-831c-b9ca4ab90e14.cleverapps.io/')
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
    tableBody.innerHTML = '';

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
            <td>${song.Popularity || 'Not Available'}</td>
            <td>${song.Duration || 'Not Available'}</td>
            <td>${year}</td>
            <td>${song.Genre || 'Not Available'}</td>
        `;
        row.addEventListener('click', () => updateTopSection(song));
        tableBody.appendChild(row);
    });
}

function updateTopSection(song) {
    document.getElementById('topTitle').textContent = song.Title;
    document.getElementById('topArtist').textContent = song.Artist;
    document.getElementById('topAlbum').textContent = song.Album;
    document.getElementById('topImage').src = song.CoverImage;
    updateYouTubeLink(song.Title, song.Artist);
}

function updateYouTubeLink(title, artist) {
    // Extract the first artist before any comma
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
