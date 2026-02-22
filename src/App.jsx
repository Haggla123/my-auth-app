import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 1. ALL HOOKS MUST BE AT THE TOP
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile Edit Hooks (Moved to the top)
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [tempBio, setTempBio] = useState('');

  // Auto-login check
  useEffect(() => {
    const savedUser = localStorage.getItem('loggedUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setTempUsername(parsedUser.username || '');
      setTempBio(parsedUser.bio || '');
    }
  }, []);

  // 2. LOGIC FUNCTIONS
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const endpoint = isLogin ? 'login' : 'signup';
    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        if (isLogin) {
          setUser(data.user);
          setTempUsername(data.user.username || '');
          setTempBio(data.user.bio || '');
          localStorage.setItem('loggedUser', JSON.stringify(data.user));
        } else {
          setIsLogin(true);
        }
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Backend connection failed.");
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch('http://localhost:5000/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, username: tempUsername, bio: tempBio }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('loggedUser', JSON.stringify(data.user));
        setIsEditing(false);
        alert("Profile saved!");
      }
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('loggedUser');
  };

  // 3. RENDER LOGIC (The "if" statements come AFTER the hooks)
  
  // --- VIEW: DASHBOARD ---
  if (user) {
    return (
      <div className="auth-container">
        <div className="auth-card profile-card">
          <h1>{isEditing ? 'Edit Profile' : 'Your Profile'}</h1>
          <div className="profile-info">
            <label>Username:</label>
            {isEditing ? (
              <input value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} />
            ) : (
              <p><strong>{user.username || 'No username set'}</strong></p>
            )}

            <label>Bio:</label>
            {isEditing ? (
              <textarea 
                value={tempBio} 
                onChange={(e) => setTempBio(e.target.value)} 
                style={{ width: '100%', padding: '10px', marginTop: '5px' }} 
              />
            ) : (
              <p>{user.bio || 'No bio yet...'}</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            {isEditing ? (
              <button onClick={handleUpdate} style={{ backgroundColor: '#28a745' }}>Save Changes</button>
            ) : (
              <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
            <button onClick={handleLogout} style={{ backgroundColor: '#dc3545' }}>Logout</button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: LOGIN/SIGNUP ---
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Welcome Back' : 'Join Us'}</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {!isLogin && (
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          )}
          <button type="submit">{isLogin ? 'Login' : 'Create Account'}</button>
        </form>
        <p className="toggle-text">
          {isLogin ? "New here?" : "Already a member?"} 
          <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? ' Sign Up' : ' Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default App;