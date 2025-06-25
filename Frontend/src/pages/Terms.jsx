import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Terms/Terms.scss';

import Footer from '../components/Footer';

const Terms = () => {
  return (
    <div className="terms-container flex-column">
      <div className="terms-content">
        <h1>Terms and Conditions</h1>
        
        <section>
          <h2>1. Introduction</h2>
          <p>Welcome to StudyZone. By using our platform, you agree to these Terms and Conditions. Please read them carefully.</p>
        </section>
        
        <section>
          <h2>2. User Accounts</h2>
          <p>When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the security of your account.</p>
        </section>
        
        <section>
          <h2>3. User Content</h2>
          <p>You retain ownership of any content you create and share on StudyZone. By posting content, you grant us a license to use, store, and share that content.</p>
        </section>
        
        <section>
          <h2>4. Acceptable Use</h2>
          <p>You agree not to use StudyZone for any illegal purposes or in any way that could damage or impair the service.</p>
        </section>
        
        <section>
          <h2>5. Privacy</h2>
          <p>Your privacy is important to us. Please review our <Link to="/Privacy">Privacy Policy</Link> to understand how we collect and use your information.</p>
        </section>
        
        <section>
          <h2>6. Changes to Terms</h2>
          <p>We may modify these terms at any time. Continued use of StudyZone after changes constitutes acceptance of the new terms.</p>
        </section>
        
        <section>
          <h2>7. Termination</h2>
          <p>We reserve the right to terminate or suspend your account at our discretion, without notice, for conduct that we believe violates these terms.</p>
        </section>
        
        <section>
          <h2>8. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at support@studyzone.com</p>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Terms;
