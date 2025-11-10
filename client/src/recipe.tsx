import { Home, Search, User, LogOut } from "lucide-react";
import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './recipe.css';
import { useParams } from "react-router-dom";

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
    videos?: string[]; // URLs de vídeos 
    creacionDate: Date;
}

function Recipe() {
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

    if (!receta) return <div></div>;

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
                            <div className="ImagenesReceta">
                                <img src={receta!.images[0]} className="d-block w-100" alt="..."/>
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
                        </div>
                        <div className="DerechaReceta">
                            <div className="TextoReceta">
                                <h3>Receta</h3>
                                <p>{receta!.steps}</p>
                            </div>
                        </div>
                    </div>
                    <div className="ReseñasReceta">
                        <h3>Reseñas</h3>
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
                <div className="ContenedorNavegacion">
                    <button className="BotonNavegacion">
                        <Home size={24}></Home>
                        <span>Inicio</span>
                    </button>
                    <button className="BotonNavegacion">
                        <Search size={24}></Search>
                        <span>Buscar</span>
                    </button>
                    <button className="BotonNavegacion">
                        <User size={24}></User>
                        <span>Perfil</span>
                    </button>
                    <button className="BotonNavegacion">
                        <LogOut size={24}></LogOut>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Recipe;