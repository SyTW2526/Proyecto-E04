import axios from 'axios';
import './login.css';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

interface SignUpFormState  {
  username: string;
  email: string;
  password: string;
}

interface SignInFormState  {
  email: string;
  password: string;
}

const SignInSchema = yup.object().shape({
    email: yup.string().email('Debe de ser un email').required('El email es obligatorio'),
    password: yup.string().required('La contraseña es obligatoria').min(6, 'La contraseña debe de tener al menos 6 caracteres')
})

const SignUpSchema = yup.object().shape({
    username: yup.string().required('El nombre de usuario es obligatorio').min(4, 'El nombre de usuario debe de tener al menos 4 caracteres').max(30, 'El nombre de usuario no puede exceder los 30 caracteres'),
    email: yup.string().email('Debe de ser un email').required('El email es obligatorio').max(40, 'El email no puede exceder los 40 caracteres'),
    password: yup.string().required('La contraseña es obligatoria').min(6, 'La contraseña debe de tener al menos 6 caracteres')
})

function LogIn() {
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:3000/users/me', {
            withCredentials: true
        })
        .then(() => {
            navigate('/home');
        })
        .catch(() => {
        
        });
    }, [navigate]);

    const [loginError, setLoginError] = useState('');
    const [registerError, setRegisterError] = useState('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function signIn(signInData: any) {
        try {
            const responseSignIn = await axios.post('http://localhost:3000/users/login', signInData, {
                withCredentials: true
            });
            console.log(responseSignIn);

            if (responseSignIn.status === 200) {
                navigate("/home");
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setLoginError(error.response.data.message || 'El usuario o la contraseña son incorrectos');
            } else {
                setLoginError('Error inesperado');
            }
        }
    }

    return (
        <>
            <Helmet>
                <title>Log-In / RecipeVault</title>
            </Helmet>
            <div className="ContenedorGeneral">
                <div className="ContenedorInicio">
                    <div className="Logo">
                        <img src="/logo.png" alt="Logo de RecipeVault" width="50%" height="50%"></img>
                    </div>
                    <div className="InicioRegistro">
                        <h1>Iniciar sesión</h1>
                            <Formik
                                initialValues={{
                                    email: '',
                                    password: '',
                                }}
                                validationSchema={SignInSchema}
                                onSubmit={(values: SignInFormState) => {
                                    try {
                                        signIn(values);
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }}
                            >
                                {({values, handleChange, handleBlur, errors, touched}) => (
                                    <Form>
                                        <label htmlFor="lemail">Correo electrónico:</label><br />
                                        <input type="email" className="inputTexto" name= "email" id="lemail" onChange={handleChange} value={values.email} onBlur={handleBlur} /><br />
                                        {touched.email && errors.email && (
                                            <p className="help is-danger">{errors.email}</p>
                                        )}
                                        <label htmlFor="lpassword">Contraseña:</label><br />
                                        <input type="password" className="inputTexto" name="password" id="lpassword" onChange={handleChange} value={values.password} onBlur={handleBlur} /><br />
                                        {touched.password && errors.password && (
                                            <p className="help is-danger">{errors.password}</p>
                                        )}
                                        <input type="submit" className="submit" value="Iniciar sesión"></input>
                                        {loginError && <p className="error-message">{loginError}</p>}
                                    </Form>
                                )}
                            </Formik>
                    </div>
                    <div className="lineaVertical" />
                    <div className="InicioRegistro">
                        <h1>Registrarse</h1>
                            <Formik
                                initialValues={{
                                    username: '',
                                    email: '',
                                    password: '',
                                }}
                                validationSchema={SignUpSchema}
                                onSubmit={async (values: SignUpFormState) => {
                                    try {
                                        const response = await axios.post('http://localhost:3000/users', values);
                                        console.log(response);

                                        if (response.status === 201) {
                                            signIn(values);
                                        }
                                    } catch (error) {
                                        if (axios.isAxiosError(error) && error.response) {
                                            setRegisterError(error.response.data.message || 'El nombre de usuario o email ya se han utilizado anteriormente');
                                        } else {
                                            setRegisterError('Error inesperado');
                                        }
                                    }
                                }}
                            >
                                {({values, handleChange, handleBlur, errors, touched}) => (
                                    <Form>
                                        <label htmlFor="ruser">Nombre de usuario:</label><br />
                                        <input type="text" className="inputTexto" name= "username" id="ruser" onChange={handleChange} value={values.username} onBlur={handleBlur} /><br />
                                        {touched.username && errors.username && (
                                            <p className="help is-danger">{errors.username}</p>
                                        )}
                                        <label htmlFor="remail">Correo electrónico:</label><br />
                                        <input type="email" className="inputTexto" name= "email" id="remail" onChange={handleChange} value={values.email} onBlur={handleBlur} /><br />
                                        {touched.email && errors.email && (
                                            <p className="help is-danger">{errors.email}</p>
                                        )}
                                        <label htmlFor="rpassword">Contraseña:</label><br />
                                        <input type="password" className="inputTexto" name="password" id="rpassword" onChange={handleChange} value={values.password} onBlur={handleBlur} /><br />
                                        {touched.password && errors.password && (
                                            <p className="help is-danger">{errors.password}</p>
                                        )}
                                        <input type="submit" className="submit" value="Registrarse"></input>
                                        {registerError && <p className="error-message">{registerError}</p>}
                                    </Form>
                                )}
                            </Formik>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LogIn;