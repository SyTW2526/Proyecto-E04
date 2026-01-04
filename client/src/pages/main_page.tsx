import { Search, MoreVertical, Bookmark, Star, MessageSquare } from "lucide-react";
import "./main_page.css"; 
import Navigation from "../components/navigation";
import { useEffect, useState } from "react"; 
import axios from "axios"; 
import type { UserInterface } from "../interfaces/UserInterface";
import SimplifiedProfile from "../components/simplifiedProfile";
import type { RecipePost } from "../components/postcard";
import PostCard from "../components/postcard";
import { Helmet } from "react-helmet";

const port = import.meta.env.VITE_PORT ?? 3000;

function Main_page() {
  const [me, setMe] = useState<UserInterface | null>(null);
  const [posts, setPosts] = useState<RecipePost[]>([]); 
  const [postCount, setPostCount] = useState(0); 

  useEffect(() => {
    axios.get<UserInterface>(`http://localhost:${port}/users/me`, { withCredentials: true })
      .then(response => setMe(response.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    axios.get<RecipePost[]>(`http://localhost:${port}/recipes/feed`, { withCredentials: true })
      .then(response => {
        setPosts(response.data.slice(0, 15));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
        if (me) {
            axios.get(`http://localhost:${port}/recipes?userId=${me._id}`, {
                withCredentials: true
            })
            .then(response => setPostCount(response.data.length))
            .catch(error => console.error(error));
        }
    }, [me])

  if (!me) return <div className="loading">Cargando perfil...</div>;

  return (
    <div className="contenedor">
      <Helmet>
        <title>Inicio / RecipeVault</title>
      </Helmet>
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
            ))
          )}
        </div>
      </main>

      {/* Perfil de Usuario */}
      <aside className="panel-derecho profile-sidebar">
        <img src="/logo.png" alt="Recipe Vault Logo" className="recipe-vault-logo"/>
        <SimplifiedProfile user={me} postCount={postCount}/>

        <div className="sidebar-navigation">
          <Navigation user={me} active={1}/>
          <div className="layout-link"></div>
        </div>
      </aside>
    </div>
  );
}

export default Main_page;