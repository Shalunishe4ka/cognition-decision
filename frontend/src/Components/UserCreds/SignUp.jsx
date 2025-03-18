import React, { useState } from 'react';

export const SignUp = ({setHeaderShow}) => {
    setHeaderShow(true)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // чтобы не перезагружать страницу

    try {
      setError(null);
      setSuccessMsg('');

      const response = await fetch('http://localhost:8000/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        // например, 400/500
        setError(data.error || 'Ошибка регистрации');
      } else {
        // Успешная регистрация (201)
        setSuccessMsg(data.message || 'Регистрация успешна');

        if (data.user_uuid) {
          // Сохраняем uuid в localStorage (или в Redux), если нужно
          localStorage.setItem('user_uuid', data.user_uuid);
        }
      }
    } catch (err) {
      console.error('Ошибка запроса:', err);
      setError('Произошла ошибка при отправке запроса');
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {successMsg && <p style={{color: 'green'}}>{successMsg}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input 
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input 
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
}


