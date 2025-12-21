import React, { useState, useEffect } from 'react'; 
// import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './create_recipe.css';
import { Formik, Form, FieldArray } from "formik";
import * as yup from 'yup';
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "./navigation";
import type { UserInterface } from './interfaces/UserInterface';
import SimplifiedProfile from './simplifiedProfile';
import { Helmet } from 'react-helmet';
import type { Recipe } from './interfaces/RecipeInterface';
import { X } from 'lucide-react';
import { isIngredientError, RecipeSchema } from './create_recipe';

interface RecipeFormState {
    name: string;
    steps: string;
    ingredients: { ingredient: string, quantity: string }[];
    tools: string[];
    category: string[]; // Pasta, postre, carne, etc. 
    images?: string[]; // URLs de imágenes o vídeos 
    videos?: string[]; // URLs de vídeos 
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
        axios.get<UserInterface>('http://localhost:3000/users/me', {
            withCredentials: true
        })
        .then(response => setMe(response.data))
        .catch(error => console.error(error));
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

    if (!receta) return <div></div>;

    if (!me) return <div className="loading">Cargando perfil...</div>

    if (!user) return <></>;

    const userIsOwner = (user._id === receta.userId._id) ? true : false;

    if (!userIsOwner) navigate('/home');

    const recetaLimpia = {
        name: receta.name,
        steps: receta.steps,
        ingredients: [...receta.ingredients],
        tools: [...receta.tools],
        category: [...receta.category],
        images: receta.images ? [...receta.images] : [],
        videos: receta.videos ? [...receta.videos] : []
    };

    return (
        <>
            <Helmet>
                <title>Editar / RecipeVault</title>
            </Helmet>
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
                                            <FieldArray name="category">
                                                {({ push, remove }) => (
                                                    <>
                                                        <div className="listaCategorias">
                                                            {values.category.map((_, index) => (
                                                                <>
                                                                    <div key={`categoria${index}`} className="filaCategorias">
                                            
                                                                    <select
                                                                        name={`category[${index}]`}
                                                                        value={values.category[index]}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                    >
                                                                        <option value="">Seleccione categoría</option>
                                                                        {categories.map((cat) => (
                                                                            <option key={cat} value={cat}>
                                                                                {cat}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                            
                                                                    {/* Botón eliminar */}
                                                                    {values.category.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            className="botonEliminar"
                                                                            onClick={() => remove(index)}
                                                                        >
                                                                            <X size={24}/>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                {Array.isArray(touched.category) &&
                                                                Array.isArray(errors.category) &&
                                                                touched.category[index] &&
                                                                errors.category[index] && (
                                                                    <p className="help is-danger">
                                                                        {errors.category[index]}
                                                                    </p>
                                                                )}
                                                            </>
                                                        ))}
                                                    </div>
                                            
                                                    {/* ÚNICO BOTÓN + */}
                                                    <button
                                                        type="button"
                                                        className="botonMasGeneral"
                                                        onClick={() => push('')}
                                                    >
                                                        + Añadir categoría
                                                    </button>
                                            
                                                    {/* Errores */}
                                                    {typeof errors.category === "string" && (
                                                        <p className="help is-danger">{errors.category}</p>
                                                    )}
                                                </>
                                            )}
                                            </FieldArray>
                                        </div>
                                        <div className="IngredientesReceta">
                                            <h3>Ingredientes</h3>
                                            <FieldArray name="ingredients">
                                                {({ push, remove }) => (
                                                    <>
                                                        <div className="listaIngredientes">
                                                            {values.ingredients.map((_, index) => (
                                                                <React.Fragment key={index}>
                                                                    <div className="filaIngrediente">
                                            
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
                                            
                                                                        <input
                                                                            type="text"
                                                                            name={`ingredients[${index}].quantity`}
                                                                            value={values.ingredients[index].quantity}
                                                                            onChange={handleChange}
                                                                            onBlur={handleBlur}
                                                                        />
                                            
                                                                        {values.ingredients.length > 1 && (
                                                                            <button
                                                                                type="button"
                                                                                className="botonEliminar"
                                                                                onClick={() => remove(index)}
                                                                            >
                                                                                <X size={24}/>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                            
                                                                    {/* error ingredient DEBAJO DEL BLOQUE */}
                                                                    {touched.ingredients?.[index]?.ingredient &&
                                                                        isIngredientError(errors.ingredients?.[index]) &&
                                                                        errors.ingredients[index].ingredient && 
                                                                        errors.ingredients[index].ingredient !== "No puede haber ingredientes duplicados" && (
                                                                            <p className="help is-danger">
                                                                                {errors.ingredients[index].ingredient}
                                                                            </p>
                                                                    )}
                                                                                                                
                                                                    {/* error quantity */}
                                                                    {touched.ingredients?.[index]?.quantity &&
                                                                        isIngredientError(errors.ingredients?.[index]) &&
                                                                        errors.ingredients[index].quantity && (
                                                                            <p className="help is-danger">
                                                                                {errors.ingredients[index].quantity}
                                                                            </p>
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                            
                                                        {/* ÚNICO BOTÓN + */}
                                                        <button
                                                            type="button"
                                                            className="botonMasGeneral"
                                                            onClick={() => push({ ingredient: '', quantity: '' })}
                                                        >
                                                            + Añadir ingrediente
                                                        </button>
                                                                                                    
                                                        {/* ERROR GLOBAL DE LA LISTA */}
                                                        {typeof errors.ingredients === "string" && (
                                                            <p className="help is-danger">{errors.ingredients}</p>
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
                                                                <>
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
                                                                                <X size={24}/>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    {Array.isArray(touched.tools) &&
                                                                    Array.isArray(errors.tools) &&
                                                                    touched.tools[index] &&
                                                                    errors.tools[index] && (
                                                                        <p className="help is-danger">
                                                                            {errors.tools[index]}
                                                                        </p>
                                                                    )}
                                                                </>
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
                                                
                                                        {/* ERROR GLOBAL DE LA LISTA */}
                                                        {typeof errors.tools === "string" && (
                                                            <p className="help is-danger">{errors.tools}</p>
                                                        )}
                                                    </>
                                                )}
                                            </FieldArray>
                                        </div>
                                    </div>
                                    <div className="DerechaCReceta">
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
                <SimplifiedProfile user={me} postCount={postCount}/>
                <div className="sidebar-navigation">
                    <Navigation user={me} active={0} />
                </div>
            </aside>
        </>
    )
}

export default EditRecipe;