document.addEventListener('DOMContentLoaded', function() {
    const regions = ['global', 'us', 'gb', 'ca', 'br', 'in'];
    regions.forEach(region => loadData(region));
    setTimeout(() => setupCarousel(), 1000);
    loadDataForSAContainer();
    loadDataForEUContainer();
    loadDataForWOContainer();
    loadYouTubeTrends();
});

const countryData = {
    'global': { name: 'Global', flag: '🌐' },
    'us': { name: 'United States', flag: '🇺🇸' },
    'gb': { name: 'United Kingdom', flag: '🇬🇧' },
    'ca': { name: 'Canada', flag: '🇨🇦' },
    'br': { name: 'Brazil', flag: '🇧🇷' },
    'in': { name: 'India', flag: '🇮🇳' },
    'ar': { name: 'Argentina', flag: '🇦🇷' },
    'co': { name: 'Colombia', flag: '🇨🇴' },
    'cl': { name: 'Chile', flag: '🇨🇱' },
    'mx': { name: 'Mexico', flag: '🇲🇽' },
    'es': { name: 'Spain', flag: '🇪🇸' },
    'fr': { name: 'France', flag: '🇫🇷' },
    'be': { name: 'Belgium', flag: '🇧🇪' },
    'it': { name: 'Italy', flag: '🇮🇹' },
    'de': { name: 'Germany', flag: '🇩🇪' },
    'nl': { name: 'Netherlands', flag: '🇳🇱' },
    'kr': { name: 'South Korea', flag: '🇰🇷' },
    'jp': { name: 'Japan', flag: '🇯🇵' },
    'th': { name: 'Thailand', flag: '🇹🇭' },
    'au': { name: 'Australia', flag: '🇦🇺' },
    'nz': { name: 'New Zealand', flag: '🇳🇿' }
};
function setupCarousel() {
    const slides = document.querySelectorAll('.chart-container');
    const indicators = document.querySelector('.carousel-indicators');
    let currentSlide = 0;

    // Hide all slides initially
    slides.forEach(slide => slide.style.display = 'none');

    // Ensure only the first chart is shown initially
    slides[currentSlide].style.display = 'block';

    slides.forEach((slide, index) => {
        const indicator = document.createElement('button');
        if (index === 0) indicator.className = 'active';
        indicator.addEventListener('click', () => {
            changeSlide(index);
        });
        indicators.appendChild(indicator);
    });

    document.querySelector('.arrow.left').addEventListener('click', () => {
        const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
        changeSlide(prevSlide);
    });

    document.querySelector('.arrow.right').addEventListener('click', () => {
        const nextSlide = (currentSlide + 1) % slides.length;
        changeSlide(nextSlide);
    });

    function changeSlide(index) {
        // Hide current slide
        slides[currentSlide].style.display = 'none';
        indicators.children[currentSlide].classList.remove('active');

        // Show the new slide
        slides[index].style.display = 'block';
        indicators.children[index].classList.add('active');
        currentSlide = index;
    }

    // Automatically change slide every 7 seconds
    setInterval(() => {
        const nextSlide = (currentSlide + 1) % slides.length;
        changeSlide(nextSlide);
    }, 7000);
}


function loadData(region) {
    const jsonFile = `DATABASES/SPOTIFY/SP_${region}.json`;
    const tsFile = 'DATABASES/SPOTIFY/TS.json';
    Promise.all([
        fetch(jsonFile).then(response => response.json()),
        fetch(tsFile).then(response => response.json())
    ])
        .then(([spData, tsData]) => {
            const mergedData = mergeDataBySongID(spData, tsData);
            const topFive = mergedData.filter(song => song.Position <= 5);
            displayTopFive(topFive, region);
        })
        .catch(error => console.error('Error loading JSON files:', error));
}

