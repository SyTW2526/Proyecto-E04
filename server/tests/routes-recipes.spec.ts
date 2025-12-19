import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/server.js';
import { Recipe } from '../src/items/recipe.js';
import { User } from '../src/items/user.js';
import { describe, expect, test, beforeEach } from "vitest";
import jwt from 'jsonwebtoken';
import { Review } from '../src/items/review.js';

const JWT_SECRET = 'fallback-secret-for-dev-only-654321';

describe('Recipe Routes: POST /recipes', () => {
  let activeUserId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    await User.deleteMany();
    await Recipe.deleteMany();

    const user = new User({
      username: 'RecipeAuthor', 
      email: 'autor@test.com',
      password: 'Password123!',
    });
    const savedUser = await user.save();
    activeUserId = savedUser._id;
  });

  test('SUCCESS: Should create a new recipe with valid data', async () => {
    const validRecipe = {
      name: 'Pasta Carbonara',
      steps: '1. Hervir agua. 2. Cocinar pasta. 3. Mezclar con huevo.',
      ingredients: [
        { ingredient: 'pollo', quantity: '200g' } 
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
    expect(Array.isArray(response.body.category)).toBe(true);
  });

  test('ERROR: Should return 400 if required fields are missing', async () => {
    const invalidRecipe = {
      name: 'Receta incompleta'
    };

    await request(app)
      .post('/recipes')
      .send(invalidRecipe)
      .expect(400);
  });

  test('ERROR: Should fail if tool is not in the Enum list', async () => {
    const recipeWithInvalidTool = {
      name: 'Receta con Herramienta Falsa',
      steps: 'Pasos...',
      ingredients: [{ ingredient: 'pollo', quantity: '1' }],
      tools: ['destornillador'], 
      userId: activeUserId,
      category: ['otro']
    };

    const response = await request(app)
      .post('/recipes')
      .send(recipeWithInvalidTool)
      .expect(400);

    expect(response.body.message).toContain('tools');
  });

  test('ERROR: Should fail if category is not in the Enum list', async () => {
    const recipeWithInvalidCategory = {
      name: 'Receta Categoría Falsa',
      steps: 'Pasos...',
      ingredients: [{ ingredient: 'pollo', quantity: '1' }],
      tools: ['sartén'],
      userId: activeUserId,
      category: ['comida-espacial'] 
    };

    await request(app)
      .post('/recipes')
      .send(recipeWithInvalidCategory)
      .expect(400);
  });
});

