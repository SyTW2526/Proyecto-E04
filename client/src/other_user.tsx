import { Home, Search, User, LogOut } from "lucide-react";
import "./other_user.css";
import { useState } from "react";


function other_user() {
 

    const [username] = useState("Alicia Alison");
  const [followers, setFollowers] = useState(139);
  const [follows] = useState(42);

  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowers(prev => isFollowing ? prev - 1 : prev + 1);
  };
   

  return (
     <div className="contenedor">

      {/* Izquierda: Perfil y Posts */}
      <main className="principal">
        <h1>Perfil de Usuario</h1>

        <div className="tarjeta usuario">
          <div className="fila-datos">
            
            {/* FOTO DE PERFIL */}
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              alt="Foto de perfil"
              className="foto-perfil"
            />

            {/* COLUMNA INFO */}
            <div className="fila-seguidores">
              <p><strong>Followers:</strong> {followers}</p>
              <p><strong>Follows:</strong> {follows}</p>

              <button className="boton-seguir" onClick={handleFollow}>
                {isFollowing ? "Siguiendo ✓" : "Seguir"}
              </button>
            </div>

          </div>
        </div>


        <h2>Posts recientes</h2>

         <div className="tarjeta post">
          <div className="subtarjeta-post">
         <img src="/Caesar.jpg" alt="Ensalada César" className="imagen-post" />
            <h3>Ensalada César</h3>
            <p>⭐ 139 · 💬 99</p>
            </div>
            </div>
    </main>

      {/* Derecha: barra lateral */}
      <aside className="panel-derecho">
        <button className="boton-panel">
          <Home size={24} />
          <span>Home</span>
        </button>

        <button className="boton-panel">
          <Search size={24} />
          <span>Search</span>
        </button>

        <button className="boton-panel">
          <User size={24} />
          <span>Account</span>
        </button>

        <div className="linea" />

        <button className="boton-panel logout">
          <LogOut size={24} />
          <span>Logout</span>
        </button>
      </aside>
    </div>
  );
}

export default other_user;
