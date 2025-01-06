import { assert, describe, expect, it, beforeAll, afterAll } from 'vitest'
import request from 'supertest';
import { app, server } from '../../src/server';
import { insertDummyData } from '../utils/testUtils';

beforeAll(async () => {
    await insertDummyData()
});

describe('GET /auth/login', () => {
    it('should return 302, on successful redirect', async () => {
        const res = await request(app).get('/auth/login');
        expect(res.status).toBe(302);
    });
});

const jwt1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6InRlc3RtYWlsQGdtYWlsLmNvbSJ9.lr_4jRXDGxhyw9CIiGPrzc2L2PHxpr6Gg3ZetqHmPqk"
const jwt2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJlbWFpbCI6InRlc3RtYWlsMUBnbWFpbC5jb20ifQ.2sNaqg4ae9fPBw_ngF6q9cAQjbx0us-1q5M3wpocO_o"
const jwt3 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMiLCJlbWFpbCI6InRlc3RtYWlsMkBnbWFpbC5jb20ifQ.XK2c3evGwYO4H6dpmUH52Bhia930ElLYC-uG8sGDcFw"

describe('POST /api/shorten', () => {
    it('should return 201 on successful shorten', async () => {
        const res = await request(app).post('/api/shorten')
            .send({ "longUrl": "https://www.testsite.com", "customAlias": "test1", "topic": "test" })
            .set('Authorization', `Bearer ${jwt1}`)
        expect(res.status).toBe(201);
        // expect(res.body).toBe({ "message": "Short URL created successfully.", "shortUrl": "test1", "createdAt": `${new Date()}` });
    });

    it('should return 201 on successful shorten', async () => {
        const res = await request(app).post('/api/shorten')
            .send({ "longUrl": "https://www.testsite1.com", "customAlias": "test2", "topic": "test" })
            .set('Authorization', `Bearer ${jwt2}`)
        expect(res.status).toBe(201);
        // expect(res.body).toBe({ "message": "Short URL created successfully.", "shortUrl": "test1", "createdAt": `${new Date()}` });
    });


    it('should return 201 on successful shorten', async () => {
        const res = await request(app).post('/api/shorten')
            .send({ "longUrl": "https://www.testsite2.com", "customAlias": "test3", "topic": "test" })
            .set('Authorization', `Bearer ${jwt3}`)
        expect(res.status).toBe(201);
        // expect(res.body).toBe({ "message": "Short URL created successfully.", "shortUrl": "test1", "createdAt": `${new Date()}` });
    });

});

describe('GET /api/shorten/:alias', () => {
    it('should return 302 on successful redirect', async () => {
        const res = await request(app).get('/api/shorten/test1');
        expect(res.status).toBe(302);
    });

    it('should return 302 on successful redirect', async () => {
        const res = await request(app).get('/api/shorten/test2');
        expect(res.status).toBe(302);
    });

    it('should return 302 on successful redirect', async () => {
        const res = await request(app).get('/api/shorten/test3');
        expect(res.status).toBe(302);
    });
});
