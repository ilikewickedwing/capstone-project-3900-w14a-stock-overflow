import { authRegister } from "../auth";
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