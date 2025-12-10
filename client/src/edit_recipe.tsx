import React, { useState, useEffect } from 'react'; 
// import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './create_recipe.css';
import { Formik, Form, FieldArray } from "formik";
import * as yup from 'yup';
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "./navigation";

//https://cdn.pixabay.com/photo/2017/06/13/12/53/profile-2398782_640.png
//https://comedera.com/wp-content/uploads/sites/9/2023/03/pastel-de-pistache.jpeg

interface Recipe {
    name: string;
    steps: string;
    ingredients: { ingredient: string, quantity: string }[];
    tools: string[];
    userId: {_id: string, username: string, profilePic:string}; 
    category: string; // Pasta, postre, carne, etc. 
    images: string[]; // URLs de imágenes o vídeos 
    videos?: string[]; // URLs de vídeos 
    creacionDate: Date;
}

interface RecipeFormState {
    name: string;
    steps: string;
    ingredients: { ingredient: string, quantity: string }[];
    tools: string[];
    category: string; // Pasta, postre, carne, etc. 
    images?: string[]; // URLs de imágenes o vídeos 
    videos?: string[]; // URLs de vídeos 
}

export interface UserInterface {
  _id: string;
  username: string;
  email: string;
  password?: string;
  profilePic: string; 
  bio: string; 
  followers: string[]; 
  following: string[]; 
  recentSearches: string[];
  createdAt: Date;
}

const categories = [
    'entrante',
    'plato principal',
    'guarnición',
    'postre',
    'desayuno',
    'merienda',
    'bebida',
    'salsa o aderezo',
    'panadería',
    'pasta',
    'arroz',
    'carne', 
    'pescado',
    'marisco',
    'pollo',
    'vegetariano', 
    'vegano',
    'sin gluten',
    'bajo en carbohidratos',
    'alto en proteínas',
    'otro'
];

const ingredients = [
    'harina', 'azucar', 'sal', 'huevo', 'leche', 'mantequilla', 'aceite', 'levadura', 'chocolate', 'vainilla', 'frutas', 'verduras', 'carne', 'pescado', 'especias'
]

const tools = [
    'cuchillo', 'tabla de cortar', 'sartén', 'olla', 'batidora', 'horno', 'microondas', 'espátula', 'cucharón', 'colador', 'caldero', 'rodillo', 'rallador'
]

const RecipeSchema = yup.object().shape({
    name: yup.string().required('Se necesita poner un nombre a la receta').min(6),
    steps: yup.string().required('La receta debe tener unos pasos a seguir').min(50),
    ingredients: yup.array().of(yup.mixed().required('Hay ingredientes sin asignar')).min(1, 'La receta tiene que tener al menos un ingrediente'),
    tools: yup.array().of(yup.string().required('Hay utensilios sin asignar')).min(1, 'La receta tiene que utilizar al menos un utensilio'),
    category: yup.string().required('La receta debe pertenecer a una categoría'),
    images: yup.array().of(yup.string()),
    videos: yup.array().of(yup.string())
});

