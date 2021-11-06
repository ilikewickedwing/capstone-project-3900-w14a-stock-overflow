import { authRegister } from '../auth';
import { app, database } from '../index';
import request from 'supertest';
import { nanoid } from 'nanoid';

describe('Get User notifications endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })
  it('200 on getting requests', async () => {
    const resp = await authRegister(nanoid(), 'strongpassword', database);
    database.insertUserNotification(resp.uid, '');
    const response = await request(app).get(`/user/notifications?token=${resp.token}`).send();
    expect(response.statusCode).toBe(200);
    expect(response.body.notifications.length).toBe(1);
  })
  // Close the database after all tests
  afterAll(async () => {
    await database.disconnect();
  })
})