import "./SearchBar.css";
import { useState } from "react";

const SearchBar = ({ onSearch }) => {

    const [keyword, setKeyword] = useState("");

    const handleSearch = () => {

        if (onSearch) {
            onSearch(keyword);
        }

    };

    const handleKeyDown = (event) => {

        if (event.key === "Enter") {
            handleSearch();
        }

    };

    const clearSearch = () => {

        setKeyword("");

        if (onSearch) {
            onSearch("");
        }

    };

    return (

        <div className="search-container">

            <div className="search-box">

                <input
                    type="text"
                    placeholder="Search your favourite food..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                {
                    keyword && (

                        <button
                            className="clear-btn"
                            onClick={clearSearch}
                        >

                            ✖

                        </button>

                    )
                }

                <button
                    className="search-btn"
                    onClick={handleSearch}
                >

                    🔍 Search

                </button>

            </div>

        </div>

    );

};

export default SearchBar;