function EditRecipe() {

    const navigate = useNavigate();

    const { id } = useParams();

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

    const [me, setMe] = useState<UserInterface | null>(null);
            const [postCount, setPostCount] = useState(0); 
        
            useEffect(() => {
                const token = localStorage.getItem("token");
                if (!token) return;
        
                axios.get<UserInterface>('http://localhost:3000/users/me', {
                headers: { Authorization: `Bearer ${token}` }
                })
                .then(response => setMe(response.data))
                .catch(console.error);
                
                setPostCount(480); 
                
            }, []);

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

        if (!me) return <div className="loading">Cargando perfil...</div>;
            
              const followersCount = me.followers.length;
              const followingCount = me.following.length;
              const usernameDisplay = me.username; 
              const handleDisplay = `@${me.username.toLowerCase()}`; 

    if (!user) return <></>;

    const userIsOwner = (user._id === receta.userId._id) ? true : false;

    if (!userIsOwner) navigate('/home');

    const recetaLimpia = {
        name: receta.name,
        steps: receta.steps,
        ingredients: [...receta.ingredients],
        tools: [...receta.tools],
        category: receta.category,
        images: receta.images ? [...receta.images] : [],
        videos: receta.videos ? [...receta.videos] : []
    };

    

    return (
        <>
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Editar receta / RecipeVault</title>
            </head>
            <div className="ContenedorGeneralReceta">
                <Formik
                    initialValues = {recetaLimpia}
                    validationSchema={RecipeSchema}
                    onSubmit={async (values: RecipeFormState) => {
                        try {
                            console.log(values)
                            const response = await axios.patch('http://localhost:3000/recipes/' + id, values);
                            console.log(response)
                            
                            if (response.status === 200) {
                                navigate('/recipe/' + id);
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }}
                >
                    {({values, handleChange, handleBlur, errors, touched}) => (
                        <Form>
                            <div className="NombreReceta">
                                <label htmlFor="name">Nombre de la receta:</label>
                                <input type="text" className="inputNombre" name="name" id="name" onChange={handleChange} value={values.name} onBlur={handleBlur}></input>
                                {touched.name && errors.name && (
                                    <p className="help is-danger">{errors.name}</p>
                                )}
                            </div>
                            <div className="ContenedorPublicacion">
                                <div className="InformacionPublicacion">
                                    <div className="IzquierdaReceta">
                                        <div className="CategoriaPublicacion">
                                            <h3>Categorías</h3>
                                            <div>
                                                <select name="category" onChange={handleChange} value={values.category} onBlur={handleBlur}>
                                                    <option value="">Seleccione la categoría</option>
                                                    {categories.map((category) => (
                                                        <option key={category} value={category}>{category}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {touched.category && errors.category && (
                                                <p className="help is-danger">{errors.category}</p>
                                            )}
                                        </div>
                                        <div className="IngredientesReceta">
                                            <h3>Ingredientes</h3>
                                            <FieldArray name="ingredients">
                                                {({ push, remove }) => (
                                                    <>
                                                        <div className="listaIngredientes">
                                                            {values.ingredients.map((_, index) => (
                                                                <div key={index} className="filaIngrediente">

                                                                    <select
                                                                        name={`ingredients[${index}].ingredient`}
                                                                        value={values.ingredients[index].ingredient}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                    >
                                                                        <option value="">Seleccione ingrediente</option>
                                                                        {ingredients.map((ingrediente) => (
                                                                            <option key={ingrediente} value={ingrediente}>
                                                                                {ingrediente}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <input type="text" 
                                                                        name={`ingredients[${index}].quantity`} 
                                                                        value={values.ingredients[index].quantity} 
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}>
                                                                    </input>

                                                                    {/* Botón eliminar */}
                                                                    {values.ingredients.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            className="botonEliminar"
                                                                            onClick={() => remove(index)}
                                                                        >
                                                                            -
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* ÚNICO BOTÓN + */}
                                                        <button
                                                            type="button"
                                                            className="botonMasGeneral"
                                                            onClick={() => push('')}
                                                        >
                                                            + Añadir ingrediente
                                                        </button>

                                                        {/* Errores */}
                                                        {touched.ingredients && errors.ingredients && (
                                                            <p className="help is-danger">{errors.ingredients as string}</p>
                                                        )}
                                                    </>
                                                )}
                                            </FieldArray>
                                        </div>
                                        <div className="UtensiliosReceta">
                                            <h3>Utensilios</h3>
                                            <FieldArray name="tools">
                                                {({ push, remove }) => (
                                                    <>
                                                        <div className="listaUtensilios">
                                                            {values.tools.map((_, index) => (
                                                                <div key={index} className="filaUtensilio">

                                                                    <select
                                                                        name={`tools[${index}]`}
                                                                        value={values.tools[index]}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                    >
                                                                        <option value="">Seleccione utensilio</option>
                                                                        {tools.map((tool) => (
                                                                            <option key={tool} value={tool}>
                                                                                {tool}
                                                                            </option>
                                                                        ))}
                                                                    </select>

                                                                    {/* Botón eliminar */}
                                                                    {values.tools.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            className="botonEliminar"
                                                                            onClick={() => remove(index)}
                                                                        >
                                                                            -
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* ÚNICO BOTÓN + */}
                                                        <button
                                                            type="button"
                                                            className="botonMasGeneral"
                                                            onClick={() => push('')}
                                                        >
                                                            + Añadir utensilio
                                                        </button>

                                                        {/* Errores */}
                                                        {touched.tools && errors.tools && (
                                                            <p className="help is-danger">{errors.tools as string}</p>
                                                        )}
                                                    </>
                                                )}
                                            </FieldArray>
                                        </div>
                                    </div>
                                    <div className="DerechaReceta">
                                        <div className="TextoPublicacion">
                                            <h3>Pasos:</h3>
                                            <textarea className="inputPasos" name="steps" id="steps" onChange={handleChange} value={values.steps} onBlur={handleBlur} />
                                            {touched.steps && errors.steps && (
                                                <p className="help is-danger">{errors.steps}</p>
                                            )}
                                            <input type="submit" className="botonPublicar" value="Publicar"/>
                                        </div>
                                        
                                    </div>
                                </div>
                            </ div>
                        </Form>
                    )}
                </Formik>
            </div>
            
            <aside className="panel-derecho profile-sidebar">
                <img src="/logo.png" alt="Recipe Vault Logo" className="recipe-vault-logo"/>
                <div className="user-profile-info">
                
                <img src={`http://localhost:3000/${me.profilePic}` || "default_profile_pic.png"} alt={`Foto de perfil de ${usernameDisplay}`} className="foto-perfil-grande"/>
                
                <h3 className="user-name">{usernameDisplay}</h3>
                <p className="user-handle">{handleDisplay}</p>
                
                <div className="stats-row">
                    <div>
                    <span className="stat-number">{postCount}</span> 
                    <span className="stat-label">Posts</span>
                    </div>
                    <div>
                    <span className="stat-number">{followersCount > 999 ? `${(followersCount / 1000).toFixed(1)}k` : followersCount}</span>
                    <span className="stat-label">Followers</span>
                    </div>
                    <div>
                    <span className="stat-number">{followingCount}</span>
                    <span className="stat-label">Following</span>
                    </div>
                </div>

                <p className="user-description">
                    {me.bio || "Comparte tu pasión por la cocina en tu biografía."}
                </p>
                </div>

                <div className="sidebar-navigation">
                <Navigation />
                <div className="layout-link">Layout</div>
                </div>
            </aside>
        </>
    )
}

export default EditRecipe;