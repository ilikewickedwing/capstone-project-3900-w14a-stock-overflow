import { Database } from "../database";
import { authRegister } from "../auth";
import { postUserProfile, getUserProfile } from '../user';
import { app, database } from '../index';
import request from 'supertest';

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

describe('Post User profile', () => {
  const d = new Database(true);
  // Run this before all the tests
  beforeAll(async () => {
    await d.connect();
  })
  it('Username will be changed', async () => {
    const resp = await authRegister('Ashley', 'strongpassword', d);
    await postUserProfile(resp.uid, resp.token, {
      username: 'Bob'
    }, d);
    const profileResp = await getUserProfile(resp.uid, resp.token, d);
    expect(profileResp.username).toBe('Bob');
  })
  it('Empty object will not change anything', async () => {
    const resp = await authRegister('Ashley2', 'strongpassword', d);
    await postUserProfile(resp.uid, resp.token, {}, d);
    const profileResp = await getUserProfile(resp.uid, resp.token, d);
    expect(profileResp.username).toBe('Ashley2');
  })
  it('Invalid uid will not change anything', async () => {
    const resp = await authRegister('Ashley3', 'strongpassword', d);
    const postresp = await postUserProfile('myuid', resp.token, {}, d);
    expect(postresp).toBe(false);
  })
  it('Invalid token will not change anything', async () => {
    const resp = await authRegister('Ashley4', 'strongpassword', d);
    const postresp = await postUserProfile(resp.uid, 'faketoken', {}, d);
    expect(postresp).toBe(false);
  })
  // Close the database after all tests
  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Post User profile endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })
  it('200 on valid data change', async () => {
    const resp = await authRegister('Ashley', 'strongpassword', database);
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
  // Close the database after all tests
  afterAll(async () => {
    await database.disconnect();
  })
})
