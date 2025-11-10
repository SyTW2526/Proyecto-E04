import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './index.css'
import Home from './home.tsx';
import LogIn from './login.tsx'
import Recipe from './recipe.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LogIn />} />
          <Route path="/" element={<LogIn />} />
          <Route path="/home" element={<Home />} />
          <Route path="/recipe/:id" element={<Recipe/>} />
        </Routes>
    </BrowserRouter>
  </StrictMode>,
)
