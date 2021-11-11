
import { app, database } from '../index';
import request from 'supertest';
import { nanoid } from 'nanoid';

describe('Celebrity Discover endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })
  it ('Returns empty list when there are no celebrities', async () => {
    await database.insertUser(nanoid());
    const resp = await request(app).get(`/celebrity/discover`).send();
    expect(resp.statusCode).toBe(200);
    expect(resp.body.celebrities.length).toBe(0);
  })
  it ('Returns correct number of celebrities', async () => {
    await database.insertUser(nanoid(), 'celebrity');
    await database.insertUser(nanoid(), 'celebrity');
    await database.insertUser(nanoid(), 'celebrity');
    await database.insertUser(nanoid(), 'celebrity');
    await database.insertUser(nanoid(), 'celebrity');
    const resp = await request(app).get(`/celebrity/discover`).send();
    expect(resp.statusCode).toBe(200);
    expect(resp.body.celebrities.length).toBe(5);
  })
  // Close the database after all tests
  afterAll(async () => {
    await database.disconnect();
  })
})