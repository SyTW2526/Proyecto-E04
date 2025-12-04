import React, { useState, useMemo, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import { Search, User, Plus, Clock, ChevronDown, ChevronUp, X } from "lucide-react"; 
import './filtered_main_page.css'
import Navigation from "./navigation";

const FilterKey = {
  INGREDIENTS: 'ingredients',
  CATEGORY: 'category',
  TOOLS: 'tools',
} as const;

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
  'cuchillo', 'tablaDeCortar', 'tabla de cortar', 'sartén', 'olla', 'batidora', 
  'horno', 'microondas', 'espátula', 'cucharón', 'colador', 'caldero', 'rodillo', 
  'rallador'
];

type FilterKeyType = typeof FilterKey[keyof typeof FilterKey];

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

  if (ingredients && ingredients.length > 0) {
    summaryParts.push(`${ingredients.length} Ingredients${ingredients.length !== 1 ? 's' : ''}`);
  }

  if (categories && categories.length > 0) {
    summaryParts.push(`${categories.length} Category${categories.length !== 1 ? 's' : ''}`);
  }

  if (utensils && utensils.length > 0) {
    summaryParts.push(`${utensils.length} Utensils${utensils.length !== 1 ? 's' : ''}`);
  }

  if (summaryParts.length === 0) {
    return 'No filters applied';
  }

  return summaryParts.join(' · ');
};

interface ParsedFilters {
  searchTerm: string;
  ingredients: string[];
  categories: string[];
  utensils: string[];
}

/**
 * Parsea una cadena de búsqueda reciente y devuelve un objeto de filtros.
 */
const parseSearchString = (searchString: string): ParsedFilters => {
  const filters: ParsedFilters = {
    searchTerm: '',
    ingredients: [],
    categories: [],
    utensils: [],
  };

  if (!searchString) return filters;
  const parts = searchString.split('|').map(p => p.trim()).filter(Boolean);

  for (const part of parts) {
    const colonIndex = part.indexOf(':');
    if (colonIndex === -1) continue; 
    const type = part.substring(0, colonIndex).trim().toLowerCase();
    const value = part.substring(colonIndex + 1).trim();
    if (!value) continue;

    switch (type) {
      case 'nombre':
        filters.searchTerm = value;
        break;
      case 'ingrediente':
        filters.ingredients.push(value);
        break;
      case 'categoria':
        filters.categories.push(value);
        break;
      case 'utensilio':
        filters.utensils.push(value);
        break;
      default:
        break;
    }
  }

  return filters;
};

type User = {
  id: string;
  username: string;
  recentSearches: string[];
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
  const [currentUser, setCurrentUser] = useState<User>({ 
      id: '693b24ddc4a6d66c239e', 
      username: 'aliciaalison', 
      recentSearches: [], 
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Recipe[] | null>(null); 
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedUtensils, setSelectedUtensils] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(currentUser.recentSearches); 
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState<boolean>(true);

  const getToken = (): string | null => localStorage.getItem('token');
  const updateUserSearches = useCallback(async (newSearches: string[]) => {
  const token = getToken();
  if (!token) return;

  try {
    const response = await fetch(`${BASE_API_URL}/users/updateSearches`, { 
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
        },
      body: JSON.stringify({ recentSearches: newSearches }) 
    });

    if (!response.ok) {
      throw new Error(`Error al guardar búsquedas: ${response.status}`);
    }
    setRecentSearches(newSearches); 
    setCurrentUser(prev => ({...prev, recentSearches: newSearches}));

  } catch (error) {
    console.error("Fallo al persistir las búsquedas recientes en la BD:", error);
  }
  }, [BASE_API_URL]);
    const fetchUserSearches = useCallback(async () => {
      const token = getToken();
      if (!token) return; 
      try {
        const response = await fetch(`${BASE_API_URL}/users/me`, { 
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, 
          },
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData && Array.isArray(userData.recentSearches)) {
            setCurrentUser(userData as User);
            setRecentSearches(userData.recentSearches as string[]);
          }
        }
      } catch (error) {
        console.error("Fallo al cargar la información inicial del usuario:", error);
      }
    }, [BASE_API_URL]);

  useEffect(() => { fetchUserSearches(); }, [fetchUserSearches]); 

const [openSelector, setOpenSelector] = useState<FilterKeyType | ''>(''); 
    
const filterMap: Record<FilterKeyType, { list: readonly string[]; selected: string[]; setSelected: React.Dispatch<React.SetStateAction<string[]>> }> = useMemo(() => ({
  [FilterKey.INGREDIENTS]: { list: ALLOWED_INGREDIENTS, selected: selectedIngredients, setSelected: setSelectedIngredients },
  [FilterKey.CATEGORY]: { list: ALLOWED_CATEGORIES, selected: selectedCategories, setSelected: setSelectedCategories },
  [FilterKey.TOOLS]: { list: ALLOWED_UTENSILS, selected: selectedUtensils, setSelected: setSelectedUtensils },
}), [selectedIngredients, selectedCategories, selectedUtensils]);

