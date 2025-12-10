import { Home, Search, User, LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import './navigation.css';
import axios from "axios";
import { useEffect, useState } from "react";

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


function Navigation() {
    const navigate = useNavigate();

    const [me, setMe] = useState<UserInterface | null>(null);
    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get('http://localhost:3000/users/me', {
        headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setMe(response.data))
        .catch(console.error);
    }, []);

    if (!me) return <></>;

    return (
        <>
            <div className="sidebar-navigation">
                {/* Elementos de Navegación de la barra lateral */}
                <button className="boton-panel" onClick={() => navigate('/home')}>
                    <Home size={24} />
                    <span>Home</span>
                </button>

                <button className="boton-panel" onClick={() => navigate('/search')}>
                    <Search size={24} />
                    <span>Search</span>
                </button>

                <button className="boton-panel" onClick={() => navigate('/user/' + me._id)}>
                    <User size={24} />
                    <span>Account</span>
                </button>
                <button className="boton-panel" onClick={() => navigate('/publish/post')}>
                    <Plus size={24} />
                    <span>Publish</span>
                </button>

                <div className="linea" />

                <button className="boton-panel logout" onClick={() => {
                    try {
                        const response = axios.post('http://users/logout');
                        console.log(response);

                        navigate('/login');
                    } catch (error) {
                        console.error(error);
                    }
                }}>
                    <LogOut size={24} />
                    <span>Logout</span>
                </button>
                <div className="layout-link">Layout</div>
            </div>
        </>
    )
}

export default Navigation;