function mergeDataBySongID(spData, tsData) {
    return spData.map(song => {
        const tsEntry = tsData.find(ts => ts.SongID === song.SongID) || {};
        return { ...song, ...tsEntry };
    });
}
function displayTopFive(songs, region) {
    const container = document.querySelector('.main-chart-container');
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.id = `spotify-${region}`;

    const heading = document.createElement('h2');
    const countryInfo = countryData[region];
    if (countryInfo) {
        heading.textContent = `${countryInfo.flag} Spotify ${countryInfo.name} TOP 5`;
    } else {
        heading.textContent = `Spotify ${region.toUpperCase()} TOP 5`;
    }
    chartContainer.appendChild(heading);

    const songList = document.createElement('div');
    songList.className = 'song-list';

    // Sort the songs array by the Position field in ascending order
    const sortedSongs = songs.sort((a, b) => a.Position - b.Position);

    sortedSongs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';

        // Check if screen width is 600px or less (mobile vertical mode)
        if (window.innerWidth <= 600) {
            songItem.innerHTML = `
                <div class="song-image">
                    <img src="${song.CoverImage || 'images/logoo.jpg'}" alt="Cover Image"
                        onerror="this.onerror=null; this.src='images/logoo.jpg';">
                </div>
                <div class="song-text">
                    <div class="song-rank">${song.Position}</div>
                    <div class="song-title">${song.Title}</div>
                    <div class="song-artist">by ${song.Artist}</div>
                </div>
            `;
        } else {
            // Normal layout for larger screens
            songItem.innerHTML = `
                <div class="song-image">
                    <img src="${song.CoverImage || 'images/logoo.jpg'}" alt="Cover Image"
                        onerror="this.onerror=null; this.src='images/logoo.jpg';">
                </div>
                <div class="song-rank">${song.Position}</div>
                <div class="song-title">${song.Title}</div>
                <div class="song-artist">${song.Artist}</div>
            `;
        }
        songList.appendChild(songItem);
    });

    chartContainer.appendChild(songList);
    container.appendChild(chartContainer);
}


function loadDataForSAContainer() {
    const saRegions = ['ar', 'co', 'cl', 'mx', 'es'];
    saRegions.forEach(region => loadSARegionData(region));
    setTimeout(() => setupSACarousel(), 1000);
}

function loadSARegionData(region) {
    const jsonFile = `DATABASES/SPOTIFY/SP_${region}.json`;
    const tsFile = 'DATABASES/SPOTIFY/TS.json';
    Promise.all([
        fetch(jsonFile).then(response => response.json()),
        fetch(tsFile).then(response => response.json())
    ])
        .then(([spData, tsData]) => {
            const mergedData = mergeDataBySongID(spData, tsData);
            const topSongs = mergedData.filter(song => song.Position >= 1 && song.Position <= 5);
            createSASlide(topSongs, region);
        })
        .catch(error => console.error('Error loading JSON files:', error));
}

