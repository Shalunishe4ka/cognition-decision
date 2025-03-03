import React from "react";
import "./Header.css";
import SocialIcons from "./SocialIcons";
import { Link, useLocation } from "react-router-dom";

const Header = ({ headerShow }) => {
  const location = useLocation();
  if (!headerShow) return null
  return (
    <header className="App-header">
      <SocialIcons />
      <nav>
        <ul>
          <li className={location.pathname === "/" ? "active" : ""}>
            <Link to="/">Main</Link>
          </li>
          <li>
            <Link to="/">Registration</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;