import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './index.css';
import LogIn from './pages/login.tsx';
import UserPage from './pages/user.tsx';
import Recipe from './pages/recipe.tsx';
import EditRecipe from './pages/edit_recipe.tsx';
import CreateRecipe from './pages/create_recipe.tsx';
import Filtered from './pages/filtered main page.tsx'
import SearchFilterView from './pages/filtered main page.tsx';
import FollowingPage from './pages/following_page.tsx';
import SavedPage from './pages/saved_page.tsx';
import Main_page from './pages/main_page.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LogIn />} />
          <Route path="/" element={<LogIn />} />
          <Route path="/home" element={<Main_page />} />
          <Route path="/recipe/:id" element={<Recipe/>} />
          <Route path="/recipe/:id/edit" element={<EditRecipe/>} />
          <Route path="/publish/post" element={<CreateRecipe/>}/>
          <Route path="/search" element={<SearchFilterView/>}/>
          <Route path="/user/:id" element={<UserPage/>}/>
          <Route path="/filtered" element={<Filtered />} />
          <Route path="/publish/post" element={<CreateRecipe/>}/>
          <Route path="/user/:id/following" element={<FollowingPage type={true}/>}/>
          <Route path="/user/:id/followers" element={<FollowingPage type={false}/>}/>
          <Route path="/saved" element={<SavedPage/>}/>
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
