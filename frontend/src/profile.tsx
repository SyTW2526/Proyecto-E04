import { Home, Search, User, LogOut } from "lucide-react";
import "./profile.css";


function Profile() {
  return (
    <div className="contenedor">
      {/* Izquierda: Perfil y Posts */}
      <main className="principal">
        <h1>Perfil de Usuario</h1>
        <h2>Información del usuario</h2>
        <div className="tarjeta usuario">
        

        <div className="fila-datos">
        {/* Columna 1: Usuario */}
        <img
          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
           alt="Foto de perfil"
           className="foto-perfil"
          />
        <div className="columna">
         <label>Nombre de usuario:</label>
          <input type="text" placeholder="Alicia Alison" />
        </div>

       {/* Columna 2: Correo + Contraseña */}
         <div className="columna">
         <label>Correo electrónico:</label>
          <input type="text" placeholder="ali.alison@gmail.com" />

          <label>Contraseña:</label>
         <input type="password" placeholder="*********" />
         </div>

       {/* Columna 3: Descripción */}
       <div className="columna">
       <label>Descripción:</label>
       <textarea
        placeholder="Me encanta cocinar y compartir recetas"
        
         />
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

export default Profile;
