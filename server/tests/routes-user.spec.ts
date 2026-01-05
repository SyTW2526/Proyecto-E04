import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/server.js';
import { User } from '../src/items/user.js';
import { describe, expect, test, beforeAll, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

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
        expect(response.body).toHaveProperty('_id');
        const userInDb = await User.findById(response.body._id); // buscar en la base de datos para verificar el hashing
        expect(userInDb).not.toBeNull();
        
        const isMatch = await bcrypt.compare(newUserData.password, userInDb!.password); // verificar que el hash es VÁLIDO comparándolo con la contraseña original
        expect(isMatch).toBe(true);
    });

    test('Should return 400 when provided with an invalid email', async () => {
        await request(app)
            .post('/users')
            .send({ ...testUserData, email: 'not-an-email' }) 
            .expect(400);
    });
});

describe('User Routes GET (Search and Find)', () => {
    beforeEach(async () => {
        await User.deleteMany();
        await new User(testUserData).save();
    });

    test('Should get users by searching part of the username', async () => {
        const response = await request(app)
            .get('/users')
            .query({ username: 'Prueba' })
            .expect(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].username).toBe(testUserData.username);

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

describe('User Routes PATCH (Update by Query Filter)', () => {
    beforeEach(async () => {
        await User.deleteMany();
        const user = await new User(testUserData).save(); 
        userId = user._id;
    });

    test('Should return 400 if no filter (username or email) is provided in query', async () => {
        await request(app)
            .patch('/users')
            .send({ username: 'Failure' })
            .expect(400); 
    });

    test('Should return 400 if no update data is provided in body', async () => {
        await request(app)
            .patch('/users')
            .query({ email: testUserData.email })
            .send({}) 
            .expect(400);
    });

    test('Should return 400 if an unallowed field is provided (e.g., bio)', async () => {
        await request(app)
            .patch('/users')
            .query({ email: testUserData.email })
            .send({ bio: 'New Bio' })
            .expect(400);
    });

    test('Should return 404 if no user matches the filter criteria', async () => {
        await request(app)
            .patch('/users')
            .query({ email: 'nonexistent@email.com' })
            .send({ username: 'Failure' })
            .expect(404);
    });
});

describe('Users Routes delete', () => {

  test('Should return 404 when deleting non-existent recipe by ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await request(app)
      .delete(`/users/${nonExistentId.toString()}`)
      .expect(404);
  });
});

describe('User Routes DELETE (by ID)', () => {
    beforeEach(async () => {
        await User.deleteMany();
        const user = await new User(testUserData).save(); 
        userId = user._id;
    });

    test('Should delete a user by ID', async () => {
        await request(app)
            .delete(`/users/${userId.toString()}`)
            .expect(200);

        const userInDb = await User.findById(userId);
        expect(userInDb).toBeNull();
    });

    test('Should return 404 when trying to delete a non-existent user', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        await request(app)
            .delete(`/users/${nonExistentId.toString()}`)
            .expect(404);
    });
});