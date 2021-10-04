import { authLogin, authLogout, authRegister } from "../auth";
import { Database } from "../database";

describe('Auth register', () => {
  const d = new Database(true);
  // Run this before all the tests
  beforeAll(async () => {
    await d.connect();
  })
  it('Registering a new user returns a uid and token', async () => {
    const resp = await authRegister('Ashley', 'strongpassword', d);
    expect(resp).toMatchObject({
      uid: expect.any(String),
      token: expect.any(String)
    })
  })
  it('Cannot register a username that already exists', async () => {
    const resp = await authRegister('Ashley', 'bobiscool', d);
    expect(resp).toBe(null);
  })
  it('Registering a new user returns a valid uid', async () => {
    const resp = await authRegister('Bob Dylan', 'strongpassword', d);
    const user = await d.getUser(resp.uid);
    expect(user).not.toBe(null);
  })
  it('Registering a new user returns a valid token', async () => {
    const resp = await authRegister('Bob Dylan 2', 'strongpassword', d);
    const uid = await d.getTokenUid(resp.token);
    expect(uid).toBe(resp.uid);
  })
  // Close the database after all tests
  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Auth Logout', () => {
  const d = new Database(true);
  // Run this before all the tests
  beforeAll(async () => {
    await d.connect();
  })
  it('Token is invalidated after logging out', async () => {
    const resp = await authRegister('Ashley', 'bobiscool', d);
    // Token should be valid at this point
    const uid = await d.getTokenUid(resp.token);
    expect(uid).toBe(resp.uid);
    const hasLoggedout = await authLogout(resp.token, d);
    expect(hasLoggedout).toBe(true);
    // Token should now be invalidated
    const newUid = await d.getTokenUid(resp.token);
    expect(newUid).toBe(null);
  })
  it('Logging out an invalid token returns false', async () => {
    const hasLoggedout = await authLogout('my very cool token bro', d);
    expect(hasLoggedout).toBe(false);
  })
  // Close the database after all tests
  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Auth login', () => {
  const d = new Database(true);
  // Run this before all the tests
  beforeAll(async () => {
    await d.connect();
  })
  it('Logging in returns a valid uid and token', async () => {
    const resp = await authRegister('Ashley', 'bobiscool', d);
    await authLogout(resp.token, d);
    const loginResp = await authLogin('Ashley', 'bobiscool', d);
    expect(loginResp).not.toBe(null);
    const user = await d.getUser(loginResp.uid);
    expect(user).not.toBe(null);
    const validToken = (await d.getTokenUid(loginResp.token) !== null);
    expect(validToken).toBe(true);
  })
  it('Cannot log in to existing user with wrong password', async () => {
    const resp = await authRegister('Ashley2', 'bobiscool', d);
    await authLogout(resp.token, d);
    const loginResp = await authLogin('Ashley2', 'wrongpassword', d);
    expect(loginResp).toBe(null);
  })
  it('Cannot log in to user that doesnt exist', async () => {
    const loginResp = await authLogin('Nonexistent user', 'wrongpassword', d);
    expect(loginResp).toBe(null);
  })
  // Close the database after all tests
  afterAll(async () => {
    await d.disconnect();
  })
})