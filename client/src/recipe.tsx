import React, { useState, useEffect } from 'react'; 
import { Star } from 'lucide-react';
import axios from 'axios';
import './recipe.css';
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as yup from 'yup';
import Navigation from "./navigation";
import MediaCarousel from './MediaCarousel';
import SimplifiedProfile from './simplifiedProfile';
import type { UserInterface } from './interfaces/UserInterface';
import SaveButton from './botonSave';
import { Helmet } from 'react-helmet';
import type { Recipe } from './interfaces/RecipeInterface';

export interface Review {
    _id: string;
    userId: {_id: string, username: string, profilePic:string};
    recipeId: string;
    rating: number;
    text?: string;
    creacionDate: Date;
}

const ReviewSchema = yup.object().shape({
    userId: yup.string(),
    recipeId: yup.string(),
    rating: yup.number().required('Se debe dar una puntuación.'),
    text: yup.string().max(300, 'La reseña no puede tener más de 300 caracteres.')
});

function Recipe() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [receta, setReceta] = useState<Recipe | null>(null);
    const [resenas, setResenas] = useState<Review[] | null>(null);
    const [mostrarFormularioResena, setMostrarFormularioResena] = useState(false);
    const [resenaEditando, setResenaEditando] = useState<string | null>(null);
    const [user, setUser] = useState<{ _id: string } | null>(null);
    const [me, setMe] = useState<UserInterface | null>(null);
    const [postCount, setPostCount] = useState(0);

    // Cargar datos de la receta y el usuario actual
    useEffect(() => {
        axios.get('http://localhost:3000/recipes/' + id)
            .then(response => setReceta(response.data))
            .catch(console.error);

        axios.get('http://localhost:3000/users/me', { withCredentials: true })
            .then(response => {
                setUser(response.data);
                setMe(response.data);
            })
            .catch(console.error);
    }, [id]);

    // Cargar reseñas de la receta
    useEffect(() => {
        if (!id) return;
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/reviews?recipeId=${id}`);
                setResenas(response.data);
            } catch (error: any) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    setResenas([]);
                }
            }
        };
        fetchReviews();
    }, [id]);

    // Contador de posts del usuario
    useEffect(() => {
        if (me) {
            axios.get(`http://localhost:3000/recipes?userId=${me._id}`, { withCredentials: true })
                .then(response => setPostCount(response.data.length))
                .catch(console.error);
        }
    }, [me]);

    if (!me || !receta || !resenas || !user) return <div className="loading">Cargando...</div>;

    const usuarioYaReseno = resenas.some(r => r.userId._id === user._id);
    const userIsOwner = user._id === receta.userId._id;
    const resenasEmpty = resenas.length === 0;

    return (
        <>
            <Helmet>
                <title>{receta.name} de {receta.userId.username} / RecipeVault</title>
            </Helmet>

            <div className="ContenedorGeneralReceta">
                <div className="NombreReceta">
                    <h2>{receta.name}</h2>
                </div>

                <div className="ContenedorReceta">
                    <div className="InformacionReceta">
                        <div className="IzquierdaReceta">
                            <div className="UsuarioReceta">
                                <a href={`/user/${receta.userId.username}`} className="profile-link">
                                    <img className="foto-perfil-grande" src={`http://localhost:3000/${receta.userId.profilePic}`} alt="Perfil" />
                                </a>
                                <div className="user-data-column">
                                    <a href={`/user/${receta.userId.username}`} className="profile-link">
                                        <span className="post-user-name">{receta.userId.username}</span>
                                    </a>
                                    <div className="valoracionReceta">
                                        <div className="rating-pill">
                                            <Star size={22} fill="#ff7f50" color="#ff7f50" /> 
                                            <p>{!resenasEmpty 
                                                ? (resenas.reduce((acc, curr) => acc + curr.rating, 0) / resenas.length).toFixed(1) 
                                                : "-"}</p>
                                        </div>
                                        <SaveButton user={me} setUser={setMe} id={receta._id} />
                                    </div>
                                </div>
                            </div>

                            {userIsOwner && (
                                <div className="boton-control-receta">
                                    <button onClick={() => navigate('/recipe/' + id + '/edit')}>Editar</button>
                                    <button onClick={async () => {
                                        if(window.confirm("¿Borrar receta?")) {
                                            try {
                                                await axios.delete('http://localhost:3000/recipes/' + id);
                                                navigate('/home');
                                            } catch (e) { console.error(e); }
                                        }
                                    }}>Borrar</button>
                                </div>
                            )}
                           
                            <div className="CategoriasReceta">
                                <h3>Categorías</h3>
                                <div className="categorias-interior">
                                    {receta.category.map((cat, index) => (
                                        <span key={`categoria${index}`} className="category-tag">{cat}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="IngredientesReceta">
                                <h3>Ingredientes</h3>
                                <ul>
                                    {receta.ingredients.map((ing, index) => (
                                        <li key={`ingrediente${index}`}>{`${ing.ingredient}: ${ing.quantity}`}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="UtensiliosReceta">
                                <h3>Utensilios</h3>
                                <ul>
                                    {receta.tools.map((utensilio, index) => (
                                        <li key={`utensilio${index}`}>{utensilio}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="DerechaReceta">
                            <div className="ImagenesReceta">
                                {(receta.images.length > 0 || receta.videos.length > 0) && (
                                    <MediaCarousel media={[...receta.images, ...receta.videos]} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="AbajoReceta">
                        <div className="TextoReceta">
                            <h3>Receta</h3>
                            <p>{receta.steps}</p>
                        </div>

                        {/* SECCIÓN DE RESEÑAS */}
                        <div className="ResenasReceta">
                            <h3>Reseñas</h3>
                            {!usuarioYaReseno && !userIsOwner && !mostrarFormularioResena && (
                                <div className="contenedorBoton">
                                    <button 
                                        type="button" 
                                        className="boton-resena-salmon" 
                                        onClick={() => setMostrarFormularioResena(true)}
                                    >
                                        Escribir una reseña
                                    </button>
                                </div>
                            )}

                            {resenasEmpty && !mostrarFormularioResena && (
                                <p className="sin-resenas">Todavía no hay reseñas para esta receta. ¡Sé el primero en compartir la tuya!</p>
                            )}

                            {mostrarFormularioResena && (
                                <div className="formularioResena">
                                    <Formik
                                        initialValues={{ userId: '', recipeId: '', rating: 5, text: '' }}
                                        validationSchema={ReviewSchema}
                                        onSubmit={async (values) => {
                                            try {
                                                const payload = { ...values, userId: user._id, recipeId: id as string };
                                                await axios.post('http://localhost:3000/reviews', payload);
                                                const resp = await axios.get(`http://localhost:3000/reviews?recipeId=${id}`);
                                                setResenas(resp.data);
                                                setMostrarFormularioResena(false);
                                            } catch (error) { console.error(error); }
                                        }}
                                    >
                                        {({values, handleChange, touched, errors}) => (
                                            <Form className="form-card">
                                                <div className="form-group">
                                                    <label className="form-label">Valoración</label>
                                                    <select name="rating" className="form-input" value={values.rating} onChange={handleChange}>
                                                        <option value={5}>5 estrellas</option>
                                                        <option value={4}>4 estrellas</option>
                                                        <option value={3}>3 estrellas</option>
                                                        <option value={2}>2 estrellas</option>
                                                        <option value={1}>1 estrella</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Tu comentario</label>
                                                    <textarea 
                                                        name="text" 
                                                        className="form-input form-textarea" 
                                                        value={values.text} 
                                                        onChange={handleChange} 
                                                        placeholder="¿Qué te pareció la receta?" 
                                                    />
                                                    {touched.text && errors.text && <p className="error-text">{errors.text}</p>}
                                                </div>
                                                <div className="form-actions">
                                                    <button type="submit" className="boton-resena-salmon">Publicar reseña</button>
                                                    <button type="button" className="boton-cancelar" onClick={() => setMostrarFormularioResena(false)}>Cancelar</button>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            )}

                            <div className="resenas-lista">
                                {resenas.map((resena) => (
                                    <div className="resena-card" key={resena._id}>
                                        {resenaEditando === resena._id ? (
                                            
                                            <Formik
                                                initialValues={{ rating: resena.rating, text: resena.text || '' }}
                                                validationSchema={ReviewSchema}
                                                onSubmit={async (values) => {
                                                    try {
                                                        await axios.patch(`http://localhost:3000/reviews/${resena._id}`, values);
                                                        const resp = await axios.get(`http://localhost:3000/reviews?recipeId=${id}`);
                                                        setResenas(resp.data);
                                                        setResenaEditando(null);
                                                    } catch (e) { console.error(e); }
                                                }}
                                            >
                                                {({ values, handleChange }) => (
                                                    <Form className="form-card-edit">
                                                        <div className="form-group">
                                                            <select name="rating" value={values.rating} onChange={handleChange} className="form-input">
                                                                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} estrellas</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="form-group">
                                                            <textarea name="text" value={values.text} onChange={handleChange} className="form-input form-textarea" />
                                                        </div>
                                                        <div className="form-actions-edit">
                                                            <button type="submit" className="boton-resena-salmon btn-small">Guardar</button>
                                                            <button type="button" onClick={() => setResenaEditando(null)} className="boton-cancelar btn-small">Cancelar</button>
                                                        </div>
                                                    </Form>
                                                )}
                                            </Formik>
                                        ) : (
                                            <>
                                                <div className="UsuarioResena">
                                                    <img className="resena-avatar" src={`http://localhost:3000/${resena.userId.profilePic}`} alt="Avatar" />
                                                    <div className="resena-usuario-info">
                                                        <span className="resena-username">{resena.userId.username}</span>
                                                        <div className="rating-pill">
                                                            <Star size={14} className="estrella-salmon-icon" fill="currentColor" />
                                                            <p>{resena.rating}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="informacionResena">
                                                    <p className="textoResena">{resena.text}</p>
                                                </div>
                                                
                                                {user._id === resena.userId._id && (
                                                    <div className="resena-acciones">
                                                        <button className="boton-accion editar" onClick={() => setResenaEditando(resena._id)}>Editar</button>
                                                        <button className="boton-accion borrar" onClick={async () => {
                                                            if(window.confirm("¿Borrar reseña?")) {
                                                                try {
                                                                    await axios.delete(`http://localhost:3000/reviews/${resena._id}`);
                                                                    const resp = await axios.get(`http://localhost:3000/reviews?recipeId=${id}`);
                                                                    setResenas(resp.data);
                                                                } catch (e) { console.error(e); }
                                                            }
                                                        }}>Borrar</button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <aside className="ContenedorDerecha profile-sidebar">
                <img src="/logo.png" alt="Recipe Vault Logo" className="LogoImagen"/>
                <SimplifiedProfile user={me} postCount={postCount}/>
                <div className="sidebar-navigation">
                    <Navigation user={me} active={0}/>
                </div>
            </aside>
        </>
    );
}

export default Recipe;