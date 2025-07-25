import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

function Navbar() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('jwtToken');
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <style>{`
        .custom-navbar {
          background-color: #0d6efd;
          padding: 0.5rem 1rem;
        }

        .custom-nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .custom-brand {
          color: white;
          font-weight: bold;
          font-size: 1.25rem;
          text-decoration: none;
        }

        .custom-nav-links {
          display: flex;
          flex-direction: row;
          list-style: none;
          margin-bottom: 0;
          padding-left: 0;
        }

        .custom-nav-links li {
          margin-left: 1rem;
        }

        .custom-link {
          color: white;
          text-decoration: none;
          cursor: pointer;
        }

        @media (max-width: 575.98px) {
          .custom-nav-container {
            justify-content: center;
            flex-direction: column;
          }

          .custom-nav-links {
            justify-content: space-around;
            width: 100%;
            margin-top: 0.5rem;
          }

          .custom-nav-links li {
            margin-left: 0;
          }
        }
      `}</style>

      <nav className="custom-navbar">
        <div className="custom-nav-container">
          <Link className="custom-brand" to="/">📘 RabiuslBookManager</Link>
          <ul className="custom-nav-links">
            {!user ? (
              <li>
                <Link className="custom-link" to="/login">Login</Link>
              </li>
            ) : (
              <>
                <li>
                  <Link className="custom-link" to="/">Home</Link>
                </li>
                <li>
                  <Link className="custom-link" to="/books">All Books</Link>
                </li>
                <li>
                  <span className="custom-link" onClick={handleLogout}>Logout</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
