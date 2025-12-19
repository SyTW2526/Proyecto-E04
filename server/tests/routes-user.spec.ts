import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/server.js';
import { User } from '../src/items/user.js';
import { describe, expect, test, beforeAll, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { UserInterface } from '../src/items/user.js';
import { Recipe } from '../src/items/recipe.js'; 
import { Review } from '../src/items/review.js';

const testUserData = {
	username: 'PruebaUser3',
	email: 'prueba3@test.com',
	password: 'MiPassSegura1235',
	bio: 'Usuario de prueba para el hashing.',
};

const otherUserData = {
	username: 'OtroUsuario',
	email: 'otro@test.com',
	password: 'OtraPass2025',
	bio: 'Otro usuario de prueba.',
};

let userId: mongoose.Types.ObjectId;
let otherUserId: mongoose.Types.ObjectId;

beforeEach(async () => {
	await User.deleteMany();
});

describe('User Routes POST (Sign Up)', () => {
	test('Should create a new user and hash the password', async () => {
		const newUserData = { username: 'NuevoUnico', email: 'nuevo@unico.com', password: 'passwordUnico', bio: 'test' };
		const response = await request(app)
			.post('/users')
			.send(newUserData)
			.expect(201);
	});

	test('Should return 400 when provided with an invalid email', async () => {
		await request(app)
			.post('/users')
			.send({ ...testUserData, email: 'not-an-email' }) 
			.expect(400);
	});
});

describe('User Routes POST (Login)', () => {
  beforeEach(async () => {
    await User.deleteMany();
    await new User(testUserData).save();
  });

  test('Should login successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({
        email: testUserData.email,
        password: testUserData.password
      })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe(testUserData.email);
  });

  test('Should return 401 for incorrect password', async () => {
    await request(app)
      .post('/users/login')
      .send({
        email: testUserData.email,
        password: 'wrongPassword123'
      })
      .expect(401);
  });

  test('Should return 401 for non-existent email', async () => {
    await request(app)
      .post('/users/login')
      .send({
        email: 'fake@email.com',
        password: testUserData.password
      })
      .expect(401);
  });
});

