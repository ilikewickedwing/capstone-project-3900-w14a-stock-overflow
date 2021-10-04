import { Database } from "../database";

describe('Database Wrapper', () => {
  const d = new Database(true);
  // Run this before all the tests
  beforeAll(async () => {
    await d.connect();
  })
  it('Has username returns true when username exists', async () => {
    await d.insertUser('micky');
    const resp = await d.hasUsername('micky');
    expect(resp).toBe(true);
  })
  it('Has username returns false when username doesnt exist', async () => {
    const resp = await d.hasUsername('mickys missing brother');
    expect(resp).toBe(false);
  })
  it('Get uid returns valid uid when user exists', async () => {
    const uid = await d.insertUser('goofy');
    const resp = await d.getUid('goofy')
    expect(resp).toBe(uid);
  })
  it('Get uid returns null when user doesnt exists', async () => {
    const resp = await d.getUid('goofys missing brother')
    expect(resp).toBe(null);
  })
  it('Get user returns info for valid user', async () => {
    const uid = await d.insertUser('donald');
    const resp = await d.getUser(uid)
    expect(resp).not.toBe(null);
  })
  it('Get user returns null for invalid user', async () => {
    const resp = await d.getUser('asdfasdfasdfasdfas')
    expect(resp).toBe(null);
  })
  // Close the database after all tests
  afterAll(async () => {
    await d.disconnect();
  })
})