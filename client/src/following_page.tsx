import "./user.css";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navigation from "./navigation";
import FollowButton from "./botonFollow";
import './following_page.css'

export interface UserInterface {
  _id: string;
  username: string;
  email: string;
  password: string;
  profilePic: string;   // URL de la foto de perfil
  bio: string;          // Descripción opcional
  followers: string[];
  following: string[];   
  createdAt: Date;
}

interface FollowProps {
  type: boolean
}

function FollowingPage({ type }: FollowProps) {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState<UserInterface | null>(null);
    const [following, setFollowing] = useState<UserInterface[]>([]);
    const [followers, setFollowers] = useState<UserInterface[]>([]);
    const [me, setMe] = useState<UserInterface | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showFollowing, setShowFollowing] = useState(type);

    useEffect(() => {
        axios.get('http://localhost:3000/users/' + id)
        .then(response => setUser(response.data))
        .catch(console.error);
    }, [id]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get('http://localhost:3000/users/me', {
        headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setMe(response.data))
        .catch(console.error);
    }, []);

    useEffect(() => {
        if (user && me) {
        setIsFollowing(me.following.includes(user._id));
        }
    }, [user, me]);

    useEffect(() => {
        if (user && me) {
            axios.get('http://localhost:3000/users/' + id + '/follows')
                .then(data => setFollowing(data.data))
                .catch(err => console.error(err));
        }
    }, [user, me]);

    useEffect(() => {
        if (user && me) {
            axios.get('http://localhost:3000/users/' + id + '/followers')
                .then(data => setFollowers(data.data))
                .catch(err => console.error(err));
        }
    }, [user, me]);

    if (!user || !me) return <></>;
    
    const followersCount = me.followers.length;
    const followingCount = me.following.length;
    const usernameDisplay = me.username; 
    const handleDisplay = `@${me.username.toLowerCase()}`; 
    const postCount = 480;

    const isMe = user._id === me._id;

  return (
    <>
        <div className="contenedorGeneral">
            <div className="contenedorUsuarios">
                <div className="usuarioFollows">
                    <h3>{user.username}</h3>
                </div>
                <div className="botonesFollow">
                    { showFollowing ? (
                        <>
                            <button className="boton inactive" onClick={() => {setShowFollowing(false)}}>Seguidores</button>
                            <button className="boton active" onClick={() => {setShowFollowing(true)}}>Seguidos</button>
                        </>
                        ) : (
                        <>
                            <button className="boton active" onClick={() => {setShowFollowing(false)}}>Seguidores</button>
                            <button className="boton inactive" onClick={() => {setShowFollowing(true)}}>Seguidos</button>
                        </>
                        )}
                    
                </div>
                {showFollowing && 
                    following.map((usr, index) => (
                        <>
                            <div className="usuario-boton">
                                <Link className="linkUsuario" to={`/user/${usr._id}`}>
                                    <div className="usuarioSimplificado" key={`usr${index}`}>
                                        <img className="foto-perfil-grande" src={`http://localhost:3000/${usr.profilePic}`}></img>
                                        <div className="datosUsuario" key={`data${index}`}>
                                            <h4>{usr.username}</h4>
                                            <p>{usr.bio}</p>
                                        </div>
                                    </div>
                                </Link>
                                <div className="botonUsuario" key={`boton${index}`}>
                                    {usr._id !== me._id ? (
                                        <FollowButton
                                            user={usr}
                                            me={me}
                                            setMe={setMe}
                                        />
                                    ) : (<></>)
                                    }
                                </div>
                                
                            </div>
                            {index !== following.length-1 ? (<div className="linea"></div>) : (<></>)}
                        </>
                ))}
                {!showFollowing &&
                    followers.map((usr, index) => (
                        <>
                            <div className="usuario-boton" key={usr._id}>
                                <Link className="linkUsuario" to={`/user/${usr._id}`}>
                                    <div className="usuarioSimplificado">
                                    <img
                                        className="foto-perfil-grande"
                                        src={`http://localhost:3000/${usr.profilePic}`}
                                    />
                                    <div className="datosUsuario">
                                        <h4>{usr.username}</h4>
                                        <p>{usr.bio}</p>
                                    </div>
                                    </div>
                                </Link>

                                <div className="botonUsuario">
                                    {usr._id !== me._id && (
                                    <FollowButton
                                        user={usr}
                                        me={me}
                                        setMe={setMe}
                                    />
                                    )}
                                </div>
                            </div>
                            {index !== following.length-1 ? (<div className="linea"></div>) : (<></>)}
                        </>
                    ))}
            </div>
        </div>
        <aside className="panel-derecho profile-sidebar">
            <img src="/logo.png" alt="Recipe Vault Logo" className="recipe-vault-logo"/>
            <div className="user-profile-info">  
                <img src={`http://localhost:3000/${me.profilePic}` || "default_profile_pic.png"} alt={`Foto de perfil de ${usernameDisplay}`} className="foto-perfil-grande"/>
                    
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
    </>
  );
}

export default FollowingPage;
