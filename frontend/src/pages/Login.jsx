import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import api, { tokenStore } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (tokenStore.access) return <Navigate to="/users" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      tokenStore.set(data);
      navigate('/users', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      setError(data?.errors?.[0]?.message || data?.message || 'Login failed');
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
    
          <h1>Sign in</h1>
    
          <p>
            Access your account to manage cargo operations
            and daily activities.
          </p>
        </div>
    
        <div className="login-form-wrapper">
          <form onSubmit={onSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="identifier">
                Email or username
              </label>
    
              <input
                id="identifier"
                type="text"
                value={form.identifier}
                onChange={(e) =>
                  setForm({
                    ...form,
                    identifier: e.target.value
                  })
                }
                autoComplete="username"
                disabled={loading}
              />
            </div>
              
            <div className="form-field">
              <label htmlFor="password">
                Password
              </label>
              
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value
                  })
                }
                autoComplete="current-password"
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          
          <div className="login-footer">
            <span>Don't have an account?</span>
          
            <Link to="/register">
              Register
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
