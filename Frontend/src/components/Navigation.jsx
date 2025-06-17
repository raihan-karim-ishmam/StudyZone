import React, { useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

import '../styles/Navigation.scss';

import logo from '../assets/image/global/logo.png';
import defaultAvatar from '../assets/svg/navigation/default-avatar.svg';

const Navigation = () => {
  const { user } = useUser();
  const location = useLocation();
  const indicatorRef = useRef(null);
  const menuRef = useRef(null);

  const getProfileImage = () => {
    return user.profileImage || defaultAvatar;
  };

  const updateIndicator = (disableTransition = false) => {
    if (!menuRef.current || !indicatorRef.current) return;
    const activeLink = menuRef.current.querySelector('.nav-link.active');
    if (activeLink) {
      if (disableTransition) {
        indicatorRef.current.style.transition = 'none';
      } else {
        indicatorRef.current.style.transition = '';
      }
      const { offsetLeft, clientWidth } = activeLink;
      const offset = parseFloat(activeLink.dataset.indicatorOffset) || 0;
      const centerPosition = offsetLeft + clientWidth / 2 + offset;
      indicatorRef.current.style.left = `${centerPosition}px`;
      indicatorRef.current.style.transform = 'translateX(-50%)';
    }
  };

  useEffect(() => {
    updateIndicator();
  }, [location]);

  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      updateIndicator(true);
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (indicatorRef.current) {
          indicatorRef.current.style.transition = '';
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <nav className="navigation flex-row">
      <div className="logo prevent-select flex-row">
        <Link className='flex-row nav-link' to="/StudyZone">
          <img src={logo} alt="StudyZone Logo" />
        </Link>
        <span className="logo-text">StudyZone</span>
      </div>

      <div className="menu flex-row" ref={menuRef}>
        <NavLink 
          data-indicator-offset="3px"
          className={({ isActive }) => 
            isActive ? 'flex-row nav-link active' : 'flex-row nav-link'
          } 
          to="/To-do"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19.9994 19.2611H10.9294C10.4794 19.2611 10.1094 18.8911 10.1094 18.4411C10.1094 17.9911 10.4794 17.6211 10.9294 17.6211H19.9994C20.4494 17.6211 20.8194 17.9911 20.8194 18.4411C20.8194 18.9011 20.4494 19.2611 19.9994 19.2611Z" fill="black"/>
            <path d="M19.9994 12.9681H10.9294C10.4794 12.9681 10.1094 12.5981 10.1094 12.1481C10.1094 11.6981 10.4794 11.3281 10.9294 11.3281H19.9994C20.4494 11.3281 20.8194 11.6981 20.8194 12.1481C20.8194 12.5981 20.4494 12.9681 19.9994 12.9681Z" fill="black"/>
            <path d="M19.9994 6.67125H10.9294C10.4794 6.67125 10.1094 6.30125 10.1094 5.85125C10.1094 5.40125 10.4794 5.03125 10.9294 5.03125H19.9994C20.4494 5.03125 20.8194 5.40125 20.8194 5.85125C20.8194 6.30125 20.4494 6.67125 19.9994 6.67125Z" fill="black"/>
            <path d="M4.90969 8.03187C4.68969 8.03187 4.47969 7.94187 4.32969 7.79187L3.41969 6.88188C3.09969 6.56188 3.09969 6.04187 3.41969 5.72187C3.73969 5.40187 4.25969 5.40187 4.57969 5.72187L4.90969 6.05188L7.04969 3.91187C7.36969 3.59188 7.88969 3.59188 8.20969 3.91187C8.52969 4.23188 8.52969 4.75188 8.20969 5.07188L5.48969 7.79187C5.32969 7.94187 5.12969 8.03187 4.90969 8.03187Z" fill="black"/>
            <path d="M4.90969 14.3287C4.69969 14.3287 4.48969 14.2487 4.32969 14.0887L3.41969 13.1788C3.09969 12.8588 3.09969 12.3388 3.41969 12.0188C3.73969 11.6988 4.25969 11.6988 4.57969 12.0188L4.90969 12.3488L7.04969 10.2087C7.36969 9.88876 7.88969 9.88876 8.20969 10.2087C8.52969 10.5288 8.52969 11.0487 8.20969 11.3687L5.48969 14.0887C5.32969 14.2487 5.11969 14.3287 4.90969 14.3287Z" fill="black"/>
            <path d="M4.90969 20.3288C4.69969 20.3288 4.48969 20.2488 4.32969 20.0888L3.41969 19.1788C3.09969 18.8588 3.09969 18.3388 3.41969 18.0188C3.73969 17.6988 4.25969 17.6988 4.57969 18.0188L4.90969 18.3488L7.04969 16.2087C7.36969 15.8888 7.88969 15.8888 8.20969 16.2087C8.52969 16.5288 8.52969 17.0488 8.20969 17.3688L5.48969 20.0888C5.32969 20.2488 5.11969 20.3288 4.90969 20.3288Z" fill="black"/>
          </svg>
          <p>To-do</p>
        </NavLink>
        
        <NavLink 
          data-indicator-offset="5px"
          className={({ isActive }) => 
            isActive ? 'flex-row nav-link active' : 'flex-row nav-link'
          } 
          to="/StudyZone"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14.0003 9.91667V14.5833L16.3337 16.9167M23.3337 14.5833C23.3337 19.738 19.155 23.9167 14.0003 23.9167C8.84567 23.9167 4.66699 19.738 4.66699 14.5833C4.66699 9.42867 8.84567 5.25 14.0003 5.25C19.155 5.25 23.3337 9.42867 23.3337 14.5833Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>StudyZone</p>
        </NavLink>

        <NavLink 
          data-indicator-offset="5"
          className={({ isActive }) => 
            isActive ? 'flex-row nav-link active' : 'flex-row nav-link'
          } 
          to="/Notities"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 3V5M12 3V5M15 3V5M13 9H9M15 13H9M8.2 21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 18.9201 19 17.8V7.2C19 6.0799 19 5.51984 18.782 5.09202C18.5903 4.71569 18.2843 4.40973 17.908 4.21799C17.4802 4 16.9201 4 15.8 4H8.2C7.0799 4 6.51984 4 6.09202 4.21799C5.71569 4.40973 5.40973 4.71569 5.21799 5.09202C5 5.51984 5 6.07989 5 7.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.07989 21 8.2 21Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>Notities</p>
        </NavLink>
        <div className="indicator-line" ref={indicatorRef}></div>
      </div>

      <div className='flex-row account-section'>
        <div className="account flex-row">
          <div className="user-email">
            {user.isAuthenticated ? (
              <p>{user.email}</p>
            ) : (
              <p>Example@gmail.com</p>
            )}
          </div>
          <Link className="user-profile prevent-select" to="/Account">
            <img 
              src={getProfileImage()} 
              alt="Profile" 
              className="profile-avatar"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
