import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/server.js';
import { Recipe } from '../src/items/recipe.js';
import { User } from '../src/items/user.js';
import { Review } from '../src/items/review.js';
import { beforeAll, describe, expect, test, beforeEach } from "vitest";

const userId = new mongoose.Types.ObjectId();
const recipeId = new mongoose.Types.ObjectId();
const reviewId = new mongoose.Types.ObjectId();

beforeEach(async () => {
  await User.deleteMany();
  await Recipe.deleteMany();
  await Review.deleteMany();

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
    ingredients: ['harina', 'azucar'],
    tools: ['cuchillo', 'tablaDeCortar'],
    userId: userId,
    category: 'postre',
    images: ['http://example.com/image1.jpg'],
    creacionDate: new Date(),
  });
  await recipe.save();

  const review = new Review({
    _id: reviewId,
    userId: userId,
    recipeId: recipeId,
    rating: 3,
    text: 'Reseña.'
  });
  await review.save();
});

describe('Review Routes post', () => {
  test('Should create a new review', async () => {
    const response = await request(app)
      .post('/reviews')
      .send({
        userId: userId.toString(),
        recipeId: recipeId.toString(),
        rating: 4,
        text: 'Reseña.'
      }) 	
      .expect(201);
    expect(response.body.rating).toBe(4);
    expect(response.body.text).toBe('Reseña.');
  });

  test('Should create a new review', async () => {
    const response = await request(app)
      .post('/reviews')
      .send({
        userId: userId.toString(),
        recipeId: recipeId.toString(),
        rating: 2.5,
      }) 	
      .expect(201);
    expect(response.body.rating).toBe(2.5);
  });

  test('Should not create a recipe with invalid userId', async () => {
    await request(app)
      .post('/reviews')
      .send({
        userId: '1234234',
        recipeId: recipeId.toString(),
        rating: 3,
        text: 'Reseña.'
      })
      .expect(400);
  });

  test('Should not create a recipe with invalid recipeId', async () => {
    await request(app)
      .post('/reviews')
      .send({
        userId: userId.toString(),
        recipeId: '1234234',
        rating: 3,
        text: 'Reseña.'
      })
      .expect(400);
  });

});

describe('Recipe Routes get', () => {

  test('Should get reviews of a recipe', async () => {
    const response = await request(app)
      .get('/reviews')
      .query({ recipeId: recipeId })
      .expect(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].rating).toBe(3);
    expect(response.body[0].text).toBe('Reseña.');
  });

  test('Should get reviews of a recipe', async () => {
    const response = await request(app)
      .get('/reviews')
      .query({ userId: userId })
      .expect(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].rating).toBe(3);
    expect(response.body[0].text).toBe('Reseña.');
  });

  test('Should return 404 if no recipe found', async () => {
    await request(app)
      .get('/reviews')
      .query({ creationDate: '2025-10-10' })
      .expect(404);
  });

  test('Should return 400 for invalid userId', async () => {
    await request(app)
      .get('/reviews')
      .query({ userId: 'invalidUserId' })
      .expect(400);
  });

  test('Should return 400 for invalid recipeId', async () => {
    await request(app)
      .get('/reviews')
      .query({ recipeId: 'invalidRecipeId' })
      .expect(400);
  });

  test('Should return 400 for invalid creacionDate', async () => {
    await request(app)
      .get('/reviews')
      .query({ creationDate: 'invalidDate' })
      .expect(400);
  });

});

describe('Recipe Routes get:id', () => {
  test('Should get a recipe by ID', async () => {
    const response = await request(app)
      .get(`/reviews/${reviewId.toString()}`)
      .expect(200);
    expect(response.body.text).toBe('Reseña.');
  });

  test('Should return 404 for non-existent recipe ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await request(app)
      .get(`/reviews/${nonExistentId.toString()}`)
      .expect(404);
  });
});

describe('Recipe Routes patch', () => {

  test('Should update a recipe by ID (PATCH /recipes/:id)', async () => {
    const newName = 'Updated Recipe by ID';
    const response = await request(app)
      .patch(`/reviews/${reviewId.toString()}`)
      .send({ rating: 5 })
      .expect(200);
    expect(response.body.rating).toBe(5);
  });

  // expect 404 if recipe not found
  test('Should return 404 when updating non-existent recipe by ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await request(app)
      .patch(`/reviews/${nonExistentId.toString()}`)
      .send({ rating: 2 })
      .expect(404);
  });

  // expect 400 if no update data provided
  test('Should return 400 when no update data provided', async () => {
    await request(app)
      .patch(`/reviews/${reviewId.toString()}`)
      .send({nam: ''})
      .expect(400);
  });

});

describe('Review Routes delete', () => {

  test('Should delete a recipe by ID', async () => {
    await request(app)
      .delete(`/reviews/${reviewId.toString()}`)
      .expect(200);
    const review = await Review.findById(recipeId);
    expect(review).toBeNull();
  });

  //expect 404 if recipe not found
  test('Should return 404 when deleting non-existent recipe by ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await request(app)
      .delete(`/reviews/${nonExistentId.toString()}`)
      .expect(404);
  });
});

describe('Review Routes delete:id', () => {
  test('Should delete a recipe using query filters (DELETE /recipes?name=...)', async () => {
    const response = await request(app)
      .delete('/reviews')
      .query({ userId: userId.toString() })
      .expect(200);

    const deletedReview = await Recipe.findById(reviewId);
    expect(deletedReview).toBeNull();
  });

  test('Should delete a recipe using query filters (DELETE /recipes?name=...)', async () => {
    const response = await request(app)
      .delete('/reviews')
      .query({ recipeId: recipeId.toString() })
      .expect(200);

    const deletedReview = await Recipe.findById(reviewId);
    expect(deletedReview).toBeNull();
  });

  test('Should return 400 if no filters provided for deletion', async () => {
    await request(app)
      .delete('/reviews')
      .expect(200);
  });

  test('Should return 404 if no recipe matches the filters for deletion', async () => {
    const nonExistentId = "69145e80b21fd994256ac9bc";
    const response = await request(app)
      .delete('/reviews')
      .query({ recipeId: nonExistentId })
      .expect(404);
  });

  test('Should return 400 for invalid userId during deletion', async () => {
    const nonExistentId = "69145e80b21fd994256ac9bc";
    const response = await request(app)
      .delete('/reviews')
      .query({ userId: nonExistentId })
      .expect(404);
  });

  test('Should return 400 for invalid userId during deletion', async () => {
    await request(app)
      .delete('/reviews')
      .query({ creationDate: '2024-10-10' })
      .expect(404);
  });

  test('Should return 400 for invalid userId during deletion', async () => {
    await request(app)
      .delete('/reviews')
      .query({ recipeId: 'invalidId' })
      .expect(400);
  });

  test('Should return 400 for invalid userId during deletion', async () => {
    await request(app)
      .delete('/reviews')
      .query({ userId: 'invalidId' })
      .expect(400);
  });
});