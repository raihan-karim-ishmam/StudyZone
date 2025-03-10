import React from 'react';
import { useUser } from '../../context/UserContext';

const PersonalInfo = ({ onNext }) => {
  const { user, updateUserFields } = useUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update user context with form data
    updateUserFields({
      firstName: e.target.firstName.value,
      lastName: e.target.lastName.value,
      dateOfBirth: e.target.dateOfBirth.value,
      email: e.target.email.value,
      password: e.target.password.value
    });
    
    // Move to next step
    onNext();
  };

  return (
    <div className="registration-step">
      <div className="icon-container">
        {/* Your account icon */}
      </div>
      
      <h2>Maak Account</h2>
      <p className="subtitle">
        Maak hier jouw account aan of log in (rechtsboven)
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Bijv. naam@email.com"
            defaultValue={user.email}
            required
          />
        </div>

        <div className="form-group">
          <label>Wachtwoord</label>
          <input
            type="password"
            name="password"
            placeholder="Wachtwoord"
            required
          />
        </div>

        <div className="form-group">
          <label>Voornaam</label>
          <input
            type="text"
            name="firstName"
            placeholder="Bijv. Abel"
            defaultValue={user.firstName}
            required
          />
        </div>

        <div className="form-group">
          <label>Achternaam</label>
          <input
            type="text"
            name="lastName"
            placeholder="Bijv. Vestering"
            defaultValue={user.lastName}
            required
          />
        </div>

        <div className="form-group">
          <label>Geboortedatum</label>
          <input
            type="date"
            name="dateOfBirth"
            defaultValue={user.dateOfBirth}
            required
          />
        </div>

        <button type="submit" className="btn-primary">
          Ga Verder
        </button>
      </form>
    </div>
  );
};

export default PersonalInfo;