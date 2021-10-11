import { authRegister } from "../auth";
import { createPf, deletePf, userPfs, openPf, getPid } from "../portfolio";
import { Database } from "../database";
import request from 'supertest';
import { app } from "../index";
import { GridFSBucket } from "mongodb";

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
    const pf = await openPf(resp, d);
    expect(pf).toMatchObject({
      pid: expect.any(String)
    })
  })
  it('Creating a new portfolio returns a valid portfolio name', async () => {
    const resp = await createPf(token, 'myPf3', d);
    const pf = await openPf(resp, d);
    expect(pf).toMatchObject({
      name: 'myPf3'
    })
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Portfolio get', () => {
  const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  var uid = null;
  var token = null;
  var wpid = null;
  var pid1 = null;

  it('Create new user and check portfolios', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    uid = rego.uid;
    token = rego.token;
    const resp = await userPfs(token, d);
    expect(resp).not.toBe(null);
  })
  it('Check watchlist exists upon user creation', async () => {
    const resp = await userPfs(token, d);
    wpid = await getPid(token, "Watchlist", d);
    const myArray = [wpid];
    expect(resp).toEqual(expect.arrayContaining(myArray));
  })
  it('Add portfolio to user portfolios', async () => {
    pid1 = await createPf(token, 'myPf', d);
    const myArray = [wpid, pid1];
    const resp = await userPfs(token, d);
    expect(resp).toEqual(expect.arrayContaining(myArray));
  })
  it('Add second portfolio to user portfolios', async () => {
    const pid2 = await createPf(token, 'myPf2', d);
    const myArray = [wpid, pid1, pid2];
    const resp = await userPfs(token, d);
    expect(resp).toEqual(expect.arrayContaining(myArray));
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Portfolio open', () => {
  const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  var uid = null;
  var token = null;
  var myPid = null;

  it('Create new user and add portfolio', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    uid = rego.uid;
    token = rego.token;
    myPid = await createPf(token, 'myPf', d);
    const myArray = [myPid];
    const resp = await userPfs(token, d);
    expect(resp).toEqual(expect.arrayContaining(myArray));
  })
  it('Get pid for portfolio', async () => {
    const pid = await getPid(token, 'myPf', d);
    expect(pid).toBe(myPid);
  })
  it('Open portfolio', async () => {
    const resp = await openPf(myPid, d);
    expect(resp).toMatchObject({
      name: "myPf",
      pid: myPid,
      stocks: []
    })
  })
  it('Create new portfolio and open', async () => {
    const newPid = await createPf(token, 'myPf2', d);
    const resp = await openPf(newPid, d);
    expect(resp).toMatchObject({
      name: "myPf2",
      pid: newPid,
      stocks: []
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

  it('Create and delete portfolio', async () => {
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

