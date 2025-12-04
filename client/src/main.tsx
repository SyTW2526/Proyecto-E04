import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './index.css'
import Home from './home.tsx';
import LogIn from './login.tsx'
import Recipe from './recipe.tsx'
import CreateRecipe from './create_recipe';
import UserPage from './user.tsx';
import Recipe from './recipe.tsx';
import EditRecipe from './edit_recipe.tsx';
import CreateRecipe from './create_recipe.tsx';
import Filtered from './filtered main page.tsx'
import SearchFilterView from './filtered main page.tsx';

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
          <Route path="/search" element={<SearchFilterView/>}/>
          <Route path="/user/me" element={<User/>}/>
          <Route path="/filtered" element={<Filtered />} />
          <Route path="/publish/post" element={<CreateRecipe/>}></Route>
          <Route path="/user/:id" element={<UserPage/>}></Route>
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
