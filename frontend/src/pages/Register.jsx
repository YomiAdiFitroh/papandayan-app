import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const data = err.response?.data;
      setError(data?.errors?.[0]?.message || data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="brand-mark">PC</div>
    
        <div>
          <div className="brand-name">PAPANDAYAN CARGO</div>
          <div className="brand-subtitle">Cargo Management System</div>
        </div>
      </div>
    
      <div className="login-content">
        <div className="login-intro">
          <div className="intro-line" />
    
          <h1>Create account</h1>
    
          <p>
            Register your account to access the
            Papandayan Cargo Management System.
          </p>
        </div>
    
        <div className="login-form-wrapper">
          <form onSubmit={onSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="email">
                Email
              </label>
    
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
    
            <div className="form-field">
              <label htmlFor="username">
                Username
              </label>
    
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={onChange}
                autoComplete="username"
                required
                minLength={3}
                disabled={loading}
              />
            </div>
    
            <div className="form-field">
              <label htmlFor="password">
                Password
              </label>
    
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                autoComplete="new-password"
                required
                minLength={8}
                disabled={loading}
              />
            </div>
    
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}
  
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          
          <div className="login-footer">
            <span>Already have an account?</span>
          
            <Link to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </div>
          
      <div className="login-bottom">
        <span>© Papandayan Cargo</span>
        <span>Secure access</span>
      </div>
    </div>
  );
}
