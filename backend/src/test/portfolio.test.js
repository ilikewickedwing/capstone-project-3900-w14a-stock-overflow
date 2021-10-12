import { authRegister } from "../auth";
import { createPf, deletePf, userPfs, openPf, getPid, editPf } from "../portfolio";
import { Database } from "../database";
import request from 'supertest';
import { app, database } from "../index";
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
    const pf = await openPf(resp.pid, d);
    expect(pf).toMatchObject({
      pid: expect.any(String)
    })
  })
  it('Creating a new portfolio returns a valid portfolio name', async () => {
    const resp = await createPf(token, 'myPf3', d);
    const pf = await openPf(resp.pid, d);
    expect(pf).toMatchObject({
      name: 'myPf3'
    })
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Portfolio create endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })

  var token = null;

  it('200 on valid creation', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', database);
    token = rego.token;
    const resp = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'myPf'
    })
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toMatchObject({
      pid: expect.any(String)
    });
  })
  it('400 on invalid portfolio name ie. empty', async () => {
    const resp = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: ''
    })
    expect(resp.statusCode).toBe(400);
  })
  it('400 on invalid portfolio name ie. duplicate', async () => {
    const resp = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'myPf'
    })
    expect(resp.statusCode).toBe(400);
  })
  it('403 on invalid token', async () => {
    const resp = await request(app).post(`/user/portfolios/create`).send({
      token: "faketoken",
      name: 'myPf'
    })
    expect(resp.statusCode).toBe(403);
  })

  afterAll(async() => {
    await database.disconnect();
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
    const myArray = [{ name: "Watchlist", pid: wpid }];
    expect(resp).toEqual(expect.arrayContaining(myArray));
  })
  it('Add portfolio to user portfolios', async () => {
    const getpid = await createPf(token, 'myPf', d);
    pid1 = getpid.pid;
    const myArray = [{ name: "Watchlist", pid: wpid }, 
    { name: "myPf", pid: pid1 }];
    const resp = await userPfs(token, d);
    expect(resp).toEqual(expect.arrayContaining(myArray));
  })
  it('Add second portfolio to user portfolios', async () => {
    const getpid = await createPf(token, 'myPf2', d);
    const pid2 = getpid.pid;
    const myArray =  [{ name: "Watchlist", pid: wpid }, 
      { name: "myPf", pid: pid1 }, { name: "myPf2", pid: pid2 }];
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
    const getpid = await createPf(token, 'myPf', d);
    myPid = getpid.pid;
    const myArray = [{ name: 'myPf', pid: myPid }];
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
    const getpid = await createPf(token, 'myPf2', d);
    const newPid = getpid.pid;
    const resp = await openPf(newPid, d);
    expect(resp).toMatchObject({
      name: "myPf2",
      pid: newPid,
      stocks: []
    });
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Portfolio edit', () => {
  const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  var uid = null;
  var token = null;
  var wPid = null;
  var myPid = null;

  it('Create new user and add portfolio', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    uid = rego.uid;
    token = rego.token;
    wPid = await getPid(token, "Watchlist", d);
    const getpid = await createPf(token, 'myPf', d);
    myPid = getpid.pid;
    const myArray = [{ name: "Watchlist", pid: wPid }, { name: "myPf", pid: myPid }];
    const resp = await userPfs(token, d);
    expect(resp).toEqual(expect.arrayContaining(myArray));
  })
  it('Edit portfolio', async () => {
    const resp = await editPf(token, myPid, 'updatedPf', d);
    expect(resp).not.toBe(null);
  })
  it('Edited portfolio name shows up in database', async () => {
    const resp = await openPf(myPid, d);
    expect(resp).toMatchObject({
      name: "updatedPf",
      pid: myPid,
      stocks: []
    });
  })
  it('Edited portfolio name shows up in user portfolios', async () => {
    const resp = await userPfs(token, d);
    const myArray = [{ name: "Watchlist", pid: wPid }, { name: "updatedPf", pid: myPid }];
    expect(resp).toEqual(expect.arrayContaining(myArray));
  })
  it('Create new portfolio and confirm edit', async () => {
    const getpid = await createPf(token, 'myPf', d);
    const newPid = getpid.pid;
    const myArray1 = [{ name: "myPf", pid: newPid }];
    const uPfs = await userPfs(token, d);
    expect(uPfs).toEqual(expect.arrayContaining(myArray1));
    const edit = await editPf(token, newPid, 'updatedPf2', d);
    expect(edit).not.toBe(null);
    const dbPf = await openPf(newPid, d);
    expect(dbPf).toMatchObject({
      name: "updatedPf2",
      pid: newPid,
      stocks: []
    });
    const nuPfs = await userPfs(token, d);
    const myArray2 = [{ name: "updatedPf2", pid: newPid }];
    expect(nuPfs).toEqual(expect.arrayContaining(myArray2));
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

  var uid = null;
  var token = null;
  var wPid = null;
  var myPid = null;

  it('Create new user and add portfolio', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    uid = rego.uid;
    token = rego.token;
    wPid = await getPid(token, "Watchlist", d);
    const getpid = await createPf(token, 'myPf', d);
    myPid = getpid.pid;
    const myArray = [{ name: "Watchlist", pid: wPid }, { name: 'myPf', pid: myPid }];
    const resp = await userPfs(token, d);
    expect(resp).toEqual(expect.arrayContaining(myArray));
  })
  it('Check for portfolio in database', async () => {
    const delResp = await deletePf(token, myPid, d);
    expect(delResp).toBe(true);
    const pf = await openPf(myPid, d);
    expect(pf).toBe(null);
  })
  it('Check for portfolio in users portfolios', async () => {
    const resp = await userPfs(token, d);
    const myArray = [{ name: 'myPf', pid: myPid }];
    expect(resp).toEqual(expect.not.arrayContaining(myArray));
  })
  it('Add and delete new portfolio', async () => {
    const getpid = await createPf(token, 'myPf', d);
    const create = getpid.pid;
    const myArray = [{ name: 'myPf', pid: create }];
    var Pfs = await userPfs(token, d);
    expect(Pfs).toEqual(expect.arrayContaining(myArray));
    var myPid1 = await getPid(token, 'myPf', d);
    expect(myPid1).toBe(create);
    const delResp = await deletePf(token, create, d);
    expect(delResp).toBe(true);
    const pf = await openPf(create, d);
    expect(pf).toBe(null);
    myPid1 = await getPid(token, 'myPf', d);
    expect(myPid1).toBe(null);
    Pfs = await userPfs(token, d);
    expect(Pfs).toEqual(expect.not.arrayContaining(myArray));
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

