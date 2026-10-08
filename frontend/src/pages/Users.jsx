import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { tokenStore } from '../api';

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/users')
      .then((res) => setUsers(res.data.users))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await api.post('/auth/logout', { refreshToken: tokenStore.refresh });
    } catch {
      // gaada apa apa sih karena lokalan juga hehe ((JKJK))
    }
    tokenStore.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="users-page">
      <header className="users-header">
        <div className="users-brand">
          <div className="brand-mark">PC</div>

          <div>
            <div className="brand-name">PAPANDAYAN CARGO</div>
            <div className="brand-subtitle">
              Cargo Management System
            </div>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </header>

      <main className="users-content">
        <div className="users-title">
          <div>
            <div className="section-label">ADMINISTRATION</div>
            <h1>User Management</h1>
            <p>
              Manage registered users and account information.
            </p>
          </div>

          {!loading && !error && (
            <div className="user-count">
              <span>{users.length}</span>
              <small>Users</small>
            </div>
          )}
        </div>

        <div className="users-table-wrapper">
          {loading && (
            <div className="users-state">
              Loading users...
            </div>
          )}

          {error && (
            <div className="users-error">
              {error}
            </div>
          )}

          {!loading && !error && (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="users-empty">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td className="user-id">
                        {u.id}
                      </td>

                      <td>{u.email}</td>

                      <td>
                        <span className="username-badge">
                          {u.username}
                        </span>
                      </td>

                      <td className="user-created">
                        {new Date(u.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <footer className="users-footer">
        <span>© Papandayan Cargo</span>
        <span>Secure access</span>
      </footer>
    </div>
  );
}
