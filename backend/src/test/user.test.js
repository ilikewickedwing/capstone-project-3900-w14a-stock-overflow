import { Database } from "../database";
import { authRegister } from "../auth";
import { postUserProfile, getUserProfile } from '../user';
import { app, database } from '../index';
import request from 'supertest';

describe('Get uid endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })
  it('200 on valid uid', async () => {
    const resp = await authRegister('Ashleybob', 'strongpassword', database);
    const response = await request(app).get(`/user/uid?username=Ashleybob`).send();
    expect(response.statusCode).toBe(200);
    expect(response.body.uid).toBe(resp.uid);
  })
  it('404 on invalid username', async () => {
    const response = await request(app).get(`/user/uid?username=Ashleybasdfdsaob`).send();
    expect(response.statusCode).toBe(404);
  })
  // Close the database after all tests
  afterAll(async () => {
    await database.disconnect();
  })
})

describe('Get User profile', () => {
  const d = new Database(true);
  // Run this before all the tests
  beforeAll(async () => {
    await d.connect();
  })
  it('Returns valid user information for valid uid', async () => {
    const resp = await authRegister('Ashley', 'strongpassword', d);
    const profileResp = await getUserProfile(resp.uid, resp.token, d);
    expect(profileResp).not.toBe(null);
  })
  it('Returns null on invalid uid', async () => {
    const resp = await authRegister('Ashleyasd', 'strongpassword', d);
    const profileResp = await getUserProfile('random uid', resp.token, d);
    expect(profileResp).toBe(null);
  })
  // Close the database after all tests
  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Get User profile endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })
  it('200 on valid uid', async () => {
    const resp = await authRegister('Ashley', 'strongpassword', database);
    const response = await request(app).get(`/user/profile?uid=${resp.uid}&token=${resp.token}`).send();
    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe('Ashley');
  })
  it('403 on invalid uid', async () => {
    const resp = await authRegister('Ashleay', 'strongpassword', database);
    const response = await request(app).get(`/user/profile?uid=fakeuid&token=${resp.token}`).send();
    expect(response.statusCode).toBe(403);
  })
  // Close the database after all tests
  afterAll(async () => {
    await database.disconnect();
  })
})

describe('Post User profile endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })
  it('200 on valid data change', async () => {
    const resp = await authRegister('BAshley', 'strongpassword', database);
    const response = await request(app).post(`/user/profile`).send({
      uid: resp.uid,
      token: resp.token,
      userData: {
        username: 'Bob'
      }
    });
    expect(response.statusCode).toBe(200);
    // Expect profile to be changed
    const profileResp = await getUserProfile(resp.uid, resp.token, database);
    expect(profileResp.username).toBe('Bob');
  })
  it('401 on invalid token', async () => {
    const resp = await authRegister('Ashley1', 'strongpassword', database);
    const response = await request(app).post(`/user/profile`).send({
      uid: resp.uid,
      token: 'bad token',
      userData: {
        username: 'Bob'
      }
    });
    expect(response.statusCode).toBe(401);
  })
  it('403 on invalid privileges', async () => {
    const resp = await authRegister('Ashley2', 'strongpassword', database);
    const resp2 = await authRegister('Ashley3', 'strongpassword', database);
    const response = await request(app).post(`/user/profile`).send({
      uid: resp.uid,
      token: resp2.token,
      userData: {
        username: 'Bob'
      }
    });
    expect(response.statusCode).toBe(403);
  })
  it('403 on invalid uid', async () => {
    const resp = await authRegister('Ashley4', 'strongpassword', database);
    const response = await request(app).post(`/user/profile`).send({
      uid: 'fake uid',
      token: resp.token,
      userData: {
        username: 'Bob'
      }
    });
    expect(response.statusCode).toBe(403);
  })
  it('400 on username that already exists', async () => {
    const resp = await authRegister('Ashley5', 'strongpassword', database);
    const resp2 = await authRegister('Ashley6', 'strongpassword', database);
    const response = await request(app).post(`/user/profile`).send({
      uid: resp.uid,
      token: resp.token,
      userData: {
        username: 'Ashley6'
      }
    });
    expect(response.statusCode).toBe(400);
  })
  // Close the database after all tests
  afterAll(async () => {
    await database.disconnect();
  })
})
