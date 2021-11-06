import { authRegister } from '../auth';
import { app, database } from '../index';
import request from 'supertest';

describe('Admin Celebrity make request endpoint tests', () => {
  beforeAll(async () => {
    await database.connect();
  })
  it('200 on making valid request', async () => {
    const resp = await authRegister('Ashley', 'strongpassword', database);
    const response = await request(app).post(`/celebrity/makerequest`).send({
      token: resp.token,
      info: "pls make me celeb"
    });
    expect(response.statusCode).toBe(200);
  })
  it('403 on duplicate request', async () => {
    const resp = await authRegister('Ashley2', 'strongpassword', database);
    const response1 = await request(app).post(`/celebrity/makerequest`).send({
      token: resp.token,
      info: "pls make me celeb"
    });
    expect(response1.statusCode).toBe(200);
    const response2 = await request(app).post(`/celebrity/makerequest`).send({
      token: resp.token,
      info: "pls make me celeb"
    });
    expect(response2.statusCode).toBe(403);
  })
  it('401 on invalid token', async () => {
    const response1 = await request(app).post(`/celebrity/makerequest`).send({
      token: 'randomtoken',
      info: "pls make me celeb"
    });
    expect(response1.statusCode).toBe(401);
  })
  it('403 on requesting from a user who is already a celebrity', async () => {
    const resp = await authRegister('Ashley3', 'strongpassword', database);
    await database.updateUser(resp.uid, { userType: 'celebrity' })
    const response1 = await request(app).post(`/celebrity/makerequest`).send({
      token: resp.token,
      info: "pls make me celeb"
    });
    expect(response1.statusCode).toBe(403);
  })
  // Close the database after all tests
  afterAll(async () => {
    await database.disconnect();
  })
})

describe('Get admin celebrity requests endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })
  it('200 on making valid request', async () => {
    const resp = await authRegister('Ashley4', 'strongpassword', database);
    const response = await request(app).post(`/celebrity/makerequest`).send({
      token: resp.token,
      info: "pls make me celeb"
    });
    expect(response.statusCode).toBe(200);
    await database.updateUser(resp.uid, { userType: 'admin' })
    const celebResp = await request(app).get(`/admin/celebrity/requests?token=${resp.token}`);
    expect(celebResp.statusCode).toBe(200);
    expect(celebResp.body.requests.length).toBe(1);
  })
  it('401 on invalid token', async () => {
    const resp = await authRegister('Ashley5', 'strongpassword', database);
    const response = await request(app).post(`/celebrity/makerequest`).send({
      token: resp.token,
      info: "pls make me celeb"
    });
    expect(response.statusCode).toBe(200);
    await database.updateUser(resp.uid, { userType: 'admin' })
    const celebResp = await request(app).get(`/admin/celebrity/requests?token=${'adsfasdfa'}`);
    expect(celebResp.statusCode).toBe(401);
  })
  it('403 when user is not an admin', async () => {
    const resp = await authRegister('Ashley6', 'strongpassword', database);
    const response = await request(app).post(`/celebrity/makerequest`).send({
      token: resp.token,
      info: "pls make me celeb"
    });
    expect(response.statusCode).toBe(200);
    const celebResp = await request(app).get(`/admin/celebrity/requests?token=${resp.token}`);
    expect(celebResp.statusCode).toBe(403);
  })
  // Close the database after all tests
  afterAll(async () => {
    await database.disconnect();
  })
})

// describe('Post Admin Celebrity Handle Request endpoint test', () => {
  
// })