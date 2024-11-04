document.addEventListener("DOMContentLoaded", function () {
    const bannerContent = document.getElementById('banner_content');

    const countryCodes = {
        'global': {'name': 'Global', 'flag': '🌐'},
        'us': {'name': 'United States', 'flag': '🇺🇸'},
        'uk': {'name': 'United Kingdom', 'flag': '🇬🇧'},
        'gb': {'name': 'United Kingdom', 'flag': '🇬🇧'},
        'ca': {'name': 'Canada', 'flag': '🇨🇦'},
        'br': {'name': 'Brazil', 'flag': '🇧🇷'},
        'in': {'name': 'India', 'flag': '🇮🇳'},
        'ar': {'name': 'Argentina', 'flag': '🇦🇷'},
        'co': {'name': 'Colombia', 'flag': '🇨🇴'},
        'cl': {'name': 'Chile', 'flag': '🇨🇱'},
        'mx': {'name': 'Mexico', 'flag': '🇲🇽'},
        'es': {'name': 'Spain', 'flag': '🇪🇸'},
        'fr': {'name': 'France', 'flag': '🇫🇷'},
        'be': {'name': 'Belgium', 'flag': '🇧🇪'},
        'it': {'name': 'Italy', 'flag': '🇮🇹'},
        'de': {'name': 'Germany', 'flag': '🇩🇪'},
        'nl': {'name': 'Netherlands', 'flag': '🇳🇱'},
        'kr': {'name': 'South Korea', 'flag': '🇰🇷'},
        'jp': {'name': 'Japan', 'flag': '🇯🇵'},
        'th': {'name': 'Thailand', 'flag': '🇹🇭'},
        'au': {'name': 'Australia', 'flag': '🇦🇺'},
        'nz': {'name': 'New Zealand', 'flag': '🇳🇿'}
    };

    const platformLogos = {
        'Spotify': 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png',
        'YouTube': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png',
        'YouTube Insights': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png',
        'iTunes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/2048px-Apple_Music_icon.svg.png',
        'Apple Music': 'https://www.citypng.com/public/uploads/preview/hd-apple-itunes-music-round-white-icon-transparent-background-701751694974721aets5ghsqq.png',
        'Deezer': 'https://brandlogo.org/wp-content/uploads/2024/05/Deezer-Logo-Icon-300x300.png.webp',
        'Shazam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Shazam_icon.svg/2048px-Shazam_icon.svg.png'
    };

    const platforms = ['Spotify', 'YouTube', 'iTunes', 'Apple Music', 'Deezer', 'Shazam', 'YouTube Insights'];

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    let scrollPosition = 0; // Starting position for track display
    const displayLimit = 3; // Number of tracks to display at once
    const countryLimitPerCycle = 3; // Max number of countries to show per platform

    function displayNextSet(data, startPosition) {
        let content = '';
        const endPosition = startPosition + displayLimit;
        const displayCycle = [...platforms];

        shuffleArray(displayCycle); // Shuffle platforms for randomness

        for (let i = 0; i < displayCycle.length; i++) {
            const platform = displayCycle[i];
            if (data[platform]) {
                content += `<span class="${platform.toLowerCase()}"><img src="${platformLogos[platform]}" style="height: 20px; width: 20px; vertical-align: middle;"> <strong>${platform}:</strong> `;

                let countries = Object.keys(data[platform]);
                shuffleArray(countries);  // Shuffle countries for randomness

                let countryCount = 0;
                for (const country of countries) {
                    if (countryCount >= countryLimitPerCycle) break;

                    const tracks = data[platform][country];
                    const flag = countryCodes[country]?.flag || '';
                    content += `<span class="country">${flag} ${country.toUpperCase()}:</span> `;

                    tracks.slice(startPosition, endPosition).forEach(track => {
                        if (platform === 'YouTube' || platform === 'YouTube Insights') {
                            const youtubeUrl = track.youtube_url || '';
                            content += `<span class="position">${track.Position}</span> <span class="separator">-</span> `;
                            if (youtubeUrl) {
                                content += `<a href="${youtubeUrl}" target="_blank" style="text-decoration: none;"><strong>${track.Title}</strong></a>&nbsp;&nbsp;`;
                            } else {
                                content += `<strong>${track.Title}</strong>&nbsp;&nbsp;`;
                            }
                        } else if (platform === 'Spotify') {
                            const spotifyUrl = track.spotify_url || '';
                            content += `<span class="position">${track.Position}</span> <span class="separator">-</span> `;
                            if (spotifyUrl) {
                                content += `<a href="${spotifyUrl}" target="_blank" style="text-decoration: none;"><strong>${track.Title} - ${track.Artist}</strong></a>&nbsp;&nbsp;`;
                            } else {
                                content += `<strong>${track.Title} - ${track.Artist}</strong>&nbsp;&nbsp;`;
                            }
                        } else {
                            content += `<span class="position">${track.Position}</span> <span class="separator">-</span> `;
                            content += `<strong>${track.Title} - ${track.Artist}</strong>&nbsp;&nbsp;`;
                        }
                    });

                    countryCount++;
                }
                content += '</span>&nbsp;&nbsp;';
            }
        }

        bannerContent.innerHTML += content;
        scrollPosition = endPosition;
    }

    // Fetch and display the data
    fetch('DATABASES/daily_banner.json')
        .then(response => response.json())
        .then(data => {
            displayNextSet(data, scrollPosition);
        })
        .catch(error => {
            console.error("Error fetching JSON data:", error);
            bannerContent.textContent = "Failed to load trends.";
        });
});
