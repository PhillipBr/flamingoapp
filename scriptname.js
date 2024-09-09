document.addEventListener('DOMContentLoaded', function() {
    fetch('https://app-637f919d-127a-4d06-831c-b9ca4ab90e14.cleverapps.io/api/songs')
        .then(response => response.json())
        .then(data => {
            populateTable(data);
            document.getElementById('searchButton').addEventListener('click', () => performSearch(data));
            document.getElementById('searchInput').addEventListener('keypress', event => {
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
    const filteredData = mergedData.filter(song => song.Artist.toLowerCase().includes(searchText));
    populateTable(filteredData.length ? filteredData : mergedData);
}

function populateTable(data) {
    const tableBody = document.querySelector('.table tbody');
    tableBody.innerHTML = '';
    data.forEach(song => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${song.Title}</td>
            <td>${song.Album || 'Not Available'}</td>
            <td>${song.Popularity || 'Not Available'}</td>
            <td>${song.Duration || 'Not Available'}</td>
            <td>${song.ReleaseDate ? song.ReleaseDate.substring(0, 4) : 'Not Available'}</td>
            <td>${song.Genre || 'Not Available'}</td>
        `;
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
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`; // Faltaban los backticks
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const videoId = data.items[0].id.videoId;
                const videoUrl = https://www.youtube.com/watch?v=${videoId};
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
