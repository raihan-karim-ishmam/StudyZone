import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.scss';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer flex-row">
        <div className="copyright">
            <p>&copy; {currentYear}, StudyZone.</p>
        </div>
        <div className="footer-links flex-row">
            <Link to="/Privacy">Privacy</Link>
            <Link to="/Terms">Terms</Link>
        </div>
    </footer>
  );
};

export default Footer;