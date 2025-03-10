import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { UserProvider } from './context/UserContext';

import "./styles/App.scss"
import '@mantine/core/styles.css';

import Navigation from './components/Navigation';

import Login from './pages/Login';
import Notities from './pages/Notities';
import StudyZone from './pages/StudyZone';
import Todo from './pages/To-do';
import Welcome from './pages/Welcome';

function App() {
  return (
    <BrowserRouter>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <UserProvider>
          <div className="App">
            <Navigation />
            <Routes>
              <Route path="/" element={<Navigate to="/StudyZone" replace />} />
              
              <Route path="/Account" element={<Welcome />} />
              <Route path="/Notities" element={<Notities />} />
              <Route path="/StudyZone" element={<StudyZone />} />
              <Route path="/To-do" element={<Todo />} />
              <Route path="/Welcome" element={<Welcome />} />

              <Route path="*" element={<Navigate to="/StudyZone" replace />} />
            </Routes>
          </div>
        </UserProvider>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;