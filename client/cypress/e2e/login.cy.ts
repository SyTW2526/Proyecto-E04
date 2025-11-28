describe("Login Page E2E", () => {

  it("muestra el formulario", () => {
    cy.visit("/login");

    cy.contains("Correo electrónico").should("exist");
    cy.contains("Contraseña").should("exist");
  });

  it("muestra error si el email no es válido", () => {
    cy.visit("/login");

    // Seleccionamos solo el primer input con name=email
    cy.get('input[name="email"]').first().type("correoSinArroba.com");

    cy.contains("Iniciar sesión").click();

    cy.contains(/debe de ser un email/i).should("exist");
  });

  it("muestra error si la contraseña es corta", () => {
    cy.visit("/login");

    cy.get('input[name="password"]').first().type("123");

    cy.contains("Iniciar sesión").click();

    cy.contains(/al menos 6 caracteres/i).should("exist");
  });

  it("login válido: envía credenciales correctamente", () => {
    cy.visit("/login");

    // Interceptamos la llamada al backend
    cy.intercept(
      "POST",
      "/users/login",
      {
        statusCode: 200,
        body: { token: "mockToken123" }
      }
    ).as("loginRequest");

    cy.get('input[name="email"]').first().type("test@mail.com");
    cy.get('input[name="password"]').first().type("123456");

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
