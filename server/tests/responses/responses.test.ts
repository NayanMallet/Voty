import request = require('supertest');
import app from '../../src/index';
import connectDB, { closeDB } from '../../src/config/connectDB';

describe('Responses API', () => {
    let token: string;
    let pollId: string;
    let responseId: string;
    let questionIds: string[] = [];

    const testUser = {
        name: 'Responder',
        email: 'responder@example.com',
        password: 'password123',
    };

    const testPoll = {
        name: 'Poll for Responses',
        description: 'Testing responses',
        questions: [
            { title: 'Your name?', type: 'open' },
            { title: 'Do you like testing?', type: 'multiple_choice', options: ['Yes', 'No'] }
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

        // Create poll
        const pollRes = await request(app)
            .post('/api/polls')
            .set('Authorization', `Bearer ${token}`)
            .send(testPoll);

        pollId = pollRes.body.poll._id;
        questionIds = pollRes.body.poll.questions.map((q: { _id: string }) => q._id);
    });

    afterAll(async () => {
        await closeDB();
    });

    it('should submit a response to a poll', async () => {
        const res = await request(app)
            .post(`/api/polls/${pollId}/responses`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                answers: [
                    { question_id: questionIds[0], answer: 'John Doe' },
                    { question_id: questionIds[1], answer: 'Yes' }
                ]
            })
            .expect(201);

        expect(res.body.message).toMatch(/Response recorded/i);
        expect(res.body).toHaveProperty('response');
        responseId = res.body.response._id;
    });

    it('should get all responses for a poll (creator only)', async () => {
        const res = await request(app)
            .get(`/api/polls/${pollId}/responses`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body).toHaveProperty('responses');
        expect(Array.isArray(res.body.responses)).toBe(true);
    });

    it('should update a response', async () => {
        if (!responseId) return;

        const res = await request(app)
            .put(`/api/polls/${pollId}/responses/${responseId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                answers: [
                    { question_id: questionIds[0], answer: 'Jane Doe' },
                    { question_id: questionIds[1], answer: 'No' }
                ]
            })
            .expect(200);

        expect(res.body.message).toMatch(/Response updated/i);
        expect(res.body).toHaveProperty('response');
    });

    it('should delete a response', async () => {
        if (!responseId) return;

        const res = await request(app)
            .delete(`/api/polls/${pollId}/responses/${responseId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.message).toMatch(/Response deleted/i);
    });
});
