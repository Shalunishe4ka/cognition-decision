import React, { useState } from 'react';
import { supabase } from "../supabaseClient";
import "./SignUpPage.css";

export const SignUpPage = ({ setHeaderShow }) => {
    setHeaderShow(true)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [username, setUsername] = useState("")


    async function handleSignup(e) {
        e.preventDefault();

        // Проверяем, существует ли уже такой username
        const { data: existingUsers } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", username);

        if (existingUsers.length > 0) {
            setMessage("Этот никнейм уже занят.");
            return;
        }

        // Создаём пользователя
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            // Если успешно, создаём профиль
            const user = data.user;
            if (user) {
                await supabase.from("profiles").insert([{ id: user.id, username }]);
                setMessage("Регистрация успешна!");
                window.location.href("/")
            }
        }
    }

    return (
        <div className="signup-container">
            <h2 className="signup-title">Регистрация</h2>
            {message && <p className="message">{message}</p>}
            <form className="signup-form" onSubmit={handleSignup}>
            <input
                    type="text"
                    placeholder="Username"
                    className="signup-input"
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="signup-input"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    className="signup-input"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="signup-button">Зарегистрироваться</button>
            </form>
            <p>Уже есть аккаунт? <a href='/sign-in'>Войти</a></p>
        </div>
    );
};
