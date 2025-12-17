import "./user.css";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Formik, Form } from "formik";
import * as yup from "yup";
import Recipe from "./recipe";
import Navigation from "./navigation";
import FollowButton from "./botonFollow";
import type { UserInterface } from "./interfaces/UserInterface";

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
  const [isFollowing, setIsFollowing] = useState(false);
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
    if (user && me) {
      setIsFollowing(me.following.includes(user._id));
    }
  }, [user, me]);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

const handleButtonClick = () => {
  fileInputRef.current?.click(); // dispara el input oculto
};

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!me) return;

  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("profilePic", file);

  try {
    const token = localStorage.getItem("token");
    const response = await axios.patch(
      `http://localhost:3000/users/${me._id}/files`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log(response);

    // Actualizar foto en pantalla inmediatamente
    setUser(prev => ({ ...prev!, profilePic: response.data.profilePic }));

  } catch (err) {
    console.error(err);
  }
};

  if (!user || !me) return <></>;
  //if (!posts) return <></>;

  const isMe = user._id === me._id;

  return (
    <div className="contenedor">
      <main className="principal">
        <h1>Perfil de Usuario</h1>

        <div className="tarjeta usuario">
          <div className="fila-datos">
            <div className="fotoUsuario">
              <img src={`http://localhost:3000/${user.profilePic}`} alt="Foto de perfil" className="foto-perfil" />
              <div className="cambiar-foto">
                <button onClick={handleButtonClick}>Cambiar foto</button>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {!editing ? (
              <>
                <div className="datosUsuario">
                  <div>
                    <h3>{user.username}</h3>
                    {!isMe && (
                      <>
                        <FollowButton
                          user={user}
                          setUser={setUser}
                          me={me}
                          setMe={setMe}
                        />
                      </>
                    )}
                    {isMe && (
                      <>
                        <button onClick={() => setEditing(true)}>Editar</button>
                        <button onClick={() => navigate('/home')}>Borrar</button>
                      </>
                    )}
                  </div>
                  <p>{user.bio}</p>

                  {/* Columna info de seguidores */}
                  <div className="fila-seguidores">
                    <Link to='followers'><p><strong>Followers:</strong> {user.followers.length}</p></Link>
                    <Link to='following'><p><strong>Follows:</strong> {user.following.length}</p></Link>
                  </div>
                </div>
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
                      <label>Nombre de usuario:</label><br/>
                      <input name="username" value={values.username} onChange={handleChange} onBlur={handleBlur} />
                      {touched.username && errors.username && <p className="error">{errors.username}</p>}
                    </div>
                    <div>
                      <label>Email:</label><br/>
                      <input name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} />
                      {touched.email && errors.email && <p className="error">{errors.email}</p>}
                    </div>
                    <div>
                      <label>Biografía:</label>
                      <textarea name="bio" value={values.bio} onChange={handleChange} onBlur={handleBlur} />
                      {touched.bio && errors.bio && <p className="error">{errors.bio}</p>}
                    </div>
                    <div className="botones-editar">
                      <button className="editButton" type="submit">Guardar</button>
                      <button className="editButton" type="button" onClick={() => setEditing(false)}>Cancelar</button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </div>

        <h2>Recetas</h2>
        {/* Aquí puedes mapear los posts del usuario si los tienes */}
        <div className="posts-grid">
          
        </div>
      </main>

      <aside className="panel-derecho">
        <Navigation user={me} />
      </aside>
    </div>
  );
}

export default UserPage;
