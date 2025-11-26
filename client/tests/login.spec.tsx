import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../src/login";   // AJUSTA LA RUTA si es distinta

describe("Login Page", () => {

  test("renders login form fields", () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  test("shows error if email does not contain @", async () => {
    render(<Login />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "correoSinArroba.com");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
  });

  test("shows error if password < 6 characters", async () => {
    render(<Login />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/contraseña/i), "123");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(screen.getByText(/mínimo 6 caracteres/i)).toBeInTheDocument();
  });

  test("submits form with valid data", async () => {
    render(<Login />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@mail.com");
    await user.type(screen.getByLabelText(/contraseña/i), "123456");

    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument();
  });
});
