import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import icon from '../assets/book.ico';

// FontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faDownload, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

function BooksPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(() => {
    // Initialize currentPage from URL query param ?page=number, default to 1
    const page = parseInt(searchParams.get('page'), 10);
    return isNaN(page) || page < 1 ? 1 : page;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showConfirm, setShowConfirm] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [viewingBook, setViewingBook] = useState(null);
  const [viewDetailsBook, setViewDetailsBook] = useState(null);
  const toastRef = useRef(null);

  const token = localStorage.getItem('jwtToken');

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 1500);
  };

  // Fetch books for given page
  const fetchBooks = async (page = 1) => {
    try {
      const res = await axios.get(
        `https://book-management-system-backend-pearl.vercel.app/books?page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBooks(res.data.books);
      setTotalPages(res.data.totalPages);
    } catch {
      showToast('Failed to fetch books', 'danger');
    }
  };

  // Effect: On mount and whenever currentPage changes or search cleared, fetch books for that page
  useEffect(() => {
    document.title = `All Books | RabiuslBookManager`;
  }, []);

  // When currentPage changes, update URL query and fetch books if no search active
  useEffect(() => {
    // Update the URL query param without reload
    setSearchParams({ page: currentPage.toString() });

    // Only fetch books if no search is active
    if (!search.trim()) {
      fetchBooks(currentPage);
    }
  }, [currentPage, setSearchParams, search]);

  // When search changes, handle searching or reset
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      // If search cleared, reset to page 1 and fetch books normally
      setCurrentPage(1);
      fetchBooks(1);
      return;
    }

    try {
      const res = await axios.get(
        `https://book-management-system-backend-pearl.vercel.app/books/search?q=${encodeURIComponent(value)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBooks(res.data);
      setTotalPages(1);
      setCurrentPage(1);
    } catch {
      showToast('Search failed', 'danger');
    }
  };

  // Edit flow
  const handleEdit = (id) => setShowConfirm(id);
  const confirmEdit = (id) => {
    setShowConfirm(null);
    navigate(`/update-book/${id}`);
  };

  // Delete flow
  const handleDelete = (id) => setShowDelete(id);
  const confirmDelete = async (id) => {
    try {
      await axios.delete(
        `https://book-management-system-backend-pearl.vercel.app/books/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Book deleted successfully!', 'success');
      // Refresh current page after deletion
      if (!search.trim()) {
        fetchBooks(currentPage);
      } else {
        // Refresh search results after deletion
        handleSearch({ target: { value: search } });
      }
    } catch {
      showToast('Failed to delete book', 'danger');
    }
    setShowDelete(null);
  };

  // Extract Google Drive file id
  const extractDriveFileId = (url) => {
    const match = url.match(/\/d\/([^/]+)\//);
    return match ? match[1] : null;
  };

  // View book handler
  const handleViewBook = (book) => {
    const isDrive = book.url?.includes('drive.google.com');
    const fileId = isDrive ? extractDriveFileId(book.url) : null;
    if (!isDrive && book.url) {
      window.open(book.url, '_blank');
      return;
    }
    setViewingBook({ ...book, fileId, isDrive });
  };

  // Download book handler
  const handleDownload = (book) => {
    if (!book.url.includes('drive.google.com')) {
      showToast('Download available only for Google Drive files', 'warning');
      return;
    }
    const fileId = extractDriveFileId(book.url);
    const link = document.createElement('a');
    link.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
    link.download = `${book.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View details modal
  const handleViewDetails = (book) => {
    if (!book.description) return;
    setViewDetailsBook(book);
  };

  return (
    <>
      <Helmet>
        <title>All Books | RabiuslBookManager</title>
        <link rel="icon" href={icon} />
      </Helmet>

      <div className="container py-4">
        {toast.show && (
          <div
            ref={toastRef}
            className={`toast position-fixed top-0 start-50 translate-middle-x mt-3 shadow text-white bg-${toast.type} show`}
            style={{ zIndex: 1050, minWidth: '250px' }}
          >
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => setToast({ ...toast, show: false })}
              />
            </div>
          </div>
        )}

        <h2 className="text-center mb-4">📚 All Books</h2>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search book by name..."
          value={search}
          onChange={handleSearch}
        />

        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-primary text-center">
              <tr>
                <th>#</th>
                <th>Book Name</th>
                <th>Details</th>
                <th>Download</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {books.length > 0 ? (
                books.map((book, index) => (
                  <tr key={book._id}>
                    <td>{(currentPage - 1) * 10 + index + 1}</td>
                    <td>
                      {book.url ? (
                        <button
                          className="btn btn-link p-0 text-primary text-decoration-none"
                          onClick={() => handleViewBook(book)}
                        >
                          {book.title}
                        </button>
                      ) : (
                        <span>{book.title}</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleViewDetails(book)}
                        disabled={!book.description}
                      >
                        <FontAwesomeIcon icon={faCircleInfo} style={{ color: '#26d2df' }} />
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-success"
                        disabled={!book.url?.includes('drive.google.com')}
                        onClick={() => handleDownload(book)}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEdit(book._id)}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(book._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No books found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!search.trim() && (
          <nav className="d-flex justify-content-center">
            <ul className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Edit confirm modal */}
        {showConfirm !== null && (
          <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header"><h5 className="modal-title">Edit Book</h5></div>
                <div className="modal-body">Are you sure you want to edit this book?</div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowConfirm(null)}>No</button>
                  <button className="btn btn-primary" onClick={() => confirmEdit(showConfirm)}>Yes</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm modal */}
        {showDelete !== null && (
          <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header"><h5 className="modal-title">Delete Book</h5></div>
                <div className="modal-body">Are you sure you want to delete this book?</div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => { setShowDelete(null); showToast('Book deletion cancelled.', 'warning'); }}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={() => confirmDelete(showDelete)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View details modal */}
        {viewDetailsBook && (
          <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{viewDetailsBook.title}</h5>
                  <button className="btn-close" onClick={() => setViewDetailsBook(null)}></button>
                </div>
                <div className="modal-body">
                  <p>{viewDetailsBook.description}</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setViewDetailsBook(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Book preview modal */}
        {viewingBook && (
          <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1060 }}>
            <div className="modal-dialog modal-fullscreen">
              <div className="modal-content bg-dark text-white">
                <div className="modal-header border-0">
                  <h5 className="modal-title">{viewingBook.title}</h5>
                  <button className="btn-close btn-close-white" onClick={() => setViewingBook(null)}></button>
                </div>
                {viewingBook.description && (
                  <div className="px-3 pb-2 text-muted">
                    <em>{viewingBook.description}</em>
                  </div>
                )}
                <div className="modal-body p-0">
                  <iframe
                    src={viewingBook.isDrive ? `https://drive.google.com/file/d/${viewingBook.fileId}/preview` : viewingBook.url}
                    title="Book Viewer"
                    width="100%"
                    height="100%"
                    allow="autoplay"
                    style={{ border: 'none' }}
                  />
                </div>
                <div className="modal-footer justify-content-center">
                  <button className="btn btn-light" onClick={() => setViewingBook(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default BooksPage;
