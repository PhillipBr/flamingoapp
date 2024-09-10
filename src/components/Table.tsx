import React from 'react';

interface Song {
    SongID: string;
    Title: string;
    Artist: string;
    Album: string;
    Popularity: string; // Assuming this is where the raw views number will come from
    Duration: string;
    ReleaseDate: string;
    Genre: string;
    CoverImage: string;
    Views: number; // If this is the field that holds the views count
}

interface TableProps {
    songs: Song[];
    onSelectSong: (song: Song) => void;
}

const formatViews = (number: number): string => {
    if (number >= 1e9) { // Represents a billion
        return (number / 1e9).toFixed(2) + ' B';
    } else if (number >= 1e6) { // Represents a million
        return (number / 1e6).toFixed(1) + ' M';
    } else {
        return number.toString(); // Returns the number as is if less than a million
    }
};

const Table: React.FC<TableProps> = ({ songs, onSelectSong }) => {
    return (
        <div className="table-container">
            <table className="table">
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Album</th>
                    <th>Views</th>
                    <th>Duration</th>
                    <th>Release</th>
                    <th>Genre</th>
                </tr>
                </thead>
                <tbody>
                {songs.map((song) => (
                    <tr key={song.SongID} onClick={() => onSelectSong(song)}>
                        <td>
                            <div className="title-artist">
                                <div className="song-title">{song.Title}</div>
                                <div className="song-artist">{song.Artist}</div>
                            </div>
                        </td>
                        <td>{song.Album}</td>
                        <td>{formatViews(song.Views)}</td>
                        <td>{song.Duration}</td>
                        <td>{song.ReleaseDate ? song.ReleaseDate.substring(0, 4) : 'Not Available'}</td>
                        <td>{song.Genre}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
