import { Home, Search, User, LogOut } from "lucide-react";
import "./user.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Formik, Form } from "formik";
import * as yup from "yup";
import Recipe from "./recipe";

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

const UserSchema = yup.object().shape({
  username: yup.string().required("El nombre de usuario es obligatorio").min(3),
  email: yup.string().email("Email inválido").required("Email obligatorio"),
  bio: yup.string().max(200, "La bio no puede exceder 200 caracteres"),
});

function UserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<UserInterface | null>(null);
  const [me, setMe] = useState<UserInterface | null>(null);
  const [editing, setEditing] = useState(false); // <--- Controla si estamos editando
  const [posts, setPosts] = useState<Recipe[] | null>(null);

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
        axios.get(`http://localhost:3000/reviews?userId=${id}`)  
        .then(response => {
            setPosts(response.data);
        })
        .catch(error => {
            console.error(error);
        })
    });

  if (!user || !me) return <></>;
  if (!posts) return <></>;

  const isMe = user._id === me._id;

  return (
    <div className="contenedor">
      <main className="principal">
        <h1>Perfil de Usuario</h1>

        <div className="tarjeta usuario">
          <div className="fila-datos">
            <img src={user.profilePic} alt="Foto de perfil" className="foto-perfil" />

            {!editing ? (
              <>
                <h3>{user.username}</h3>
                <p>{user.bio}</p>

                {isMe && (
                  <>
                    <button onClick={() => setEditing(true)}>Editar</button>
                    <button onClick={() => navigate('/home')}>Borrar</button>
                  </>
                )}
              </>
            ) : (
              <Formik
                initialValues={{
                  username: user.username,
                  email: user.email,
                  bio: user.bio || "",
                }}
                validationSchema={UserSchema}
                onSubmit={async (values) => {
                  try {
                    console.log(values)
                    const response = await axios.patch('http://localhost:3000/users/' + me._id, values);
                    setUser(response.data);
                    setEditing(false);
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                {({ values, handleChange, handleBlur, errors, touched }) => (
                  <Form className="formulario-editar-usuario">
                    <div>
                      <label>Nombre de usuario:</label>
                      <input name="username" value={values.username} onChange={handleChange} onBlur={handleBlur} />
                      {touched.username && errors.username && <p className="error">{errors.username}</p>}
                    </div>
                    <div>
                      <label>Email:</label>
                      <input name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} />
                      {touched.email && errors.email && <p className="error">{errors.email}</p>}
                    </div>
                    <div>
                      <label>Bio:</label>
                      <textarea name="bio" value={values.bio} onChange={handleChange} onBlur={handleBlur} />
                      {touched.bio && errors.bio && <p className="error">{errors.bio}</p>}
                    </div>
                    <div className="botones-editar">
                      <button type="submit">Guardar</button>
                      <button type="button" onClick={() => setEditing(false)}>Cancelar</button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}

            {/* Columna info de seguidores */}
            <div className="fila-seguidores">
              <p><strong>Followers:</strong> {user.followers.length}</p>
              <p><strong>Follows:</strong> {user.following.length}</p>
            </div>
          </div>
        </div>

        <h2>Recetas</h2>
        {/* Aquí puedes mapear los posts del usuario si los tienes */}
        <div className="posts-grid">
          
        </div>
      </main>

      <aside className="panel-derecho">
        <button className="boton-panel"><Home size={24} /><span>Home</span></button>
        <button className="boton-panel"><Search size={24} /><span>Search</span></button>
        <button className="boton-panel"><User size={24} /><span>Account</span></button>
        <div className="linea" />
        <button className="boton-panel logout"><LogOut size={24} /><span>Logout</span></button>
      </aside>
    </div>
  );
}

export default UserPage;