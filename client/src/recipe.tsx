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

interface ReviewFormState {
    userId: string;
    recipeId: string;
    rating: number;
    text?: string;
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
    useEffect(() => {
        axios.get('http://localhost:3000/recipes/' + id)
        .then(response => {
            setReceta(response.data);
        })
        .catch(error => {
            console.error(error);
        });
    }, [id]);

    const [resenas, setResenas] = useState<Review[] | null>(null);
    useEffect(() => {
        if (!id) return;

        const controller = new AbortController();

        const fetchReviews = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/reviews?recipeId=${id}`, { signal: controller.signal });
                setResenas(response.data);
            } catch (error: any) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    setResenas([]);
                } else if (!axios.isCancel(error)) {
                    console.error(error);
                }
            }
    };

    fetchReviews();

    return () => {
        controller.abort();
    };
    });

    const [mostrarFormularioResena, setMostrarFormularioResena] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [resenaEditando, setResenaEditando] = useState<string | null>(null);

    const [user, setUser] = useState<{ _id: string } | null>(null);
    useEffect(() => {
        axios.get('http://localhost:3000/users/me', {
            withCredentials: true
        })
        .then(response => {
            setUser(response.data);
        })
        .catch(console.error);
    }, []);

    const [me, setMe] = useState<UserInterface | null>(null);
    const [postCount, setPostCount] = useState(0); 

    useEffect(() => {
        axios.get<UserInterface>('http://localhost:3000/users/me', {
            withCredentials: true
        })
        .then(response => setMe(response.data))
        .catch(console.error);
    }, []);

    useEffect(() => {
        if (me) {
            axios.get(`http://localhost:3000/recipes?userId=${me._id}`, {
                withCredentials: true
            })
            .then(response => setPostCount(response.data.length))
            .catch(error => console.error(error));
        }
    }, [me])
    
    if (!me) return <div className="loading">Cargando perfil...</div>;
    if (!receta) return <div></div>;
    if (!resenas) return <div></div>;
    if (!user) return <div></div>;

    const usuarioYaReseno = resenas.some(
        r => r.userId._id === user._id
    );

    const userIsOwner = (user._id === receta.userId._id) ? true : false;
    const resenasEmpty = (resenas.length === 0) ? true : false;

    const isResenaOwner = (resena: Review): boolean => {
        return user._id === resena.userId._id
    }

    const imagesEmpty = (receta.images.length === 0);

    return (
        <>
            <Helmet>
                <title>{receta.name} de {receta.userId.username} / RecipeVault</title>
            </Helmet>
            <div className="ContenedorGeneralReceta">
                <div className="NombreReceta">
                    <h2>{receta!.name}</h2>
                </div>
                <div className="ContenedorReceta">
                    <div className="InformacionReceta">
                        <div className="IzquierdaReceta">
                            <div className="UsuarioReceta">
                                <a href={`/user/${receta.userId.username}`} className="profile-link" aria-label={`Ir al perfil de ${receta.userId.username}`}>
                                    <img className="foto-perfil-grande" src={`http://localhost:3000/${receta!.userId.profilePic}`}></img>
                                </a>
                                <a href={`/user/${receta.userId.username}`} className="profile-link" aria-label={`Ir al perfil de ${receta.userId.username}`}>
                                    <span className="post-user-name">{receta.userId.username}</span>
                                </a>
                            </div>
                            {userIsOwner && (
                                <div className="boton-control-receta">
                                    <button onClick={() => navigate('/recipe/' + id + '/edit')}>Editar</button>
                                    <button onClick={async () => {
                                            try {
                                                const response = axios.delete('http://localhost:3000/recipes/' + id);
                                                console.log(response);

                                                navigate('/home');
                                            } catch (error) {
                                                console.error(error);
                                            }
                                        }}
                                    >
                                        Borrar
                                    </button>
                                </div>
                            )}
                            <div className="valoracionReceta">
                                {!resenasEmpty && (
                                    <><Star /> <p>{resenas.reduce((accumulator, currentValue) => accumulator + currentValue.rating, 0) / resenas.length}</p></>
                                )}
                                {resenasEmpty && (
                                    <><Star /> <p>-</p></>
                                )}
                                <SaveButton user={me} setUser={setMe} id={receta._id}></SaveButton>
                            </div>
                            <div className="CategoriasReceta">
                                <h3>Categorías</h3>
                                <div className="categorias-interior">
                                    {receta.category.map((cat, index) => (<div key={`categoria${index}`}>{cat}</div>))}
                                </div>
                            </div>
                            <div className="IngredientesReceta">
                                <h3>Ingredientes</h3>
                                <ul>
                                    {receta.ingredients.map((ingrediente: {ingredient: string, quantity: string}, index) => (
                                    <li key={`ingrediente${index}`}>{`${ingrediente.ingredient}: ${ingrediente.quantity}`}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="UtensiliosReceta">
                                <h3>Utensilios</h3>
                                <ul>
                                    {receta.tools.map((utensilio: string, index) => (
                                    <li key={`utensilio${index}`}>{utensilio}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="DerechaReceta">
                            <div className="ImagenesReceta">
                                {!imagesEmpty && (
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
                        <div className="ResenasReceta">
                            <h3>Reseñas</h3>
                            {!usuarioYaReseno && !userIsOwner && !mostrarFormularioResena && (
                                <div className="contenedorBoton">
                                    <button type="button"
                                        className="botonResena"
                                        onClick={() => setMostrarFormularioResena(true)}>
                                        Hacer reseña
                                    </button>
                                </div>
                            )}
                            {resenasEmpty && (
                                <p>Todavía no hay reseñas para esta receta.</p>
                            )}
                            <div className="formularioResena">
                                {mostrarFormularioResena && (
                                <Formik
                                    initialValues={{
                                        userId: '',
                                        recipeId: '',
                                        rating: 1,
                                        text: ''
                                    }}
                                    validationSchema={ReviewSchema}
                                    onSubmit={async (values: ReviewFormState) => {
                                        try {
                                            values.userId = user._id;
                                            values.recipeId = id as unknown as string;
                                            console.log(values);

                                            const response = axios.post('http://localhost:3000/reviews', values);
                                            console.log(response);

                                            const resp = await axios.get(`http://localhost:3000/reviews?recipeId=${id}`);
                                            setResenas(resp.data);
                                        } catch (error) {
                                            setReviewError('Error inesperado');
                                            console.error(error);
                                        }

                                        setMostrarFormularioResena(false);
                                    }}
                                >
                                    {({values, handleChange, handleBlur, errors, touched}) => (
                                        <Form>
                                            <label htmlFor="rating">Valoración:</label><br/>
                                            <select id="rating" value={values.rating} onChange={handleChange} onBlur={handleBlur}>
                                                <option value={1}>1</option>
                                                <option value={2}>2</option>
                                                <option value={3}>3</option>
                                                <option value={4}>4</option>
                                                <option value={5}>5</option>
                                            </select>
                                            <br/>
                                            {touched.rating && errors.rating && (
                                                <p className="help is-danger">{errors.rating}</p>
                                            )}

                                            <label htmlFor="text">Comentario:</label><br/>
                                            <textarea
                                                id="text"
                                                value={values.text}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            <br/>
                                            {touched.text && errors.text && (
                                                <p className="help is-danger">{errors.text}</p>
                                            )}

                                            <button type="submit">Publicar reseña</button>
                                            {reviewError && <p className="error-message">{reviewError}</p>}
                                            <button type="button" onClick={() => setMostrarFormularioResena(false)}>Cancelar</button>
                                        </Form>
                                    )}
                                </Formik>
                            )}
                            </div>
                            {resenas.map((resena) => (
                                <div className="contenedorResena" key={resena._id}>
                                    {resenaEditando === resena._id ? (
                                        
                                        <Formik
                                            initialValues={{
                                                rating: resena.rating,
                                                text: resena.text || ''
                                            }}
                                            validationSchema={ReviewSchema}
                                            onSubmit={async (values) => {
                                                try {
                                                    await axios.patch(`http://localhost:3000/reviews/${resena._id}`, values);

                                                    const resp = await axios.get(`http://localhost:3000/reviews?recipeId=${id}`);
                                                    setResenas(resp.data);

                                                    setResenaEditando(null);
                                                } catch (error) {
                                                    console.error(error);
                                                }
                                            }}
                                        >
                                            {({ values, handleChange, handleBlur, errors, touched }) => (
                                                <Form className="formularioEditResena">

                                                    <label htmlFor="rating">Valoración:</label>
                                                    <select
                                                        id="rating"
                                                        name="rating"
                                                        value={values.rating}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    >
                                                        <option value={1}>1</option>
                                                        <option value={2}>2</option>
                                                        <option value={3}>3</option>
                                                        <option value={4}>4</option>
                                                        <option value={5}>5</option>
                                                    </select>

                                                    {touched.rating && errors.rating && <p>{errors.rating}</p>}

                                                    <label htmlFor="text">Comentario:</label>
                                                    <textarea
                                                        id="text"
                                                        name="text"
                                                        value={values.text}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />

                                                    {touched.text && errors.text && <p>{errors.text}</p>}

                                                    <button type="submit">Guardar cambios</button>
                                                    <button type="button" onClick={() => setResenaEditando(null)}>
                                                        Cancelar
                                                    </button>

                                                </Form>
                                            )}
                                        </Formik>

                                    ) : (
                                        <>
                                            <div className="UsuarioResena">
                                                <img className="foto-perfil-grande" src={`http://localhost:3000/${resena.userId.profilePic}` } />
                                                <a href={`/user/${resena.userId._id}`} className="profile-link" aria-label={`Ir al perfil de ${receta.userId.username}`}>
                                                    <span>{resena.userId.username}</span>
                                                </a>
                                            </div>
                                            <div className="informacionResena">
                                                <div className="valoracionResena"><Star size={20}/><p>{resena.rating}</p></div>
                                                <p className="textoResena">{resena.text}</p>
                                            </div>

                                            {isResenaOwner(resena) && (
                                                <div>
                                                    <button onClick={() => setResenaEditando(resena._id)}>
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await axios.delete(
                                                                    'http://localhost:3000/reviews/' + resena._id
                                                                );
                                                                const resp = await axios.get(
                                                                    `http://localhost:3000/reviews?recipeId=${id}`
                                                                );
                                                                setResenas(resp.data);
                                                            } catch (error) {
                                                                console.error(error);
                                                            }
                                                        }}
                                                    >
                                                        Borrar
                                                    </button>
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
            <aside className="panel-derecho profile-sidebar">
                <img src="/logo.png" alt="Recipe Vault Logo" className="recipe-vault-logo"/>
                <SimplifiedProfile user={me} postCount={postCount}/>
                <div className="sidebar-navigation">
                    <Navigation user={me} active={0}/>
                </div>
            </aside>
        </>
    )
}

export default Recipe;