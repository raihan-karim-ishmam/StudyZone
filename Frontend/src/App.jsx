import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

import "./styles/App.scss"
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import Navigation from './components/Navigation';

import Login from './pages/Login';
import Notities from './pages/Notities';
import StudyZone from './pages/StudyZone';
import Todo from './pages/To-do';
import Welcome from './pages/Welcome';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function App() {
  return (
    <BrowserRouter>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <ModalsProvider>
        <Notifications position="bottom-right" zIndex={100000} />
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

                <Route path="/Privacy" element={<Privacy />} />
                <Route path="/Terms" element={<Terms />} />

                <Route path="*" element={<Navigate to="/StudyZone" replace />} />
              </Routes>
            </div>
          </UserProvider>
        </ModalsProvider>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;