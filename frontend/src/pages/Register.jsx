import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { setAuth } from '../auth.js';

const Register = ({ onAuth }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!form.password.trim()) return 'Password is required.';
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim());
    if (!emailOk) return 'Enter a valid email address.';
    if (form.password.trim().length < 6) return 'Password must be at least 6 characters.';
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
    api.post('/api/auth/register', form)
      .then((res) => {
        setAuth(res.data.token, res.data.user);
        onAuth(res.data.user);
        navigate('/');
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Registration failed.');
      });
  };

  return (
    <div className="container page-stack">
      <div className="auth-card">
        <h2>Create your account</h2>
        {error && <div className="notice error">{error}</div>}
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <button className="button" type="submit">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
