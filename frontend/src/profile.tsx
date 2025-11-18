import { Home, Search, User, LogOut } from "lucide-react";
import "./profile.css";
import { useState } from "react";


function Profile() {
  // para subir foto de perfil
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  //maneja la selección de la imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file) {
      setFile(file);
      setSelectedImage(URL.createObjectURL(file));

    }
  };

  //para subir al backend
  const userId = localStorage.getItem("userId");
  const handleUpload = async () => {
    if(!file) return alert("Selecciona una imagen primero");
    const formData = new FormData();
    formData.append("profileImage", file);

  

    try {
      const res = await fetch("http://localhost:3000/users/${userId}/upload",{
        method: "POST",
        body: formData,
      });
      if(res.ok) { alert ("Imagen subida correctamente");
      }else alert("Error al subir la imagen");
    } catch (error) { 
      console.error(error);
      alert("Error en la conexión con el servisor");
    }
  };





  const[username, setUsername] = useState("");
  const[email, setEmail] = useState("");
  const[password, setPassword] = useState("");
  const[description, setDescription] = useState("");

  const handleSaveProfile = async () => {
    if (!userId) return alert("No hay usuario logueado");

    const updateData = {
      username,
      email,
      password,
      description,
    };
    
    try {
      const res = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        alert("Perfil actualizado correctamente");
      } else {
        alert("Error al actualizar el perfil");
      }
    } catch (error) {
      console.error(error);
      alert("Error en la conexión con el servidor");
    }
  };

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
          src={ selectedImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
           alt="Foto de perfil"
           className="foto-perfil"
          />


          {/* Input para seleccionar imagen */}
          <label className= "boton-subir">
            Cambiar foto
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{display: "none"}}
              id="profilePicInput"
              />
          </label>
          <button 
              onClick={handleUpload}
              className="boton-guardar"
            >
              Guardar foto
          </button>
          
        <div className="columna">
         <label>Nombre de usuario:</label>
          <input type="text"
           placeholder="Alicia Alison" 
           value={username}
           onChange={(e) => setUsername(e.target.value)}
           />
        </div>

       {/* Columna 2: Correo + Contraseña */}
         <div className="columna">
         <label>Correo electrónico:</label>
          <input type="text"
           placeholder="ali.alison@gmail.com"
           value={email}
           onChange={(e) => setEmail(e.target.value)} 
           />

          <label>Contraseña:</label>
         <input type="password" 
         placeholder="*********" 
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         />
         </div>

       {/* Columna 3: Descripción */}
       <div className="columna">
       <label>Descripción:</label>
       <textarea
        placeholder="Me encanta cocinar y compartir recetas"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
         />
        </div>
        <button 
          className="boton-guardar"
          onClick={handleSaveProfile}
        >
         Guardar cambios del perfil
        </button>
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