function createSASlide(songs, region) {
    const saCarouselContainer = document.getElementById('saCarousel');
    const slide = document.createElement('div');
    slide.className = 'sa-chart-slide';
    const saSongList = document.createElement('div');
    saSongList.className = 'sa-song-list';
    const isMobile = window.innerWidth <= 600;

    if (isMobile) {
        const topSong = songs.find(song => song.Position === 1);
        const saSongItem = document.createElement('div');
        saSongItem.className = 'sa-song-item';
        const countryInfo = countryData[region];
        const rank = 1;

        saSongItem.innerHTML = `
            <div class="sa-song-image">
                <img src="${topSong.CoverImage || 'images/logoo.jpg'}" alt="Cover Image"
                    onerror="this.onerror=null; this.src='images/logoo.jpg';">
            </div>
            <div class="sa-song-text">
                <div class="sa-song-rank">${rank}. ${countryInfo.flag}</div>
                <div class="sa-song-title">${topSong.Title}</div>
                <div class="sa-song-artist">by ${topSong.Artist}</div>
            </div>
        `;
        saSongList.appendChild(saSongItem);
        slide.appendChild(saSongList);
        saCarouselContainer.appendChild(slide);
    } else {
        const topSong = songs.find(song => song.Position === 1);
        const saSongItem = document.createElement('div');
        saSongItem.className = 'sa-song-item';
        const countryInfo = countryData[region];
        const countryTitle = countryInfo ? `${countryInfo.flag} Spotify Top 5 ${countryInfo.name}` : `Spotify Top 5 ${region.toUpperCase()}`;

        saSongItem.innerHTML = `
            <div class="sa-song-country">${countryTitle}</div>
            <div class="sa-song-image">
                <img src="${topSong.CoverImage || 'images/logoo.jpg'}" alt="Cover Image" onerror="this.onerror=null; this.src='images/logoo.jpg';">
            </div>
            <div class="sa-song-title">${topSong.Title}</div>
            <div class="sa-song-artist">${topSong.Artist}</div>
        `;
        saSongList.appendChild(saSongItem);

        const table = document.createElement('table');
        table.className = 'sa-song-table';
        const otherSongs = songs.filter(song => song.Position >= 2 && song.Position <= 5);
        otherSongs.sort((a, b) => a.Position - b.Position);
        otherSongs.forEach(song => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${song.Position}</td>
                <td>${song.Title}</td>
                <td>${song.Artist}</td>
            `;
            table.appendChild(row);
        });
        saSongList.appendChild(table);
        slide.appendChild(saSongList);
        saCarouselContainer.appendChild(slide);
    }
}

function setupSACarousel() {
    const slides = document.querySelectorAll('.sa-chart-slide');
    const indicators = document.querySelector('.sa-carousel-indicators');
    let currentSlide = 0;
    slides[currentSlide].style.display = 'block';
    slides.forEach((slide, index) => {
        const indicator = document.createElement('button');
        if (index === 0) indicator.className = 'active';
        indicator.addEventListener('click', () => changeSlide(index));
        indicators.appendChild(indicator);
    });
    document.querySelector('.sa-arrow.left').addEventListener('click', () => {
        const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
        changeSlide(prevSlide);
    });
    document.querySelector('.sa-arrow.right').addEventListener('click', () => {
        const nextSlide = (currentSlide + 1) % slides.length;
        changeSlide(nextSlide);
    });
    function changeSlide(index) {
        slides[currentSlide].style.display = 'none';
        indicators.children[currentSlide].classList.remove('active');
        slides[index].style.display = 'block';
        indicators.children[index].classList.add('active');
        currentSlide = index;
    }
    setInterval(() => {
        const nextSlide = (currentSlide + 1) % slides.length;
        changeSlide(nextSlide);
    }, 7000);
}

function loadDataForEUContainer() {
    const euRegions = ['fr', 'be', 'it', 'de', 'nl'];
    euRegions.forEach(region => loadEURegionData(region));
    setTimeout(() => setupEUCarousel(), 1000);
}

function loadEURegionData(region) {
    const jsonFile = `DATABASES/SPOTIFY/SP_${region}.json`;
    const tsFile = 'DATABASES/SPOTIFY/TS.json';
    Promise.all([
        fetch(jsonFile).then(response => response.json()),
        fetch(tsFile).then(response => response.json())
    ])
        .then(([spData, tsData]) => {
            const mergedData = mergeDataBySongID(spData, tsData);
            const topSongs = mergedData.filter(song => song.Position >= 1 && song.Position <= 5);
            createEUSlide(topSongs, region);
        })
        .catch(error => console.error('Error loading JSON files:', error));
}

function createEUSlide(songs, region) {
    const euCarouselContainer = document.getElementById('euCarousel');
    const slide = document.createElement('div');
    slide.className = 'eu-chart-slide';
    const euSongList = document.createElement('div');
    euSongList.className = 'eu-song-list';
    const isMobile = window.innerWidth <= 600;

    if (isMobile) {
        const topSong = songs.find(song => song.Position === 1);
        const euSongItem = document.createElement('div');
        euSongItem.className = 'eu-song-item';
        const countryInfo = countryData[region];
        const rank = 1;

        euSongItem.innerHTML = `
            <div class="eu-song-image">
                <img src="${topSong.CoverImage || 'images/logoo.jpg'}" alt="Cover Image"
                    onerror="this.onerror=null; this.src='images/logoo.jpg';">
            </div>
            <div class="eu-song-text">
                <div class="eu-song-rank">${rank}. ${countryInfo.flag}</div>
                <div class="eu-song-title">${topSong.Title}</div>
                <div class="eu-song-artist">by ${topSong.Artist}</div>
            </div>
        `;
        euSongList.appendChild(euSongItem);
        slide.appendChild(euSongList);
        euCarouselContainer.appendChild(slide);
    } else {
        const topSong = songs.find(song => song.Position === 1);
        const euSongItem = document.createElement('div');
        euSongItem.className = 'eu-song-item';
        const countryInfo = countryData[region];
        const countryTitle = countryInfo ? `${countryInfo.flag} Spotify Top 5 ${countryInfo.name}` : `Spotify Top 5 ${region.toUpperCase()}`;

        euSongItem.innerHTML = `
            <div class="eu-song-country">${countryTitle}</div>
            <div class="eu-song-image">
                <img src="${topSong.CoverImage || 'images/logoo.jpg'}" alt="Cover Image" onerror="this.onerror=null; this.src='images/logoo.jpg';">
            </div>
            <div class="eu-song-title">${topSong.Title}</div>
            <div class="eu-song-artist">${topSong.Artist}</div>
        `;
        euSongList.appendChild(euSongItem);

        const table = document.createElement('table');
        table.className = 'eu-song-table';
        const otherSongs = songs.filter(song => song.Position >= 2 && song.Position <= 5);
        otherSongs.sort((a, b) => a.Position - b.Position);
        otherSongs.forEach(song => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${song.Position}</td>
                <td>${song.Title}</td>
                <td>${song.Artist}</td>
            `;
            table.appendChild(row);
        });
        euSongList.appendChild(table);
        slide.appendChild(euSongList);
        euCarouselContainer.appendChild(slide);
    }
}

