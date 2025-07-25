import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import icon from '../assets/book.ico';

function LoginPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });


  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 2000);
  };


  const handleGoogleLogin = async () => {
    try {
      const onlyEmail = process.env.REACT_APP_ONLY_EMAIL;
    console.log("Allowed email:", onlyEmail);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user.email;

      // ✅ Only allow specific user
      if (email !== onlyEmail) {
        await user.delete(); // Delete unauthorized user from Firebase
        await auth.signOut(); // Sign out unauthorized user
        showToast('Unauthorized user. Access denied.', 'danger');
        return;
      }

      const token = await user.getIdToken();

      const BACKEND_URL = 'http://localhost:5000/login'; // Or device IP if needed
      const response = await axios.post(BACKEND_URL, { idToken: token });

      const jwtToken = response.data.token;
      localStorage.setItem('jwtToken', jwtToken);

      showToast('Google login successful!', 'success');
      setTimeout(() => navigate('/'), 1500);

    } catch (error) {
      console.error("Google login failed:", error);

      // Handle Firebase errors
      if (error.code === 'auth/popup-closed-by-user') {
        showToast('Login popup closed.', 'danger');
        return;
      }

      // Handle backend response errors
      if (error.response) {
        const { data, status } = error.response;
        console.error('Backend error:', data);
        showToast(`Backend error ${status}: ${data}`, 'danger');
      } else {
        showToast(error.message || 'Unknown login error', 'danger');
      }

      // Try to logout and delete user if still logged in
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await currentUser.delete();
          await auth.signOut();
          console.log('Deleted and signed out unauthorized user');
        } catch (logoutErr) {
          console.error('Error signing out user:', logoutErr.message);
        }
      }
    }
  };




  return (
    <>
      <Helmet>
        <title>Login | RabiuslBookManager</title>
        <link rel="icon" href={icon} />
      </Helmet>
      <div className="d-flex justify-content-center bg-light w-100" style={{ paddingTop: '150px', minHeight: '100vh' }}>
        {/* Toast */}
        {toast.show && (
          <div className={`toast position-fixed top-0 start-50 translate-middle-x mt-3 text-white bg-${toast.type} show`} style={{ zIndex: 1050 }}>
            <div className="toast-body d-flex justify-content-between align-items-center">
              {toast.message}
              <button className="btn-close btn-close-white ms-2" onClick={() => setToast({ show: false })}></button>
            </div>
          </div>
        )}

        {/* Google Login */}
        <div className="w-100" style={{ maxWidth: '300px' }}>
          <div className="text-center mt-30 mb-4 ">
            <h1 className="text-primary fw-bold">Book Manager</h1>
            <p className="text-muted fs-5">Sign in with Google to manage your books</p>
          </div>
          <div className="card shadow p-4 text-center">
            <button onClick={handleGoogleLogin} className="btn btn-danger btn-lg w-100">
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
