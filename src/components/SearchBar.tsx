import React from 'react';

function SearchBar() {
    return (

        <div className="searchbar-container">
            <div className="search_bar">
                <input type="text" id="searchInput" placeholder="Search by Artist..." />
                <button id="searchButton">Search</button>

            </div>
        </div>
    );
}

export default SearchBar;
