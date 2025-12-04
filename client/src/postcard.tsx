import { MoreVertical, Bookmark, Star, MessageSquare } from "lucide-react";
import 'postcard.css';

/**
 * Definición de la interfaz ContentCardProps
 */
interface ContentCardProps {
  title: string;
  imageSrc: string | string[]; 
  rating: number;
  comments: number;
  type: 'image' | 'video'; 
  userProfilePic: string; 
  userName: string;
  category: string;
}

// Componente PostCard 
const PostCard = ({ title, imageSrc, rating, comments, userProfilePic, userName, category }: ContentCardProps) => {
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
        </div>
        <button className="post-options-button" aria-label="Opciones de publicación">
          <MoreVertical size={20} />
        </button>
      </div>            
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
        <div className="post-categories-container">
            {category}
        </div>

        {/* Descripción del*/}
        <h3 className="post-title">{title}</h3>
      </div>
    </div>
  );
};

export default PostCard;