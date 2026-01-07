import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/server.js';
import { Recipe } from '../src/items/recipe.js';
import { User } from '../src/items/user.js';
import { Review } from '../src/items/review.js';
import { beforeAll, describe, expect, test, beforeEach, afterAll } from "vitest";

const userId = new mongoose.Types.ObjectId();
const recipeId = new mongoose.Types.ObjectId();
const reviewId = new mongoose.Types.ObjectId();

//limpieza global tras todos los tests
afterAll(async () => {
  await User.deleteMany({});
  await Recipe.deleteMany({});
  await Review.deleteMany({});
});

//tests de post/reviews
describe('Review Routes: POST /reviews', () => {
  let userId: string;
  let recipeId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Review.deleteMany({});

    const user = await new User({
      username: 'CriticoGastronomico',
      _id: '000000000000000000000105',
      email: 'critico@test.com',
      password: 'Password123!',
      categories: ['otro']
    }).save();
    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Pasta Carbonara',
      _id: '000000000000000000000115',
      steps: 'Cocer pasta y añadir salsa.',
      ingredients: [{ ingredient: 'harina', quantity: '1' }],
      tools: ['olla'],
      userId: user._id,
      category: ['pasta']
    }).save();
    recipeId = recipe._id.toString();
  });

  //test success y crear reseña válida
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

  //test error rating > 5
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

  //test error rating < 0
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

  //test error campos obligatorios faltantes
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

//tests de get/reviews
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
      _id: '000000000000000000000106',
      email: 'test@gourmet.com',
      password: 'Password123!',
      categories: ['otro']
    }).save();
    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Gazpacho',
      _id: '000000000000000000000116',
      steps: 'Triturar verduras.',
      ingredients: [{ ingredient: 'harina', quantity: '1' }],
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

  //test success filter recipeId y popular user data
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

  //test success filter userId
  test('SUCCESS: Should filter reviews by userId', async () => {
    const response = await request(app)
      .get('/reviews')
      .query({ userId: userId })
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].userId._id).toBe(userId);
  });

  //test success filter creationDate
  test('SUCCESS: Should filter by exact day in creationDate', async () => {
    const response = await request(app)
      .get('/reviews')
      .query({ creationDate: creationDateStr })
      .expect(200);

    expect(response.body.length).toBe(1);
    const responseDate = new Date(response.body[0].creationDate).toISOString();
    expect(responseDate).toContain(creationDateStr);
  });

  //test success no reviews match
  test('SUCCESS: Should return an empty array if no reviews match', async () => {
    const otherRecipeId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get('/reviews')
      .query({ recipeId: otherRecipeId.toString() })
      .expect(200);

    expect(response.body).toEqual([]);
  });

  //test error invalid userId format
  test('ERROR: Should return 400 for invalid userId format', async () => {
    const response = await request(app)
      .get('/reviews')
      .query({ userId: 'invalid-id' })
      .expect(400);

    expect(response.body.error).toBe('ID de usuario no válido.');
  });

  //test error invalid recipeId format
  test('ERROR: Should return 400 for invalid creationDate format', async () => {
    const response = await request(app)
      .get('/reviews')
      .query({ creationDate: 'esto-no-es-una-fecha' })
      .expect(400);

    expect(response.body.error).toBe('Fecha de creación no válida.');
  });
});

//tests de get/reviews/:id
describe('Review Routes: GET /reviews/:id', () => {
  let reviewId: string;
  let userId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Review.deleteMany({});

    const user = await new User({
      username: 'CriticoExperto',
      _id: '000000000000000000000107',
      email: 'experto@test.com',
      password: 'Password123!',
      categories: ['otro'],
      profilePic: 'uploads/profiles/expert.jpg'
    }).save();
    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Tortilla de Patatas',
      _id: '000000000000000000000117',
      steps: 'Cocinar patatas y huevo.',
      ingredients: [{ ingredient: 'harina', quantity: '1' }],
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

  //test success get review details with populated user data
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

  //test error id valid pero no existe
  test('ERROR: Should return 404 if the ID is valid but does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get(`/reviews/${fakeId}`)
      .expect(404);

    expect(response.body.error).toBe('Reseña no encontrada.');
  });

  //test error id no válido
  test('ERROR: Should return 500 if the ID format is invalid', async () => {
    const response = await request(app)
      .get('/reviews/id-no-valido-123')
      .expect(500);

    expect(response.body).toBeDefined();
  });
});

