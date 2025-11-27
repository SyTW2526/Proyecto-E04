import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { vi } from "vitest";


import LogIn from "../src/login";

// Mock global de axios
vi.mock("axios");
const mockedAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>;
};

// Helper para renderizar con router
function renderWithRouter(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("Login Page", () => {

  test("renders login form fields", () => {
    renderWithRouter(<LogIn />);

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  test("shows error if email does not contain @", async () => {
    renderWithRouter(<LogIn />);
    const user = userEvent.setup();

    const emailInput = screen.getAllByLabelText(/correo electrónico/i)[0]; // login form
    await user.type(emailInput, "correoSinArroba.com");

    await user.click(screen.getAllByRole("button", { name: /iniciar sesión/i })[0]);

    expect(
      screen.getByText(/debe de ser un email/i)
    ).toBeInTheDocument();
  });

  test("shows error if password < 6 characters", async () => {
    renderWithRouter(<LogIn />);
    const user = userEvent.setup();

    const passwordInput = screen.getAllByLabelText(/contraseña/i)[0];
    await user.type(passwordInput, "123");

    await user.click(screen.getAllByRole("button", { name: /iniciar sesión/i })[0]);

    expect(
      screen.getByText(/al menos 6 caracteres/i)
    ).toBeInTheDocument();
  });

  test("submits form with valid data", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      status: 200,
      data: { token: "mockToken" }
    });

    renderWithRouter(<LogIn />);
    const user = userEvent.setup();

    await user.type(screen.getAllByLabelText(/correo electrónico/i)[0], "test@mail.com");
    await user.type(screen.getAllByLabelText(/contraseña/i)[0], "123456");

    await user.click(screen.getAllByRole("button", { name: /iniciar sesión/i })[0]);

    // Verificamos que axios fue llamado correctamente
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:3000/users/login",
      { email: "test@mail.com", password: "123456" }
    );
  });
});
