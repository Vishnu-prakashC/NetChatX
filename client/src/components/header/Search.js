import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { getDataAPI, postDataAPI } from "../../utils/fetchData";
import { GLOBALTYPES } from "../../redux/actions/globalTypes";
import Avatar from "../Avatar";
import LoadIcon from "../../images/loading.gif";

const Search = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState({ users: [], posts: [], hashtags: [] });
  const [activeFilter, setActiveFilter] = useState('all');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const { auth } = useSelector((state) => state);
  const dispatch = useDispatch();
  const history = useHistory();
  const [load, setLoad] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults({ users: [], posts: [], hashtags: [] });
      return;
    }

    try {
      setLoad(true);
      const res = await getDataAPI(`search?username=${searchTerm}&type=${activeFilter}&limit=15`, auth.token);
      setResults(res.data);
      setLoad(false);
    } catch (err) {
      setLoad(false);
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: err.response?.data?.msg || "Search failed" },
      });
    }
  }, [auth.token, activeFilter, dispatch]);

  // Handle real-time search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (search) {
        debouncedSearch(search);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, debouncedSearch]);

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent);
    
    // Popular suggestions
    setSuggestions([
      { type: 'user', text: 'john_doe', icon: 'fas fa-user' },
      { type: 'hashtag', text: '#photography', icon: 'fas fa-hashtag' },
      { type: 'hashtag', text: '#travel', icon: 'fas fa-hashtag' },
      { type: 'user', text: 'sarah_wilson', icon: 'fas fa-user' },
    ]);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      addToRecentSearches(search.trim());
      debouncedSearch(search.trim());
    }
  };

  const addToRecentSearches = (searchTerm) => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const newRecent = [searchTerm, ...recent.filter(item => item !== searchTerm)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    setRecentSearches(newRecent);
  };

  const handleClose = () => {
    setSearch("");
    setResults({ users: [], posts: [], hashtags: [] });
    setIsOpen(false);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion);
    debouncedSearch(suggestion);
    addToRecentSearches(suggestion);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
        setResults({ users: [], posts: [], hashtags: [] });
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return (
    <div className="world-class-search-container" ref={searchRef}>
      <form className="search-form-advanced" onSubmit={handleSearchSubmit}>
        <div className="search-input-container">
          <div className="search-icon-wrapper">
            <i className="fas fa-search search-icon"></i>
          </div>
          
          <input
            type="text"
            placeholder="Search MESME..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={handleFocus}
            className="search-input-advanced"
            autoComplete="off"
          />
          
          {search && (
            <button
              type="button"
              onClick={handleClose}
              className="search-clear-button"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
          
          {load && (
            <div className="search-loading-indicator">
              <div className="loading-spinner-mini"></div>
            </div>
          )}
        </div>
      </form>

      {/* Advanced Search Dropdown */}
      {isOpen && (
        <div className="search-dropdown-advanced">
          {!search ? (
            // Show recent searches and suggestions when no search term
            <div className="search-suggestions-container">
              {recentSearches.length > 0 && (
                <div className="search-section">
                  <div className="search-section-header">
                    <h4>Recent searches</h4>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('recentSearches');
                        setRecentSearches([]);
                      }}
                      className="clear-recent-btn"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="recent-searches-list">
                    {recentSearches.map((recent, index) => (
                      <div 
                        key={index}
                        className="recent-search-item"
                        onClick={() => handleSuggestionClick(recent)}
                      >
                        <i className="fas fa-history"></i>
                        <span>{recent}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const newRecent = recentSearches.filter(item => item !== recent);
                            localStorage.setItem('recentSearches', JSON.stringify(newRecent));
                            setRecentSearches(newRecent);
                          }}
                          className="remove-recent-btn"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="search-section">
                <div className="search-section-header">
                  <h4>Popular searches</h4>
                </div>
                <div className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion.text)}
                    >
                      <i className={suggestion.icon}></i>
                      <span>{suggestion.text}</span>
                      <i className="fas fa-arrow-up-right suggestion-arrow"></i>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Show search results
            <div className="search-results-container">
              {/* Filter Tabs */}
              <div className="search-filter-tabs">
                {['all', 'users', 'posts', 'hashtags'].map(filter => (
                  <button
                    key={filter}
                    className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                    {filter === 'all' && (
                      <span className="total-count">
                        {results.users?.length + results.posts?.length + results.hashtags?.length || 0}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {load ? (
                <div className="search-loading-state">
                  <div className="loading-animation">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <p>Searching across MESME...</p>
                </div>
              ) : (
                <div className="search-results-content">
                  {/* Users Results */}
                  {(activeFilter === 'all' || activeFilter === 'users') && results.users?.length > 0 && (
                    <div className="results-section">
                      <div className="results-section-header">
                        <h4>
                          <i className="fas fa-users"></i>
                          People ({results.users.length})
                        </h4>
                      </div>
                      <div className="users-results-grid">
                        {results.users.slice(0, activeFilter === 'users' ? 15 : 5).map(user => (
                          <div 
                            key={user._id}
                            className="user-result-card"
                            onClick={() => { handleClose(); history.push(`/profile/${user._id}`); }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter') { handleClose(); history.push(`/profile/${user._id}`); } }}
                          >
                            <Avatar src={user.avatar} size="medium-avatar" />
                            <div className="user-result-info">
                              <h5>{user.fullname}</h5>
                              <p>@{user.username}</p>
                              <span className="followers-count">
                                {user.followers?.length || 0} followers
                              </span>
                            </div>
                            <div className="user-result-actions">
                              {/* Quick message button */}
                              <button
                                type="button"
                                className="modern-btn message-btn small-btn"
                                onClick={async (e) => { 
                                  e.stopPropagation();
                                  console.log('Search -> message click:', { userId: user._id, username: user.username });
                                  handleClose(); 
                                  try {
                                    const res = await postDataAPI('conversations', { recipient: user._id }, auth.token);
                                    console.log('createConversation response:', res.data);
                                  } catch (err) {
                                    console.error('createConversation error:', err?.response?.data || err.message);
                                  }
                                  history.push(`/message/${user._id}`); 
                                }}
                                aria-label={`Message ${user.username}`}
                              >
                                <i className="fas fa-paper-plane"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Posts Results */}
                  {(activeFilter === 'all' || activeFilter === 'posts') && results.posts?.length > 0 && (
                    <div className="results-section">
                      <div className="results-section-header">
                        <h4>
                          <i className="fas fa-file-alt"></i>
                          Posts ({results.posts.length})
                        </h4>
                      </div>
                      <div className="posts-results-list">
                        {results.posts.slice(0, activeFilter === 'posts' ? 15 : 3).map(post => (
                          <div key={post._id} className="post-result-card">
                            <Avatar src={post.user?.avatar} size="small-avatar" />
                            <div className="post-result-content">
                              <div className="post-result-header">
                                <span className="post-author">@{post.user?.username}</span>
                                <span className="post-date">
                                  {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="post-preview">
                                {post.content?.slice(0, 120)}
                                {post.content?.length > 120 ? '...' : ''}
                              </p>
                              <div className="post-stats">
                                <span><i className="fas fa-heart"></i> {post.likes?.length || 0}</span>
                                <span><i className="fas fa-comment"></i> {post.comments?.length || 0}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hashtags Results */}
                  {(activeFilter === 'all' || activeFilter === 'hashtags') && results.hashtags?.length > 0 && (
                    <div className="results-section">
                      <div className="results-section-header">
                        <h4>
                          <i className="fas fa-hashtag"></i>
                          Hashtags ({results.hashtags.length})
                        </h4>
                      </div>
                      <div className="hashtags-results-grid">
                        {results.hashtags.map((hashtag, index) => (
                          <div key={index} className="hashtag-result-card">
                            <div className="hashtag-icon">
                              <i className="fas fa-hashtag"></i>
                            </div>
                            <div className="hashtag-info">
                              <h5>{hashtag.tag}</h5>
                              <p>{hashtag.count} posts</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results */}
                  {!load && results.users?.length === 0 && results.posts?.length === 0 && results.hashtags?.length === 0 && (
                    <div className="no-results-state">
                      <div className="no-results-icon">
                        <i className="fas fa-search"></i>
                      </div>
                      <h3>No results found</h3>
                      <p>Try searching for something else or check your spelling</p>
                      <div className="search-suggestions">
                        <span>Try searching for:</span>
                        <div className="suggestion-tags">
                          {['#photography', '#travel', '#food', 'john', 'sarah'].map(tag => (
                            <button 
                              key={tag}
                              onClick={() => handleSuggestionClick(tag)}
                              className="suggestion-tag"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