const handleAddFilter = (type: FilterKeyType, value: string): void => {
  const filterType = type;
  const entry = filterMap[filterType];
  if (entry) {
    const { selected, setSelected } = entry;
    if (!selected.includes(value)) {
      setSelected([...selected, value]);
    }
  }
};

const handleRemoveFilter = (type: FilterKeyType, value: string): void => {
  const filterType = type;
  const entry = filterMap[filterType];
  if (entry) {
    const { selected, setSelected } = entry;
    setSelected(selected.filter(item => item !== value));
  }
};

const handleSearch = async (
  term: string = searchTerm, 
  ingredients: string[] = selectedIngredients, 
  categories: string[] = selectedCategories, 
  utensils: string[] = selectedUtensils
): Promise<void> => {
  if (term !== searchTerm) setSearchTerm(term);
  if (ingredients !== selectedIngredients) setSelectedIngredients(ingredients);
  if (categories !== selectedCategories) setSelectedCategories(categories);
  if (utensils !== selectedUtensils) setSelectedUtensils(utensils);
  
  if (isLoading) return; 

  setIsLoading(true);
  setSearchResults(null); 
  setIsAdvancedSearchOpen(false); 
  
  const params = new URLSearchParams();
  if (term.trim()) {
      params.append('name', term.trim());
  }
  ingredients.forEach(ing => { params.append('ingredientName', ing); });
  categories.forEach(cat => { params.append('category', cat); });
  utensils.forEach(tool => { params.append('tools', tool); });
  
  const queryString = params.toString();
  const fetchUrl = `${BASE_API_URL}/recipes${queryString ? '?' + queryString : ''}`;

  const token = getToken();
  const headers: Record<string,string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  try {
    const response = await fetch(fetchUrl, { method: 'GET', headers: headers });
    if (response.status === 401) {
      console.error("Error 401: Token inválido o expirado.");
      setSearchResults([]); 
      return; 
    }

    if (response.status === 404) {
      setSearchResults([]);
      return;
    }

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    const results: Recipe[] = Array.isArray(data) ? data : (data.results || [data]);
    setSearchResults(results);
    const searchTermsArray: string[] = [];
    if (term.trim()) searchTermsArray.push(`Nombre: ${term.trim()}`);
    ingredients.forEach(ing => searchTermsArray.push(`Ingrediente: ${ing}`));
    categories.forEach(cat => searchTermsArray.push(`Categoría: ${cat}`));
    utensils.forEach(tool => searchTermsArray.push(`Utensilio: ${tool}`));
    
    const newSearchString = searchTermsArray.join(' | ');
    
    if (newSearchString) {
      const newSearches = recentSearches.filter(s => s !== newSearchString); 
      newSearches.unshift(newSearchString);
      const searchesToSave = newSearches.slice(0, MAX_RECENT_SEARCHES);

      if (token) {
        await updateUserSearches(searchesToSave); 
      } else {
        setRecentSearches(searchesToSave);
      }
    }

  } catch (error) {
    console.error("Error al realizar la búsqueda:", error);
    setSearchResults(null); 
  } finally {
    setIsLoading(false);
  }
};
    
const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleSearch();
  }
};

const handleApplyRecentSearch = (searchString: string): void => {
  const filters = parseSearchString(searchString);

  setSearchTerm(filters.searchTerm);
  setSelectedIngredients(filters.ingredients);
  setSelectedCategories(filters.categories);
  setSelectedUtensils(filters.utensils);

  if (filters.ingredients.length > 0 || filters.categories.length > 0 || filters.utensils.length > 0) {
    setIsAdvancedSearchOpen(true);
  } else {
    setIsAdvancedSearchOpen(false);
  }
  
  handleSearch(filters.searchTerm, filters.ingredients, filters.categories, filters.utensils);
};

