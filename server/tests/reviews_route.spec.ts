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

describe('Review Routes: POST /reviews', () => {
  let userId: string;
  let recipeId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Review.deleteMany({});

    const user = await new User({
      username: 'CriticoGastronomico',
      email: 'critico@test.com',
      password: 'Password123!',
      categories: ['otro']
    }).save();
    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Pasta Carbonara',
      steps: 'Cocer pasta y añadir salsa.',
      ingredients: [{ ingredient: 'pimiento', quantity: '1' }],
      tools: ['olla'],
      userId: user._id,
      category: ['pasta']
    }).save();
    recipeId = recipe._id.toString();
  });

  test('SUCCESS: Should create a valid review', async () => {
    const reviewData = {
      userId: userId,
      recipeId: recipeId,
      rating: 4.5,
      text: 'Increíble receta, me encantó el sabor.'
    };

    const response = await request(app)
      .post('/reviews')
      .send(reviewData)
      .expect(201);

    expect(response.body.rating).toBe(4.5);
    expect(response.body.text).toBe('Increíble receta, me encantó el sabor.');
    expect(response.body.userId).toBe(userId);
    expect(response.body.recipeId).toBe(recipeId);
    expect(response.body).toHaveProperty('creationDate');
  });

  test('ERROR: Should fail if rating is greater than 5', async () => {
    const invalidReview = {
      userId: userId,
      recipeId: recipeId,
      rating: 6, 
      text: 'Demasiado buena para ser verdad'
    };

    const response = await request(app)
      .post('/reviews')
      .send(invalidReview)
      .expect(400);
    expect(response.body.message).toContain('La valoración tiene que tener un valor entre 0 y 5');
  });

  test('ERROR: Should fail if rating is less than 0', async () => {
    await request(app)
      .post('/reviews')
      .send({
        userId: userId,
        recipeId: recipeId,
        rating: -1
      })
      .expect(400);
  });

  test('ERROR: Should fail if required fields are missing', async () => {
    await request(app)
      .post('/reviews')
      .send({
        userId: userId,
        text: 'Review incompleta'
      })
      .expect(400);
  });
});

describe('Review Routes: GET /reviews ', () => {
  let userId: string;
  let recipeId: string;
  let creationDateStr = '2025-05-15';

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Review.deleteMany({});

    const user = await new User({
      username: 'GourmetTester',
      email: 'test@gourmet.com',
      password: 'Password123!',
      categories: ['otro']
    }).save();
    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Gazpacho',
      steps: 'Triturar verduras.',
      ingredients: [{ ingredient: 'pimiento', quantity: '1' }],
      tools: ['batidora'],
      userId: user._id,
      category: ['entrante']
    }).save();
    recipeId = recipe._id.toString();

    await new Review({
      userId: userId,
      recipeId: recipeId,
      rating: 5,
      text: 'Excelente receta de verano.',
      creationDate: new Date(creationDateStr)
    }).save();
  });

  test('SUCCESS: Should filter reviews by recipeId and populate user data', async () => {
    const response = await request(app)
      .get('/reviews')
      .query({ recipeId: recipeId })
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].recipeId).toBe(recipeId);

    expect(response.body[0].userId.username).toBe('GourmetTester');
    expect(response.body[0].userId.profilePic).toBeDefined();
  });

  test('SUCCESS: Should filter reviews by userId', async () => {
    const response = await request(app)
      .get('/reviews')
      .query({ userId: userId })
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].userId._id).toBe(userId);
  });

  test('SUCCESS: Should filter by exact day in creationDate', async () => {
    const response = await request(app)
      .get('/reviews')
      .query({ creationDate: creationDateStr })
      .expect(200);

    expect(response.body.length).toBe(1);
    const responseDate = new Date(response.body[0].creationDate).toISOString();
    expect(responseDate).toContain(creationDateStr);
  });

  test('SUCCESS: Should return an empty array if no reviews match', async () => {
    const otherRecipeId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get('/reviews')
      .query({ recipeId: otherRecipeId.toString() })
      .expect(200);

    expect(response.body).toEqual([]);
  });

  test('ERROR: Should return 400 for invalid userId format', async () => {
    const response = await request(app)
      .get('/reviews')
      .query({ userId: 'invalid-id' })
      .expect(400);

    expect(response.body.error).toBe('ID de usuario no válido.');
  });

  test('ERROR: Should return 400 for invalid creationDate format', async () => {
    const response = await request(app)
      .get('/reviews')
      .query({ creationDate: 'esto-no-es-una-fecha' })
      .expect(400);

    expect(response.body.error).toBe('Fecha de creación no válida.');
  });
});

