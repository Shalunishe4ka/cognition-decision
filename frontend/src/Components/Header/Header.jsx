import React, { useEffect, useState } from "react";
import { supabase } from "../UserCredsPage/supabaseClient";
import "./Header.css";
import SocialIcons from "./SocialIcons";
import { Link, useLocation } from "react-router-dom";

const Header = ({ headerShow }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    fetchUser();
  }, []);

  if (!headerShow) return null;

  return (
    <header className="App-header">
      <SocialIcons />
      <nav>
        <ul>
          <li className={location.pathname === "/" ? "active" : ""}>
            <Link to="/">Main</Link>
          </li>

          {user ? (
            <>
              <li>
                <button className="log-out-button" onClick={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                  window.location.reload(); // Обновляем страницу после выхода
                }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              {/* <li className={location.pathname === "/sign-in" ? "active" : ""}>
                <Link to="/sign-in">Sign In</Link>
              </li> */}
              <li className={location.pathname === "/sign-up" ? "active" : ""}>
                <Link to="/sign-up">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
