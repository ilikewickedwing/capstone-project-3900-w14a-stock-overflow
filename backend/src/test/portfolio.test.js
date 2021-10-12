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

  let token = null;

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

  let token = null;

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
    expect(resp.body.message).toBe("Invalid portfolio name");
  })
  it('400 on invalid portfolio name ie. duplicate', async () => {
    const resp = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'myPf'
    })
    expect(resp.statusCode).toBe(400);
    expect(resp.body.message).toBe("Portfolio name already in use");
  })
  it('401 on invalid token', async () => {
    const resp = await request(app).post(`/user/portfolios/create`).send({
      token: "faketoken",
      name: 'myPf'
    })
    expect(resp.statusCode).toBe(401);
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

  let uid = null;
  let token = null;
  let wpid = null;
  let pid1 = null;

  it('Create new user and check portfolios', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    uid = rego.uid;
    token = rego.token;
    const resp = await userPfs(token, d);
    expect(resp).not.toBe(null);
    expect(resp[0]).toMatchObject({ 
      name: "Watchlist",
      pid: expect.any(String),
    });
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

describe('Portfolio get endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })

  let token = null;

  it('200 on valid portfolio retrieval', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', database);
    token = rego.token;
    const resp = await request(app).get(`/user/portfolios?token=${token}`).send()
    expect(resp.statusCode).toBe(200);
    expect(resp.body[0]).toMatchObject({ 
      name: "Watchlist",
      pid: expect.any(String),
    });
  })
  it('200 on valid portfolio creation and subsequent retrieval', async () => {
    const create = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'myPf'
    })
    expect(create.statusCode).toBe(200);
    expect(create.body).toMatchObject({
      pid: expect.any(String)
    });
    const resp = await request(app).get(`/user/portfolios?token=${token}`).send()
    expect(resp.statusCode).toBe(200);
    expect(resp.body[0]).toMatchObject({ 
      name: "Watchlist",
      pid: expect.any(String),
    });
    expect(resp.body[1]).toMatchObject({
      name: "myPf",
      pid: expect.any(String),
    })
  })
  it('200 on valid portfolio deletion and subsequent retrieval', async () => {
    const pid = await getPid(token, "myPf", database);
    const del = await request(app).delete(`/user/portfolios/delete`).send({
      token: token,
      pid: pid
    });    
    expect(del.statusCode).toBe(200);
    const resp = await request(app).get(`/user/portfolios?token=${token}`).send()
    expect(resp.statusCode).toBe(200);
    expect(resp.body[0]).toMatchObject({ 
      name: "Watchlist",
      pid: expect.any(String),
    });
    expect(resp.body[1]).toBe(undefined);
  })
  it('401 on invalid token', async () => {
    const resp = await request(app).get(`/user/portfolios?token=faketoken`).send()
    expect(resp.statusCode).toBe(401);
  })

  afterAll(async() => {
    await database.disconnect();
  })
})

describe('Portfolio open', () => {
  const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  let uid = null;
  let token = null;
  let myPid = null;

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

describe('Portfolio open endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })

  let token = null;

  it('200 on valid watchlist open', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', database);
    token = rego.token;
    const pid = await getPid(token, "Watchlist", database);
    const resp = await request(app).get(`/user/portfolios/open?pid=${pid}`).send()
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toMatchObject({ 
      name: "Watchlist",
      pid: pid,
      stocks: []
    });
  })
  it('200 on valid portfolio creation and subsequent retrieval', async () => {
    const create = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'myPf'
    })
    expect(create.statusCode).toBe(200);
    expect(create.body).toMatchObject({
      pid: expect.any(String)
    });
    const pid = await getPid(token, "myPf", database);
    const resp = await request(app).get(`/user/portfolios/open?pid=${pid}`).send()
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toMatchObject({
      name: "myPf",
      pid: pid,
      stocks: []
    })
  })
  it('403 on invalid pid', async () => {
    const resp = await request(app).get(`/user/portfolios/open?pid=fakepid`).send()
    expect(resp.statusCode).toBe(403);
  })

  afterAll(async() => {
    await database.disconnect();
  })
})

