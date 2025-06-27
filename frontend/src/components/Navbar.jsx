// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../redux/slices/authSlice';
import { disconnectSocket } from '../sockets/socket';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem('user');
    disconnectSocket();
    navigate('/');
  };

  return (
    <nav style={styles.navbar}>
      <h2><Link to="/" style={styles.logo}>Fleet App</Link></h2>

      <div style={styles.links}>
        {!user ? (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        ) : (
          <>
            <span style={styles.userText}>👤 {user.username} ({user.role})</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    padding: '10px 20px',
    backgroundColor: '#222',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    textDecoration: 'none',
    color: '#00d9ff',
  },
  links: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '16px',
  },
  userText: {
    color: '#ccc',
    marginRight: '10px',
  },
  logoutBtn: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
  },
};

export default Navbar;
