import type { UserInterface } from "./interfaces/UserInterface";

interface ProfileProps {
  user: UserInterface,
  postCount: number
}

function SimplifiedProfile({ user, postCount }: ProfileProps) {
    const followersCount = user.followers.length;
    const followingCount = user.following.length;
    const usernameDisplay = user.username; 
    const handleDisplay = `@${user.username.toLowerCase()}`; 
    
    return (
        <div className="user-profile-info">           
            <img src={`http://localhost:3000/${user.profilePic}` || "default_profile_pic.png"} alt={`Foto de perfil de ${usernameDisplay}`} className="foto-perfil-grande"/>
                            
            <h3 className="user-name">{usernameDisplay}</h3>
            <p className="user-handle">{handleDisplay}</p>
                            
            <div className="stats-row">
                <div>
                    <span className="stat-number">{postCount}</span> 
                    <span className="stat-label">Posts</span>
                </div>
                <div>
                    <span className="stat-number">{followersCount > 999 ? `${(followersCount / 1000).toFixed(1)}k` : followersCount}</span>
                    <span className="stat-label">Seguidores</span>
                </div>
                <div>
                    <span className="stat-number">{followingCount}</span>
                    <span className="stat-label">Seguidos</span>
                </div>
            </div>

            <p className="user-description">
                {user.bio || "Comparte tu pasión por la cocina en tu biografía."}
            </p>
        </div>
    );
}

export default SimplifiedProfile