const toggleAdvancedSearch = (): void => {
  setIsAdvancedSearchOpen(!isAdvancedSearchOpen);
};

  return (
    <>
    {/* Modal de Filtros */}
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
        {/* Campo de búsqueda general */}
          <div className="search-bar-main">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Recipe name..." 
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress} 
              disabled={isLoading}
            />
          </div>
                    
        {/* Búsquedas recientes*/}
          <div className="recent-tags-section">
            <div className="recent-tags-container">
              {recentSearches.length === 0 ? (
                <p className="no-recent-searches">Sin búsquedas recientes.</p>
              ) : (
                recentSearches.map((search, index) => (
                  <button key={index} className="recent-search-tag" onClick={() => handleApplyRecentSearch(search)}>
                    <Clock size={16} className="clock-icon" /> 
                    <span className="search-text">{search}</span>
                  </button>
                ))
              )}
            </div>
          </div>
                    
        {/* Búsqueda avanzada */}
          <div className="advanced-search-section">
            <div className="advanced-search-header" onClick={toggleAdvancedSearch}>
              <h3 className="advanced-search-title">Advanced Search</h3>       
                {!isAdvancedSearchOpen && (
                    <span className="advanced-filter-summary">
                        {buildFilterSummary(selectedIngredients, selectedCategories, selectedUtensils)}
                    </span>
                )}
                {isAdvancedSearchOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />} 
              </div>
              <button className="final-search-button top-right-search" onClick={() => handleSearch()} disabled={isLoading}>
                {isLoading ? 'Buscando...' : 'Search'}
              </button>
              {isAdvancedSearchOpen && (
              <div className="advanced-search-content">
                {/* Ingredientes */}
                <div className="advanced-input-group">
                  <label>Ingredients</label>
                  <div className="enum-tags-container">
                    {selectedIngredients.map(ing => (
                      <span key={ing} className="selected-enum-tag selected-enum-tag--ingredients">
                      {ing} 
                        <button className="remove-enum-tag-button" onClick={() => handleRemoveFilter(FilterKey.INGREDIENTS, ing)} aria-label={`Remover ingrediente ${ing}`}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <button className="plus-button" aria-label="Añadir ingrediente" onClick={() => setOpenSelector(FilterKey.INGREDIENTS)} disabled={selectedIngredients.length === ALLOWED_INGREDIENTS.length || isLoading}>
                      <Plus size={20} className="plus-icon-image transform rotate-45" />
                    </button>
                  </div>
                </div>

                {/* Categoría */}
                <div className="advanced-input-group">
                  <label>Category</label>
                  <div className="enum-tags-container">
                    {selectedCategories.map(cat => (
                      <span key={cat} className="selected-enum-tag selected-enum-tag--category">
                        {cat} 
                        <button className="remove-enum-tag-button" onClick={() => handleRemoveFilter(FilterKey.CATEGORY, cat)} aria-label={`Remover categoría ${cat}`}>
                          <X size={12} />
                        </button>
                     </span>
                    ))}
                    <button className="plus-button" aria-label="Añadir categoría" onClick={() => setOpenSelector(FilterKey.CATEGORY)} disabled={selectedCategories.length === ALLOWED_CATEGORIES.length || isLoading}>
                      <Plus size={20} className="plus-icon-image transform rotate-45" />
                    </button>
                  </div>
                </div>

                {/* Utensils */}
                <div className="advanced-input-group">
                  <label>Utensils</label>
                  <div className="enum-tags-container">
                    {selectedUtensils.map(tool => (
                      <span key={tool} className="selected-enum-tag selected-enum-tag--tools">
                          {tool} 
                          <button className="remove-enum-tag-button" onClick={() => handleRemoveFilter(FilterKey.TOOLS, tool)} aria-label={`Remover utensilio ${tool}`}>
                            <X size={12} />
                          </button>
                      </span>
                    ))}
                    <button className="plus-button" aria-label="Añadir utensilio" onClick={() => setOpenSelector(FilterKey.TOOLS)} disabled={selectedUtensils.length === ALLOWED_UTENSILS.length || isLoading}>
                      <Plus size={20} className="plus-icon-image transform rotate-45" />
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Área de resultados */}
        <div className={`search-results-area ${isAdvancedSearchOpen ? 'results-open' : 'results-closed'}`} >
          <h3 className="recent-title results-title">Search Results</h3>
          {isLoading && <p>Cargando recetas...</p>}
          {!isLoading && searchResults && searchResults.length > 0 && (
            <div>
              <p>
              {searchResults.length === 1 ? `1 recipe was found:` : `${searchResults.length} recipes  were found:`}</p>
              <ul className="results-list"> 
                {searchResults.map((recipe, index) => (
                  <li key={recipe._id ?? index}>
                    {recipe.name} (User: {recipe.userId?.username || 'Anonymous'})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isLoading && searchResults && searchResults.length === 0 && (
            <p className="no-results-message"> No se ha encontrado ninguna receta que coincida con tus criterios de búsqueda. </p>
           )}
                        
          {!isLoading && searchResults === null && (
            <p className="initial-message"> Presiona **Search** para comenzar la búsqueda. </p>
           )}
      </div>
    </main>
                
    <aside className="panel-derecho profile-sidebar">
      <img src="/logo.png" alt="Recipe Vault Logo" className="recipe-vault-logo"/>
      <div className="user-profile-info">
        <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Foto de perfil de Alicia Alison" className="foto-perfil-grande"/>
        <div className="user-text-container">
          <h3 className="user-name">{currentUser.username}</h3>
          <p className="user-handle">@{currentUser.username}</p>
        </div>
                        
        <div className="stats-row">
          <div>
            <span className="stat-number">480</span>
            <span className="stat-label">Posts</span>
          </div>
          <div>
            <span className="stat-number">57k</span>
            <span className="stat-label">Followers</span>
          </div>
          <div>
            <span className="stat-number">50</span>
            <span className="stat-label">Following</span>
          </div>
        </div>

        <p className="user-description"> Me encanta cocinar y compartir recetas</p>
      </div>

      <div className="sidebar-navigation">
        <Navigation />
      </div>
      </aside>
    </div>
  </>
  );
}

export default SearchFilterView;