import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Helmet } from 'react-helmet';
import icon from '../assets/book.ico';

const PublicRoute = ({ children }) => {
  const { user, jwt, loading } = useAuth();

 if (loading) {
    return (
      <>
       <Helmet>
          <title>Login</title>
          <link rel="icon" href={icon} />
        </Helmet>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
         margin: '100px 0 0 0',
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      </>
    );
  }

  // Redirect to home if user is already authenticated
  return !user || !jwt ? children : <Navigate to="/" />;
};

export default PublicRoute;
