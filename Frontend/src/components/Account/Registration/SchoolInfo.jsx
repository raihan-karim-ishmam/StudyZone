import React from 'react';
import { useUser } from '../../../context/UserContext';

const SchoolInfo = ({ onNext, onBack }) => {
  const { user, updateUserFields } = useUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update user context with school information
    updateUserFields({
      school: e.target.school.value,
      educationLevel: e.target.educationLevel.value,
      grade: e.target.grade.value,
      subjects: [] // This will be populated with selected subjects
    });
    
    // Move to next step or complete registration
    onNext();
  };

  return (
    <div className="registration-step">
      <div className="icon-container">
        {/* Your school icon */}
      </div>
      
      <h2>Maak Account</h2>
      <p className="subtitle">
        Hoe ziet jou middelbare school ervaring eruit?
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>School</label>
          <input
            type="text"
            name="school"
            placeholder="Bijv. Spieringshoek"
            defaultValue={user.school}
            required
          />
        </div>

        <div className="form-group">
          <label>Niveau</label>
          <select 
            name="educationLevel"
            defaultValue={user.educationLevel}
            required
          >
            <option value="">Selecteer niveau</option>
            <option value="vmbo">VMBO</option>
            <option value="mavo">MAVO</option>
            <option value="havo">HAVO</option>
            <option value="vwo">VWO</option>
          </select>
        </div>

        <div className="form-group">
          <label>Leerjaar (1 t/m 6)</label>
          <select 
            name="grade"
            defaultValue={user.grade}
            required
          >
            <option value="">Selecteer leerjaar</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
          </select>
        </div>

        {/* You might want to add subject selection here */}
        
        <div className="button-group">
          <button 
            type="button" 
            onClick={onBack}
            className="btn-secondary"
          >
            Ga Terug
          </button>
          <button 
            type="submit"
            className="btn-primary"
          >
            Ga Verder
          </button>
        </div>
      </form>
    </div>
  );
};

export default SchoolInfo;