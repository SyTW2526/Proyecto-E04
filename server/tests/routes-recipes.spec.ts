import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/server.js';
import { Recipe } from '../src/items/recipe.js';
import { User } from '../src/items/user.js';
import { describe, expect, test, beforeEach, afterAll } from "vitest";
import jwt from 'jsonwebtoken';
import { Review } from '../src/items/review.js';

const JWT_SECRET = 'fallback-secret-for-dev-only-654321';

afterAll(async () => {
  await User.deleteMany({});
  await Recipe.deleteMany({});
  await Review.deleteMany({});
});

describe('Recipe Routes: POST /recipes', () => {
  let activeUserId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    await User.deleteMany();
    await Recipe.deleteMany();
    const user = new User({
      username: 'RecipeAuthor', 
      _id: '000000000000000000000101',
      email: 'autor@test.com',
      password: 'Password123!'
    });
    const savedUser = await user.save();
    activeUserId = savedUser._id;
  });

  test('SUCCESS: Should create a new recipe with valid data', async () => {
    const validRecipe = {
      name: 'Pasta Carbonara',
      steps: '1. Hervir agua. 2. Cocinar pasta.',
      ingredients: [
        { ingredient: 'harina', quantity: '200g' } 
      ],
      tools: ['sartén'],
      userId: activeUserId,
      category: ['pasta'],
    };

    const response = await request(app)
      .post('/recipes')
      .send(validRecipe)
      .expect(201);

    expect(response.body.name).toBe(validRecipe.name);
    expect(response.body.userId).toBe(activeUserId.toString());
    expect(response.body.ingredients[0].ingredient).toBe('harina');
  });

  test('ERROR: Should return 400 if required fields are missing', async () => {
    const invalidRecipe = {
      name: 'Receta sin pasos ni ingredientes'
    };

    await request(app)
      .post('/recipes')
      .send(invalidRecipe)
      .expect(400);
  });

  test('ERROR: Should fail if tool is not in the Enum list', async () => {
    const recipeWithInvalidTool = {
      name: 'Receta Error Herramienta',
      _id: '000000000000000000000112',
      steps: 'Pasos...',
      ingredients: [{ ingredient: 'harina', quantity: '1' }],
      tools: ['martillo'], 
      userId: activeUserId,
      category: ['otro']
    };

    await request(app)
      .post('/recipes')
      .send(recipeWithInvalidTool)
      .expect(400);
  });
});

describe('Recipe Routes: GET /recipes', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await Recipe.deleteMany({});
    await User.deleteMany({});

    const user = await new User({
      username: 'ChefUser',
      _id: '000000000000000000000106',
      email: 'chef@test.com',
      password: 'Password123!',
      categories: ['otro'], 
      recentSearches: []
    }).save();

    userId = user._id.toString();
    token = jwt.sign({ _id: userId }, JWT_SECRET);

    await new Recipe({
      name: 'Tortilla Especial',
      _id: '000000000000000000000115',
      steps: 'Cocinar todo en la sartén.',
      ingredients: [{ ingredient: 'harina', quantity: '2' }], 
      tools: ['sartén', 'cuchillo'],
      userId: userId,
      category: ['plato principal', 'desayuno'],
      creacionDate: new Date('2025-01-01T10:00:00Z')
    }).save();

    await new Recipe({
      name: 'Ensalada Mix',
      _id: '000000000000000000000116',
      steps: 'Cortar y servir.',
      ingredients: [{ ingredient: 'aceite', quantity: '200g' }], 
      tools: ['cuchillo', 'tabla de cortar'],
      userId: userId,
      category: ['entrante', 'vegano'],
      creacionDate: new Date('2025-05-20T10:00:00Z')
    }).save();
  });


  test('Should filter by multiple categories using $all logic', async () => {
    const res = await request(app)
      .get('/recipes')
      .set('Cookie', `token=${token}`)
      .query({ category: 'plato principal, desayuno' })
      .expect(200);

    expect(res.body.length).toBe(1);
    expect(res.body[0].category).toContain('desayuno');
  });

  test('Should filter by ingredient name', async () => {
    const res = await request(app)
      .get('/recipes')
      .set('Cookie', `token=${token}`)
      .query({ ingredientName: 'aceite' })
      .expect(200);

    expect(res.body[0].name).toBe('Ensalada Mix');
  });

  test('Should filter by multiple tools using $all logic', async () => {
    const res = await request(app)
      .get('/recipes')
      .set('Cookie', `token=${token}`)
      .query({ tools: 'cuchillo, tabla de cortar' })
      .expect(200);

    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Ensalada Mix');
  });

  test('Should return 400 for invalid ID format', async () => {
    const res = await request(app)
      .get('/recipes')
      .set('Cookie', `token=${token}`)
      .query({ userId: '123-not-real' })
      .expect(400);

    expect(res.body.error).toBe('ID de usuario no válido.');
  });
});