describe('Portfolio edit', () => {
  const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  let uid = null;
  let token = null;
  let wPid = null;
  let myPid = null;

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
    expect(resp).toBe(1);
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
    expect(edit).toBe(1);
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
  it('Can not edit with name that is already in use', async () => {
    const getpid = await createPf(token, 'myPf', d);
    const newPid = getpid.pid;
    const myArray = [{ name: "myPf", pid: newPid }];
    const uPfs1 = await userPfs(token, d);
    expect(uPfs1).toEqual(expect.arrayContaining(myArray));
    const edit = await editPf(token, newPid, 'updatedPf', d);
    expect(edit).toBe(-1);
  })
  it('Can not edit with invalid name', async () => {
    const edit = await editPf(token, myPid, '', d);
    expect(edit).toBe(2);
  })
  it('Can not edit watchlist', async () => {
    const edit = await editPf(token, wPid, "updatedPf3", d);
    expect(edit).toBe(5);
  })
  it('Can not edit with invalid token', async () => {
    const edit = await editPf("faketoken", myPid, "updatedPf3", d);
    expect(edit).toBe(3);
  })
  it('Can not edit with invalid pid', async () => {
    const edit = await editPf(token, "fakepid", 'updatedPf3', d);
    expect(edit).toBe(4);
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Portfolio edit endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })

  let token = null;

  it('200 on valid portfolio edit', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', database);
    token = rego.token;
    const create = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'myPf'
    })
    expect(create.statusCode).toBe(200);
    expect(create.body).toMatchObject({
      pid: expect.any(String)
    });
    const pid = await getPid(token, "myPf", database);
    const resp = await request(app).post(`/user/portfolios/edit`).send({
      token: token,
      pid: pid,
      name: 'updatedPf'
    })
    expect(resp.statusCode).toBe(200);
    const pid1 = await getPid(token, "updatedPf", database);
    // expect(pid1).toBe(pid);
    const pid2 = await getPid(token, 'myPf', database);
    // expect(pid2).toBe(null);
    const resp1 = await request(app).get(`/user/portfolios/open?pid=${pid}`).send()
    expect(resp1.statusCode).toBe(200);
    expect(resp1.body).toMatchObject({
      name: "updatedPf",
      pid: pid,
      stocks: []
    })
  })
  it('400 on name already being used', async () => {
    const resp3 = await request(app).get(`/user/portfolios?token=${token}`).send()
    expect(resp3.statusCode).toBe(200);
    expect(resp3.body[0]).toMatchObject({ 
      name: "Watchlist",
      pid: expect.any(String),
    });
    const create = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'name'
    })
    expect(create.statusCode).toBe(200);
    expect(create.body).toMatchObject({
      pid: expect.any(String)
    });
    const create1 = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'duped name'
    })
    expect(create1.statusCode).toBe(200);
    expect(create1.body).toMatchObject({
      pid: expect.any(String)
    });
    const pid = await getPid(token, "duped name", database);
    const resp = await request(app).post(`/user/portfolios/edit`).send({
      token: token,
      pid: pid,
      name: 'name'
    })
    expect(resp.statusCode).toBe(400);
    expect(resp.body.message).toBe("Name already in use");
  })
  it('400 on invalid name provided', async () => {
    const create = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'myPf1'
    })
    expect(create.statusCode).toBe(200);
    expect(create.body).toMatchObject({
      pid: expect.any(String)
    });

    const pid = await getPid(token, "myPf1", database);
    const resp = await request(app).post(`/user/portfolios/edit`).send({
      token: token,
      pid: pid,
      name: ''
    })
    expect(resp.statusCode).toBe(400);
    expect(resp.body.message).toBe("Invalid name");
  })
  it('400 on invalid pid', async () => {
    const resp = await request(app).post(`/user/portfolios/edit`).send({
      token: token,
      pid: "fakepid",
      name: 'My name'
    })
    expect(resp.statusCode).toBe(400);
    expect(resp.body.message).toBe("Invalid pid");
  })
  it('401 on invalid token', async () => {
    const create = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'myPf2'
    })
    expect(create.statusCode).toBe(200);
    expect(create.body).toMatchObject({
      pid: expect.any(String)
    });

    const pid = await getPid(token, "myPf2", database);

    const resp = await request(app).post(`/user/portfolios/edit`).send({
      token: "faketoken",
      pid: pid,
      name: 'My name'
    })
    expect(resp.statusCode).toBe(401);
    expect(resp.body.message).toBe("Invalid token");
  })
  it('403 on invalid watchlist edit', async () => {
    const pid = await getPid(token, "Watchlist", database);
    const resp = await request(app).post(`/user/portfolios/edit`).send({
      token: token,
      pid: pid,
      name: 'My name'
    })
    expect(resp.statusCode).toBe(403);
    expect(resp.body.message).toBe("Can not edit watchlist");
  })

  afterAll(async() => {
    await database.disconnect();
  })
})

describe('Porfolio delete', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  let uid = null;
  let token = null;
  let wPid = null;
  let myPid = null;

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
    expect(delResp).toBe(1);
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
    let Pfs = await userPfs(token, d);
    expect(Pfs).toEqual(expect.arrayContaining(myArray));
    let myPid1 = await getPid(token, 'myPf', d);
    expect(myPid1).toBe(create);
    const delResp = await deletePf(token, create, d);
    expect(delResp).toBe(1);
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

describe('Portfolio delete endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })

  let token = null;

  it('200 on valid portfolio deletion', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', database);
    token = rego.token;
    const create = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'myPf'
    })
    expect(create.statusCode).toBe(200);
    expect(create.body).toMatchObject({
      pid: expect.any(String)
    });
    const pid = await getPid(token, "myPf", database);
    const resp = await request(app).delete(`/user/portfolios/delete`).send({
      token: token,
      pid: pid
    });
    expect(resp.statusCode).toBe(200);
    const resp1 = await request(app).get(`/user/portfolios/open?pid=${pid}`).send()
    expect(resp1.statusCode).toBe(403);
  })
  it('400 on invalid pid', async () => {
    const create = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'myPf'
    })
    expect(create.statusCode).toBe(200);
    expect(create.body).toMatchObject({
      pid: expect.any(String)
    });
    const resp = await request(app).delete(`/user/portfolios/delete`).send({
      token: token,
      pid: 'fakepid'
    });    
    expect(resp.statusCode).toBe(400);
  })
  it('401 on invalid token', async () => {
    const create = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'myPf2'
    })
    expect(create.statusCode).toBe(200);
    expect(create.body).toMatchObject({
      pid: expect.any(String)
    });
    const pid = await getPid(token, "myPf", database);
    const resp = await request(app).delete(`/user/portfolios/delete`).send({
      token: 'faketoken',
      pid: pid
    });    
    expect(resp.statusCode).toBe(401);
  })
  it('403 on invalid watchlist deletion', async () => {
    const pid = await getPid(token, "Watchlist", database);
    const resp = await request(app).delete(`/user/portfolios/delete`).send({
      token: token,
      pid: pid
    });    
    expect(resp.statusCode).toBe(403);
  })

  afterAll(async() => {
    await database.disconnect();
  })
})