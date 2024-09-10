import React from 'react';

interface HeaderProps {
    title: string;
    artist: string;
    album: string;
    coverImage: string;
    youtubeLink: string;
}

const Header: React.FC<HeaderProps> = ({ title, artist, album, coverImage, youtubeLink }) => {
    return (

        <div className="header-container">
            <div className="top">
                <div className="image">
                    <img src={coverImage} alt="Album Cover" />
                </div>
                <div className="text">
                    <div className="title">{title}</div>
                    <div className="artists">{artist}</div>
                    <div className="album">{album}</div>
                    <div className="icons">
                        <a href={youtubeLink || '#'} target="_blank">
                            <img src="https://cdn3.iconfinder.com/data/icons/social-network-30/512/social-06-512.png" alt="YouTube" />
                        </a>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;
