import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/server.js';
import { User, UserInterface } from '../src/items/user.js';
import { Recipe } from '../src/items/recipe.js';
import { Review } from '../src/items/review.js';
import { describe, expect, test, beforeEach, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'fallback-secret-for-dev-only-654321';

// Datos de prueba comunes
const testUserData = {
  username: 'ChefMaster',
  _id: '000000000000000000000101',
  email: 'chef@test.com',
  password: 'Password123!',
  bio: 'Amante de la cocina mediterránea.',
  categories: ['pasta', 'vegano']
};

// Otro usuario para pruebas relacionadas con seguidores
const otherUserData = {
  username: 'OtroChef',
  _id: '000000000000000000000102',
  email: 'otro@test.com',
  password: 'OtraPassword123!',
  categories: ['otro']
};

let userId: string;
let token: string;

const userEmail = 'test-delete@example.com';
const userName = 'DeleteMeUser';

// Limpiar y preparar la base de datos antes de cada prueba
beforeEach(async () => {
  await User.deleteMany({});
  await Recipe.deleteMany({});
  await Review.deleteMany({});


  const user = await new User(testUserData).save();
  userId = user._id.toString();
  token = jwt.sign({ _id: userId }, JWT_SECRET);
});

// Limpiar la base de datos después de todas las pruebas
afterAll(async () => {
  await User.deleteMany({});
  await Recipe.deleteMany({});
  await Review.deleteMany({});
});

// Tests para las rutas de usuario
describe('User Routes POST', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  //test de creación de usuario
  test('Should create a new user by explicitly sending valid categories', async () => {
    const newUserData = { 
      username: 'NuevoUnico', 
      _id: '000000000000000000000103',
      email: 'nuevo@unico.com', 
      password: 'passwordUnico', 
      bio: 'test',
      categories: ['otro'] 
    };

    const response = await request(app)
      .post('/users')
      .send(newUserData)
      .expect(201);

  });

  //test de error al crear usuario con email inválido
  test('Should return 400 when provided with an invalid email', async () => {
    await request(app)
      .post('/users')
      .send({ ...testUserData, email: 'not-an-email' }) 
      .expect(400);
  });

  //test de error al crear usuario con email ya existente
  test('Should return 401 for incorrect credentials', async () => {
    await request(app)
      .post('/users/login')
      .send({ email: testUserData.email, password: 'wrongPassword' })
      .expect(401);
  });
});

// Tests para las rutas de usuario
describe('User Routes POST', () => {
  beforeEach(async () => {
    await User.deleteMany();
    await new User(testUserData).save();
  });

  //test de login de usuario
  test('Should login successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({
        email: testUserData.email,
        password: testUserData.password
      })
      .expect(200);

    expect(response.body.user.email).toBe(testUserData.email);
  });

  //test de error al hacer login con contraseña incorrecta
  test('Should return 401 for incorrect password', async () => {
    await request(app)
      .post('/users/login')
      .send({
        email: testUserData.email,
        password: 'wrongPassword123'
      })
      .expect(401);
  });

  //test de error al hacer login con email inexistente
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

// Tests para las rutas de usuario autenticado
describe('User Routes GET /users/me', () => {
  let token: string;
  const JWT_SECRET = 'fallback-secret-for-dev-only-654321';

  beforeEach(async () => {
    await User.deleteMany();
    const user = await new User(testUserData).save();
    userId = user._id.toString();
    token = jwt.sign({ _id: userId.toString() }, JWT_SECRET);
  });

  //test de obtención del perfil del usuario autenticado
  test('Should return the profile of the authenticated user', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Cookie', `token=${token}`)
      .expect(200);

    expect(response.body.username).toBe(testUserData.username);
    expect(response.body.email).toBe(testUserData.email);
  });

  //test de error al obtener perfil sin token
  test('Should return 401 if no token is provided', async () => {
    await request(app)
      .get('/users/me')
      .expect(401);
  });

  //test de error al obtener perfil con token inválido
  test('Should return 401 if token is invalid', async () => {
    await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer token-inventado-falso')
      .expect(401);
  });
});

