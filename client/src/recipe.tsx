import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './recipe.css';
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as yup from 'yup';
import Navigation from "./navigation";
import MediaCarousel from './MediaCarousel';

//https://cdn.pixabay.com/photo/2017/06/13/12/53/profile-2398782_640.png
//https://comedera.com/wp-content/uploads/sites/9/2023/03/pastel-de-pistache.jpeg

interface Recipe {
    name: string;
    steps: string;
    ingredients: string[];
    tools: string[];
    userId: {_id: string, username: string, profilePic:string}; 
    category: string; // Pasta, postre, carne, etc. 
    images: string[]; // URLs de imágenes o vídeos 
    videos: string[]; // URLs de vídeos 
    creacionDate: Date;
}

interface Review {
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
        axios.get(`http://localhost:3000/reviews?recipeId=${id}`)
        .then(response => {
            setResenas(response.data);
        })
        .catch(error => {
            if (error.status === 404) {
                setResenas([]);
            } else {
                console.error(error);
            }
        })
    });

    const [mostrarFormularioResena, setMostrarFormularioResena] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [resenaEditando, setResenaEditando] = useState<string | null>(null);

    const [user, setUser] = useState<{ _id: string } | null>(null);
    useEffect(() => {
        const token = localStorage.getItem("token");

        axios.get('http://localhost:3000/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setUser(response.data);
        })
        .catch(console.error);
    }, []);

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

    return (
        <>
            <div className="ContenedorGeneralReceta">
                <div className="NombreReceta">
                    <h2>{receta!.name}</h2>
                </div>
                <div className="ContenedorReceta">
                    <div className="InformacionReceta">
                        <div className="IzquierdaReceta">
                            <div className="UsuarioReceta">
                                <img src={receta!.userId.profilePic}></img>
                                <p>{receta!.userId.username}</p>
                            </div>
                            {userIsOwner && (
                                <div>
                                    <button onClick={() => navigate('/recipe/' + id + '/edit')}>Editar</button>
                                    <button onClick={async () => {
                                            try {
                                                const response = axios.delete('http://localhost:3000/recipes/' + id);
                                                console.log(response);
                                            } catch (error) {
                                                console.error(error);
                                            }

                                            navigate('/home')}
                                        }
                                    >
                                        Borrar
                                    </button>
                                </div>
                            )}
                            <div className="ImagenesReceta">
                                <MediaCarousel media={[...receta.images, ...receta.videos]} />
                            </div>
                            <div>
                                {!resenasEmpty && (
                                    <p>V: {resenas.reduce((accumulator, currentValue) => accumulator + currentValue.rating, 0) / resenas.length}</p>
                                )}
                            </div>
                            <div className="CategoriasReceta">
                                <h3>Categorías</h3>
                                <div>{receta!.category}</div>
                            </div>
                            <div className="IngredientesReceta">
                                <h3>Ingredientes</h3>
                                <ul>
                                    {receta.ingredients.map((ingrediente: string) => (
                                    <li>{ingrediente}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="UtensiliosReceta">
                                <h3>Utensilios</h3>
                                <ul>
                                    {receta.tools.map((utensilio: string) => (
                                    <li>{utensilio}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="DerechaReceta">
                            <div className="TextoReceta">
                                <h3>Receta</h3>
                                <p>{receta.steps}</p>
                            </div>
                        </div>
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
                                            <img src={resena.userId.profilePic} />
                                            <p>{resena.userId.username}</p>
                                        </div>
                                        <div className="informacionResena">
                                            <p>V: {resena.rating}</p>
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
            <div className="ContenedorDerecha">
                <div className="ContenedorPerfilSimp">
                    <img className="LogoImagen" src="/logo.png" alt="Logo de RecipeVault"></img>
                    <img className="PerfilImagen" src="https://cdn.pixabay.com/photo/2017/06/13/12/53/profile-2398782_640.png"></img>
                    <p>Usuario</p>
                    <div className="InformacionUsuario">
                        <div>
                            <p>300</p>
                            <p>Seguidos</p>
                        </div>
                        <div>
                            <p>300</p>
                            <p>Seguidores</p>
                        </div>
                        <div>
                            <p>300</p>
                            <p>Posts</p>
                        </div>
                    </div>
                </div>
                <Navigation/>
            </div>
        </>
    )
}

export default Recipe;