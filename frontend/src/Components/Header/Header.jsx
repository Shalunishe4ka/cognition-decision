import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";
import SocialIcons from "./SocialIcons";
import { useCustomStates } from "../../CustomStates";
import LogoutIcon from '@mui/icons-material/Logout';

const Header = ({ headerShow }) => {
  const location = useLocation();
  const { userUuid, setUserUuid } = useCustomStates();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_uuid");
    setUserUuid(null);
    // console.log("Пользователь разлогинен");
    window.location.href="/sign-in"
    // При желании можно добавить редирект
  };

  if (!headerShow) return null;

  return (
    <header className="App-header">
      <SocialIcons />
      <nav>
        <ul>
          <li className={location.pathname === "/" ? "active" : ""}>
            <Link to="/">Main</Link>
          </li>
          {userUuid ? (
            <li className="logout-icon">
              <button onClick={handleLogout} className="logout-button" title="Log Out">
                <LogoutIcon fontSize="inherit"/>
              </button>
            </li>
          ) : (
            <li className={location.pathname === "/sign-in" ? "active" : ""}>
              <Link to="/sign-in">Sign in</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
