import React, { useState } from 'react'; 
import axios from 'axios';
import './login.css';
import { useNavigate } from 'react-router-dom';

interface SignUpFormState  {
  username: string;
  email: string;
  password: string;
}

interface SignInFormState  {
  email: string;
  password: string;
}

function LogIn() {
    const navigate = useNavigate();

    const [signUpData, setSignUpData] = useState<SignUpFormState> ({
        username: '',
        email: '',
        password: ''    
    });

    const [signInData, setSignInData] = useState<SignInFormState> ({
        email: '',
        password: ''    
    });

    const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setSignUpData(prevData => ({...prevData, [name]: value}))
    }

    const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setSignInData(prevData => ({...prevData, [name]: value}))
    }

    const handleSignUpSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/users', signUpData);
            console.log(response);

            if (response.status === 201) {
                signInData.email = signUpData.email;
                signInData.password = signUpData.password;

                signIn(signInData);
            }
        }catch (error) {
            console.error(error);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function signIn(signInData: any) {
        const responseSignIn = await axios.post('http://localhost:3000/users/login', signInData);
        console.log(responseSignIn);

        if (responseSignIn.status === 200) {
            navigate("/home");
        }
    }

    const handleSignInSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            signIn(signInData);
        }catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <div className="ContenedorGeneral">
                <div className="ContenedorInicio">
                    <div className="Logo">
                        <img src="/logo.png" alt="Logo de RecipeVault" width="50%" height="50%"></img>
                    </div>
                    <div className="InicioRegistro">
                        <h1>Iniciar sesión</h1>
                            <form onSubmit={handleSignInSubmit}>
                                <label htmlFor="lemail">Nombre de usuario:</label><br />
                                <input type="email" className="inputTexto" name= "email" id="lemail" onChange={handleSignInChange} value={signInData.email} required maxLength={20}></input><br />
                                <label htmlFor="lpassword">Contraseña:</label><br />
                                <input type="password" className="inputTexto" name="password" id="lpassword" onChange={handleSignInChange} value={signInData.password} required maxLength={20}></input><br />
                                <input type="submit" className="submit" value="Iniciar sesión"></input>
                            </form>
                    </div>
                    <div className="lineaVertical" />
                    <div className="InicioRegistro">
                        <h1>Registrarse</h1>
                            <form onSubmit={handleSignUpSubmit}>
                                <label htmlFor="ruser">Nombre de usuario:</label><br />
                                <input type="text" className="inputTexto" name= "username" id="ruser" onChange={handleSignUpChange} value={signUpData.username} required maxLength={20}></input><br />
                                <label htmlFor="remail">Email:</label><br />
                                <input type="email" className="inputTexto" name="email" id="remail" onChange={handleSignUpChange} value={signUpData.email} required maxLength={30}></input><br />
                                <label htmlFor="rpassword">Contraseña:</label><br />
                                <input type="password" className="inputTexto" name="password" id="rpassword" onChange={handleSignUpChange} value={signUpData.password} required maxLength={20}></input><br />
                                <input type="submit" className="submit" value="Registrarse"></input>
                            </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LogIn;