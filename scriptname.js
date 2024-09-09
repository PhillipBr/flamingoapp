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
