import request = require('supertest');
import app from '../../src/index';
import connectDB, { closeDB } from '../../src/config/connectDB';

describe('Polls API', () => {
    let token: string;
    let pollId: string;

    const testUser = {
        name: 'Poll Creator',
        email: 'pollcreator@example.com',
        password: 'password123',
    };

    const testPoll = {
        name: 'My First Poll',
        description: 'A poll for testing',
        questions: [
            { title: 'Question 1', type: 'open' },
            { title: 'Question 2', type: 'multiple_choice', options: ['Yes', 'No'] }
        ]
    };

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await connectDB();

        // Register & login user
        await request(app).post('/api/auth/register').send(testUser);
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        token = loginRes.body.token;
    });

    afterAll(async () => {
        await closeDB();
    });

    it('should create a new poll', async () => {
        const res = await request(app)
            .post('/api/polls')
            .set('Authorization', `Bearer ${token}`)
            .send(testPoll)
            .expect(201);

        expect(res.body.poll).toHaveProperty('_id');
        pollId = res.body.poll._id;
    });

    it('should get all polls', async () => {
        const res = await request(app).get('/api/polls').expect(200);
        expect(Array.isArray(res.body.polls)).toBe(true);
    });

    it('should get a poll by ID', async () => {
        const res = await request(app).get(`/api/polls/${pollId}`).expect(200);
        expect(res.body.poll).toHaveProperty('_id', pollId);
    });

    it('should update a poll', async () => {
        const res = await request(app)
            .put(`/api/polls/${pollId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ description: 'Updated description' })
            .expect(200);

        expect(res.body.poll.description).toBe('Updated description');
    });

    it('should delete a poll', async () => {
        await request(app)
            .delete(`/api/polls/${pollId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    });
});
