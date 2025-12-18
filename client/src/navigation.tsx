import { Home, Search, User, LogOut, Plus, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import './navigation.css';
import axios from "axios";
import type { UserInterface } from "./interfaces/UserInterface";

interface NavigationProps {
    user: UserInterface
    active: number
}

function Navigation({ user, active }: NavigationProps) {
    const navigate = useNavigate();

    const active1 = active === 1;
    const active2 = active === 2;
    const active3 = active === 3;
    const active4 = active === 4;
    const active5 = active === 5;

    return (
        <>
            <div className="sidebar-navigation">
                {/* Elementos de Navegación de la barra lateral */}
                {active1 && (
                    <button className="boton-panel active" onClick={() => navigate('/home')}>
                        <Home size={24} />
                        <span>Inicio</span>
                    </button>
                )}
                {!active1 && (
                    <button className="boton-panel" onClick={() => navigate('/home')}>
                        <Home size={24} />
                        <span>Inicio</span>
                    </button>
                )}

                {active2 && (
                    <button className="boton-panel active" onClick={() => navigate('/search')}>
                        <Search size={24} />
                        <span>Buscar</span>
                    </button>
                )}
                {!active2 && (
                    <button className="boton-panel" onClick={() => navigate('/search')}>
                        <Search size={24} />
                        <span>Buscar</span>
                    </button>
                )}

                {active3 && (
                    <button className="boton-panel active" onClick={() => navigate('/user/' + user._id)}>
                        <User size={24} />
                        <span>Perfil</span>
                    </button>
                )}
                {!active3 && (
                    <button className="boton-panel" onClick={() => navigate('/user/' + user._id)}>
                        <User size={24} />
                        <span>Perfil</span>
                    </button>
                )}

                {active4 && (
                    <button className="boton-panel active" onClick={() => navigate('/publish/post')}>
                        <Plus size={24} />
                        <span>Publicar</span>
                    </button>
                )}
                {!active4 && (
                    <button className="boton-panel" onClick={() => navigate('/publish/post')}>
                        <Plus size={24} />
                        <span>Publicar</span>
                    </button>
                )}

                {active5 && (
                    <button className="boton-panel active" onClick={() => navigate('/saved')}>
                        <Bookmark size={24} />
                        <span>Guardados</span>
                    </button>
                )}
                {!active5 && (
                    <button className="boton-panel" onClick={() => navigate('/saved')}>
                        <Bookmark size={24} />
                        <span>Guardados</span>
                    </button>
                )}

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
            </div>
        </>
    )
}

export default Navigation;