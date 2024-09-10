import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Table from './components/Table';
import './App.css';

interface Song {
    SongID: string;
    Title: string;
    Artist: string;
    Album: string;
    Popularity: string;
    Duration: string;
    ReleaseDate: string;
    Genre: string;
    CoverImage: string;
    Views: number;  // Make sure all fields are correctly typed based on your backend data
}

const App = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [youtubeLink, setYoutubeLink] = useState('');

    useEffect(() => {
        fetch('http://localhost:3002/api/songs') // Adjust the URL if needed based on where your backend is hosted
            .then(response => response.json())
            .then(data => {
                setSongs(data);
                if (data.length > 0) {
                    updateTopSection(data[0]); // Default to first song if available
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    const updateTopSection = (song: Song) => {
        setSelectedSong(song);
        updateYouTubeLink(song.Title, song.Artist);
    };

    const updateYouTubeLink = (title: string, artist: string) => {
        const query = `${title} ${artist} Official Audio`;
        const apiKey = 'yourAPIKey'; // Replace with your actual API key
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.items && data.items.length > 0) {
                    const videoId = data.items[0].id.videoId;
                    const newLink = `https://www.youtube.com/watch?v=${videoId}`;
                    setYoutubeLink(newLink);
                } else {
                    setYoutubeLink('');
                }
            })
            .catch(error => {
                console.error('Error fetching YouTube data:', error);
                setYoutubeLink('');
            });
    };

    return (
        <div className="container">
            {selectedSong && <Header title={selectedSong.Title} artist={selectedSong.Artist} album={selectedSong.Album} coverImage={selectedSong.CoverImage} youtubeLink={youtubeLink}/>}
            <SearchBar />
            <Table songs={songs} onSelectSong={updateTopSection} />
        </div>
    );
};

export default App;