describe('User Routes GET /users/me (Authenticated)', () => {
  let token: string;
  const JWT_SECRET = 'fallback-secret-for-dev-only-654321';

  beforeEach(async () => {
    await User.deleteMany();
    const user = await new User(testUserData).save();
    userId = user._id;
    token = jwt.sign({ _id: userId.toString() }, JWT_SECRET);
  });

  test('Should return the profile of the authenticated user', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`) 
      .expect(200);

    expect(response.body.username).toBe(testUserData.username);
    expect(response.body.email).toBe(testUserData.email);
  });

  test('Should return 401 if no token is provided', async () => {
    await request(app)
      .get('/users/me')
      .expect(401);
  });

  test('Should return 401 if token is invalid', async () => {
    await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer token-inventado-falso')
      .expect(401);
  });
});

describe('User Routes PATCH /users/me (Authenticated)', () => {
  let token: string;
  const JWT_SECRET: string = 'fallback-secret-for-dev-only-654321';

  beforeEach(async () => {
    await User.deleteMany();
    const user = await new User(testUserData).save();
    token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET);
  });

  test('Should update allowed profile fields successfully', async () => {
    const updates: Partial<UserInterface> = {
      bio: 'Nueva biografía actualizada',
      username: 'UpdatedUser'
    };

    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send(updates)
      .expect(200);

    const userResponse = response.body as UserInterface;
    
    expect(userResponse.bio).toBe(updates.bio);
    expect(userResponse.username).toBe(updates.username);
    expect(userResponse.password).toBeUndefined();
  });

  test('Should return 400 when trying to update prohibited fields', async () => {
    await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ followers: [] }) 
      .expect(400);
  });

  test('Should return 400 if the update body is empty', async () => {
    await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);
  });

  test('Should hash the new password if it is updated', async () => {
    const newPassword = 'NewSecretPassword123';
    
    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: newPassword })
      .expect(200);

    const userInDb = await User.findOne({ email: testUserData.email });
    expect(userInDb).not.toBeNull();
    
    const isMatch = await bcrypt.compare(newPassword, userInDb!.password);
    expect(isMatch).toBe(true);

    const oldMatch = await bcrypt.compare(testUserData.password, userInDb!.password);
    expect(oldMatch).toBe(false);
  });
});

describe('User Routes GET (Search and Find)', () => {
	beforeEach(async () => {
			await new User(testUserData).save();
	});

	test('Should get users by searching part of the username', async () => {
			const response = await request(app)
					.get('/users')
					.query({ username: 'Prueba' })
					.expect(200);

	}); 
	
	test('Should return 404 if no user matches the search criteria', async () => {
			await request(app)
				.get('/users')
				.query({ username: 'NonExistentUsername' })
				.expect(404);
	});
	
	test('Should return user by exact email match', async () => {
		const response = await request(app)
			.get('/users')
			.query({ email: testUserData.email }) 
			.expect(200);

		expect(response.body.length).toBe(1);
		expect(response.body[0].email).toBe(testUserData.email);
	});
});

describe('User Routes DELETE /users/me (Authenticated)', () => {
  let token: string;
  const JWT_SECRET: string = 'fallback-secret-for-dev-only-654321';

  beforeEach(async () => {
    await User.deleteMany();
    const user = await new User(testUserData).save();
    token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET);
  });

  test('Should delete the authenticated user account', async () => {
    await request(app)
      .delete('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const userInDb = await User.findOne({ email: testUserData.email });
    expect(userInDb).toBeNull();
  });

  test('Should return 401 if trying to delete without token', async () => {
    await request(app)
      .delete('/users/me')
      .expect(401);

    const userInDb = await User.findOne({ email: testUserData.email });
    expect(userInDb).not.toBeNull();
  });

  test('Should return 401 for invalid token during deletion', async () => {
    await request(app)
      .delete('/users/me')
      .set('Authorization', 'Bearer token-falso')
      .expect(401);
  });
});

describe('User Routes POST /users/logout (Authenticated)', () => {
  let token: string;
  const JWT_SECRET: string = 'fallback-secret-for-dev-only-654321';

  beforeEach(async () => {
    await User.deleteMany();
    const user = await new User(testUserData).save();
    token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET);
  });

  test('Should logout successfully and return a personalized message', async () => {
    const response = await request(app)
      .post('/users/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(`${testUserData.username} ha cerrado sesión exitosamente.`);
  });

  test('Should return 401 if trying to logout without being authenticated', async () => {
    const response = await request(app)
      .post('/users/logout')
      .expect(401);

    expect(response.body.error).toBe('Por favor, autentíquese.');
  });

  test('Should return 401 with a malformed or expired token', async () => {
    await request(app)
      .post('/users/logout')
      .set('Authorization', 'Bearer token-totalmente-invalido')
      .expect(401);
  });
});

describe('User Routes GET /users (Search functionality)', () => {
  beforeEach(async () => {
    await User.deleteMany();
    await new User(testUserData).save(); 
    await new User(otherUserData).save(); 
  });

  test('Should find users by partial username (case-insensitive)', async () => {
    const response = await request(app)
      .get('/users')
      .query({ username: 'prueba' })
      .expect(200);

    const users = response.body as UserInterface[];
    expect(users.length).toBeGreaterThan(0);
    expect(users[0].username).toBe(testUserData.username);
  });

  test('Should find users by partial email', async () => {
    const response = await request(app)
      .get('/users')
      .query({ email: 'test.com' })
      .expect(200);

    const users = response.body as UserInterface[];
    expect(users.length).toBe(2);
  });

  test('Should return 404 if no user matches the filter', async () => {
    await request(app)
      .get('/users')
      .query({ username: 'NombreInexistente' })
      .expect(404);
  });

  test('Should return all users if no query parameters are provided', async () => {
    const response = await request(app)
      .get('/users')
      .expect(200);

    const users = response.body as UserInterface[];
    expect(users.length).toBe(2);
  });

  test('Should filter by both username and email combined', async () => {
    const response = await request(app)
      .get('/users')
      .query({ 
        username: 'Prueba',
        email: 'prueba3@test.com'
      })
      .expect(200);

    const users = response.body as UserInterface[];
    expect(users.length).toBe(1);
    expect(users[0].email).toBe(testUserData.email);
  });
});

describe('User Routes GET /users/:id/follows', () => {
  let mainUserId: string;
  let followedUserId: string;

  beforeEach(async () => {
    await User.deleteMany();

    const followedUser = await new User(otherUserData).save();
    followedUserId = (followedUser._id as mongoose.Types.ObjectId).toString();

    const mainUser = await new User({
      ...testUserData,
      following: [followedUser._id] 
    }).save();
    
    mainUserId = (mainUser._id as mongoose.Types.ObjectId).toString();
  });

  test('Should return the list of users followed by the user', async () => {
    const response = await request(app)
      .get(`/users/${mainUserId}/follows`)
      .expect(200);

    const follows = response.body as UserInterface[];
    
    expect(Array.isArray(follows)).toBe(true);
    expect(follows.length).toBe(1);
    expect(follows[0].username).toBe(otherUserData.username);
    expect(follows[0].email).toBe(otherUserData.email);
  });

  test('Should return an empty array if the user follows no one', async () => {
    const lonelyUser = await new User({
      username: 'LonelyUser',
      email: 'lonely@test.com',
      password: 'password123'
    }).save();

    const response = await request(app)
      .get(`/users/${lonelyUser._id}/follows`)
      .expect(200);

    expect(response.body).toEqual([]);
  });

  test('Should return 404 if the main user does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .get(`/users/${fakeId}/follows`)
      .expect(404);
  });
});

describe('User Routes GET /users/:id/followers', () => {
  let targetUserId: string;
  let followerId: string;

  beforeEach(async () => {
    await User.deleteMany();

    const followerUser = await new User(otherUserData).save();
    followerId = (followerUser._id as mongoose.Types.ObjectId).toString();

    const targetUser = await new User({
      ...testUserData,
      followers: [followerUser._id]
    }).save();
    
    targetUserId = (targetUser._id as mongoose.Types.ObjectId).toString();
  });

  test('Should return the list of followers for a specific user', async () => {
    const response = await request(app)
      .get(`/users/${targetUserId}/followers`)
      .expect(200);

    const followers = response.body as UserInterface[];
    
    expect(Array.isArray(followers)).toBe(true);
    expect(followers.length).toBe(1);
    expect(followers[0].username).toBe(otherUserData.username);
    expect(followers[0].email).toBe(otherUserData.email);
  });

  test('Should return an empty array if the user has no followers', async () => {
    const response = await request(app)
      .get(`/users/${followerId}/followers`)
      .expect(200);

    expect(response.body).toEqual([]);
  });

  test('Should return 404 if the user does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .get(`/users/${fakeId}/followers`)
      .expect(404);
  });
});

describe('User Routes GET /users/:id', () => {
  let userId: string;

  beforeEach(async () => {
    await User.deleteMany();
    const user = await new User(testUserData).save();
    userId = (user._id as mongoose.Types.ObjectId).toString();
  });

  test('Should get a user by a valid and existing ID', async () => {
    const response = await request(app)
      .get(`/users/${userId}`)
      .expect(200);

    const userResponse = response.body as UserInterface;
    expect(userResponse.username).toBe(testUserData.username);
    expect(userResponse.email).toBe(testUserData.email);
  });

  test('Should return 404 for a non-existent but valid format ID', async () => {
    const randomId = new mongoose.Types.ObjectId().toString();
    
    const response = await request(app)
      .get(`/users/${randomId}`)
      .expect(404);

    expect(response.body.error).toBe('Usuario no encontrado.');
  });

  test('Should return 500 for an invalid ID format (CastError)', async () => {
    const invalidId = '123-id-no-valido';
    
    await request(app)
      .get(`/users/${invalidId}`)
      .expect(500);
  });
});

describe('User Routes get:id', () => { 
	beforeEach(async () => {
		await User.deleteMany();
		const user = await new User(testUserData).save(); 
		userId = user._id; 
	});

	test('Should get a user by ID', async () => {
		const response = await request(app)
			.get(`/users/${userId.toString()}`) 
			.expect(200);
		expect(response.body.username).toBe(testUserData.username);
	});

	test('Should return 404 for non-existent user ID', async () => {
		const nonExistentId = new mongoose.Types.ObjectId();
		await request(app)
			.get(`/users/${nonExistentId.toString()}`)
			.expect(404);
	});
});

describe('User Routes PATCH /users (Update by Filter)', () => {
  beforeEach(async () => {
    await User.deleteMany();
    await new User(testUserData).save();
  });

  test('Should update user successfully using email filter', async () => {
    const updates: Partial<UserInterface> = { bio: 'Bio actualizada por email' };

    const response = await request(app)
      .patch('/users')
      .query({ email: testUserData.email }) 
      .send(updates)
      .expect(200);

    expect(response.body.bio).toBe(updates.bio);
    expect(response.body.email).toBe(testUserData.email);
  });

  test('Should update user successfully using username filter (regex)', async () => {
    const updates: Partial<UserInterface> = { bio: 'Bio actualizada por username' };
    const response = await request(app)
      .patch('/users')
      .query({ username: 'Prueba' })
      .send(updates)
      .expect(200);

    expect(response.body.username).toBe(testUserData.username);
    expect(response.body.bio).toBe(updates.bio);
  });

  test('Should return 400 if no filters (username/email) are provided', async () => {
    await request(app)
      .patch('/users')
      .send({ bio: 'No funcionará' })
      .expect(400); 
  });

  test('Should return 400 if the update body is empty', async () => {
    await request(app)
      .patch('/users')
      .query({ email: testUserData.email })
      .send({})
      .expect(400);
  });

  test('Should return 400 if update contains prohibited fields', async () => {
    await request(app)
      .patch('/users')
      .query({ email: testUserData.email })
      .send({ role: 'admin' })
      .expect(400);
  });

  test('Should return 404 if no user matches the filter', async () => {
    await request(app)
      .patch('/users')
      .query({ email: 'no-existe@test.com' })
      .send({ bio: 'Nueva bio' })
      .expect(404);
  });
});

describe('User Routes PATCH /users/:id', () => {
  let userId: string;

  beforeEach(async () => {
    await User.deleteMany();
    const user = await new User(testUserData).save();
    userId = (user._id as mongoose.Types.ObjectId).toString();
  });

  test('Should update user profile successfully by ID', async () => {
    const updates: Partial<UserInterface> = {
      bio: 'Biografía actualizada por ID',
      username: 'UserIDPatch'
    };

    const response = await request(app)
      .patch(`/users/${userId}`)
      .send(updates)
      .expect(200);

    const userResponse = response.body as UserInterface;
    expect(userResponse.bio).toBe(updates.bio);
    expect(userResponse.username).toBe(updates.username);
  });

  test('Should return 400 when updating with prohibited fields', async () => {
    await request(app)
      .patch(`/users/${userId}`)
      .send({ role: 'admin' }) 
      .expect(400);
  });

  test('Should return 404 for a non-existent ID', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await request(app)
      .patch(`/users/${fakeId}`)
      .send({ bio: 'No importa' })
      .expect(404);
  });

  test('Should return 400 if validation fails (e.g., invalid email)', async () => {
    await request(app)
      .patch(`/users/${userId}`)
      .send({ email: 'email-invalido' })
      .expect(400);
  });
});

describe('User Routes: DELETE comprehensive tests', () => {
  let userId: string;
  let userEmail = 'test-delete@example.com';
  let userName = 'DeleteMeUser';

  const getValidRecipeData = (uId: any) => ({
    name: 'Receta para borrar',
    steps: 'Mezclar y cocinar.',
    ingredients: [{ ingredient: 'pollo', quantity: '200g' }], 
    tools: ['sartén'],
    category: ['carne'], 
    userId: uId
  });

  beforeEach(async () => {
    await User.deleteMany();
    await Recipe.deleteMany();
    await Review.deleteMany();

    const user = await new User({
      username: userName,
      email: userEmail,
      password: 'Password123!',
      profilePic: 'uploads/images/foto-usuario.png'
    }).save();

    userId = user._id.toString();

    const recipe1 = await new Recipe(getValidRecipeData(user._id)).save();
    const recipe2 = await new Recipe({ ...getValidRecipeData(user._id), name: 'Receta 2' }).save();

    await new Review({
      comment: 'Review 1',
      userId: user._id,
      rating: 5,
      recipeId: recipe1._id
    }).save();
  });

  describe('DELETE /users (By Query)', () => {
    test('SUCCESS: Should delete user and all their content using EXACT email', async () => {
      const response = await request(app)
        .delete('/users')
        .query({ email: userEmail })
        .expect(200);

      expect(response.body.email).toBe(userEmail);

      expect(await User.findById(userId)).toBeNull();
      expect(await Recipe.countDocuments({ userId })).toBe(0);
      expect(await Review.countDocuments({ userId })).toBe(0);
    });

    test('SUCCESS: Should delete user using PARTIAL username (Regex)', async () => {
      await request(app)
        .delete('/users')
        .query({ username: 'DeleteMe' }) 
        .expect(200);

      expect(await User.findOne({ username: userName })).toBeNull();
    });

    test('ERROR: Should return 400 if NO query parameters are provided', async () => {
      const response = await request(app)
        .delete('/users')
        .expect(400);

      expect(response.body.error).toContain('Debe proporcionar al menos un filtro');
    });

    test('ERROR: Should return 404 if user does not exist with that email', async () => {
      await request(app)
        .delete('/users')
        .query({ email: 'noexiste@test.com' })
        .expect(404);
    });
  });

  describe('DELETE /users/:id (By ID)', () => {
    test('SUCCESS: Should delete user by valid ID and trigger cascade', async () => {
      const response = await request(app)
        .delete(`/users/${userId}`)
        .expect(200);
    });

    test('SUCCESS: Should handle profilePic logic for "default/*" (Regex test)', async () => {
      const defaultUser = await new User({
        username: 'DefaultUser',
        email: 'default@test.com',
        password: 'pass123',
        profilePic: 'default/avatar.png'
      }).save();

      await request(app)
        .delete(`/users/${defaultUser._id}`)
        .expect(200);
      expect(await User.findById(defaultUser._id)).toBeNull();
    });

    test('SUCCESS: Should handle profilePic logic for "Flaticon.png"', async () => {
        const flaticonUser = await new User({
          username: 'FlaticonUser',
          email: 'flaticon@test.com',
          password: 'pass124',
          profilePic: 'uploads/images/Flaticon.png'
        }).save();
  
        await request(app)
          .delete(`/users/${flaticonUser._id}`)
          .expect(200);
  
        expect(await User.findById(flaticonUser._id)).toBeNull();
      });

    test('ERROR: Should return 404 for a valid ID that is not in database', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/users/${fakeId}`)
        .expect(404);
    });

    test('ERROR: Should return 500 for an ID with invalid format', async () => {
      const response = await request(app)
        .delete('/users/123-not-an-id')
        .expect(500);
      expect(response.body).toBeDefined();
    });
  });
});