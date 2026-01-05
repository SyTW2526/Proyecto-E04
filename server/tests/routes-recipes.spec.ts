import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/server.js';
import { Recipe } from '../src/items/recipe.js';
import { User } from '../src/items/user.js';
import { beforeAll, describe, expect, test, beforeEach } from "vitest";

const userId = new mongoose.Types.ObjectId();
const recipeId = new mongoose.Types.ObjectId();

beforeEach(async () => {
  await User.deleteMany();
  await Recipe.deleteMany();

  const user = new User({
    _id: userId,
    username: 'TestUserUnique', 
    email: 'ejemplo@algo.com',
    password: 'TestPass123!',
  });
  await user.save();

  const recipe = new Recipe({
    _id: recipeId,
    name: 'Test Recipe',
    steps: 'Step 1, Step 2',
    ingredients: [{ ingredient: 'harina', quantity: '2g' }, { ingredient: 'azucar', quantity: '3g' }],
    tools: ['cuchillo'],
    userId: userId,
    category: 'postre',
    images: ['http://example.com/image1.jpg'],
    creacionDate: new Date(),
  });
  await recipe.save();
});

describe('Recipe Routes post', () => {
  test('Should create a new recipe', async () => {
    const response = await request(app)
      .post('/recipes')
      .send({
        name: 'New Recipe',
        steps: 'Step A, Step B',
        ingredients: [{ ingredient: 'sal', quantity: '2g' }, { ingredient: 'huevo', quantity: '3g' }],
        tools: ['sartén', 'olla'],
        userId: userId.toString(),
        category: 'plato principal',
        images: ['http://example.com/image2.jpg'],
      }) 	
      .expect(201);
    expect(response.body.name).toBe('New Recipe');
  });

  test('Should not create a recipe with invalid userId', async () => {
    await request(app)
      .post('/recipes')
      .send({
        name: 'Invalid Recipe',
        steps: 'Step X, Step Y',
        ingredients: [{ ingredient: 'sal', quantity: '2g' }, { ingredient: 'huevo', quantity: '3g' }],
        tools: ['sartén', 'olla'],
        userId: 'invalidUserId',
        category: 'plato principal',
        images: ['http://example.com/image3.jpg'],
      })
      .expect(400);
  });

});

describe('Recipe Routes get', () => {

  test('Should get recipes by name', async () => {
    const response = await request(app)
      .get('/recipes')
      .query({ name: 'Test' })
      .expect(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].name).toBe('Test Recipe');
  });

  test('Should return 404 if no recipe found', async () => {
    await request(app)
      .get('/recipes')
      .query({ name: 'NonExistentRecipe' })
      .expect(404);
  });

  test('Should return 400 for invalid userId', async () => {
    await request(app)
      .get('/recipes')
      .query({ userId: 'invalidUserId' })
      .expect(400);
  });

  test('Should return 400 for invalid creacionDate', async () => {
    await request(app)
      .get('/recipes')
      .query({ creacionDate: 'invalidDate' })
      .expect(400);
  });

  test('Should get a recipe by ID', async () => {
    const response = await request(app)
      .get(`/recipes/${recipeId.toString()}`)
      .expect(200);
    expect(response.body.name).toBe('Test Recipe');
  });

});

describe('Recipe Routes get:id', () => {
  test('Should get a recipe by ID', async () => {
    const response = await request(app)
      .get(`/recipes/${recipeId.toString()}`)
      .expect(200);
    expect(response.body.name).toBe('Test Recipe');
  });

  test('Should return 404 for non-existent recipe ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await request(app)
      .get(`/recipes/${nonExistentId.toString()}`)
      .expect(404);
  });
});

describe('Recipe Routes patch', () => {

  test('Should update a recipe by ID (PATCH /recipes/:id)', async () => {
    const newName = 'Updated Recipe by ID';
    const response = await request(app)
      .patch(`/recipes/${recipeId.toString()}`)
      .send({ name: newName })
      .expect(200);
    expect(response.body.name).toBe(newName);

  });

  // expect 404 if recipe not found
  test('Should return 404 when updating non-existent recipe by ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await request(app)
      .patch(`/recipes/${nonExistentId.toString()}`)
      .send({ name: 'Some Name' })
      .expect(404);
  });

  // expect 400 if no update data provided
  test('Should return 400 when no update data provided', async () => {
    await request(app)
      .patch(`/recipes/${recipeId.toString()}`)
      .send({nam: ''})
      .expect(400);
  });

});

describe('Recipe Routes patch:id', () => {

  test('Should update a recipe using query filters (PATCH /recipes?name=...)', async () => {
    const newCategory = 'postre';
    const oldName = 'Test Recipe';

    const response = await request(app)
      .patch(`/recipes?name=${oldName}`)
      .send({ category: newCategory })
      .expect(200);

    expect(response.body.name).toBe(oldName);
    expect(response.body.category).toContain(newCategory);

    const unaffectedRecipe = await Recipe.findById(recipeId);
    expect(unaffectedRecipe!.category).toContain('postre'); 

    const updatedRecipe = await Recipe.findById(recipeId);
    expect(updatedRecipe!.category).toContain(newCategory);
  });

  test('Should return 400 when no filters provided for update', async () => {
    await request(app)
      .patch('/recipes')
      .send({ category: 'entrante' })
      .expect(400);
  });

  test('Should return 404 when no recipe matches the filters for update', async () => {
    await request(app)
      .patch('/recipes')
      .query({ name: 'NonExistentRecipe' })
      .send({ category: 'entrante' })
      .expect(404);
  });

});

describe('Recipe Routes delete', () => {

  test('Should delete a recipe by ID', async () => {
    await request(app)
      .delete(`/recipes/${recipeId.toString()}`)
      .expect(200);
    const recipe = await Recipe.findById(recipeId);
    expect(recipe).toBeNull();
  });

  //expect 404 if recipe not found
  test('Should return 404 when deleting non-existent recipe by ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await request(app)
      .delete(`/recipes/${nonExistentId.toString()}`)
      .expect(404);
  });
});

describe('Recipe Routes delete:id', () => {
  test('Should delete a recipe using query filters (DELETE /recipes?name=...)', async () => {
    const response = await request(app)
      .delete('/recipes')
      .query({ name: 'Test Recipe' })
      .expect(200);
    expect(response.body.name).toBe('Test Recipe');

    const deletedRecipe = await Recipe.findById(recipeId);
    expect(deletedRecipe).toBeNull();
  });

  test('Should return 400 if no filters provided for deletion', async () => {
    await request(app)
      .delete('/recipes')
      .expect(400);
  });

  test('Should return 404 if no recipe matches the filters for deletion', async () => {
    await request(app)
      .delete('/recipes')
      .query({ name: 'NonExistentRecipe' })
      .expect(404);
  });

  test('Should return 400 for invalid userId during deletion', async () => {
    await request(app)
      .delete('/recipes')
      .query({ userId: 'invalidUserId' })
      .expect(400);
  });
});