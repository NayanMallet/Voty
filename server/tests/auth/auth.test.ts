import request = require('supertest');
import app from '../../src/index';
import connectDB, { closeDB } from '../../src/config/connectDB';

describe('Auth API', () => {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
    };

    let token: string;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await connectDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser)
            .expect(201);

        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    it('should not register a user with an existing email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser)
            .expect(400);

        expect(res.body.message).toMatch(/already exists/i);
    });

    it('should login with correct credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            })
            .expect(200);

        expect(res.body).toHaveProperty('token');
        token = res.body.token; // refresh token for /me test
    });

    it('should get current user with valid token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.user).toMatchObject({
            name: testUser.name,
            email: testUser.email,
        });
    });

    it('should reject /me request without token', async () => {
        const res = await request(app).get('/api/auth/me').expect(401);
        expect(res.body.message).toMatch(/no token/i);
    });

    it('should access protected profile route with valid token', async () => {
        const res = await request(app)
            .get('/api/protected/profile')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toMatch(new RegExp(`Welcome user`));
    });

    it('should reject protected profile route without token', async () => {
        const res = await request(app)
            .get('/api/protected/profile')
            .expect(401);

        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toMatch(/no token/i);
    });

});