function setupEUCarousel() {
    const slides = document.querySelectorAll('.eu-chart-slide');
    const indicators = document.querySelector('.eu-carousel-indicators');
    let currentSlide = 0;
    slides[currentSlide].style.display = 'block';
    slides.forEach((slide, index) => {
        const indicator = document.createElement('button');
        if (index === 0) indicator.className = 'active';
        indicator.addEventListener('click', () => changeSlide(index));
        indicators.appendChild(indicator);
    });
    document.querySelector('.eu-arrow.left').addEventListener('click', () => {
        const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
        changeSlide(prevSlide);
    });
    document.querySelector('.eu-arrow.right').addEventListener('click', () => {
        const nextSlide = (currentSlide + 1) % slides.length;
        changeSlide(nextSlide);
    });
    function changeSlide(index) {
        slides[currentSlide].style.display = 'none';
        indicators.children[currentSlide].classList.remove('active');
        slides[index].style.display = 'block';
        indicators.children[index].classList.add('active');
        currentSlide = index;
    }
    setInterval(() => {
        const nextSlide = (currentSlide + 1) % slides.length;
        changeSlide(nextSlide);
    }, 7000);
}

function loadDataForWOContainer() {
    const woRegions = ['kr', 'jp', 'th', 'au', 'nz'];
    woRegions.forEach(region => loadWORegionData(region));
    setTimeout(() => setupWOCarousel(), 1000);
}

function loadWORegionData(region) {
    const jsonFile = `DATABASES/SPOTIFY/SP_${region}.json`;
    const tsFile = 'DATABASES/SPOTIFY/TS.json';
    Promise.all([
        fetch(jsonFile).then(response => response.json()),
        fetch(tsFile).then(response => response.json())
    ])
        .then(([spData, tsData]) => {
            const mergedData = mergeDataBySongID(spData, tsData);
            const topSongs = mergedData.filter(song => song.Position >= 1 && song.Position <= 5);
            createWOSlide(topSongs, region);
        })
        .catch(error => console.error('Error loading JSON files:', error));
}

