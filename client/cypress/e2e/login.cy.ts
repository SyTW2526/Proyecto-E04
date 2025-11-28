describe("Login Page E2E", () => {

  it("muestra el formulario", () => {
    cy.visit("http://localhost:5173/login");

    cy.contains("Correo electrónico").should("exist");
    cy.contains("Contraseña").should("exist");
  });

  it("muestra error si el email no es válido", () => {
    cy.visit("http://localhost:5173/login");

    cy.get("input[name=email]").type("correoSinArroba.com");

    cy.contains("Iniciar sesión").click();

    cy.contains(/debe de ser un email/i).should("exist");
  });

  it("muestra error si la contraseña es corta", () => {
    cy.visit("http://localhost:5173/login");

    cy.get("input[name=password]").type("123");

    cy.contains("Iniciar sesión").click();

    cy.contains(/al menos 6 caracteres/i).should("exist");
  });

  it("login válido: envía credenciales correctamente", () => {
    cy.visit("http://localhost:5173/login");

    // Interceptamos la llamada al backend
    cy.intercept(
      "POST",
      "http://localhost:3000/users/login",
      {
        statusCode: 200,
        body: { token: "mockToken123" }
      }
    ).as("loginRequest");

    cy.get("input[name=email]").type("test@mail.com");
    cy.get("input[name=password]").type("123456");

    cy.contains("Iniciar sesión").click();

    // Verificamos que se envía correctamente la request
    cy.wait("@loginRequest")
      .its("request.body")
      .should("deep.equal", {
        email: "test@mail.com",
        password: "123456"
      });

    // Opcional: validar redirección
    // cy.url().should("include", "/home");
  });

});
