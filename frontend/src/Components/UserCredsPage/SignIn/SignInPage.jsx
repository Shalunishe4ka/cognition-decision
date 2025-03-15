import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import "./SignInPage.css";

export const SignInPage = ({ setHeaderShow }) => {
  setHeaderShow(true)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  // const [username, setUsername] = useState("")


  async function handleSignIn(e) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      // username,
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      const user = data.user;

      // Получаем username
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      setMessage(`Вы вошли как ${profile.username}`);
      window.location.href = "/";
      console.log("User Token:", data.session.access_token);
    }
  }


  return (
    <div className="signin-container">
      <h2 className="signin-title">Вход</h2>
      {message && <p className="message">{message}</p>}
      <form className="signin-form" onSubmit={handleSignIn}>
        {/* <input
          type="text"
          placeholder="Username"
          className="signin-input"
          onChange={(e) => setUsername(e.target.value)}
          required
        /> */}
        <input
          type="email"
          placeholder="Email"
          className="signin-input"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          className="signin-input"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="signin-button">Войти</button>
      </form>
      <p>Впервые здесь? <a href="/sign-up">Зарегистрироваться</a></p>
    </div>
  );
};