describe('Review Routes: GET /reviews/:id', () => {
  let reviewId: string;
  let userId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Review.deleteMany({});

    const user = await new User({
      username: 'CriticoExperto',
      email: 'experto@test.com',
      password: 'Password123!',
      categories: ['otro'],
      profilePic: 'uploads/profiles/expert.jpg'
    }).save();
    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Tortilla de Patatas',
      steps: 'Cocinar patatas y huevo.',
      ingredients: [{ ingredient: 'pimiento', quantity: '1' }],
      tools: ['sartén'],
      userId: user._id,
      category: ['desayuno']
    }).save();

    const review = await new Review({
      userId: user._id,
      recipeId: recipe._id,
      rating: 5,
      text: 'La mejor tortilla que he probado jamás.'
    }).save();
    
    reviewId = review._id.toString();
  });

  test('SUCCESS: Should return review details with populated user data', async () => {
    const response = await request(app)
      .get(`/reviews/${reviewId}`)
      .expect(200);

    expect(response.body.text).toBe('La mejor tortilla que he probado jamás.');
    expect(response.body.rating).toBe(5);
    expect(response.body.userId.username).toBe('CriticoExperto');
    expect(response.body.userId.profilePic).toBe('uploads/profiles/expert.jpg');
    expect(response.body.userId.password).toBeUndefined();
  });

  test('ERROR: Should return 404 if the ID is valid but does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get(`/reviews/${fakeId}`)
      .expect(404);

    expect(response.body.error).toBe('Reseña no encontrada.');
  });

  test('ERROR: Should return 500 if the ID format is invalid', async () => {
    const response = await request(app)
      .get('/reviews/id-no-valido-123')
      .expect(500);

    expect(response.body).toBeDefined();
  });
});

describe('Review Routes: PATCH /reviews/:id', () => {
  let reviewId: string;
  let userId: string;
  let recipeId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Review.deleteMany({});

    const user = await new User({
      username: 'UserEditor',
      email: 'editor@test.com',
      password: 'Password123!',
      categories: ['otro']
    }).save();
    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Ensalada Cesar',
      steps: 'Mezclar todo.',
      ingredients: [{ ingredient: 'pimiento', quantity: '1' }],
      tools: ['olla'],
      userId: user._id,
      category: ['entrante']
    }).save();
    recipeId = recipe._id.toString();

    const review = await new Review({
      userId: userId,
      recipeId: recipeId,
      rating: 2,
      text: 'Originalmente no me gustó mucho.'
    }).save();
    reviewId = review._id.toString();
  });

  test('SUCCESS: Should update rating and text correctly', async () => {
    const updateData = {
      rating: 5,
      text: 'Cambié de opinión, ¡está buenísima!'
    };

    const response = await request(app)
      .patch(`/reviews/${reviewId}`)
      .send(updateData)
      .expect(200);

    expect(response.body.rating).toBe(5);
    expect(response.body.text).toBe('Cambié de opinión, ¡está buenísima!');
  });

  test('ERROR: Should not allow updating forbidden fields', async () => {
    const response = await request(app)
      .patch(`/reviews/${reviewId}`)
      .send({ userId: new mongoose.Types.ObjectId() })
      .expect(400);

    expect(response.body.error).toBe('Update is not permitted');
  });

  test('ERROR: Should fail if new rating is out of range', async () => {
    const response = await request(app)
      .patch(`/reviews/${reviewId}`)
      .send({ rating: 10 })
      .expect(400);
    expect(response.body.message).toBeDefined();
  });

  test('ERROR: Should return 404 if review does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .patch(`/reviews/${fakeId}`)
      .send({ text: 'No importa' })
      .expect(404);
  });
});

