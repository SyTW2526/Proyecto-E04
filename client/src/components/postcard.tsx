import { MoreVertical, Bookmark, Star, MessageSquare } from "lucide-react";
import SaveButton from "./botonSave";
import { useEffect, useState } from "react";
import type { UserInterface } from "../interfaces/UserInterface";
import axios from "axios";
import type { Review } from "../pages/recipe";

export interface RecipePost {
  _id: string;
  name: string;
  steps: string[];
  ingredients: any[];
  tools: string[];
  category: string[];
  images: string[];
  videos: string[];
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
  userId: string;
  rating: number;
  comments: number;
  type: 'image' | 'video'; 
  userProfilePic: string; 
  userName: string; 
  categories: string[];
  me: UserInterface;
  setMe: React.Dispatch<React.SetStateAction<UserInterface | null>>;
}

const port = import.meta.env.VITE_PORT ?? 3000;

const PostCard = ({ id, title, imageSrc, rating, comments, userProfilePic, userId, userName, categories, me, setMe }: ContentCardProps) => {
  const displayImage = Array.isArray(imageSrc) ? imageSrc[0] : imageSrc;
  const isVideo = (imageSrc as string[]).some(src => src.includes('video') || src.includes('youtube'));

  const [reviewCount, setReviewCount] = useState(0);
  const [valoracion, setValoracion] = useState<string | number>('-');

  useEffect(() => {
    axios.get(`http://localhost:${port}/reviews?recipeId=` + id)
      .then(response => {
        setReviewCount(response.data.length);
        
        if(response.data.length > 0) {
          setValoracion(response.data.reduce((accumulator: number, currentValue: Review) => accumulator + currentValue.rating, 0) / response.data.length)
        }
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <div className="tarjeta post-card">
      <div className="post-header-info">
        <a href={`/user/${userId}`} className="profile-link-button" aria-label={`Ver perfil de ${userName}`}>
          <img src={`http://localhost:${port}/${userProfilePic}`} alt={userName} className="post-user-profile-pic" />
        </a>
          <div className="user-text-container">
          <a href={`/user/${userId}`} className="profile-link" aria-label={`Ver perfil de ${userName}`}>
            <span className="post-user-name">{userName}</span>
          </a>
        </div>
       
      </div>
      <a href={`/recipe/${id}`} className="post-detail-link" aria-label={`Ver receta: ${title}`}>              
      <div className="image-wrapper">
        <img src={`http://localhost:${port}/${displayImage}`} alt={title} className="imagen-post" />
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
              <Star size={16} fill="#FFD700" stroke="#FFD700" className="stat-icon" /> {valoracion}
            </span>
            <span className="stat-separator">·</span>
            <span className="stat-item">
              <MessageSquare size={16} fill="none" className="stat-icon" /> {reviewCount}
            </span>
          </p>
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

export default PostCard;