// Tests para las rutas de actualización de usuario
describe('User Routes PATCH /users/me', () => {
  let token: string;
  const JWT_SECRET: string = 'fallback-secret-for-dev-only-654321';

  beforeEach(async () => {
    await User.deleteMany();
    const user = await new User(testUserData).save();
    token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET);
  });

  //test de actualización exitosa de campos permitidos del perfil
  test('Should update allowed profile fields successfully', async () => {
    const updates: Partial<UserInterface> = {
      bio: 'Nueva biografía actualizada',
      username: 'UpdatedUser'
    };

    const response = await request(app)
      .patch('/users/me')
      .set('Cookie', `token=${token}`)
      .send(updates)
      .expect(200);

    const userResponse = response.body as UserInterface;
    
    expect(userResponse.bio).toBe(updates.bio);
    expect(userResponse.username).toBe(updates.username);
    expect(userResponse.password).toBeUndefined();
  });

  //test de error al intentar actualizar campos prohibidos
  test('Should return 400 when trying to update prohibited fields', async () => {
    await request(app)
      .patch('/users/me')
      .set('Cookie', `token=${token}`)
      .send({ followers: [] }) 
      .expect(400);
  });

  //test de error al enviar cuerpo vacío en la actualización
  test('Should return 400 if the update body is empty', async () => {
    await request(app)
      .patch('/users/me')
      .set('Cookie', `token=${token}`)
      .send({})
      .expect(400);
  });

  //test de hash de nueva contraseña al actualizarla
  test('Should hash the new password if it is updated', async () => {
    const newPassword = 'NewSecretPassword123';
    
    const response = await request(app)
      .patch('/users/me')
      .set('Cookie', `token=${token}`)
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

// Tests para las rutas de búsqueda y obtención de usuarios
describe('User Routes GET', () => {
  test('Should get users by searching part of the username', async () => {
    const response = await request(app)
      .get('/users')
      .query({ username: 'chef' }) 
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].username).toBe(testUserData.username);
    expect(response.body[0]).toHaveProperty('createdAt');
  });

  //test de obtención de usuario por email exacto
  test('Should return user by exact email match', async () => {
    const response = await request(app)
      .get('/users')
      .query({ email: testUserData.email }) 
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].email).toBe(testUserData.email);
    expect(Array.isArray(response.body[0].saved)).toBe(true);
  });

  //test de obtención de usuario por categoría
  test('Should return 404 if no user matches the search criteria', async () => {
    await request(app)
      .get('/users')
      .query({ username: 'UsuarioInexistente999' })
      .expect(404);
  });
});

// Tests para las rutas de eliminación de usuario
describe('User Routes DELETE /users/me', () => {
  let token: string;
  const JWT_SECRET: string = 'fallback-secret-for-dev-only-654321';

  beforeEach(async () => {
    await User.deleteMany();
    const user = await new User(testUserData).save();
    token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET);
  });

  //test de eliminación exitosa de cuenta del usuario autenticado
  test('Should delete the authenticated user account', async () => {
    await request(app)
      .delete('/users/me')
      .set('Cookie', `token=${token}`)
      .expect(200);

    const userInDb = await User.findOne({ email: testUserData.email });
    expect(userInDb).toBeNull();
  });

  //test de error al eliminar cuenta sin token
  test('Should return 401 if trying to delete without token', async () => {
    await request(app)
      .delete('/users/me')
      .expect(401);

    const userInDb = await User.findOne({ email: testUserData.email });
    expect(userInDb).not.toBeNull();
  });

  //test de error al eliminar cuenta con token inválido
  test('Should return 401 for invalid token during deletion', async () => {
    await request(app)
      .delete('/users/me')
      .set('Cookie', `token=invalid-token`)
      .expect(401);
  });
});

