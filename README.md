# Proyecto-E04
#  Recipe Vault

## Descripción del Proyecto

Este proyecto consiste en el desarrollo de una aplicación web **full-stack** que actúa como una plataforma de **creación y compartición de recetas de cocina**.  
El objetivo es ofrecer un entorno moderno, accesible e intuitivo donde los usuarios puedan descubrir nuevas recetas, compartir sus propias creaciones y formar una comunidad gastronómica.
La aplicación permitirá a los usuarios registrarse, crear perfiles personalizados, publicar recetas con ingredientes e instrucciones detalladas, así como interactuar con otros usuarios mediante valoraciones, comentarios y favoritos.

---

## Objetivo del Proyecto

Desarrollar un sistema web que permita:

- Una experiencia de usuario fluida y atractiva en el **frontend**.
- Una gestión sólida de la **lógica de negocio** en el **backend**.
- Almacenamiento y gestión eficiente de usuarios y recetas.
- Una arquitectura escalable y mantenible, aplicando los conocimientos adquiridos durante las clases.

---

##  Arquitectura MERN

La aplicación está desarrollada siguiendo una arquitectura **MERN**, utilizada durante las prácticas de la asignatura.

### 🔹 Tecnologías principales

- **MongoDB** – Base de datos NoSQL para el almacenamiento de información.
- **Express** – Framework para el desarrollo del servidor backend.
- **React** – Framework o librería para el desarrollo del frontend.
- **Node.js** – Entorno de ejecución del backend.

---

### Ejecución

Antes de poner en marcha RecipeVault, será necesario que instale todas las dependencias. Esto puede hacerlo con el comando tanto en el directorio client como en server:

```
npm install
```

La aplicación se puede ejecutar con el siguiente comando tanto en el directorio client como en server:

```
npm run dev
```

**Nota:** Puede que la primera vez que utilice la aplicación tarde un poco en cargar y parezca que se ha colgado. No se preocupe porque tarda, pero termina cargando y renderizando la página.

### Pruebas

Para ejecutar las pruebas del backend, tiene que utilizar el comando:

```
npm run test
```

Por otro lado, para ejecutar las pruebas de E2E del frontend, se hace uso de los siguientes comandos:

En server:

```
npm run dev:e2e
```

Y en client ejecutar en una terminal el primero y en otra el segundo:

```
npm run dev:e2e
```
```
npm run test
```

**Nota:** Es posible que los tests E2E fallen aleatoriamente por las distintas velocidades a las que puede cargar una página y sus elementos. En principio, la mayoría de veces funcionan correctamente, pero se le avisa para que lo tenga en cuenta.
