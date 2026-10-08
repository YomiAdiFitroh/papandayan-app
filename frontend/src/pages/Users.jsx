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
    <div className="card wide">
      <div className="header">
        <h1>User List</h1>
        <button onClick={logout}>Logout</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <table>
          <thead>
            <tr><th>ID</th><th>Email</th><th>Username</th><th>Created</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.username}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
