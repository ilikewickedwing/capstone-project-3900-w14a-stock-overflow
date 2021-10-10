import { Database } from "../database";
import { authRegister } from "../auth";
import { postUserProfile, getUserProfile } from '../user';

describe('Get User profile', () => {
  const d = new Database(true);
  // Run this before all the tests
  beforeAll(async () => {
    await d.connect();
  })
  it('Returns valid user information for valid uid', async () => {
    const resp = await authRegister('Ashley', 'strongpassword', d);
    const profileResp = await getUserProfile(resp.uid, d);
    expect(profileResp).not.toBe(null);
  })
  it('Returns null on invalid uid', async () => {
    const profileResp = await getUserProfile('random uid', d);
    expect(profileResp).toBe(null);
  })
  // Close the database after all tests
  afterAll(async () => {
    await d.disconnect();
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
    const profileResp = await getUserProfile(resp.uid, d);
    expect(profileResp.username).toBe('Bob');
  })
  it('Empty object will not change anything', async () => {
    const resp = await authRegister('Ashley2', 'strongpassword', d);
    await postUserProfile(resp.uid, resp.token, {}, d);
    const profileResp = await getUserProfile(resp.uid, d);
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