import { Home, Search, User, LogOut } from "lucide-react";
import "./filtered_main_page.css"; 

/**
 * Función principal del componente SearchFilterView 
 * @returns Elemento JSX que representa la vista de búsqueda avanzada/filtrado.
 */
function SearchFilterView() {
  return (
    <div className="contenedor">
      
      {/* IZQUIERDA: ÁREA PRINCIPAL (Vista de Filtro Avanzado) */}
      <main className="principal">
        
        <h2 className="section-title">Search</h2>
        
        {/* 1. Campo de Búsqueda General */}
        <div className="search-bar-main">
          <Search size={20} />
          <input type="text" placeholder="name" />
        </div>
        
        {/* 2. Etiquetas Recientes */}
        <div className="recent-tags-section">
          <h3 className="recent-title">Recent</h3>
          <div className="recent-tags-container">
            <span className="recent-tag">
                {/* Ícono de receta reciente */}
                <img src="https://cdn-icons-png.flaticon.com/512/992/992700.png" alt="Receta" className="recent-tag-icon" />
                Columbian de Ferrera
            </span>
            <span className="recent-tag">
                {/* Ícono de receta reciente */}
                <img src="https://cdn-icons-png.flaticon.com/512/992/992700.png" alt="Receta" className="recent-tag-icon" />
                Arroz 3 delicias
            </span>
            <span className="recent-tag">
                {/* Ícono de receta reciente */}
                <img src="https://cdn-icons-png.flaticon.com/512/992/992700.png" alt="Receta" className="recent-tag-icon" />
                Ensalada con rúcula, tomate, queso y nueces
            </span>
          </div>
        </div>
        
        {/* 3. Búsqueda Avanzada */}
        <div className="advanced-search-section">
          <h3 className="advanced-search-title">Advanced Search</h3>
          
          {/* Botón de Búsqueda Flotante */}
          <button className="final-search-button top-right-search">Search</button>

          {/* Campos de Entrada Avanzada - AHORA COMO ENUMS/TAGS */}
          <div className="advanced-input-group">
            <label>Ingredients</label>
            <div className="enum-tags-container">
                <span className="selected-enum-tag">Slice</span> 
                <button className="plus-button" aria-label="Añadir ingrediente">
                    {/* Ícono de más */}
                    <img src="https://cdn-icons-png.flaticon.com/256/32/32339.png" alt="Añadir" className="plus-icon-image" />
                </button>
            </div>
          </div>

          <div className="advanced-input-group">
            <label>Category</label>
            <div className="enum-tags-container">
                <span className="selected-enum-tag">Postre</span> 
                <span className="selected-enum-tag">Dulce</span> 
                <button className="plus-button" aria-label="Añadir categoría">
                    {/* Ícono de más */}
                    <img src="https://cdn-icons-png.flaticon.com/256/32/32339.png" alt="Añadir" className="plus-icon-image" />
                </button>
            </div>
          </div>

          <div className="advanced-input-group">
            <label>Utensils</label>
            <div className="enum-tags-container">
                <span className="selected-enum-tag">Whip</span> 
                <button className="plus-button" aria-label="Añadir utensilio">
                    {/* Ícono de más */}
                    <img src="https://cdn-icons-png.flaticon.com/256/32/32339.png" alt="Añadir" className="plus-icon-image" />
                </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* DERECHA: BARRA LATERAL (Perfil de Usuario) */}
      <aside className="panel-derecho profile-sidebar">
        <img src="/logo.png" alt="Recipe Vault Logo" className="recipe-vault-logo"/>
        <div className="user-profile-info">
          <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Foto de perfil de Alicia Alison" className="foto-perfil-grande"/>
          <h3 className="user-name">Alicia Alison</h3>
          <p className="user-handle">@aliciaalison</p>
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

          <p className="user-description">
            Me encanta cocinar y compartir recetas
          </p>
        </div>

        <div className="sidebar-navigation">
          {/* Elementos de Navegación de la barra lateral */}
          <button className="boton-panel active">
            <Home size={24} />
          <span>Home</span>
          </button>

          <button className="boton-panel">
            <Search size={24} />
            <span>Search</span>
          </button>

          <button className="boton-panel">
            <User size={24} />
          <span>Account</span>
          </button>

          <div className="linea" />

          <button className="boton-panel logout">
            <LogOut size={24} />
            <span>Logout</span>
          </button>
          <div className="layout-link">Layout</div>
        </div>
      </aside>
    </div>
  );
}

export default SearchFilterView;