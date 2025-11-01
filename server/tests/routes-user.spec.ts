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

const userId = new mongoose.Types.ObjectId();

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
    
    test('Should not create a user with a duplicate email (400)', async () => {
        await request(app)
            .post('/users')
            .send(testUserData)
            .expect(201); 

        await request(app)
            .post('/users')
            .send(testUserData)
            .expect(400);
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


// describe('User Routes POST (Login) - PENDIENTE', () => {});
// describe('User Routes GET/PATCH/DELETE (Auth Required) - PENDIENTE', () => {});