//tests de patch/reviews/:id
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
      _id: '000000000000000000000108',
      email: 'editor@test.com',
      password: 'Password123!',
      categories: ['otro']
    }).save();
    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Ensalada Cesar',
      _id: '000000000000000000000118',
      steps: 'Mezclar todo.',
      ingredients: [{ ingredient: 'harina', quantity: '1' }],
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

  //test success update rating and text
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

  //test error intentar actualizar userId
  test('ERROR: Should not allow updating forbidden fields', async () => {
    const response = await request(app)
      .patch(`/reviews/${reviewId}`)
      .send({ userId: new mongoose.Types.ObjectId() })
      .expect(400);

    expect(response.body.error).toBe('Update is not permitted');
  });

  //test error rating out of range
  test('ERROR: Should fail if new rating is out of range', async () => {
    const response = await request(app)
      .patch(`/reviews/${reviewId}`)
      .send({ rating: 10 })
      .expect(400);
    expect(response.body.message).toBeDefined();
  });

  //test error review no existe
  test('ERROR: Should return 404 if review does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .patch(`/reviews/${fakeId}`)
      .send({ text: 'No importa' })
      .expect(404);
  });
});

//tests de delete/reviews
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
      _id: '000000000000000000000109',
      email: 'cleaner@test.com',
      password: 'Password123!',
      categories: ['otro']
    }).save();
    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Sopa de Letras',
      _id: '000000000000000000000119',
      steps: 'Cocer pasta.',
      ingredients: [{ ingredient: 'harina', quantity: '1' }],
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

  //test success delete all reviews for a recipe
  test('SUCCESS: Should delete all reviews for a specific recipe', async () => {
    const response = await request(app)
      .delete('/reviews')
      .query({ recipeId: recipeId })
      .expect(200);

    expect(response.body.deletedCount).toBe(3);

    const remaining = await Review.countDocuments({ recipeId });
    expect(remaining).toBe(0);
  });

  //test success delete reviews by specific date
  test('SUCCESS: Should delete reviews filtered by specific date', async () => {
    const response = await request(app)
      .delete('/reviews')
      .query({ creationDate: creationDateStr })
      .expect(200);

    expect(response.body.deletedCount).toBe(2);

    const totalInDb = await Review.countDocuments({});
    expect(totalInDb).toBe(1); 
  });

  //test error no reviews match filters
  test('ERROR: Should return 404 if no reviews match the filters', async () => {
    const otherUserId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .delete('/reviews')
      .query({ userId: otherUserId.toString() })
      .expect(404);

    expect(response.body.error).toBe('Reseña no encontrada con el filtro proporcionado.');
  });

  //test error invalid userId format
  test('ERROR: Should return 400 for invalid recipeId format', async () => {
    const response = await request(app)
      .delete('/reviews')
      .query({ recipeId: 'not-an-object-id' })
      .expect(400);

    expect(response.body.error).toBe('ID de usuario no válido.');
  });

  //test error invalid creationDate format
  test('ERROR: Should return 400 for invalid creationDate format', async () => {
    await request(app)
      .delete('/reviews')
      .query({ creationDate: 'fecha-falsa' })
      .expect(400);
  });
});

//tests de delete/reviews/:id
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
      _id: '000000000000000000000135',
      email: 'borrar@test.com',
      password: 'Password123!',
      categories: ['otro']
    }).save();
    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Batido de Fresa',
      _id: '000000000000000000000145',
      steps: 'Mezclar fresas y leche.',
      ingredients: [{ ingredient: 'harina', quantity: '1' }],
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

  //test success delete a specific review
  test('SUCCESS: Should delete a specific review and return its data', async () => {
    const response = await request(app)
      .delete(`/reviews/${reviewId}`)
      .expect(200);

    expect(response.body._id).toBe(reviewId);
    expect(response.body.text).toBe('Un comentario que será borrado.');

    const findReview = await Review.findById(reviewId);
    expect(findReview).toBeNull();
  });

  //test error 404
  test('ERROR: Should return 404 if the review ID does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .delete(`/reviews/${fakeId}`)
      .expect(404);
  });

 //test error id no válido
  test('ERROR: Should return 500 if the ID format is invalid', async () => {
    await request(app)
      .delete('/reviews/esto-no-es-un-id-valido')
      .expect(500);
  });
});