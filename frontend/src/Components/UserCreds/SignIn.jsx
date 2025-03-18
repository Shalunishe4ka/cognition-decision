import React, { useState } from 'react';
import { jwtDecode } from "jwt-decode";

export const SignIn = ({ setHeaderShow }) => {
    setHeaderShow(true)

    const getUserUUIDFromToken = (token) => {
        try {
            const decoded = jwtDecode(token); // декодируем payload
            return decoded.uuid || null; // достаём user_uuid
        } catch (error) {
            console.error("Ошибка декодирования токена:", error);
            return null;
        }
    }

    const [form, setForm] = useState({
        username: '',
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
        e.preventDefault();
        try {
            setError(null);
            setSuccessMsg('');

            const response = await fetch('http://localhost:8000/sign-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Ошибка при входе');
            } else {
                // Успешный вход -> получаем токен
                setSuccessMsg(data.message || 'Вход выполнен успешно');
                if (data.access_token) {
                    localStorage.setItem('access_token', data.access_token);
                    const user_uuid = getUserUUIDFromToken(data.access_token);
                    console.log("user_uuid из токена:", user_uuid);
                    // Можешь сохранить в state или использовать сразу
                }
            }
        } catch (err) {
            console.error('Ошибка авторизации:', err);
            setError('Не удалось выполнить вход');
        }
    };

    return (
        <div>
            <h2>Sign In</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}

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
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Войти</button>
            </form>
        </div>
    );
}