describe('Recipe Routes: GET /recipes (Comprehensive Coverage)', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await Recipe.deleteMany({});
    await User.deleteMany({});

    const user = await new User({
      username: 'ChefUser',
      email: 'chef@test.com',
      password: 'Password123!',
      recentSearches: []
    }).save();

    userId = user._id.toString();
    token = jwt.sign({ _id: userId }, JWT_SECRET);

    await new Recipe({
      name: 'Tortilla de Patatas',
      steps: 'Freír patatas y mezclar con huevo.',
      ingredients: [{ ingredient: 'pollo', quantity: '1' }],
      tools: ['sartén', 'cuchillo'],
      userId: userId,
      category: ['plato principal', 'desayuno'],
      creacionDate: new Date('2025-01-01T10:00:00Z')
    }).save();

    await new Recipe({
      name: 'Ensalada Mix',
      steps: 'Cortar verduras y servir frío.',
      ingredients: [{ ingredient: 'verduras', quantity: '200g' }],
      tools: ['cuchillo', 'tabla de cortar'],
      userId: userId,
      category: ['entrante', 'vegano'],
      creacionDate: new Date('2025-05-20T10:00:00Z')
    }).save();

    await new Recipe({
      name: 'Batido de Frutas',
      steps: 'Batir todo junto.',
      ingredients: [{ ingredient: 'frutas', quantity: '300g' }],
      tools: ['batidora'],
      userId: new mongoose.Types.ObjectId(), 
      category: ['bebida', 'postre'],
      creacionDate: new Date()
    }).save();
  });

  test('Should find recipes by partial name (case-insensitive)', async () => {
    const res = await request(app)
      .get('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .query({ name: 'TORTILLA' });
    
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Tortilla de Patatas');
  });

  test('Should find recipes by steps content', async () => {
    const res = await request(app)
      .get('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .query({ steps: 'batir' });
    
    expect(res.body[0].name).toBe('Batido de Frutas');
  });

  test('Should find by multiple categories (using $all logic)', async () => {
    const res = await request(app)
      .get('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .query({ category: 'plato principal, desayuno' });
    
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Tortilla de Patatas');
  });

  test('Should find by multiple tools', async () => {
    const res = await request(app)
      .get('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .query({ tools: 'cuchillo, tabla de cortar' });
    
    expect(res.body[0].name).toBe('Ensalada Mix');
  });

  test('Should find by ingredient name', async () => {
    const res = await request(app)
      .get('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .query({ ingredientName: 'frutas' });
    
    expect(res.body[0].name).toBe('Batido de Frutas');
  });

  test('Should find recipes by a specific userId', async () => {
    const res = await request(app)
      .get('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .query({ userId: userId });
    
    expect(res.body.length).toBe(2); 
    expect(res.body[0].userId.username).toBe('ChefUser'); 
  });

  test('Should filter by exact creation date (day range)', async () => {
    const res = await request(app)
      .get('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .query({ creacionDate: '2025-01-01' });
    
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Tortilla de Patatas');
  });

  test('Should save the search term in user profile when searching by name', async () => {
    const searchName = 'Tortilla';
    await request(app)
      .get('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .query({ name: searchName });

    const user = await User.findById(userId);
    expect(user?.recentSearches).toContain(searchName);
    expect(user?.recentSearches[0]).toBe(searchName); 
  });

  test('Should return 404 if no recipes match', async () => {
    await request(app)
      .get('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .query({ name: 'RecetaInexistente' })
      .expect(404);
  });

  test('Should return 400 for invalid userId format', async () => {
    const res = await request(app)
      .get('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .query({ userId: 'abc' });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ID de usuario no válido.');
  });

  test('Should return 400 for invalid date format', async () => {
    await request(app)
      .get('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .query({ creacionDate: 'formato-incorrecto' })
      .expect(400);
  });
});

describe('Recipe Routes: GET /recipes/:id', () => {
  let recipeId: string;
  let authorId: string;

  beforeEach(async () => {
    await Recipe.deleteMany({});
    await User.deleteMany({});

    const user = await new User({
      username: 'ChefEspecial',
      email: 'especial@test.com',
      password: 'Password123!',
      profilePic: 'uploads/images/chef.png'
    }).save();

    authorId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Paella Valenciana',
      steps: 'Cocinar el arroz con el sofrito y el caldo.',
      ingredients: [{ ingredient: 'pollo', quantity: '500g' }],
      tools: ['olla'], 
      userId: user._id,
      category: ['arroz']
    }).save();

    recipeId = recipe._id.toString();
  });

  test('SUCCESS: Should return the recipe with populated user data', async () => {
    const response = await request(app)
      .get(`/recipes/${recipeId}`)
      .expect(200);

    expect(response.body.name).toBe('Paella Valenciana');
    
    expect(response.body.userId).toHaveProperty('username');
    expect(response.body.userId.username).toBe('ChefEspecial');
    expect(response.body.userId.profilePic).toBe('uploads/images/chef.png');
    
    expect(response.body.userId.password).toBeUndefined();
  });

  test('ERROR: Should return 404 if the ID format is valid but does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get(`/recipes/${fakeId}`)
      .expect(404);

    expect(response.body.error).toBe('Receta no encontrada.');
  });

  test('ERROR: Should return 500 if the ID format is invalid', async () => {
    const invalidId = '123-id-no-valido';
    const response = await request(app)
      .get(`/recipes/${invalidId}`)
      .expect(500);

    expect(response.body).toBeDefined();
    expect(response.body.name).toBe('CastError');
  });
});

describe('Recipe Routes: PATCH operations', () => {
  let recipeId: string;
  let userId: string;

  beforeEach(async () => {
    await Recipe.deleteMany({});
    await User.deleteMany({});

    const user = await new User({
      username: 'EditorChef',
      email: 'editor@test.com',
      password: 'Password123!'
    }).save();

    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Arroz con Leche',
      steps: 'Cocer arroz con leche y azúcar.',
      ingredients: [{ ingredient: 'leche', quantity: '1L' }],
      tools: ['olla'],
      userId: user._id,
      category: ['postre']
    }).save();

    recipeId = recipe._id.toString();
  });

  describe('PATCH /recipes (Update by Query Filter)', () => {
    test('SUCCESS: Should update a recipe finding it by name', async () => {
      const response = await request(app)
        .patch('/recipes')
        .query({ name: 'arroz' }) 
        .send({ steps: 'Nueva descripción de pasos corregida.' })
        .expect(200);

      expect(response.body.steps).toBe('Nueva descripción de pasos corregida.');
    });

    test('ERROR: Should return 400 if no filters are provided in query', async () => {
      await request(app)
        .patch('/recipes')
        .send({ name: 'Nuevo Nombre' })
        .expect(400); 
    });

    test('ERROR: Should return 400 if body is empty', async () => {
      await request(app)
        .patch('/recipes')
        .query({ name: 'Arroz' })
        .send({})
        .expect(400); 
    });

    test('ERROR: Should return 400 if update contains forbidden fields', async () => {
      await request(app)
        .patch('/recipes')
        .query({ name: 'Arroz' })
        .send({ userId: new mongoose.Types.ObjectId(), secretField: 'hack' })
        .expect(400); 
    });

    test('ERROR: Should return 404 if no recipe matches the filter', async () => {
      await request(app)
        .patch('/recipes')
        .query({ name: 'NombreInexistente' })
        .send({ name: 'Nuevo' })
        .expect(404);
    });

    test('ERROR: Should return 400 if userId in query is invalid', async () => {
      await request(app)
        .patch('/recipes')
        .query({ userId: 'not-an-id' })
        .send({ name: 'Nuevo' })
        .expect(400);
    });
  });

  describe('PATCH /recipes/:id (Update by ID)', () => {
    test('SUCCESS: Should update allowed fields by ID', async () => {
      const updateData = {
        name: 'Arroz con Leche Especial',
        category: ['postre', 'otro'],
        tools: ['olla', 'batidora']
      };

      const response = await request(app)
        .patch(`/recipes/${recipeId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.category).toContain('otro');
      expect(response.body.tools).toContain('batidora');
    });

    test('ERROR: Should fail if update violates Enum validation (runValidators)', async () => {
      await request(app)
        .patch(`/recipes/${recipeId}`)
        .send({ tools: ['herramienta-falsa'] })
        .expect(400); 
    });

    test('ERROR: Should return 400 if field is not permitted', async () => {
      await request(app)
        .patch(`/recipes/${recipeId}`)
        .send({ creacionDate: new Date() }) 
        .expect(400);
    });

    test('ERROR: Should return 404 if ID is valid but does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .patch(`/recipes/${fakeId}`)
        .send({ name: 'Nuevo' })
        .expect(404);
    });

    test('ERROR: Should return 400 if steps are updated to empty (validation)', async () => {
      await request(app)
        .patch(`/recipes/${recipeId}`)
        .send({ steps: '' })
        .expect(400);
    });
  });
});

describe('Recipe Routes: DELETE operations', () => {
  let recipeId: string;
  let userId: string;

  beforeEach(async () => {
    await Recipe.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});

    const user = await new User({
      username: 'ChefBorrado',
      email: 'delete@test.com',
      password: 'Password123!'
    }).save();

    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Sopa de Tomate',
      steps: 'Triturar tomates y hervir.',
      ingredients: [{ ingredient: 'verduras', quantity: '1kg' }],
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

  describe('DELETE /recipes (By Query Filter)', () => {
    test('SUCCESS: Should delete a recipe by partial name and clean reviews', async () => {
      const response = await request(app)
        .delete('/recipes')
        .query({ name: 'Sopa' })
        .expect(200);

      expect(response.body._id).toBe(recipeId);

      const found = await Recipe.findById(recipeId);
      expect(found).toBeNull();

      const reviews = await Review.find({ userId: recipeId });
      expect(reviews.length).toBe(0);
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
        .query({ name: 'Inexistente' })
        .expect(404);
    });

    test('ERROR: Should return 400 for invalid userId format in query', async () => {
      await request(app)
        .delete('/recipes')
        .query({ userId: 'esto-no-es-un-id' })
        .expect(400);
    });
  });

  describe('DELETE /recipes/:id (By ID Parameter)', () => {
    test('SUCCESS: Should delete recipe by ID and trigger file cleanup logic', async () => {
      const response = await request(app)
        .delete(`/recipes/${recipeId}`)
        .expect(200);

      expect(response.body.name).toBe('Sopa de Tomate');

      const found = await Recipe.findById(recipeId);
      expect(found).toBeNull();
    });

    test('ERROR: Should return 404 if ID is valid but recipe does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/recipes/${fakeId}`)
        .expect(404);
    });

    test('ERROR: Should return 500 if ID format is invalid', async () => {
      await request(app)
        .delete('/recipes/id-invalido-123')
        .expect(500);
    });

    test('LOGIC: Should handle recipes with multiple images (default and custom)', async () => {
      const res = await request(app)
        .delete(`/recipes/${recipeId}`)
        .expect(200);
      
      expect(res.body.images).toContain('default/food.png');
    });
  });
});