function createWOSlide(songs, region) {
    const woCarouselContainer = document.getElementById('woCarousel');
    const slide = document.createElement('div');
    slide.className = 'wo-chart-slide';
    const woSongList = document.createElement('div');
    woSongList.className = 'wo-song-list';
    const isMobile = window.innerWidth <= 600;

    if (isMobile) {
        const topSong = songs.find(song => song.Position === 1);
        const woSongItem = document.createElement('div');
        woSongItem.className = 'wo-song-item';
        const countryInfo = countryData[region];
        const rank = 1;

        woSongItem.innerHTML = `
            <div class="wo-song-image">
                <img src="${topSong.CoverImage || 'images/logoo.jpg'}" alt="Cover Image"
                    onerror="this.onerror=null; this.src='images/logoo.jpg';">
            </div>
            <div class="wo-song-text">
                <div class="wo-song-rank">${rank}. ${countryInfo.flag}</div>
                <div class="wo-song-title">${topSong.Title}</div>
                <div class="wo-song-artist">by ${topSong.Artist}</div>
            </div>
        `;
        woSongList.appendChild(woSongItem);
        slide.appendChild(woSongList);
        woCarouselContainer.appendChild(slide);
    } else {
        const topSong = songs.find(song => song.Position === 1);
        const woSongItem = document.createElement('div');
        woSongItem.className = 'wo-song-item';
        const countryInfo = countryData[region];
        const countryTitle = countryInfo ? `${countryInfo.flag} Spotify Top 5 ${countryInfo.name}` : `Spotify Top 5 ${region.toUpperCase()}`;

        woSongItem.innerHTML = `
            <div class="wo-song-country">${countryTitle}</div>
            <div class="wo-song-image">
                <img src="${topSong.CoverImage || 'images/logoo.jpg'}" alt="Cover Image" onerror="this.onerror=null; this.src='images/logoo.jpg';">
            </div>
            <div class="wo-song-title">${topSong.Title}</div>
            <div class="wo-song-artist">${topSong.Artist}</div>
        `;
        woSongList.appendChild(woSongItem);

        const table = document.createElement('table');
        table.className = 'wo-song-table';
        const otherSongs = songs.filter(song => song.Position >= 2 && song.Position <= 5);
        otherSongs.sort((a, b) => a.Position - b.Position);
        otherSongs.forEach(song => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${song.Position}</td>
                <td>${song.Title}</td>
                <td>${song.Artist}</td>
            `;
            table.appendChild(row);
        });
        woSongList.appendChild(table);
        slide.appendChild(woSongList);
        woCarouselContainer.appendChild(slide);
    }
}

function setupWOCarousel() {
    const slides = document.querySelectorAll('.wo-chart-slide');
    const indicators = document.querySelector('.wo-carousel-indicators');
    let currentSlide = 0;
    slides[currentSlide].style.display = 'block';
    slides.forEach((slide, index) => {
        const indicator = document.createElement('button');
        if (index === 0) indicator.className = 'active';
        indicator.addEventListener('click', () => changeSlide(index));
        indicators.appendChild(indicator);
    });
    document.querySelector('.wo-arrow.left').addEventListener('click', () => {
        const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
        changeSlide(prevSlide);
    });
    document.querySelector('.wo-arrow.right').addEventListener('click', () => {
        const nextSlide = (currentSlide + 1) % slides.length;
        changeSlide(nextSlide);
    });
    function changeSlide(index) {
        slides[currentSlide].style.display = 'none';
        indicators.children[currentSlide].classList.remove('active');
        slides[index].style.display = 'block';
        indicators.children[index].classList.add('active');
        currentSlide = index;
    }
    setInterval(() => {
        const nextSlide = (currentSlide + 1) % slides.length;
        changeSlide(nextSlide);
    }, 7000);
}



function loadYouTubeTrends() {
    const jsonFile = 'DATABASES/daily_table.json';
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            displayTrends(data);
        })
        .catch(error => console.error('Error loading trends data:', error));
}

function displayTrends(data) {
    const container = document.getElementById('youtube-trends');

    // Helper function to create a table with a header, icon, and rows
    function createTable(platformName, platformData, limit, isYouTube = false, tableClass, iconUrl) {
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';

        const table = document.createElement('table');
        table.className = `${tableClass} trends-table`;

        // Add table header with the platform name and icon
        const headerRow = document.createElement('tr');
        headerRow.className = 'table-header';
        headerRow.innerHTML = `
            <th colspan="2">
                <img src="${iconUrl}" alt="${platformName} logo" class="platform-icon" />
                ${platformName}
            </th>
        `;
        table.appendChild(headerRow);

        // Add rows for the platform data
        platformData.slice(0, limit).forEach(item => {
            const row = document.createElement('tr');
            if (isYouTube) {
                // For YouTube, make the Title clickable with youtube_url
                row.innerHTML = `
                    <td style="width: 5%; color: white;">${item.Position}</td>
                    <td style="width: 95%; color: white;"><a href="${item.youtube_url || '#'}" target="_blank" rel="noopener noreferrer" style="color: white;">${item.Title}</a></td>
                `;
            } else {
                // For other platforms, combine Title - Artist
                const combinedTitle = `${item.Title} - ${item.Artist}`;
                row.innerHTML = `
                    <td style="width: 5%; color: white;">${item.Position}</td>
                    <td style="width: 95%; color: white;">${combinedTitle}</td>
                `;
            }
            table.appendChild(row);
        });

        // Append the table to the container
        tableContainer.appendChild(table);
        container.appendChild(tableContainer);
    }

    // Display tables for each platform with different colors and icons
    createTable('YouTube', data.YouTube, 5, true, 'youtube-insights-table', 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png');
    createTable('iTunes', data.iTunes, 5, false, 'itunes-table', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/2048px-Apple_Music_icon.svg.png');
    createTable('Apple Music', data["Apple Music"], 5, false, 'apple-music-table', 'https://www.citypng.com/public/uploads/preview/hd-apple-itunes-music-round-white-icon-transparent-background-701751694974721aets5ghsqq.png');
    createTable('Shazam', data.Shazam, 5, false, 'shazam-table', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Shazam_icon.svg/2048px-Shazam_icon.svg.png');
    createTable('Deezer', data.Deezer, 5, false, 'deezer-table', 'https://brandlogo.org/wp-content/uploads/2024/05/Deezer-Logo-Icon-300x300.png.webp');
    createTable('Billboard', data.Billboard, 5, false, 'billboard-table', 'https://www.billboard.com/wp-content/uploads/media/billboard-logo-b-20-billboard-1548.jpg?w=1024');
}


