import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';      
import Aula01 from './pages/Aula01';  

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aula-01" element={<Aula01 />} />
      </Routes>
    </Router>
  );
}
