import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../api';
import { Loader } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      if (err.fields) {
         // Display first validation error
        const firstField = Object.keys(err.fields)[0];
        setError(`${firstField}: ${err.fields[firstField]}`);
      } else {
        setError(err.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="TaskFlow Logo" className="w-16 h-16 rounded-xl shadow-md object-cover" />
        </div>
        <h2 className="auth-title mt-0">Create Account</h2>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error max-w-md">{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength={6}
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-full p-4" disabled={loading}>
            {loading ? <Loader className="loader" /> : 'Register'}
          </button>
        </form>
        
        <p className="text-center mt-4 text-secondary">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