describe('Recipe Routes: GET /recipes/feed', () => {
  let token: string;
  let userId: string;
  let followedUserId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});

    const followedUser = await new User({
      username: 'ChefSeguido',
      _id: '000000000000000000000105',
      email: 'seguido@test.com',
      password: 'Password123!',
      categories: ['otro']
    }).save();
    followedUserId = followedUser._id.toString();

    const user = await new User({
      username: 'UserPrincipal',
      _id: '000000000000000000000106',
      email: 'principal@test.com',
      password: 'Password123!',
      categories: ['otro'],
      following: [followedUserId], 
      recentSearches: ['Nombre: Pasta']
    }).save();
    userId = user._id.toString();
    token = jwt.sign({ _id: userId }, JWT_SECRET);

    await new Recipe({
      name: 'Pasta del Seguido',
      _id: '000000000000000000000117',
      steps: 'Pasos...',
      ingredients: [{ ingredient: 'harina', quantity: '1' }],
      tools: ['olla'],
      userId: followedUserId,
      category: ['pasta']
    }).save();

    await new Recipe({
      name: 'Pasta de un Desconocido',
      _id: '000000000000000000000118',
      steps: 'Pasos...',
      ingredients: [{ ingredient: 'harina', quantity: '1' }],
      tools: ['olla'],
      userId: new mongoose.Types.ObjectId(),
      category: ['pasta']
    }).save();

    await new Recipe({
      name: 'Ensalada General',
      _id: '000000000000000000000119',
      steps: 'Pasos...',
      ingredients: [{ ingredient: 'harina', quantity: '1' }],
      tools: ['cuchillo'],
      userId: new mongoose.Types.ObjectId(),
      category: ['entrante']
    }).save();
  });

  test('SUCCESS: Should return a mixed feed of followed, searched and general recipes', async () => {
    const response = await request(app)
      .get('/recipes/feed')
      .set('Cookie', `token=${token}`)
      .expect(200);

    const recipes = response.body;

    expect(recipes.length).toBe(3);

    const followedRecipe = recipes.find((r: any) => r.name === 'Pasta del Seguido');
    expect(followedRecipe.userId.username).toBe('ChefSeguido');
    expect(recipes.some((r: any) => r.name === 'Pasta de un Desconocido')).toBe(true);
  });

  test('Should not return more than 15 recipes', async () => {
    const extraRecipes = Array.from({ length: 20 }).map((_, i) => ({
      name: `Receta Relleno ${i}`,
      _id: new mongoose.Types.ObjectId(),
      steps: 'Pasos...',
      ingredients: [{ ingredient: 'harina', quantity: '1' }],
      tools: ['olla'],
      userId: new mongoose.Types.ObjectId(),
      category: ['otro']
    }));
    await Recipe.insertMany(extraRecipes);

    const response = await request(app)
      .get('/recipes/feed')
      .set('Cookie', `token=${token}`)
      .expect(200);

    expect(response.body.length).toBe(15);
  });

  test('EMPTY: Should return general recipes even if user follows no one and has no searches', async () => {
    const cleanUser = await new User({
      username: 'CleanUser',
      _id: '000000000000000000000108',
      email: 'clean@test.com',
      password: 'Password123!',
      categories: ['otro'],
      following: [],
      recentSearches: []
    }).save();
    
    const cleanToken = jwt.sign({ _id: cleanUser._id.toString() }, JWT_SECRET);

    const response = await request(app)
      .get('/recipes/feed')
      .set('Cookie', `token=${cleanToken}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body.some((r: any) => r.name === 'Ensalada General')).toBe(true);
  });

  test('ERROR: Should return 401 if no token is provided', async () => {
    await request(app)
      .get('/recipes/feed')
      .expect(401);
  });
});

describe('Recipe Routes: GET /recipes/saved', () => {
  let token: string;
  let userId: string;
  let recipeId1: string;
  let recipeId2: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});

    const author = await new User({
      username: 'ChefAutor',
      _id: '000000000000000000000105',
      email: 'autor@test.com',
      password: 'Password123!',
      categories: ['otro']
    }).save();

    const recipe1 = await new Recipe({
      name: 'Receta Guardada 1',
      _id: '000000000000000000000161',
      steps: 'Paso 1...',
      ingredients: [{ ingredient: 'harina', quantity: '1' }],
      tools: ['olla'],
      userId: author._id,
      category: ['pasta']
    }).save();

    const recipe2 = await new Recipe({
      name: 'Receta Guardada 2',
      _id: '000000000000000000000171',
      steps: 'Paso 2...',
      ingredients: [{ ingredient: 'harina', quantity: '2' }],
      tools: ['sartén'],
      userId: author._id,
      category: ['carne']
    }).save();

    recipeId1 = recipe1._id.toString();
    recipeId2 = recipe2._id.toString();

    const user = await new User({
      username: 'UserLector',
      _id: '000000000000000000000141',
      email: 'lector@test.com',
      password: 'Password123!',
      categories: ['otro'],
      saved: [recipe1._id, recipe2._id] 
    }).save();

    userId = user._id.toString();
    token = jwt.sign({ _id: userId }, JWT_SECRET);
  });

  test('SUCCESS: Should return all saved recipes with populated author data', async () => {
    const response = await request(app)
      .get('/recipes/saved')
      .set('Cookie', `token=${token}`)
      .expect(200);

    const savedRecipes = response.body;

    expect(Array.isArray(savedRecipes)).toBe(true);
    expect(savedRecipes.length).toBe(2);

    expect(savedRecipes[0].name).toBe('Receta Guardada 1');
    expect(savedRecipes[0].userId.username).toBe('ChefAutor');
    expect(savedRecipes[0].userId.profilePic).toBeDefined();

    expect(savedRecipes[0].userId.password).toBeUndefined();
  });

  test('EMPTY: Should return an empty array if the user has no saved recipes', async () => {
    const emptyUser = await new User({
      username: 'UserSinNada',
      _id: '000000000000000000000131',
      email: 'vacio@test.com',
      password: 'Password123!',
      categories: ['otro'],
      saved: []
    }).save();
    
    const emptyToken = jwt.sign({ _id: emptyUser._id.toString() }, JWT_SECRET);

    const response = await request(app)
      .get('/recipes/saved')
      .set('Cookie', `token=${emptyToken}`)
      .expect(200);

    expect(response.body).toEqual([]);
  });

  test('ERROR: Should return 401 if token is missing', async () => {
    await request(app)
      .get('/recipes/saved')
      .expect(401);
  });
});

describe('Recipe Routes: GET /recipes/:id', () => {
  let recipeId: string;
  let authorId: string;

  beforeEach(async () => {
    await Recipe.deleteMany({});
    await User.deleteMany({});

    const author = await new User({
      username: 'ChefEspecial',
      _id: '000000000000000000000142',
      email: 'especial@test.com',
      password: 'Password123!',
      categories: ['otro'],
      profilePic: 'uploads/images/chef.png'
    }).save();

    authorId = author._id.toString();
    const recipe = await new Recipe({
      name: 'Paella Valenciana',
      _id: '000000000000000000000152',
      steps: 'Cocinar el arroz con el sofrito y el caldo.',
      ingredients: [{ ingredient: 'harina', quantity: '500g' }],
      tools: ['olla'], 
      userId: author._id,
      category: ['arroz']
    }).save();

    recipeId = recipe._id.toString();
  });

  test('SUCCESS: Should return the recipe with populated author data', async () => {
    const response = await request(app)
      .get(`/recipes/${recipeId}`)
      .expect(200);

    expect(response.body.name).toBe('Paella Valenciana');
    expect(response.body.userId).toHaveProperty('username');
    expect(response.body.userId.username).toBe('ChefEspecial');
    expect(response.body.userId.profilePic).toBe('uploads/images/chef.png');
    expect(response.body.userId.password).toBeUndefined();
  });

  test('ERROR: Should return 404 if the ID format is valid but doesnt exist', async () => {
    const fakeId = new mongoose.Types.ObjectId(); 
    const response = await request(app)
      .get(`/recipes/${fakeId}`)
      .expect(404);

    expect(response.body.error).toBe('Receta no encontrada.');
  });

  test('ERROR: Should return 500 if the ID format is totally invalid', async () => {
    const invalidId = 'este-id-no-es-un-objectid';

    const response = await request(app)
      .get(`/recipes/${invalidId}`)
      .expect(500);

    expect(response.body).toBeDefined();
    expect(response.body.name).toBe('CastError');
  });
});

describe('Recipe Routes: PATCH /recipes ', () => {
  let authorId: string;
  let recipeName = 'Arroz con Leche';

  beforeEach(async () => {
    await Recipe.deleteMany({});
    await User.deleteMany({});

    const author = await new User({
      username: 'EditorChef',
      _id: '000000000000000000000134',
      email: 'editor@test.com',
      password: 'Password123!',
      categories: ['otro'] 
    }).save();

    authorId = author._id.toString();
    await new Recipe({
      name: recipeName,
      _id: '000000000000000000000154',
      steps: 'Cocer arroz con leche.',
      ingredients: [{ ingredient: 'harina', quantity: '1' }],
      tools: ['olla'],
      userId: author._id,
      category: ['postre']
    }).save();
  });

  test('SUCCESS: Should update recipe steps using name filter', async () => {
    const response = await request(app)
      .patch('/recipes')
      .query({ name: 'arroz' }) 
      .send({ steps: 'Nueva descripción de pasos corregida.' })
      .expect(200);

    expect(response.body.steps).toBe('Nueva descripción de pasos corregida.');
  });

  test('ERROR: Should return 400 if no query filters are provided', async () => {
    const response = await request(app)
      .patch('/recipes')
      .send({ name: 'Nuevo Nombre' })
      .expect(400);

    expect(response.body.error).toContain('Debe proporcionar al menos un filtro');
  });

  test('ERROR: Should return 400 if body is empty', async () => {
    await request(app)
      .patch('/recipes')
      .query({ name: 'Arroz' })
      .send({})
      .expect(400);
  });

  test('ERROR: Should return 400 if update contains forbidden fields ', async () => {
    await request(app)
      .patch('/recipes')
      .query({ name: 'Arroz' })
      .send({ userId: new mongoose.Types.ObjectId() }) 
      .expect(400);
  });

  test('ERROR: Should return 404 if no recipe matches the filter', async () => {
    await request(app)
      .patch('/recipes')
      .query({ name: 'PizzaInexistente' })
      .send({ name: 'Nuevo' })
      .expect(404);
  });

  test('ERROR: Should fail if update violates Enum validation ', async () => {
    await request(app)
      .patch('/recipes')
      .query({ name: 'Arroz' })
      .send({ tools: ['destornillador'] })
      .expect(400);
  });
});

describe('Recipe Routes: PATCH /recipes/:id (Update by ID)', () => {
  let recipeId: string;
  let userId: string;

  beforeEach(async () => {
    await Recipe.deleteMany({});
    await User.deleteMany({});

    const user = await new User({
      username: 'ChefEditor',
      _id: '000000000000000000000121',
      email: 'editor@test.com',
      password: 'Password123!',
      categories: ['otro'] 
    }).save();

    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Receta Original',
      _id: '000000000000000000000163',
      steps: 'Pasos antiguos.',
      ingredients: [{ ingredient: 'harina', quantity: '1' }],
      tools: ['olla'],
      userId: user._id,
      category: ['otro']
    }).save();

    recipeId = recipe._id.toString();
  });

  test('SUCCESS: Should update allowed fields by ID', async () => {
    const updateData = {
      name: 'Receta Actualizada',
      category: ['postre', 'otro'],
      tools: ['olla', 'batidora']
    };

    const response = await request(app)
      .patch(`/recipes/${recipeId}`)
      .send(updateData)
      .expect(200);

    expect(response.body.name).toBe('Receta Actualizada');
    expect(response.body.category).toContain('postre');
    expect(response.body.tools).toContain('batidora');
  });

  test('ERROR: Should return 400 if update contains forbidden fields ', async () => {
    await request(app)
      .patch(`/recipes/${recipeId}`)
      .send({ userId: new mongoose.Types.ObjectId() }) 
      .expect(400);
  });

  test('ERROR: Should return 400 if validation fails ', async () => {
    await request(app)
      .patch(`/recipes/${recipeId}`)
      .send({ tools: ['martillo'] })
      .expect(400);
  });

  test('ERROR: Should return 404 if recipe ID is valid format but does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .patch(`/recipes/${fakeId}`)
      .send({ name: 'Nuevo Nombre' })
      .expect(404);
  });
});

describe('Recipe Routes: DELETE /recipes ', () => {
  let recipeId: string;
  let userId: string;

  beforeEach(async () => {
    await Recipe.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});

    const user = await new User({
      username: 'ChefBorrado',
      _id: '000000000000000000000155',
      email: 'delete@test.com',
      password: 'Password123!',
      categories: ['otro']
    }).save();

    userId = user._id.toString();
    const recipe = await new Recipe({
      name: 'Sopa de Tomate',
      _id: '000000000000000000000191',
      steps: 'Triturar tomates y hervir.',
      ingredients: [{ ingredient: 'harina', quantity: '1kg' }],
      tools: ['olla'],
      userId: user._id,
      category: ['entrante'],
      images: ['uploads/recipes/sopa.jpg', 'default/food.png'], 
      videos: ['uploads/recipes/video.mp4']
    }).save();

    recipeId = recipe._id.toString();
    await new Review({
      comment: 'Muy rica',
      rating: 5,
      userId: recipe._id, 
      recipeId: recipe._id
    }).save();
  });

  test('SUCCESS: Should delete recipe by name and clean its reviews', async () => {
    const response = await request(app)
      .delete('/recipes')
      .query({ name: 'Sopa' })
      .expect(200);

    expect(response.body._id).toBe(recipeId);

    const foundRecipe = await Recipe.findById(recipeId);
    expect(foundRecipe).toBeNull();
  });

  test('ERROR: Should return 400 if no query parameters are provided', async () => {
    const response = await request(app)
      .delete('/recipes')
      .expect(400);

    expect(response.body.error).toContain('Debe proporcionar al menos un filtro');
  });

  test('ERROR: Should return 404 if no recipe matches the filter', async () => {
    await request(app)
      .delete('/recipes')
      .query({ name: 'PizzaInexistente' })
      .expect(404);
  });

  test('Should handle files correctly (Simulation)', async () => {
    const response = await request(app)
      .delete('/recipes')
      .query({ category: 'entrante' })
      .expect(200);

    expect(response.body.images).toContain('default/food.png');
    expect(response.body.images).toContain('uploads/recipes/sopa.jpg');
  });
});

describe('Recipe Routes: DELETE /recipes/:id', () => {
  let recipeId: string;
  let userId: string;

  beforeEach(async () => {
    await Recipe.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});

    const user = await new User({
      username: 'ChefEliminador',
      _id: '000000000000000000000771',
      email: 'delete_id@test.com',
      password: 'Password123!',
      categories: ['otro']
    }).save();

    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Sopa de Cebolla',
      _id: '000000000000000000000541',
      steps: 'Cocinar cebolla y añadir caldo.',
      ingredients: [{ ingredient: 'harina', quantity: '2' }],
      tools: ['olla'],
      userId: user._id,
      category: ['entrante'],
      images: ['uploads/recipes/cebolla.jpg', 'default/soup.png'],
      videos: ['uploads/recipes/tutorial.mp4']
    }).save();

    recipeId = recipe._id.toString();

    await new Review({
      comment: 'Me encantó',
      rating: 5,
      userId: recipe._id, 
      recipeId: recipe._id
    }).save();
  });

  test('SUCCESS: Should delete recipe by ID and trigger all cleanup logic', async () => {
    const response = await request(app)
      .delete(`/recipes/${recipeId}`)
      .expect(200);

    expect(response.body._id).toBe(recipeId);
    expect(response.body.name).toBe('Sopa de Cebolla');

    const found = await Recipe.findById(recipeId);
    expect(found).toBeNull();

    const reviews = await Review.find({ userId: recipeId });
    expect(reviews.length).toBe(0);
  });

  test('ERROR: Should return 404 if the ID is valid but the recipe does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .delete(`/recipes/${fakeId}`)
      .expect(404);
  });

  test('ERROR: Should return 500 if the ID format is invalid', async () => {
    await request(app)
      .delete('/recipes/esto-no-es-un-id')
      .expect(500);
  });

  test('Should preserve "default" strings in the deleted object data', async () => {
    const response = await request(app)
      .delete(`/recipes/${recipeId}`)
      .expect(200);
    expect(response.body.images).toContain('default/soup.png');
    expect(response.body.images).toContain('uploads/recipes/cebolla.jpg');
  });
});