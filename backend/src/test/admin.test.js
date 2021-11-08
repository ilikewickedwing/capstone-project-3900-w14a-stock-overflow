import { authRegister } from '../auth';
import { app, database } from '../index';
import request from 'supertest';
import { nanoid } from 'nanoid';

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
    expect(response.body).toMatchObject({
      rid: expect.any(String),
    })
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

describe('Post Admin Celebrity Handle Request endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })
  it('200 on approving request', async () => {
    // User
    const user = await authRegister(nanoid(), 'strongpassword', database);
    // Admin
    const admin = await authRegister(nanoid(), 'strongpassword', database);
    await database.updateUser(admin.uid, { userType: 'admin' });
    // Make request
    const requestResponse = await request(app).post(`/celebrity/makerequest`).send({
      token: user.token,
      info: "pls make me celeb"
    });
    // Approve request
    const approveResponse = await request(app)
      .post(`/admin/celebrity/handlerequest`).send({
        token: admin.token,
        approve: true,
        rid: requestResponse.body.rid
      });
    expect(approveResponse.statusCode).toBe(200);
    const userData = await database.getUser(user.uid);
    // Check that user is now a celebrity
    expect(userData.userType).toBe('celebrity');
    // Check request is now deleted
    const requestData = await database.getCelebrityRequestById(requestResponse.body.rid);
    expect(requestData).toBe(null);
  })
  it('200 on rejecting request', async () => {
    // User
    const user = await authRegister(nanoid(), 'strongpassword', database);
    // Admin
    const admin = await authRegister(nanoid(), 'strongpassword', database);
    await database.updateUser(admin.uid, { userType: 'admin' });
    // Make request
    const requestResponse = await request(app).post(`/celebrity/makerequest`).send({
      token: user.token,
      info: "pls make me celeb"
    });
    // Approve request
    const approveResponse = await request(app)
      .post(`/admin/celebrity/handlerequest`).send({
        token: admin.token,
        approve: false,
        rid: requestResponse.body.rid
      });
    expect(approveResponse.statusCode).toBe(200);
    const userData = await database.getUser(user.uid);
    // Check that user is now a celebrity
    expect(userData.userType).toBe('user');
    // Check request is now deleted
    const requestData = await database.getCelebrityRequestById(requestResponse.body.rid);
    expect(requestData).toBe(null);
  })
  it('401 on invalid token', async () => {
    // User
    const user = await authRegister(nanoid(), 'strongpassword', database);
    // Admin
    const admin = await authRegister(nanoid(), 'strongpassword', database);
    await database.updateUser(admin.uid, { userType: 'admin' });
    // Make request
    const requestResponse = await request(app).post(`/celebrity/makerequest`).send({
      token: user.token,
      info: "pls make me celeb"
    });
    // Approve request
    const approveResponse = await request(app)
      .post(`/admin/celebrity/handlerequest`).send({
        token: 'sffdfgsd',
        approve: false,
        rid: requestResponse.body.rid
      });
    expect(approveResponse.statusCode).toBe(401);
    // Check request is not deleted
    const requestData = await database.getCelebrityRequestById(requestResponse.body.rid);
    expect(requestData).not.toBe(null);
  })
  it('403 when not an admin', async () => {
    // User
    const user = await authRegister(nanoid(), 'strongpassword', database);
    // Admin
    const user2 = await authRegister(nanoid(), 'strongpassword', database);
    // Make request
    const requestResponse = await request(app).post(`/celebrity/makerequest`).send({
      token: user.token,
      info: "pls make me celeb"
    });
    // Approve request
    const approveResponse = await request(app)
      .post(`/admin/celebrity/handlerequest`).send({
        token: user2.token,
        approve: false,
        rid: requestResponse.body.rid
      });
    expect(approveResponse.statusCode).toBe(403);
    // Check request is not deleted
    const requestData = await database.getCelebrityRequestById(requestResponse.body.rid);
    expect(requestData).not.toBe(null);
  })
  it('400 on invalid rid', async () => {
    // User
    const user = await authRegister(nanoid(), 'strongpassword', database);
    // Admin
    const admin = await authRegister(nanoid(), 'strongpassword', database);
    await database.updateUser(admin.uid, { userType: 'admin' });
    // Make request
    const requestResponse = await request(app).post(`/celebrity/makerequest`).send({
      token: user.token,
      info: "pls make me celeb"
    });
    // Approve request
    const approveResponse = await request(app)
      .post(`/admin/celebrity/handlerequest`).send({
        token: admin.token,
        approve: false,
        rid: 'aadfasf',
      });
    expect(approveResponse.statusCode).toBe(400);
    const userData = await database.getUser(user.uid);
    // Check that user is still a normal user
    expect(userData.userType).toBe('user');
    // Check request is not deleted
    const requestData = await database.getCelebrityRequestById(requestResponse.body.rid);
    expect(requestData).not.toBe(null);
  })
  // Close the database after all tests
  afterAll(async () => {
    await database.disconnect();
  })
})