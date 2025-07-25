import React, { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet";
import icon from "../book.ico";
function HomePage() {
  const [bookName, setBookName] = useState("");
  const [bookUrl, setBookUrl] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const toastRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null);


  const token = localStorage.getItem("jwtToken");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2000);
  };

  useEffect(() => {
    document.title = "Home | RabiuslBookManager";
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setSuggestionsVisible(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/books/search?q=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const titles = data.map((book) => book.title);
        setSuggestions(titles);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBookName(value);
    setSuggestionsVisible(true);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookName.trim()) {
      showToast("Please enter the book name.", "danger");
      return;
    }

    const payload = { title: bookName.trim() };
    if (bookUrl.trim()) payload.url = bookUrl.trim();

    try {
      const response = await fetch("http://localhost:5000/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        showToast(errorText || "Failed to add book", "danger");
        return;
      }

      await response.json();
      showToast("Book added successfully!", "success");
      setBookName("");
      setBookUrl("");
    } catch (err) {
      console.error(err);
      showToast("Error adding book.", "danger");
    }
  };

  return (
    <>
      <Helmet>
        <title>Home | RabiuslBookManager</title>
        <link rel="icon" href={icon} />
      </Helmet>
      <div className="d-flex align-items-center justify-content-center mt-5">
        {toast.show && (
          <div
            ref={toastRef}
            className={`toast position-fixed top-0 start-50 translate-middle-x mt-3 shadow text-white bg-${toast.type} show`}
            style={{ zIndex: 1050, minWidth: "250px" }}
          >
            <div className="d-flex">
              <div className="toast-body ">{toast.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => setToast({ ...toast, show: false })}
              ></button>
            </div>
          </div>
        )}

        <div className="w-100 px-3" style={{ maxWidth: "450px" }}>
          <div className="text-center mb-4">
            <h1 className="text-primary fw-bold">📚 Add New Book</h1>
            <p className="text-muted">Enter the book name and its URL (optional).</p>
          </div>
          <div className="card p-4 shadow-sm">
            <form onSubmit={handleSubmit}>
              <div className="mb-3 position-relative" ref={inputRef}>
                <label htmlFor="bookName" className="form-label">
                  Book Name
                </label>
                <input
                  type="text"
                  id="bookName"
                  className="form-control form-control-lg"
                  placeholder="Enter book name"
                  value={bookName}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
                {suggestionsVisible && suggestions.length > 0 && (
                  <ul className="list-group position-absolute w-100 mt-1" style={{ zIndex: 10 }}>
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setBookName(suggestion);
                          setSuggestionsVisible(false);
                        }}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="bookUrl" className="form-label">
                  Book URL <span className="text-muted">(optional)</span>
                </label>
                <input
                  type="url"
                  id="bookUrl"
                  className="form-control"
                  placeholder="https://example.com/book.pdf"
                  value={bookUrl}
                  onChange={(e) => setBookUrl(e.target.value)}
                />
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-success btn-lg">
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
