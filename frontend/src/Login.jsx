
import { useState } from 'react';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const endpoint = isRegister ? 'register' : 'login';

      const response = await fetch(
        `http://localhost:5000/${endpoint}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Something went wrong.');
        return;
      }

      if (isRegister) {
        setMessage('Registration successful! Please log in.');
        setIsRegister(false);
        setPassword('');
      } else {
        onLogin(data.student);
      }
    } catch {
      setMessage('Cannot connect to the server.');
    }
  };

  return (
    <div className="container">
      <h1>{isRegister ? 'Student Registration' : 'Student Login'}</h1>

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <label>Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </>
        )}

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="At least 6 characters"
        />

        <button type="submit">
          {isRegister ? 'Register' : 'Login'}
        </button>

        {message && <p>{message}</p>}
      </form>

      <p style={{ textAlign: 'center' }}>
        {isRegister ? 'Already registered?' : 'New student?'}{' '}
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage('');
          }}
        >
          {isRegister ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  );
}

export default Login;
