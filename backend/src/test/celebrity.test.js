
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

describe('Celebrity Follow endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })
  it ('Following a celebrity works', async () => {
    const userUid = await database.insertUser(nanoid());
    const token = await database.insertToken(userUid);
    const celebUid = await database.insertUser(nanoid(), 'celebrity');
    const resp = await request(app).post(`/celebrity/follow`).send({
      token: token,
      isFollow: true,
      celebUid: celebUid,
    });
    expect(resp.statusCode).toBe(200);
    const followers = await database.getCelebrityFollowers(celebUid);
    expect(followers.followers.includes(userUid)).toBe(true);
  })
  it ('Cant follow someone you are already following', async () => {
    const userUid = await database.insertUser(nanoid());
    const token = await database.insertToken(userUid);
    const celebUid = await database.insertUser(nanoid(), 'celebrity');
    const resp0 = await request(app).post(`/celebrity/follow`).send({
      token: token,
      isFollow: true,
      celebUid: celebUid,
    });
    const resp = await request(app).post(`/celebrity/follow`).send({
      token: token,
      isFollow: true,
      celebUid: celebUid,
    });
    expect(resp.statusCode).toBe(400);
    const followers = await database.getCelebrityFollowers(celebUid);
    expect(followers.followers.includes(userUid)).toBe(true);
  })
  it ('Cant follow someone who is not a celebrity', async () => {
    const userUid = await database.insertUser(nanoid());
    const token = await database.insertToken(userUid);
    const celebUid = await database.insertUser(nanoid());
    const resp = await request(app).post(`/celebrity/follow`).send({
      token: token,
      isFollow: true,
      celebUid: celebUid,
    });
    expect(resp.statusCode).toBe(400);
  })
  it ('Cant follow an invalid celebrity uid', async () => {
    const userUid = await database.insertUser(nanoid());
    const token = await database.insertToken(userUid);
    const celebUid = await database.insertUser(nanoid(), 'celebrity');
    const resp = await request(app).post(`/celebrity/follow`).send({
      token: token,
      isFollow: true,
      celebUid: 'adfasfasd',
    });
    expect(resp.statusCode).toBe(400);
  })
  afterAll(async () => {
    await database.disconnect();
  })
})

describe('Celebrity Unfollow endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })
  it ('UnFollowing a celebrity works', async () => {
    const userUid = await database.insertUser(nanoid());
    const token = await database.insertToken(userUid);
    const celebUid = await database.insertUser(nanoid(), 'celebrity');
    const resp0 = await request(app).post(`/celebrity/follow`).send({
      token: token,
      isFollow: true,
      celebUid: celebUid,
    });
    const resp = await request(app).post(`/celebrity/follow`).send({
      token: token,
      isFollow: false,
      celebUid: celebUid,
    });
    expect(resp.statusCode).toBe(200);
    const followers = await database.getCelebrityFollowers(celebUid);
    expect(followers.followers.includes(userUid)).toBe(false);
  })
  it ('Cannot unfollow if you arent followed', async () => {
    const userUid = await database.insertUser(nanoid());
    const token = await database.insertToken(userUid);
    const celebUid = await database.insertUser(nanoid(), 'celebrity');
    const resp = await request(app).post(`/celebrity/follow`).send({
      token: token,
      isFollow: false,
      celebUid: celebUid,
    });
    expect(resp.statusCode).toBe(400);
  })
  afterAll(async () => {
    await database.disconnect();
  })
})