describe('Review Routes: DELETE /reviews ', () => {
  let userId: string;
  let recipeId: string;
  let creationDateStr = '2025-12-19';

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Review.deleteMany({});

    const user = await new User({
      username: 'UserLimpiador',
      email: 'cleaner@test.com',
      password: 'Password123!',
      categories: ['otro']
    }).save();
    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Sopa de Letras',
      steps: 'Cocer pasta.',
      ingredients: [{ ingredient: 'pimiento', quantity: '1' }],
      tools: ['olla'],
      userId: user._id,
      category: ['entrante']
    }).save();
    recipeId = recipe._id.toString();

    await Review.insertMany([
      { userId, recipeId, rating: 4, text: 'Buena', creationDate: new Date(creationDateStr) },
      { userId, recipeId, rating: 5, text: 'Excelente', creationDate: new Date(creationDateStr) },
      { userId, recipeId, rating: 1, text: 'Mala', creationDate: new Date('2024-01-01') }
    ]);
  });

  test('SUCCESS: Should delete all reviews for a specific recipe', async () => {
    const response = await request(app)
      .delete('/reviews')
      .query({ recipeId: recipeId })
      .expect(200);

    expect(response.body.deletedCount).toBe(3);

    const remaining = await Review.countDocuments({ recipeId });
    expect(remaining).toBe(0);
  });

  test('SUCCESS: Should delete reviews filtered by specific date', async () => {
    const response = await request(app)
      .delete('/reviews')
      .query({ creationDate: creationDateStr })
      .expect(200);

    expect(response.body.deletedCount).toBe(2);

    const totalInDb = await Review.countDocuments({});
    expect(totalInDb).toBe(1); 
  });

  test('ERROR: Should return 404 if no reviews match the filters', async () => {
    const otherUserId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .delete('/reviews')
      .query({ userId: otherUserId.toString() })
      .expect(404);

    expect(response.body.error).toBe('Reseña no encontrada con el filtro proporcionado.');
  });

  test('ERROR: Should return 400 for invalid recipeId format', async () => {
    const response = await request(app)
      .delete('/reviews')
      .query({ recipeId: 'not-an-object-id' })
      .expect(400);

    expect(response.body.error).toBe('ID de usuario no válido.');
  });

  test('ERROR: Should return 400 for invalid creationDate format', async () => {
    await request(app)
      .delete('/reviews')
      .query({ creationDate: 'fecha-falsa' })
      .expect(400);
  });
});

describe('Review Routes: DELETE /reviews/:id', () => {
  let reviewId: string;
  let userId: string;
  let recipeId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Review.deleteMany({});

    const user = await new User({
      username: 'UserParaBorrar',
      email: 'borrar@test.com',
      password: 'Password123!',
      categories: ['otro']
    }).save();
    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Batido de Fresa',
      steps: 'Mezclar fresas y leche.',
      ingredients: [{ ingredient: 'pimiento', quantity: '1' }],
      tools: ['batidora'],
      userId: user._id,
      category: ['postre']
    }).save();
    recipeId = recipe._id.toString();

    const review = await new Review({
      userId: userId,
      recipeId: recipeId,
      rating: 3,
      text: 'Un comentario que será borrado.'
    }).save();
    reviewId = review._id.toString();
  });

  test('SUCCESS: Should delete a specific review and return its data', async () => {
    const response = await request(app)
      .delete(`/reviews/${reviewId}`)
      .expect(200);

    expect(response.body._id).toBe(reviewId);
    expect(response.body.text).toBe('Un comentario que será borrado.');

    const findReview = await Review.findById(reviewId);
    expect(findReview).toBeNull();
  });

  test('ERROR: Should return 404 if the review ID does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .delete(`/reviews/${fakeId}`)
      .expect(404);
  });

  test('ERROR: Should return 500 if the ID format is invalid', async () => {
    await request(app)
      .delete('/reviews/esto-no-es-un-id-valido')
      .expect(500);
  });
});