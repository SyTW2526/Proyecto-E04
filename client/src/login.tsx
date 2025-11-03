import './login.css';

function LogIn() {
    return (
        <>
            <div className="ContenedorGeneral">
                <div className="ContenedorInicio">
                    <div className="Logo">
                        <img src="/logo.png" alt="Logo de ReceiptVault" width="50%" height="50%"></img>
                    </div>
                    <div className="InicioRegistro">
                        <h1>Iniciar sesión</h1>

                            <label htmlFor="luser">Nombre de usuario:</label><br />
                            <input type="text" className="inputTexto" id="luser" name="luser"></input><br />
                            <label htmlFor="lpassword">Contraseña:</label><br />
                            <input type="text" className="inputTexto" id="lpassword" name="lpassword"></input><br />
                            <input type="submit" className="submit" value="Iniciar sesión"></input>

                    </div>
                    <div className="lineaVertical" />
                    <div className="InicioRegistro">
                        <h1>Registrarse</h1>

                            <label htmlFor="ruser">Nombre de usuario:</label><br />
                            <input type="text" className="inputTexto" id="ruser" name="ruser"></input><br />
                            <label htmlFor="rpassword">Contraseña:</label><br />
                            <input type="text" className="inputTexto" id="rpassword" name="rpassword"></input><br />
                            <label htmlFor="cpassword">Confirmar contraseña:</label><br />
                            <input type="text" className="inputTexto" id="cpassword" name="cpassword"></input><br />
                            <input type="submit" className="submit" value="Registrarse"></input>

                    </div>
                </div>
            </div>
        </>
    )
}

export default LogIn;