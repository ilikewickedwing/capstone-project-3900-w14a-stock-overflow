import { Database } from "../database";
import { authRegister } from "../auth";
import { userProfile } from '../user';

describe('User profile', () => {
  const d = new Database(true);
  // Run this before all the tests
  beforeAll(async () => {
    await d.connect();
  })
  it('Returns valid user information for valid uid', async () => {
    const resp = await authRegister('Ashley', 'strongpassword', d);
    const profileResp = await userProfile(resp.uid, d);
    expect(profileResp).not.toBe(null);
  })
  it('Returns null on invalid uid', async () => {
    const profileResp = await userProfile('random uid', d);
    expect(profileResp).toBe(null);
  })
  // Close the database after all tests
  afterAll(async () => {
    await d.disconnect();
  })
})