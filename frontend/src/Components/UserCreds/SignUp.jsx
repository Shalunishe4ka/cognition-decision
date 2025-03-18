import React, { useState } from 'react';
import { registerUser } from '../../clientServerHub';  // Импорт из хаба
import './UserCreds.css';

export const SignUp = ({ setHeaderShow }) => {
  setHeaderShow(true);

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');

    try {
      const response = await registerUser(form.username, form.email, form.password);
      setSuccessMsg(response.message || 'Регистрация успешна');
      // После регистрации можно автоматически перенаправить на вход или другую страницу
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Регистрация</h2>
      {error && <p className="auth-error">{error}</p>}
      {successMsg && <p className="auth-success">{successMsg}</p>}

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          name="username"
          placeholder="Имя пользователя"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
};
