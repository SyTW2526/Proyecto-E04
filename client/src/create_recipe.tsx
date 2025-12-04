// import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './create_recipe.css';
import { Formik, Form, FieldArray } from "formik";
import * as yup from 'yup';
import { useNavigate } from "react-router-dom";
import Navigation from "./navigation";
import { useState } from 'react';

//https://cdn.pixabay.com/photo/2017/06/13/12/53/profile-2398782_640.png
//https://comedera.com/wp-content/uploads/sites/9/2023/03/pastel-de-pistache.jpeg

interface RecipeFormState {
    name: string;
    steps: string;
    ingredients: string[];
    tools: string[];
    userId: string; 
    category: string; // Pasta, postre, carne, etc. 
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
    name: yup.string().required('Se necesita poner un nombre a la receta').min(6),
    steps: yup.string().required('La receta debe tener unos pasos a seguir').min(50),
    ingredients: yup.array().of(yup.string().required()).min(1, 'La receta tiene que tener al menos un ingrediente'),
    tools: yup.array().of(yup.string().required()).min(1, 'La receta tiene que utilizar al menos un utensilio'),
    category: yup.string().required('La receta debe pertenecer a una categoría'),
    userId: yup.string(),
    images: yup.array().of(yup.string()),
    videos: yup.array().of(yup.string())
});

function CreateRecipe() {

    const navigate = useNavigate();

    const [imageFiles, setImageFiles] = useState<FileList | null>(null);
    const [videoFiles, setVideoFiles] = useState<FileList | null>(null);

    return (
        <>
            <div className="ContenedorGeneralReceta">
                <Formik
                    initialValues = {{
                        name: '',
                        steps: '',
                        ingredients: [''],
                        tools: [''],
                        category: '',
                        userId: '',
                        images: [''],
                        videos: ['']
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
                            formData.append("category", values.category);
                            formData.append("userId", user.data._id);

                            values.ingredients.forEach(i => formData.append("ingredients", i));
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

                            if (response.status === 201) navigate('/home');

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
                                        <div className="ImagenesReceta">
                                            <label htmlFor="images">Imágenes:</label>
                                            <input 
                                                type="file" 
                                                name="images" 
                                                accept="image/*" 
                                                multiple
                                                onChange={(e) => {
                                                    setImageFiles(e.target.files);
                                                }}
                                            />

                                            <label htmlFor="images">Vídeos:</label>
                                            <input 
                                                type="file" 
                                                name="videos" 
                                                accept="video/*"
                                                multiple
                                                onChange={(e) => {
                                                    setVideoFiles(e.target.files);
                                                }}
                                            />
                                        </div>
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
                                                                        name={`ingredients[${index}]`}
                                                                        value={values.ingredients[index]}
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

export default CreateRecipe;