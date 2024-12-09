import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { FaSearch } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import _ from "lodash";

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  margin: auto;
`;

const SearchBox = styled.input`
  width: 100%;
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
`;

const SearchButton = styled.button`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
`;

const Suggestions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-top: none;
  background-color: #fff;
  border-radius: 0 0 25px 25px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: ${({ isvisible }) => (isvisible === 'true' ? "block" : "none")};
`;

const SuggestionItem = styled.div`
  padding: 10px 20px;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const SearchBarWithSuggestion = ({ searchData = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [, setSearchParams] = useSearchParams();

  // Debounced search filtering
  const filterSuggestions = useCallback(
    _.debounce((query) => {
      const results = searchData.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(results);
    }, 300),
    [searchData]
  );

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    setShowSuggestions(query.length > 0);
    filterSuggestions(query);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setSearchParams((prevParams) => {
      if (!suggestion) {
        prevParams.delete("search");
      } else {
        prevParams.set("search", suggestion);
      }
      return prevParams;
    });
  };

  const handleOutsideClick = useCallback((e) => {
    if (!e.target.closest(".search-container")) {
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [handleOutsideClick]);

  return (
    <SearchContainer className="search-container">
      <SearchBox
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleInputChange}
      />
      <SearchButton type="button" onClick={() => handleSuggestionClick(searchTerm)}>
        <FaSearch />
      </SearchButton>
      <Suggestions isvisible={`${showSuggestions}`}>
        {filteredSuggestions.map((suggestion, index) => (
          <SuggestionItem
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="text-capitalize"
          >
            {suggestion}
          </SuggestionItem>
        ))}
      </Suggestions>
    </SearchContainer>
  );
};

export default SearchBarWithSuggestion;
