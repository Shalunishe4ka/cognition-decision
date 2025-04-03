import React, { useEffect, useState } from 'react';
import { loginUser, getUserUuidFromToken } from '../../clientServerHub';  // Импорт из хаба
import './UserCreds.css';
import { Link } from 'react-router-dom';

export const SignIn = ({ setHeaderShow }) => {
  useEffect(() => {
    setHeaderShow(true);
  }, [setHeaderShow]);

  const [form, setForm] = useState({ username: '', password: '' });
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
      const response = await loginUser(form.username, form.password);
      setSuccessMsg(response.message || 'Вход выполнен успешно');

      // Извлекаем токен из localStorage и декодируем user_uuid
      const token = localStorage.getItem('access_token');
      const user_uuid = getUserUuidFromToken(token);
    } catch (err) {
      console.error('Ошибка входа:', err);
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Вход</h2>
      {error && <p className="auth-error">{error}</p>}
      {successMsg && <p className="auth-success">{successMsg}</p>}

      <form
        onSubmit={async (e) => {
          await handleSubmit(e);
          if (!error) {
            window.location.href = "/";
          }
        }}
        className="auth-form"
      >
        <input
          name="username"
          placeholder="Имя пользователя"
          value={form.username}
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
        <button type="submit">Войти</button>
      </form>
      <p className='sign-in-up-p'>Вы тут впервые? <Link className='sign-in-up-link' to={"/sign-up"}>Зарегистрироваться</Link></p> 
    </div>
  );
};
