import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";
import SocialIcons from "./SocialIcons";
import { useCustomStates } from "../../CustomStates";

const Header = ({ headerShow }) => {
  const location = useLocation();
  const { isMenuOpen, setIsMenuOpen, userUuid, setUserUuid } = useCustomStates();

  if (!headerShow) return null;

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_uuid");
    setUserUuid(null);
    console.log("Пользователь разлогинен");
    // Можно добавить редирект на главную или страницу логина
  };

  return (
    <header className="App-header">
      <SocialIcons />
      <nav>
        <ul>
          <li className={location.pathname === "/" ? "active" : ""}>
            <Link to="/">Main</Link>
          </li>
          {userUuid ? (
            <li className="burger-menu-container">
              <button onClick={toggleMenu} className="burger-button">
                &#9776;
              </button>
              {isMenuOpen && (
                <div className="burger-menu">
                  <Link
                    to="/profile"
                    className="burger-menu-item"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    View Profile
                  </Link>
                  <button
                    className="burger-menu-item"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </li>
          ) : (
            <li className={location.pathname === "/sign-up" ? "active" : ""}>
              <Link to="/sign-up">Sign Up</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
