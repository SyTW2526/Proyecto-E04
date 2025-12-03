import { Home, Search, User, LogOut, MoreVertical, Bookmark, Star, MessageSquare } from "lucide-react";
import "./main_page.css"; 
import { Link } from "react-router-dom";

/**
 * Definición de la interfaz ContentCardProps
 */
interface ContentCardProps {
  id: number;
  title: string;
  imageSrc: string | string[]; 
  location: string;
  rating: number;
  comments: number;
  type: 'image' | 'video'; 
  userProfilePic: string; 
  userName: string; 
  categories: string[];
}

// Componente PostCard 
const PostCard = ({ id, title, imageSrc, location, rating, comments, userProfilePic, userName, categories }: ContentCardProps) => {
  const displayImage = Array.isArray(imageSrc) ? imageSrc[0] : imageSrc;
  const isVideo = (imageSrc as string).includes('youtube') || (imageSrc as string).includes('video'); 

  return (
    <div className="tarjeta post-card">
      <div className="post-header-info">
        <a href={`/profile/${userName}`} className="profile-link-button" aria-label={`Ver perfil de ${userName}`}>
          <img src={userProfilePic} alt={userName} className="post-user-profile-pic" />
        </a>
          <div className="user-text-container">
          <a href={`/profile/${userName}`} className="profile-link" aria-label={`Ver perfil de ${userName}`}>
            <span className="post-user-name">{userName}</span>
          </a>
          <p className="post-location">{location}</p> 
        </div>
        <button className="post-options-button" aria-label="Opciones de publicación">
          <MoreVertical size={20} />
        </button>
      </div>
      <a href={`/post/${id}`} className="post-detail-link" aria-label={`Ver receta: ${title}`}>              
      <div className="image-wrapper">
        <img src={displayImage} alt={title} className="imagen-post" />
          {isVideo && (
            <div className="video-overlay">
              <div className="play-button">▶️ Video</div>
            </div>
            )}
              {Array.isArray(imageSrc) && imageSrc.length > 1 && (
              <div className="gallery-indicator">+{imageSrc.length - 1}</div>
            )}
      </div>
      <div className="post-info">
        <div className="post-stats-row">

          {/* Generación del incono de la estrella y comentario */}
          <p className="post-stats">
            <span className="stat-item">
              <Star size={16} fill="#FFD700" stroke="#FFD700" className="stat-icon" /> {rating}
            </span>
            <span className="stat-separator">·</span>
            <span className="stat-item">
              <MessageSquare size={16} fill="none" className="stat-icon" /> {comments}
            </span>
          </p>

          {/* Icono de guardar contenido */}
          <button className="post-save-button-inner" aria-label="Guardar receta">
            <Bookmark size={20} />
          </button>
        </div>

        {/* Etiquetas de cada post */}
        {categories && categories.length > 0 && (
        <div className="post-categories-container">
          {categories.map((cat) => (
            <span key={cat} className="category-tag">
              {cat}
            </span>
          ))}
        </div>
        )}

        {/* Descripción del*/}
        <h3 className="post-title">{title}</h3>
      </div>
    </a>
  </div>
  );
};

/**
 * Función principal del componente Main_page
 * @returns Elemento JSX que representa la vista del perfil de usuario
 */
function Main_page() {
  const posts: ContentCardProps[] = [
    { 
      id: 1,  
      title: "Pastel de Calabaza", 
      imageSrc: "https://www.rebanando.com/uploads/media/calabza.jpg?1396901933", 
      location: "España | Madrid", 
      rating: 5.0, 
      comments: 204,
      type: 'image',
      userProfilePic: "https://nataliasuarez.com/wp-content/uploads/2022/08/foto-con-buena-resolucion-y-detalles.jpg", // Simulado
      userName: "Ana" ,
      categories: ['postre', 'sin gluten']
      },
    { 
      id: 2, 
      title: "Pollo con arroz", 
      imageSrc: "https://imag.bonviveur.com/arroz-con-pollo.jpg", 
      location: "España | Barcelona", 
      rating: 4.8, 
      comments: 180,
      type: 'image',
      userProfilePic: "https://images.pexels.com/photos/2328141/pexels-photo-2328141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      userName: "Valeria",
      categories: ['plato principal', 'arroz', 'pollo']
    },
    { 
      id: 3, 
      title: "Tarta de chocolate", 
      imageSrc: "https://media.mykaramelli.com/galeria/recetas/tarta-de-chocolate-sin-horno_508_1_890x445.jpg", 
      location: "España | Barcelona", 
      rating: 4.5, 
      comments: 298,
      type: 'image',
      userProfilePic: "https://images.pexels.com/photos/2328141/pexels-photo-2328141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      userName: "Valeria",
      categories: ['postre']
    },
    { 
      id: 4, 
      title: "Desayuno completo", 
      imageSrc: "https://recetasdecocina.elmundo.es/wp-content/uploads/2022/08/desayuno-americano.jpg", 
      location: "EEUU | California", 
      rating: 3.9, 
      comments: 200,
      type: 'image',
      userProfilePic: "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGVyZmlsfGVufDB8fDB8fHww&fm=jpg&q=60&w=3000",
      userName: "Jack",
      categories: ['desayuno']
    },
    { 
      id: 5, 
      title: "Ensalada verde", 
      imageSrc: "https://i.ytimg.com/vi/35RAPqCrSew/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBGhWpOmRkqU5VvKZmmPcz1HMjAPw", 
      location: "España | Tenerife", 
      rating: 4.1, 
      comments: 199,
      type: 'image',
      userProfilePic: "https://www.dzoom.org.es/wp-content/uploads/2020/02/portada-foto-perfil-redes-sociales-consejos.jpg",
      userName: "Lucía",
      categories: ['vegetariano']
    },
    { 
      id: 6, 
      title: "Tacos de carnitas", 
      imageSrc: "https://www.pequerecetas.com/wp-content/uploads/2020/10/tacos-mexicanos.jpg", 
      location: "Inglaterra | Londres", 
      rating: 4.7, 
      comments: 147,
      type: 'image',
      userProfilePic: "https://www.dzoom.org.es/wp-content/uploads/2010/09/retrato-fondo-profundidad-campo-734x489.jpg",
      userName: "Elizabeth",
      categories: ['otro']
    },
  ];

  return (
    <div className="contenedor">
      {/* Lista de Posts y Búsqueda */}
      <main className="principal posts-area">
        <div className="search-bar">
          <Search size={20} />
          <input type="text" placeholder="Search..." />
        </div>
        <h2 className="section-title">Posts</h2>

        {/* Contenedor de la cuadrícula de posts */}
        <div className="posts-grid">
          {posts.map(post => (
            <PostCard 
              key={post.id}
              id={post.id}
              title={post.title}
              imageSrc={post.imageSrc}
              location={post.location}
              rating={post.rating}
              comments={post.comments}
              userProfilePic={post.userProfilePic}
              userName={post.userName}
              type={post.type}
              categories={post.categories} 
            />
          ))}
        </div>
      </main>

      {/* Perfil de Usuario */}
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

          <Link to="/filtered" className="boton-panel" aria-label="Navegar a la página de búsqueda filtrada">
            <Search size={24} />
            <span>Search</span>
          </Link>

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

export default Main_page;