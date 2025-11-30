import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './index.css'
import Home from './home.tsx';
import LogIn from './login.tsx'
import Recipe from './recipe.tsx'
import CreateRecipe from './create_recipe';
import EditRecipe from './edit_recipe.tsx';
import Search from './search.tsx';
import User from './user.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LogIn />} />
          <Route path="/" element={<LogIn />} />
          <Route path="/home" element={<Home />} />
          <Route path="/recipe/:id" element={<Recipe/>} />
          <Route path="/recipe/:id/edit" element={<EditRecipe/>} />
          <Route path="/publish/post" element={<CreateRecipe/>}/>
          <Route path="/search" element={<Search/>}/>
          <Route path="/user/me" element={<User/>}/>
        </Routes>
    </BrowserRouter>
  </StrictMode>,
)

/**
 * <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LogIn />} />
          <Route path="/" element={<LogIn />} />
          <Route path="/home" element={<Home />} />
          <Route path="/recipe/:id" element={<Recipe/>} />
        </Routes>
    </BrowserRouter>
 */
