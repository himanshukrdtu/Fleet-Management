// src/pages/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { connectSocket } from '../sockets/socket';
const API = import.meta.env.VITE_API_URL;

 


const Register = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'operator',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await  axios.post(`http://localhost:5000/api/auth/register`, form);
      const user = res.data.user;

      dispatch(setUser(user));
      localStorage.setItem('user', JSON.stringify(user));
      connectSocket(user.id);

      if (user.role === 'operator') {
        navigate('/driver/dashboard');
      } else {
        navigate('/manager/dashboard');
      }
    } catch (err) {
      alert('Registration failed');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleRegister} style={styles.form}>
      <h2>Register</h2>

      <input
        type="text"
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        required
        style={styles.input}
      />

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        style={styles.input}
      />

      <select
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        style={styles.select}
      >
        <option value="operator">Operator</option>
        <option value="manager">Manager</option>
      </select>

      <button type="submit" style={styles.button}>Register</button>
    </form>
  );
};

const styles = {
  form: {
    maxWidth: '400px',
    margin: '40px auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
  },
  select: {
    padding: '10px',
    fontSize: '16px',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '5px',
  },
};

export default Register;
