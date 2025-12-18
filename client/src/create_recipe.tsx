// import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './create_recipe.css';
import { Formik, Form, FieldArray } from "formik";
import * as yup from 'yup';
import { useNavigate } from "react-router-dom";
import Navigation from "./navigation";
import { useEffect, useState } from 'react';
import React from 'react';
import type { UserInterface } from './interfaces/UserInterface';
import SimplifiedProfile from './simplifiedProfile';
import { Minus, X } from 'lucide-react';

//https://cdn.pixabay.com/photo/2017/06/13/12/53/profile-2398782_640.png
//https://comedera.com/wp-content/uploads/sites/9/2023/03/pastel-de-pistache.jpeg

interface RecipeFormState {
    name: string;
    steps: string;
    ingredients: { ingredient: string, quantity: string }[];
    tools: string[];
    userId: string; 
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

const RecipeSchema = yup.object().shape({
    name: yup.string().required('Se necesita poner un nombre a la receta').min(6, 'El nombre de la receta debe de tener al menos 6 caracteres'),
    steps: yup.string().required('La receta debe tener unos pasos a seguir').min(50, 'Los pasos de la receta deben de tener al menos 50 caracteres'),
    ingredients: yup.array().of(yup.object().shape({
        ingredient: yup.string().required("Seleccione un ingrediente"),
        quantity: yup.string().required("Introduzca una cantidad")
    })).min(1, 'La receta debe de tener al menos un ingrediente')
    .test(
        "unique-ingredients",
        "No puede haber ingredientes duplicados",
        (ingredients) => {
            if (!ingredients) return true;

            // Map seguro: solo tomamos strings válidos
            const ingredientNames = ingredients
                .map(i => i.ingredient || "") 
                .map(name => name.trim().toLowerCase());

            return new Set(ingredientNames).size === ingredientNames.length;
        }
    ),
    tools: yup.array().of(yup.string().required('Hay utensilios sin asignar')).min(1, 'La receta tiene que utilizar al menos un utensilio')
    .test(
        "unique-tools",
        "No puede haber utensilios duplicados",
        (tools) => {
            if (!tools) return true;

            // ignorar elementos vacíos: solo revisamos duplicados si el string no está vacío
            const filteredTools = tools.filter(t => t && t.trim() !== "").map(t => t.trim().toLowerCase());

            return new Set(filteredTools).size === filteredTools.length;
        }
    ),
    category: yup.array().of(yup.string().required('Hay categorias no asignadas')),
    userId: yup.string(),
    images: yup.array().of(yup.string()).max(5, 'No se pueden adjuntar más de 5 imágenes'), //.min(1, 'Se debe adjuntar al menos una imagen').max(5, 'No se pueden adjuntar más de 5 imágenes'),
    videos: yup.array().of(yup.string()).max(3, 'No se pueden adjuntar más de tres vídeos')
});

function isIngredientError(
  error: unknown
): error is { ingredient?: string; quantity?: string } {
  return typeof error === "object" && error !== null;
}

function CreateRecipe() {

    const navigate = useNavigate();

    const [imageFiles, setImageFiles] = useState<FileList | null>(null);
    const [videoFiles, setVideoFiles] = useState<FileList | null>(null);
    const [creationError, setCreationError] = useState('');

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
    }, []);

    useEffect(() => {
        if (me) {
            const token = localStorage.getItem("token");
        
            axios.get(`http://localhost:3000/recipes?userId=${me._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => setPostCount(response.data.length))
            .catch(error => console.error(error));
        }
    }, [me])
        
    if (!me) return <div className="loading">Cargando perfil...</div>;

    return (
        <>
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Crear receta / RecipeVault</title>
            </head>
            <div className="ContenedorGeneralReceta">
                <Formik
                    initialValues = {{
                        name: '',
                        steps: '',
                        ingredients: [{ ingredient: '', quantity: '' }],
                        tools: [''],
                        category: [''],
                        userId: '',
                        images: [],
                        videos: []
                    }}
                    validationSchema={RecipeSchema}
                    onSubmit={async (values: RecipeFormState) => {
                        try {
                            const token = localStorage.getItem("token");

                            const user = await axios.get('http://localhost:3000/users/me', {
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            const formData = new FormData();

                            // ---- Campos de texto ----
                            formData.append("name", values.name);
                            formData.append("steps", values.steps);
                            values.category.forEach(t => formData.append("category", t));
                            formData.append("userId", user.data._id);

                            formData.append("ingredients", JSON.stringify(values.ingredients));
                            values.tools.forEach(t => formData.append("tools", t));

                            // ---- Archivos imagen ----
                            if (imageFiles) {
                                Array.from(imageFiles).forEach(file => {
                                    formData.append("images", file);
                                });
                            }

                            // ---- Archivos video ----
                            if (videoFiles) {
                                Array.from(videoFiles).forEach(file => {
                                    formData.append("videos", file);
                                });
                            }

                            console.log(imageFiles);

                            const response = await axios.post(
                                "http://localhost:3000/recipes/files",
                                formData,
                                {
                                    headers: {
                                        "Content-Type": "multipart/form-data",
                                        Authorization: `Bearer ${token}`
                                    }
                                }
                            );

                            console.log(response);

                            if (response.status === 201) navigate('/recipe/' + response.data._id);

                        } catch (error) {
                            if (axios.isAxiosError(error) && error.response) {
                                setCreationError(error.response.data.message);
                            } else {
                                setCreationError('Error inesperado al crear la receta');
                            }
                        }
                    }}
                >
                    {({values, setFieldValue, handleChange, handleBlur, errors, touched}) => (
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
                                        <div className="ImagenesPublicacion">
                                            <h3>Imágenes</h3>
                                            <input 
                                                type="file" 
                                                name="images" 
                                                accept="image/*" 
                                                multiple
                                                onChange={(e) => {
                                                    if (!e.target.files) return;

                                                    setImageFiles(e.target.files);
                                                    setFieldValue("images", Array.from(e.target.files));
                                                }}
                                            />
                                            {touched.images && errors.images && (
                                                <p className="help is-danger">{errors.images}</p>
                                            )}
                                            <h3>Vídeos</h3>
                                            <input 
                                                type="file" 
                                                name="videos" 
                                                accept="video/*"
                                                multiple
                                                onChange={(e) => {
                                                    if (!e.target.files) return;

                                                    setVideoFiles(e.target.files);
                                                    setFieldValue("videos", Array.from(e.target.files))
                                                }}
                                            />
                                            {touched.videos && errors.videos && (
                                                <p className="help is-danger">{errors.videos}</p>
                                            )}
                                        </div>
                                        <div className="CategoriaPublicacion">
                                            <h3>Categorías</h3>
                                            <FieldArray name="category">
                                                {({ push, remove }) => (
                                                    <>
                                                        <div className="listaCategorias">
                                                            {values.category.map((_, index) => (
                                                                <div key={`categoria${index}`} className="filaCategorias">

                                                                    <select
                                                                        name={`category[${index}]`}
                                                                        value={values.category[index]}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                    >
                                                                        <option value="">Seleccione utensilio</option>
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

                                                            {/* ERROR GLOBAL DE LA LISTA */}
                                                            {typeof errors.ingredients === "string" && (
                                                                <p className="help is-danger">{errors.ingredients}</p>
                                                            )}
                                                        </div>

                                                        {/* ÚNICO BOTÓN + */}
                                                        <button
                                                            type="button"
                                                            className="botonMasGeneral"
                                                            onClick={() => push({ ingredient: '', quantity: '' })}
                                                        >
                                                            + Añadir ingrediente
                                                        </button>

                                                        {/* Errores */}
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
                                            {creationError && <p className="error-message">{creationError}</p>}
                                        </div>
                                        
                                    </div>
                                </div>
                            </ div>
                        </Form>
                    )}
                </Formik>
            </div>
            
            <div className="ContenedorDerecha">
                <aside className="panel-derecho profile-sidebar">
                <img src="/logo.png" alt="Recipe Vault Logo" className="recipe-vault-logo"/>
                <SimplifiedProfile user={me} postCount={postCount}/>
                <div className="sidebar-navigation">
                    <Navigation user={me} active={4}/>
                </div>
            </aside>
            </div>
        </>
    )
}

export default CreateRecipe;