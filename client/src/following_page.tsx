import "./user.css";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navigation from "./navigation";
import FollowButton from "./botonFollow";
import './following_page.css'
import type { UserInterface } from "./interfaces/UserInterface";
import SimplifiedProfile from "./simplifiedProfile";

interface FollowProps {
  type: boolean
}

function FollowingPage({ type }: FollowProps) {
    const { id } = useParams();
    
    const [user, setUser] = useState<UserInterface | null>(null);
    const [following, setFollowing] = useState<UserInterface[]>([]);
    const [followers, setFollowers] = useState<UserInterface[]>([]);
    const [me, setMe] = useState<UserInterface | null>(null);
    const [showFollowing, setShowFollowing] = useState(type);
    const [postCount, setPostCount] = useState(0);

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

    useEffect(() => {
        if (me) {
            const token = localStorage.getItem("token");
    
            axios.get(`http://localhost:3000/recipes?userId=${me._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => setPostCount(response.data.length))
            .catch(error => console.error(error));
        }
    }, [me])

    if (!user || !me) return <></>;
    
    const followersCount = me.followers.length;
    const followingCount = me.following.length;
    const usernameDisplay = me.username; 
    const handleDisplay = `@${me.username.toLowerCase()}`; 

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
            <SimplifiedProfile user={me} postCount={postCount}/>
            <div className="sidebar-navigation">
                <Navigation user={me} />
            </div>
        </aside>
    </>
  );
}

export default FollowingPage;
