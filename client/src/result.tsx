import { Search, Home, User, LogOut } from "lucide-react";
import "./result.css";

function RecipeVault() {
  const recipes = [
     { id: 1, author: "Alex", location: "España, Madrid", title: "Tarta de limón y merengue", tag: "Postre", image: "...", likes: 43, comments: 19 },
  { id: 2, author: "María", location: "España, Madrid", title: "Tarta de tres chocolates", tag: "Cumpleaños", image: "...", likes: 62, comments: 21 },
  { id: 3, author: "Marcos", location: "España, León", title: "Tarta de San Marcos", tag: "Tarta", image: "...", likes: 30, comments: 12 },
  { id: 4, author: "Alex", location: "España, Madrid", title: "Tarta de limón y merengue", tag: "Postre", image: "...", likes: 43, comments: 19 },
  { id: 5, author: "María", location: "España, Madrid", title: "Tarta de tres chocolates", tag: "Cumpleaños", image: "...", likes: 62, comments: 21 },
  { id: 6, author: "Marcos", location: "España, León", title: "Tarta de San Marcos", tag: "Tarta", image: "...", likes: 30, comments: 12 },
  { id: 7, author: "Alex", location: "España, Madrid", title: "Tarta de limón y merengue", tag: "Postre", image: "...", likes: 43, comments: 19 },
  { id: 8, author: "María", location: "España, Madrid", title: "Tarta de tres chocolates", tag: "Cumpleaños", image: "...", likes: 62, comments: 21 },

  ];

  return (
    <div className="contenedor-recipevault">
      {/* Izquierda: barra de búsqueda */}
      <aside className="panel-izquierdo">
        <h2>Search</h2>
        <input
          type="text"
          placeholder="Tartas para cumpleaños"
          className="input-busqueda"
        />
        <div className="opciones-busqueda">
          <button>Solomillos de Ternera</button>
          <button>Ensaladas con rúcula</button>
          <button>Arroz tres delicias</button>
        </div>

        <h3>Advanced Search</h3>
        <p>Ingredients</p>
        <div className="opcion-extra">+ Category</div>
        <div className="opcion-extra">+ Utensils</div>
        <button className="boton-buscar">Search</button>
      </aside>

      {/* Centro: recetas */}
      <main className="principal-recipevault">
        {recipes.map((r) => (
          <div key={r.id} className="tarjeta-receta">
            <img src={r.image} alt={r.title} className="imagen-receta" />
            <div className="contenido-receta">
              <div className="cabecera-receta">
                <div>
                  <h4>{r.author}</h4>
                  <p>{r.location}</p>
                </div>
                <span className="mas">⋮</span>
              </div>
              <div className="titulo-receta">
                <span>{r.title}</span>
                <span className="etiqueta">{r.tag}</span>
              </div>
              <div className="footer-receta">
                <span>★ {r.likes}</span>
                <span>💬 {r.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Derecha: perfil */}
      <aside className="panel-derecho">
        <h1>Recipe Vault</h1>
        <img
          src="https://randomuser.me/api/portraits/women/44.jpg"
          alt="Alicia Alison"
          className="foto-perfil"
        />
        <h2>Alicia Alison</h2>
        <p className="username">@ali_rainbow340</p>

        <div className="stats">
          <div>
            <p className="num">480</p>
            <p>Posts</p>
          </div>
          <div>
            <p className="num">15.7k</p>
            <p>Followers</p>
          </div>
          <div>
            <p className="num">50</p>
            <p>Following</p>
          </div>
        </div>

        <p className="bio">
          I love cooking sweets and I would like to share my recipes with you
        </p>

        <nav className="nav-lateral">
          <button className="boton-panel">
            <Home size={22} /> Home
          </button>
          <button className="boton-panel">
            <Search size={22} /> Search
          </button>
          <button className="boton-panel">
            <User size={22} /> Account
          </button>
          <div className="linea" />
          <button className="boton-panel logout">
            <LogOut size={22} /> Logout
          </button>
        </nav>
      </aside>
    </div>
  );
}

export default RecipeVault;