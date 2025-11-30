import { Home, Search, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import './navigation.css';
import axios from "axios";


function Navigation() {
    const navigate = useNavigate();

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

                <button className="boton-panel" onClick={() => navigate('/user/me')}>
                    <User size={24} />
                    <span>Account</span>
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