//tests para la ruta de logout de usuario
describe('User Routes POST /users/logout', () => {
  let token: string;
  const JWT_SECRET: string = 'fallback-secret-for-dev-only-654321';

  beforeEach(async () => {
    await User.deleteMany();
    const user = await new User(testUserData).save();
    token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET);
  });

  //test de logout exitoso
  test('Should logout successfully and return a personalized message', async () => {
    const response = await request(app)
      .post('/users/logout')
      .set('Cookie', `token=${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(`${testUserData.username} ha cerrado sesión exitosamente.`);
  });

  //test de error al hacer logout sin estar autenticado
  test('Should return 401 if trying to logout without being authenticated', async () => {
    const response = await request(app)
      .post('/users/logout')
      .expect(401);

    expect(response.body.error).toBe('Por favor, autentíquese.');
  });

  //test de error al hacer logout con token inválido
  test('Should return 401 with a malformed or expired token', async () => {
    await request(app)
      .post('/users/logout')
      .set('Authorization', 'Bearer token-totalmente-invalido')
      .expect(401);
  });
});

//tests para las rutas de obtención de usuarios con filtros avanzados
describe('User Routes GET /users', () => {
  const user1 = {
    username: 'ChefMaster',
    email: 'chef@test.com',
    _id: '000000000000000000000108',
    password: 'Password123!',
    categories: ['pasta', 'vegano'] 
  };

  const user2 = {
    username: 'OtroChef',
    _id: '000000000000000000000109',
    email: 'otro@test.com',
    password: 'Password123!',
    categories: ['otro']
  };

  beforeEach(async () => {
    await User.deleteMany({});
    await new User(user1).save(); 
    await new User(user2).save(); 
  });

  //test de obtención de usuarios por parte del nombre de usuario
  test('Should find users by partial username ', async () => {
    const response = await request(app)
      .get('/users')
      .query({ username: 'chef' }) 
      .expect(200);

    const users = response.body;
    expect(users.length).toBe(2); 
    expect(users.some((u: any) => u.username === 'ChefMaster')).toBe(true);
  });

  //test de obtención de usuarios por parte del email
  test('Should find users by partial email', async () => {
    const response = await request(app)
      .get('/users')
      .query({ email: 'test.com' })
      .expect(200);

    const users = response.body;
    expect(users.length).toBe(2);
  });

  //test de obtención de usuarios por categoría
  test('Should filter by category', async () => {
    const response = await request(app)
      .get('/users')
      .query({ categories: 'pasta' })
      .expect(200);

    const users = response.body;
    expect(users.length).toBe(2);
    expect(users[0].username).toBe('ChefMaster');
  });

  //test de obtención de todos los usuarios sin filtros
  test('Should return all users if no query parameters are provided', async () => {
    const response = await request(app)
      .get('/users')
      .expect(200);

    expect(response.body.length).toBe(2);
  });

  //test de obtención de usuarios por combinación de filtros
  test('Should filter by both username and email combined', async () => {
    const response = await request(app)
      .get('/users')
      .query({ 
        username: 'Master',
        email: 'chef@'
      })
      .expect(200);

    const users = response.body;
    expect(users.length).toBe(1);
    expect(users[0].username).toBe('ChefMaster');
  });

  //test de error al no encontrar usuarios con los filtros dados
  test('Should return 404 if no user matches the filter', async () => {
    await request(app)
      .get('/users')
      .query({ username: 'NombreInexistente' })
      .expect(404);
  });
});

//tests para la ruta de obtención de seguidores de un usuario específico
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

  //test de obtención de seguidores de un usuario específico
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

  //test de obtención de seguidores cuando no hay ninguno
  test('Should return an empty array if the user has no followers', async () => {
    const response = await request(app)
      .get(`/users/${followerId}/followers`)
      .expect(200);

    expect(response.body).toEqual([]);
  });

  //test de error al obtener seguidores de un usuario inexistente
  test('Should return 404 if the user does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .get(`/users/${fakeId}/followers`)
      .expect(404);
  });
});

//tests para la ruta de obtención de un usuario por ID
describe('User Routes GET /users/:id', () => {
  let userId: string;

  beforeEach(async () => {
    await User.deleteMany();
    const user = await new User(testUserData).save();
    userId = (user._id as mongoose.Types.ObjectId).toString();
  });

  //test de obtención de usuario por ID válido y existente
  test('Should get a user by a valid and existing ID', async () => {
    const response = await request(app)
      .get(`/users/${userId}`)
      .expect(200);

    const userResponse = response.body as UserInterface;
    expect(userResponse.username).toBe(testUserData.username);
    expect(userResponse.email).toBe(testUserData.email);
  });

  //test de error al obtener usuario por ID válido pero inexistente
  test('Should return 404 for a non-existent but valid format ID', async () => {
    const randomId = new mongoose.Types.ObjectId().toString();
    
    const response = await request(app)
      .get(`/users/${randomId}`)
      .expect(404);

    expect(response.body.error).toBe('Usuario no encontrado.');
  });

  //test de error al obtener usuario por ID con formato inválido
  test('Should return 500 for an invalid ID format ', async () => {
    const invalidId = '123-id-no-valido';
    
    await request(app)
      .get(`/users/${invalidId}`)
      .expect(500);
  });
});

//tests para la ruta de obtención de un usuario por ID
describe('User Routes get:id', () => { 
	beforeEach(async () => {
		await User.deleteMany();
		const user = await new User(testUserData).save(); 
		userId = user._id.toString(); 
	});

  //test de obtención de usuario por ID
	test('Should get a user by ID', async () => {
		const response = await request(app)
			.get(`/users/${userId.toString()}`) 
			.expect(200);
		expect(response.body.username).toBe(testUserData.username);
	});

  //test de error al obtener usuario por ID inexistente
	test('Should return 404 for non-existent user ID', async () => {
		const nonExistentId = new mongoose.Types.ObjectId();
		await request(app)
			.get(`/users/${nonExistentId.toString()}`)
			.expect(404);
	});
});

//tests para la ruta de actualización de usuario por filtros
describe('User Routes PATCH /users (Update by Filter)', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await new User({
      username: 'ChefMaster',
      _id: '000000000000000000000107',
      email: 'chef@test.com',
      password: 'Password123!',
      categories: ['otro'],
      bio: 'Bio antigua'
    }).save();
  });

  //test de actualización exitosa de usuario por email
  test('Should update user successfully using email filter', async () => {
    const updates = { bio: 'Bio actualizada por email' };

    const response = await request(app)
      .patch('/users')
      .query({ email: 'chef@test.com' }) 
      .send(updates)
      .expect(200);

    expect(response.body.bio).toBe(updates.bio);
  });

  //test de actualización exitosa de usuario por username
  test('Should update user successfully using username filter ', async () => {
    const updates = { bio: 'Bio actualizada por username' };
    const response = await request(app)
      .patch('/users')
      .query({ username: 'Chef' }) 
      .send(updates)
      .expect(200);

    expect(response.body.username).toBe('ChefMaster');
    expect(response.body.bio).toBe(updates.bio);
  });

  //test de error al enviar actualizaciones inválidas para el esquema
  test('Should return 400 if no filters are provided', async () => {
    await request(app)
      .patch('/users')
      .send({ bio: 'No funcionará' })
      .expect(400); 
  });

  //test de error al no encontrar usuario con los filtros dados
  test('Should return 404 if no user matches the filter', async () => {
    await request(app)
      .patch('/users')
      .query({ username: 'UsuarioInexistente' })
      .send({ bio: 'Nueva bio' })
      .expect(404);
  });
});

//tests para la ruta de actualización de usuario por ID
describe('User Routes PATCH /users/:id (Update by ID)', () => {
  let userId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    const user = await new User({
      username: 'UpdateMe',
      _id: '000000000000000000000103',
      email: 'update@test.com',
      password: 'Password123!',
      categories: ['pasta']
    }).save();
    userId = user._id.toString();
  });

  //test de actualización exitosa de usuario por ID
  test('Should update user by a valid ID', async () => {
    const updates = { bio: 'Mi nueva bio por ID' };

    const response = await request(app)
      .patch(`/users/${userId}`)
      .send(updates)
      .expect(200);

    expect(response.body._id).toBe(userId);
    expect(response.body.bio).toBe(updates.bio);
  });

  //test de error al enviar actualizaciones inválidas para el esquema
  test('Should return 400 if updates are invalid for the schema', async () => {
    await request(app)
      .patch(`/users/${userId}`)
      .send({ username: '' }) 
      .expect(400);
  });

  //test de error al intentar actualizar un usuario inexistente
  test('Should return 404 if ID is valid but user does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .patch(`/users/${fakeId}`)
      .send({ bio: 'Hola' })
      .expect(404);
  });
});

//tests para la ruta de eliminación de usuario por filtros
describe('User Routes: DELETE by Query (?email or ?username)', () => {
  let userId: string;
  const userEmail = 'test-query@example.com';
  const userName = 'QueryUser';

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Review.deleteMany({});

    const user = await new User({
      username: userName,
      email: userEmail,
      _id: '000000000000000000000104',
      password: 'Password123!',
      categories: ['otro'] 
    }).save();

    userId = user._id.toString();

    const recipe = await new Recipe({
      name: 'Pasta Query',
      _id: '000000000000000000000151',
      steps: 'Pasos...',
      ingredients: [{ ingredient: 'sal', quantity: '1 pizca' }],
      tools: ['olla'],
      category: ['pasta'],
      userId: userId
    }).save();

    await new Review({
      text: 'Muy bueno',
      userId: userId,
      rating: 4,
      recipeId: recipe._id
    }).save();
  });

  //test de eliminación exitosa de usuario y su contenido asociado por email exacto
  test('Should delete user and content using EXACT email', async () => {
    await request(app)
      .delete('/users')
      .query({ email: userEmail })
      .expect(200);

    expect(await User.findById(userId)).toBeNull();
    expect(await Recipe.countDocuments({ userId })).toBe(0);
    expect(await Review.countDocuments({ userId })).toBe(0);
  });

  //test de eliminación exitosa de usuario por parte del nombre de usuario
  test('Should delete user using partial username (Regex)', async () => {
    await request(app)
      .delete('/users')
      .query({ username: 'Query' }) 
      .expect(200);

    expect(await User.findOne({ username: userName })).toBeNull();
  });

  //test de error al no proporcionar filtros en la eliminación
  test('Should return 400 if no query parameters are provided', async () => {
    const response = await request(app)
      .delete('/users')
      .expect(400);

    expect(response.body.error).toContain('Debe proporcionar al menos un filtro');
  });

  //test de error al no encontrar usuario con los filtros dados
  test('Should return 404 if user is not found', async () => {
    await request(app)
      .delete('/users')
      .query({ email: 'no-existe@test.com' })
      .expect(404);
  });
});

//tests para la ruta de eliminación de usuario por ID
describe('User Routes: DELETE by ID (/users/:id)', () => {
  let userId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    
    const user = await new User({
      username: 'IdUser',
      email: 'id@test.com',
      _id: '000000000000000000000105',
      password: 'Password123!',
      categories: ['vegano'],
      profilePic: 'uploads/images/foto-especifica.png'
    }).save();

    userId = user._id.toString();
  });

  //test de eliminación exitosa de usuario por ID
  test('Should delete user by a valid ID', async () => {
    const response = await request(app)
      .delete(`/users/${userId}`)
      .expect(200);

    expect(response.body._id).toBe(userId);
    expect(await User.findById(userId)).toBeNull();
  });

  //test de eliminación de usuario sin borrar archivo por ser imagen por defecto
  test('Should NOT delete file if profilePic is the Flaticon default', async () => {
    const flaticonUser = await new User({
      username: 'FlaticonUser',
      _id: '000000000000000000000106',
      email: 'flaticon@test.com',
      password: 'Password123!',
      categories: ['otro'],
      profilePic: 'uploads/images/Flaticon.png'
    }).save();

    await request(app)
      .delete(`/users/${flaticonUser._id}`)
      .expect(200);

    expect(await User.findById(flaticonUser._id)).toBeNull();
  });

  //test de error al eliminar usuario por ID inexistente
  test('Should return 404 for a non-existent valid ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .delete(`/users/${fakeId}`)
      .expect(404);
  });

  //test de error al eliminar usuario por ID con formato inválido
  test('Should return 500 for an invalid ID format', async () => {
    await request(app)
      .delete('/users/esto-no-es-un-id')
      .expect(500);
  });
});