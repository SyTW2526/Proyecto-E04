import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Formik, Form } from "formik";
import * as yup from "yup";
import Navigation from "../components/navigation";
import FollowButton from "../components/botonFollow";
import type { UserInterface } from "../interfaces/UserInterface";
import SimplifiedProfile from "../components/simplifiedProfile";
import PostCard, { type RecipePost } from "../components/postcard";
import { Helmet } from "react-helmet";
import "./styles/user.css";

const UserSchema = yup.object().shape({
  username: yup.string().required("El nombre de usuario es obligatorio").min(4, 'El nombre de usuario debe tener al menos 4 caracteres').max(30, 'El nombre de usuario no puede exceder los 30 caracteres'),
  email: yup.string().email("Email inválido").required("El email es obligatorio").max(40, 'El email no puede exceder los 40 caracteres'),
  bio: yup.string().max(200, "La bio no puede exceder los 200 caracteres"),
});

const port = import.meta.env.VITE_PORT ?? 3000;

function UserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<UserInterface | null>(null);
  const [me, setMe] = useState<UserInterface | null>(null);
  const [editing, setEditing] = useState(false); // <--- Controla si estamos editando
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState<RecipePost[] | null>(null);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    axios.get(`http://localhost:${port}/users/` + id)
      .then(response => setUser(response.data))
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    axios.get(`http://localhost:${port}/users/me`, {
      withCredentials: true
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
    if (me) {
      axios.get(`http://localhost:${port}/recipes?userId=${me._id}`, {
        withCredentials: true
      })
        .then(response => setPostCount(response.data.length))
        .catch(error => console.error(error));
    }
  }, [me]);

  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:${port}/recipes?userId=${user._id}`, {
        withCredentials: true
      })
        .then(response => setPosts(response.data))
        .catch(error => console.error(error));
    }
  }, [user]);

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
    const response = await axios.patch(
      `http://localhost:${port}/users/${me._id}/files`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true
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
  if (!posts) return <></>;

  const isMe = user._id === me._id;

  return (
    <div className="contenedor">
      <Helmet>
        <title>{user.username} / RecipeVault</title>
      </Helmet>
      <main className="principal">
        <h1>Perfil de Usuario</h1>

        <div className="tarjeta usuario">
          <div className="fila-datos">
            <div className="fotoUsuario">
              <img src={`http://localhost:${port}/${user.profilePic}`} alt="Foto de perfil" className="foto-perfil" />
              {isMe && (<div className="cambiar-foto">
                <button onClick={handleButtonClick}>Cambiar foto</button>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>)}
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
                        <button onClick={async () => {
                            try {
                              const response = await axios.delete(`http://localhost:${port}/users/` + user._id);
                              console.log(response);

                              navigate('/login');
                            } catch (error) {
                              console.error(error);
                            }
                          }}>Borrar</button>
                      </>
                    )}
                  </div>
                  <p>{user.bio}</p>

                  {/* Columna info de seguidores */}
                  <div className="fila-seguidores">
                    <Link to='followers'><p><strong>Seguidores:</strong> {user.followers.length}</p></Link>
                    <Link to='following'><p><strong>Seguidos:</strong> {user.following.length}</p></Link>
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
                    const response = await axios.patch(`http://localhost:${port}/users/` + me._id, values);
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
                      {touched.username && errors.username && <p className="help is-danger">{errors.username}</p>}
                    </div>
                    <div>
                      <label>Email:</label><br/>
                      <input name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} />
                      {touched.email && errors.email && <p className="help is-danger">{errors.email}</p>}
                    </div>
                    <div>
                      <label>Biografía:</label>
                      <textarea name="bio" value={values.bio} onChange={handleChange} onBlur={handleBlur} />
                      {touched.bio && errors.bio && <p className="help is-danger">{errors.bio}</p>}
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
          {posts.length === 0 ? (
            <p>Este usuario no ha compartido ninguna receta todavía.</p>
          ) : (
            posts.map(post => (
              <PostCard 
                key={post._id}
                id={post._id}
                title={post.name}
                imageSrc={post.images} 
                userId={post.userId!._id}
                rating={post.rating || 0}
                comments={post.comments || 0}
                userProfilePic={post.userId?.profilePic || "default_pic_url"}
                userName={post.userId?.username || "Usuario Desconocido"}
                type={post.images.length > 0 && post.images.some(img => img.includes('video') || img.includes('youtube')) ? 'video' : 'image'} 
                categories={post.category} 
                me={me}
                setMe={setMe}
              />
            ))
          )}
        </div>
      </main>

      <aside className="panel-derecho">
        <img src="/logo.png" alt="Recipe Vault Logo" className="recipe-vault-logo"/>
        {!isMe && (<SimplifiedProfile user={me} postCount={postCount}/>)}

        <div className="sidebar-navigation">
          {isMe && (<Navigation user={me} active={3}/>)}
          {!isMe && (<Navigation user={me} active={0}/>)}
        </div>
      </aside>
    </div>
  );
}

export default UserPage;
