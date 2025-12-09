import { Search, MoreVertical, Bookmark, Star, MessageSquare } from "lucide-react";
import "./main_page.css"; 
import Navigation from "./navigation";
import { useEffect, useState } from "react"; 
import axios from "axios"; 

export interface UserInterface {
  _id: string;
  username: string;
  email: string;
  password?: string;
  profilePic: string; 
  bio: string; 
  followers: string[]; 
  following: string[]; 
  recentSearches: string[];
  createdAt: Date;
}

export interface RecipePost {
  _id: string;
  name: string;
  steps: string[];
  ingredients: any[];
  tools: string[];
  category: string[];
  images: string[];
  videos: string[];
  location?: string; 
  rating?: number; 
  comments?: number; 
  creacionDate: Date;

  userId: {
    _id: string;
    username: string;
    profilePic: string;
  } | null;
}

interface ContentCardProps {
  id: string; 
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


const PostCard = ({ id, title, imageSrc, location, rating, comments, userProfilePic, userName, categories }: ContentCardProps) => {
  const displayImage = Array.isArray(imageSrc) ? imageSrc[0] : imageSrc;
  const isVideo = (imageSrc as string[]).some(src => src.includes('video') || src.includes('youtube'));
  const getToken = (): string | null => localStorage.getItem('token');
  const token = getToken();
  
  if (!token) return null; 

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
        <h3 className="post-title">{title}</h3>
      </div>
      </a>
    </div>
  );
};


function Main_page() {
  const [me, setMe] = useState<UserInterface | null>(null);
  const [posts, setPosts] = useState<RecipePost[]>([]); 
  const [postCount, setPostCount] = useState(0); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get<UserInterface>('http://localhost:3000/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => setMe(response.data))
      .catch(console.error);
      
    setPostCount(480); 
      
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios.get<RecipePost[]>('http://localhost:3000/recipes/feed', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setPosts(response.data.slice(0, 15));
      })
      .catch(console.error);
  }, []);

  if (!me) return <div className="loading">Cargando perfil...</div>;

  const followersCount = me.followers.length;
  const followingCount = me.following.length;
  const usernameDisplay = me.username; 
  const handleDisplay = `@${me.username.toLowerCase()}`; 

  return (
    <div className="contenedor">
      {/* Lista de Posts y Búsqueda */}
      <main className="principal posts-area">
        
        <h2 className="section-title">Posts</h2>

        {/* Contenedor de la cuadrícula de posts */}
        <div className="posts-grid">
          {posts.length === 0 ? (
            <p>No hay recetas disponibles en tu feed. ¡Sigue a alguien!</p>
          ) : (
            posts.map(post => (
              <PostCard 
                key={post._id}
                id={post._id}
                title={post.name}
                imageSrc={post.images} 
                location={post.location || "Ubicación Desconocida"} 
                rating={post.rating || 0}
                comments={post.comments || 0}
                userProfilePic={post.userId?.profilePic || "default_pic_url"}
                userName={post.userId?.username || "Usuario Desconocido"}
                type={post.images.length > 0 && post.images.some(img => img.includes('video') || img.includes('youtube')) ? 'video' : 'image'} 
                categories={post.category} 
              />
            ))
          )}
        </div>
      </main>

      {/* Perfil de Usuario */}
      <aside className="panel-derecho profile-sidebar">
        <img src="/logo.png" alt="Recipe Vault Logo" className="recipe-vault-logo"/>
        <div className="user-profile-info">
          
          <img src={me.profilePic || "default_profile_pic.png"} alt={`Foto de perfil de ${usernameDisplay}`} className="foto-perfil-grande"/>
          
          <h3 className="user-name">{usernameDisplay}</h3>
          <p className="user-handle">{handleDisplay}</p>
          
          <div className="stats-row">
            <div>
              <span className="stat-number">{postCount}</span> 
              <span className="stat-label">Posts</span>
            </div>
            <div>
              <span className="stat-number">{followersCount > 999 ? `${(followersCount / 1000).toFixed(1)}k` : followersCount}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div>
              <span className="stat-number">{followingCount}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>

          <p className="user-description">
            {me.bio || "Comparte tu pasión por la cocina en tu biografía."}
          </p>
        </div>

        <div className="sidebar-navigation">
          <Navigation />
          <div className="layout-link">Layout</div>
        </div>
      </aside>
    </div>
  );
}

export default Main_page;