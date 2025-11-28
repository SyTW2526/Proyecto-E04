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

  

});
