import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { setAuth } from '../auth.js';

const Login = ({ onAuth }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    if (!form.email.trim()) return 'Email is required.';
    if (!form.password.trim()) return 'Password is required.';
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim());
    if (!emailOk) return 'Enter a valid email address.';
    return '';
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    api.post('/api/auth/login', form)
      .then((res) => {
        setAuth(res.data.token, res.data.user);
        onAuth(res.data.user);
        navigate('/');
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Login failed.');
      });
  };

  return (
    <div className="container page-stack">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p>Login to continue</p>
        {error && <div className="notice error">{error}</div>}
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <button className="button" type="submit">Login</button>
        </form>
        <p>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
