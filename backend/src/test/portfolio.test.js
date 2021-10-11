import { authRegister } from "../auth";
import { createPf, deletePf, userPfs, openPf } from "../portfolio";
import { Database } from "../database";
import request from 'supertest';
import { app } from "../index";

describe('Porfolio create', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  var token = null;

  it('Create new user to add portfolios to', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    token = rego.token;
  })
  it('Creating a new portfolio returns a pid', async () => {
    const resp = await createPf(token, 'myPf', d);
    expect(resp).not.toBe(null);
  })
  it('Cannot create a new portfolio with a name that already exists', async () => {
    const resp = await createPf(token, 'myPf', d);
    expect(resp).toBe(null);
  })
  it('Creating a new portfolio returns a valid portfolio id', async () => {
    const resp = await createPf(token, 'myPf2', d);
    const pf = await d.openPf(resp);
    expect(pf).toMatchObject({
      pid: expect.any(String)
    })
  })
  it('Creating a new portfolio returns a valid portfolio name', async () => {
    const resp = await createPf(token, 'myPf3', d);
    const pf = await d.openPf(resp);
    expect(pf).toMatchObject({
      name: 'myPf3'
    })
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Porfolio delete', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  it('Delete portfolio', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    const token = rego.token;
    const resp = await createPf(token, 'myPf', d);
    const delResp = await deletePf(resp, d);
    expect(delResp).toBe(true);
    const pid = await openPf(resp, d);
    expect(pid).toBe(null);
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

