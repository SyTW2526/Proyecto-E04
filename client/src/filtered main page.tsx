import React, { useState, useMemo, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import { Search, User, Plus, Clock, ChevronDown, ChevronUp, X, Users, Utensils } from "lucide-react"; 
import './filtered_main_page.css'
import { useNavigate } from "react-router-dom";
import Navigation from "./navigation";
import SimplifiedProfile from "./simplifiedProfile";
import type { UserInterface } from "./interfaces/UserInterface";
import type { RecipePost } from "./postcard";
import PostCard from "./postcard";
import axios from "axios";
import { Helmet } from "react-helmet";

const FilterKey = {
  INGREDIENTS: 'ingredients',
  CATEGORY: 'category',
  TOOLS: 'tools',
} as const;

type FilterKeyType = typeof FilterKey[keyof typeof FilterKey];
type SearchMode = 'recipes' | 'users';

const MAX_RECENT_SEARCHES: number = 5; 

const ALLOWED_INGREDIENTS: readonly string[] = [
  'harina', 'azucar', 'sal', 'huevo', 'leche', 'mantequilla', 'aceite', 'levadura', 
  'chocolate', 'vainilla', 'frutas', 'verduras', 'carne', 'pescado', 'especias'
];

const ALLOWED_CATEGORIES: readonly string[] = [
  'entrante', 'plato principal', 'guarnición', 'postre', 'desayuno', 'merienda', 
  'bebida', 'salsa o aderezo', 'panadería', 'pasta', 'arroz', 'carne', 
  'pescado', 'marisco', 'pollo', 'vegetariano', 'vegano', 'sin gluten', 
  'bajo en carbohidratos', 'alto en proteínas', 'otro'
];

const ALLOWED_UTENSILS: readonly string[] = [
  'cuchillo', 'tabla de cortar', 'sartén', 'olla', 'batidora', 
  'horno', 'microondas', 'espátula', 'cucharón', 'colador', 'caldero', 'rodillo', 
  'rallador'
];

interface FilterSelectorProps {
  type: FilterKeyType | '';
  options: string[];
  selectedFilters: string[];
  onSelect: (value: string) => void;
  onClose: () => void;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({ type, options, selectedFilters, onSelect, onClose }) => {
  if (type === '') return null;

  const titleMap: Record<FilterKeyType, string> = {
    [FilterKey.INGREDIENTS]: "Añadir Ingredientes",
    [FilterKey.CATEGORY]: "Añadir Categoría",
    [FilterKey.TOOLS]: "Añadir Utensilio",
  };

  const availableOptions = options.filter(opt => !selectedFilters.includes(opt));

  return (
    <div className="filter-modal-overlay">
      <div className="filter-modal">
        <div className="modal-header">
          <h3>{titleMap[type as FilterKeyType]}</h3>
          <button onClick={onClose} aria-label="Cerrar selector">
            <X size={20} />
          </button>
        </div>
        <div className="modal-content">
          {availableOptions.length === 0 ? (
            <p className="no-options">No quedan opciones disponibles para añadir.</p>
          ) : (
            availableOptions.map(option => (
              <button 
                key={option} 
                className={`select-option-tag select-option-tag--${type}`} 
                onClick={() => { onSelect(option); onClose(); }}
              >
                {option}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const buildFilterSummary = (ingredients: readonly string[] = [], categories: readonly string[] = [], utensils: readonly string[] = []): string => {
  const summaryParts: string[] = [];
  if (ingredients.length > 0) summaryParts.push(`${ingredients.length} Ing.`);
  if (categories.length > 0) summaryParts.push(`${categories.length} Cat.`);
  if (utensils.length > 0) summaryParts.push(`${utensils.length} Utens.`);
  return summaryParts.length === 0 ? 'No filters' : summaryParts.join(' · ');
};

interface ParsedFilters {
  searchTerm: string;
  ingredients: string[];
  categories: string[];
  utensils: string[];
}

const parseSearchString = (searchString: string): ParsedFilters => {
  const filters: ParsedFilters = { searchTerm: '', ingredients: [], categories: [], utensils: [] };
  if (!searchString) return filters;
  const parts = searchString.split('|').map(p => p.trim()).filter(Boolean);
  for (const part of parts) {
    const colonIndex = part.indexOf(':');
    if (colonIndex === -1) continue; 
    const type = part.substring(0, colonIndex).trim().toLowerCase();
    const value = part.substring(colonIndex + 1).trim();
    if (!value) continue;
    switch (type) {
      case 'nombre': filters.searchTerm = value; break;
      case 'ingrediente': filters.ingredients.push(value); break;
      case 'categoria': filters.categories.push(value); break;
      case 'utensilio': filters.utensils.push(value); break;
    }
  }
  return filters;
};

type Recipe = {
  _id?: string;
  name?: string;
  userId?: { username?: string } | null;
  images?: string[] | null;
  category?: string;
};

function SearchFilterView() {
  const BASE_API_URL = 'http://localhost:3000'; 
  const navigate = useNavigate();
  
  // Estados de navegación y modo
  const [searchMode, setSearchMode] = useState<SearchMode>('recipes');
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState<boolean>(false);

  // Estado del Usuario Identificado 
  const [me, setMe] = useState<UserInterface | null>(null);

  // Estados de Búsqueda
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<RecipePost[] | null>(null); 
  const [userResults, setUserResults] = useState<UserInterface[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filtros de Recetas
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedUtensils, setSelectedUtensils] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]); 
  const [openSelector, setOpenSelector] = useState<FilterKeyType | ''>(''); 

  const updateUserSearches = useCallback(async (newSearches: string[]) => {
    try {
      await axios.post(`${BASE_API_URL}/users/updateSearches`, 
        { recentSearches: newSearches },
        { withCredentials: true } );
      setRecentSearches(newSearches); 
    } catch (error) { console.error("Error BD Searches:", error); }
  }, [BASE_API_URL]);

  const fetchUserMe = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/users/me`, { 
        withCredentials: true
      });
        const userData = await response.data;
        setMe(userData); 
        setRecentSearches(userData.recentSearches || []);
    } catch (error) { console.error("Error Profile:", error); }
  }, [BASE_API_URL]);

  useEffect(() => { fetchUserMe(); }, [fetchUserMe]); 

  const filterMap: Record<FilterKeyType, { list: readonly string[]; selected: string[]; setSelected: React.Dispatch<React.SetStateAction<string[]>> }> = useMemo(() => ({
    [FilterKey.INGREDIENTS]: { list: ALLOWED_INGREDIENTS, selected: selectedIngredients, setSelected: setSelectedIngredients },
    [FilterKey.CATEGORY]: { list: ALLOWED_CATEGORIES, selected: selectedCategories, setSelected: setSelectedCategories },
    [FilterKey.TOOLS]: { list: ALLOWED_UTENSILS, selected: selectedUtensils, setSelected: setSelectedUtensils },
  }), [selectedIngredients, selectedCategories, selectedUtensils]);

  const handleAddFilter = (type: FilterKeyType, value: string): void => {
    const entry = filterMap[type];
    if (entry && !entry.selected.includes(value)) {
      entry.setSelected([...entry.selected, value]);
    }
  };

  const handleRemoveFilter = (type: FilterKeyType, value: string): void => {
    const entry = filterMap[type];
    if (entry) entry.setSelected(entry.selected.filter(item => item !== value));
  };

 const handleSearch = async (
  term: string = searchTerm, 
  ing: string[] = selectedIngredients, 
  cat: string[] = selectedCategories, 
  ut: string[] = selectedUtensils
) => {
  if (isLoading) return;
  setIsLoading(true);
  setIsAdvancedSearchOpen(false);

  try {
    if (searchMode === 'users') {
      setSearchResults(null);
      const response = await axios.get(`${BASE_API_URL}/users?username=${term.trim()}`, { withCredentials: true });
      const data = await response.data;
      const results = Array.isArray(data) ? data : [];
      setUserResults(results);

      if (results.length > 0 && term.trim()) {
    const cleanTerm = term.trim(); 
    if (!recentSearches.includes(cleanTerm)) {
      const updated = [cleanTerm, ...recentSearches].slice(0, MAX_RECENT_SEARCHES);
      updateUserSearches(updated);
    }
  }

    } else {
      setUserResults(null);
      const params = new URLSearchParams();
      
      if (term.trim()) params.append('name', term.trim());
      if (ing.length > 0) params.append('ingredientName', ing.join(','));
      if (cat.length > 0) params.append('category', cat.join(','));
      if (ut.length > 0) params.append('tools', ut.join(','));

      const response = await axios.get(`${BASE_API_URL}/recipes?${params.toString()}`, { withCredentials: true });
      
      if (response.status !== 200) {
        setSearchResults([]);
        return;
      }

      const data = await response.data;
      const results = Array.isArray(data) ? data : [];
      setSearchResults(results);

      if (results.length > 0 && term.trim()) {
        if (!recentSearches.includes(term.trim())) {
          const updated = [term.trim(), ...recentSearches].slice(0, MAX_RECENT_SEARCHES);
          updateUserSearches(updated);
        }
      }
    }
  } catch (error) {
    console.error("Search error:", error);
    setSearchResults([]);
  } finally {
    setIsLoading(false);
  }
};

  const [postCount, setPostCount] = useState(0);
  useEffect(() => {
    if (me) {
      axios.get(`http://localhost:3000/recipes?userId=${me._id}`, {
        withCredentials: true
      })
        .then(response => setPostCount(response.data.length))
        .catch(error => console.error(error));
    }
  }, [me]) 

  if (!me) return <div className="loading">Cargando perfil...</div>;

  return (
    <>
      <Helmet>
        <title>Buscador / RecipeVault</title>
      </Helmet>
      <FilterSelector 
          type={openSelector}
          options={openSelector ? [...filterMap[openSelector].list] : []}
          selectedFilters={openSelector ? filterMap[openSelector].selected : []}
          onSelect={(value) => handleAddFilter(openSelector as FilterKeyType, value)}
          onClose={() => setOpenSelector('')}
      />

      <div className="contenedor">
        <main className="principal">
          <h2 className="section-title">Search</h2>

          {/* Selector de Modo */}
          <div className="search-mode-tabs">
            <button 
              className={`mode-tab ${searchMode === 'recipes' ? 'active' : ''}`}
              onClick={() => { setSearchMode('recipes'); setUserResults(null); }}
            >
              <Utensils size={18} /> Recipes
            </button>
            <button 
              className={`mode-tab ${searchMode === 'users' ? 'active' : ''}`}
              onClick={() => { setSearchMode('users'); setSearchResults(null); }}
            >
              <Users size={18} /> Users
            </button>
          </div>
          
          {/* Barra de búsqueda */}
          <div className="search-bar-main">
            <Search size={20} />
            <input 
              type="text" 
              placeholder={searchMode === 'recipes' ? "Search recipes..." : "Search users by username..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLoading}
            />
          </div>

          {/* Búsquedas recientes */}
          {searchMode === 'recipes' && recentSearches.length > 0 && (
            <div className="recent-tags-section">
              <div className="recent-tags-container">
                {recentSearches.map((term, index) => (
                  <button 
                    key={index} 
                    className="recent-search-tag" 
                    onClick={() => {
                      setSearchTerm(term);
                      setSelectedIngredients([]);
                      setSelectedCategories([]);
                      setSelectedUtensils([]);
                      handleSearch(term, [], [], []);
                    }}
                  >
                    <Clock size={16} />
                    <span style={{ marginLeft: '8px' }}>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Búsqueda avanzada */}
          {searchMode === 'recipes' && (
            <div className="advanced-search-section">
              <div className="advanced-search-header" onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}>
                <h3 className="advanced-search-title">Advanced Search</h3> 
                {!isAdvancedSearchOpen && (
                  <span className="advanced-filter-summary">
                    {buildFilterSummary(selectedIngredients, selectedCategories, selectedUtensils)}
                  </span>
                )}
                {isAdvancedSearchOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />} 
              </div>
              
              <button 
                className="final-search-button top-right-search" 
                onClick={() => handleSearch()} 
                disabled={isLoading}
              >
                {isLoading ? '...' : 'Search'}
              </button>

              {isAdvancedSearchOpen && (
                <div className="advanced-search-content">
                  {Object.entries(filterMap).map(([key, value]) => (
                    <div className="advanced-input-group" key={key}>
                      <label className="capitalize">{key}</label>
                      <div className="enum-tags-container">
                        {value.selected.map(item => (
                          <span key={item} className={`selected-enum-tag selected-enum-tag--${key}`}>
                            {item} 
                            <button onClick={() => handleRemoveFilter(key as FilterKeyType, item)}><X size={12} /></button>
                          </span>
                        ))}
                        <button className="plus-button" onClick={() => setOpenSelector(key as FilterKeyType)}>
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {searchMode === 'users' && (
            <button 
              className="final-search-button" 
              onClick={() => handleSearch()} 
              disabled={isLoading} 
              style={{marginTop: '10px'}}
            >
              {isLoading ? 'Searching...' : 'Search Users'}
            </button>
          )}

          {/* Resultados de Usuarios */}
            {!isLoading && searchMode === 'users' && userResults && (
              <div className="results-container">
                {userResults.length > 0 ? (
                  <div className="users-social-grid">
                    {userResults.map((user) => (
                      <div key={user._id} className="user-social-card">
                        <div className="user-social-card-content">
                          
                          <div className="user-avatar-container">
                            {user.profilePic ? (
                              <img 
                                src={`${BASE_API_URL}/${user.profilePic}`} 
                                alt={`Perfil de ${user.username}`} 
                                className="user-avatar-image"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="user-avatar-placeholder">
                                <User size={32} />
                              </div>
                            )}
                          </div>

                          <div className="user-info-main">
                            <h4 className="user-card-username">@{user.username}</h4>
                          </div>
                          <button 
                            className="view-profile-button" 
                            onClick={() => navigate(`/user/${user._id}`)} 
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="no-results-container">
                  <Users size={48} />
                  <p>No se han encontrado cocineros con ese nombre.</p>
                </div>
              )}
            </div>
          )}

          {/* Resultados de Recetas */}
          {!isLoading && searchMode === 'recipes' && searchResults && (
            <div className="results-wrapper"> 
              <hr className="main-search-divider" /> 
              
              <div className="results-container">
                <div className="results-header-section">
                  <h3 className="results-title">Resultados de búsqueda</h3>
                  <p className="results-count">
                    {searchResults.length === 1 
                      ? '1 receta encontrada' 
                      : `${searchResults.length} recetas encontradas`}
                  </p>
                </div>

                {searchResults.length > 0 ? (
                  <div className="posts-grid">
                    {searchResults.map(post => (
                      <PostCard 
                        key={post._id}
                        id={post._id}
                        title={post.name}
                        imageSrc={post.images} 
                        userId={post.userId!._id}
                        rating={post.rating || 0}
                        comments={post.comments || 0}
                        userProfilePic={post.userId?.profilePic || "default_pic_url"}
                        userName={post.userId?.username || "Usuario Desconocido"}
                        type={post.images.length > 0 && post.images.some(img => img.includes('video') || img.includes('youtube')) ? 'video' : 'image'} 
                        categories={post.category} 
                        me={me}
                        setMe={setMe}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="no-results-box">
                    <p>No se han encontrado recetas con esos criterios.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* SIDEBAR*/}
        <aside className="panel-derecho profile-sidebar">
          <img src="/logo.png" alt="Recipe Vault Logo" className="recipe-vault-logo"/>
          <SimplifiedProfile user={me} postCount={postCount}/>
          <div className="sidebar-navigation">
              <Navigation user={me} active={2} />
          </div>
        </aside>
      </div>
    </>
  );
}

export default SearchFilterView;