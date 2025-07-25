import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BooksPage from './pages/BooksPage';
import UpdateBookPage from './pages/UpdateBookPage';

import { AuthProvider } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';
import PublicRoute from './auth/PublicRoute';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/books" element={<PrivateRoute><BooksPage /></PrivateRoute>} />
          <Route path="/update-book/:id" element={<PrivateRoute><UpdateBookPage /></PrivateRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
