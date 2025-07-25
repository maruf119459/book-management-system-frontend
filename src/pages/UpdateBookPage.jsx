import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';   
import icon from '../assets/book.ico';
function UpdateBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");
  const toastRef = useRef(null);

  const [bookData, setBookData] = useState({
    title: '',
    url: '',
  });

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: '', // success | danger
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false }), 3000);
  };

  // Fetch book data by ID
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`https://book-management-system-backend-pearl.vercel.app/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setBookData({
          title: res.data.title || '',
          url: res.data.url || '',
        });
        document.title = `Update Book | ${res.data.title}`;
      } catch (err) {
        showToast("Failed to load book details", "danger");
      }
    };

    fetchBook();

  }, [id, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`https://book-management-system-backend-pearl.vercel.app/books/${id}`, bookData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      showToast(`Book "${bookData.title}" updated successfully`, "success");
      setTimeout(() => navigate("/books"), 1500);
    } catch (err) {
      console.error(err);
      showToast("Failed to update book", "danger");
    }
  };

  return (
    <>
      <Helmet>
        <title>{`Update Book | ${bookData.title}`}</title>
        <link rel="icon" href={icon} />
      </Helmet>
      <div className="container py-4">
        <h2 className="text-center mb-4">✏️ Update Book</h2>

        {toast.show && (
          <div
            ref={toastRef}
            className={`toast position-fixed top-0 start-50 translate-middle-x mt-3 shadow text-white bg-${toast.type} show`}
            style={{ zIndex: 1050, minWidth: "250px" }}
          >
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => setToast({ ...toast, show: false })}
              ></button>
            </div>
          </div>
        )}

        <form onSubmit={handleUpdate} className="bg-light p-4 rounded shadow-sm">
          <div className="mb-3">
            <label className="form-label fw-bold">Book Name</label>
            <input
              type="text"
              className="form-control"
              name="title"
              onChange={handleInputChange}
              required
              placeholder={bookData.title || "Enter book name"}
              value={bookData.title}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Book URL</label>
            <input
              type="url"
              className="form-control"
              name="url"

              onChange={handleInputChange}
              placeholder={bookData.url || "No url. Enter book URL"}
              value={bookData.url || ''}
            />
            {!bookData.url && (
              <div className="form-text text-danger">No URL found</div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100">Update Book</button>
        </form>
      </div>
    </>
  );
}

export default UpdateBookPage;
