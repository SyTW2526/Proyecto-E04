import { Home, Search, User, LogOut } from "lucide-react";
import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './receipt.css';

function Receipt() {
    const [recetas, setRecetas] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:3000/recipes')
        .then(response => {
            setRecetas(response.data);
        })
        .catch(error => {
            console.error(error);
        });
    })

    return (
        <>
            <div className="ContenedorGeneralReceta">
                <div className="NombreReceta">
                    <h2>Pastel de pistacho</h2>
                </div>
                <div className="ContenedorReceta">
                    <div className="InformacionReceta">
                        <div className="IzquierdaReceta">
                            <div className="UsuarioReceta">
                                <img src="https://cdn.pixabay.com/photo/2017/06/13/12/53/profile-2398782_640.png"></img>
                                <p>Usuario</p>
                            </div>
                            <div className="ImagenesReceta">
                                <img src="https://comedera.com/wp-content/uploads/sites/9/2023/03/pastel-de-pistache.jpeg" className="d-block w-100" alt="..."/>
                            </div>
                            <div className="CategoriasReceta">
                                <h3>Categorías</h3>
                                <div>Postre</div>
                                <div>Dulce</div>
                            </div>
                            <div className="IngredientesReceta">
                                <h3>Ingredientes</h3>
                                <p>aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</p>
                            </div>
                        </div>
                        <div className="DerechaReceta">
                            <div className="TextoReceta">
                                <h3>Receta</h3>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce eros augue, mattis eu hendrerit ullamcorper, vulputate vel risus. Donec elementum erat eget enim tempor varius et id lorem. Aliquam luctus ornare dui id hendrerit. Etiam luctus iaculis nisi. Curabitur elementum, justo sed vestibulum dapibus, dolor enim aliquet diam, sed consequat sem turpis vel nibh. Vestibulum in leo a neque luctus molestie ut sed diam. Etiam nec volutpat elit. Sed vulputate auctor velit, ut volutpat dolor bibendum ac. Ut id metus sed nibh accumsan egestas. Duis posuere accumsan lectus, vitae sollicitudin massa feugiat vitae. Duis tincidunt, libero id congue pulvinar, lacus sapien consequat est, vitae laoreet dolor turpis vel lorem. Vestibulum eu diam ipsum. Maecenas pulvinar diam dignissim vehicula semper. Morbi auctor auctor justo, quis rutrum magna vulputate a. Cras dictum velit lacus, quis posuere augue lobortis vitae. Morbi vitae est sapien. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce eros augue, mattis eu hendrerit ullamcorper, vulputate vel risus. Donec elementum erat eget enim tempor varius et id lorem. Aliquam luctus ornare dui id hendrerit. Etiam luctus iaculis nisi. Curabitur elementum, justo sed vestibulum dapibus, dolor enim aliquet diam, sed consequat sem turpis vel nibh. Vestibulum in leo a neque luctus molestie ut sed diam. Etiam nec volutpat elit. Sed vulputate auctor velit, ut volutpat dolor bibendum ac. Ut id metus sed nibh accumsan egestas. Duis posuere accumsan lectus, vitae sollicitudin massa feugiat vitae. Duis tincidunt, libero id congue pulvinar, lacus sapien consequat est, vitae laoreet dolor turpis vel lorem. Vestibulum eu diam.</p>
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
                    <img className="LogoImagen" src="/logo.png" alt="Logo de ReceiptVault"></img>
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

export default Receipt;