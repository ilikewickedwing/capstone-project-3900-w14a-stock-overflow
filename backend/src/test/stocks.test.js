import { authRegister } from "../auth";
import { createPf } from "../portfolio";
import { checkStock, addStock, modifyStock } from "../stocks";
import { Database } from "../database";
import request from 'supertest';
import { app, database } from "../index";

describe('Check stock', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  it('Checking valid stock', async () => {
    const resp = await checkStock('AAP');
    expect(resp).toBe(true);
  })
  it('Checking invalid stock', async () => {
    const resp = await checkStock('Jono');
    expect(resp).toBe(false);
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Add stock', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  let token = null;
  let pid = null;

  it('Create new user and portfolio', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    token = rego.token;
    const getPid = await createPf(token, 'myPf', d);
    pid = getPid.pid;
    expect(pid).not.toBe(null);
  })
  it('Adding valid stock', async () => {
    const resp = await addStock(token, pid, 'IBM', 1.00, 2, d);
    expect(resp).toBe(-1);
    const stock = await d.getStock(pid, 'IBM');
    expect(stock).toMatchObject({
      stock: 'IBM',
      avgPrice: 1.00,
      quantity: 2,
    })
  })
  it('Adding invalid stock', async () => {
    const resp = await addStock(token, pid, 'Jono', 1.00 , 5, d);
    expect(resp).toBe(2);
    const stock = await d.getStock(pid, 'Jono');
    expect(stock).toBe(null);
  })
  it('Invalid token', async () => {
    const resp = await addStock('yep', pid, 'IBM', 1.00 , 5, d);
    expect(resp).toBe(1);
  })
  it('Invalid pid', async () => {
    const resp = await addStock(token, 'pid', 'IBM', 1.00 , 5, d);
    expect(resp).toBe(3);
  })
  it('Invalid quantity', async () => {
    const check1 = await addStock(token, pid, 'IBM', 1.00, 0, d);
    expect(check1).toBe(4);
    const check2 = await addStock(token, pid, 'IBM', 1.00, -2, d);
    expect(check2).toBe(4);
    const check3 = await addStock(token, pid, 'IBM', 1.00, 2.4, d);
    expect(check3).toBe(4);
    const check4 = await addStock(token, pid, 'IBM', 1.00, 'fakequantity', d);
    expect(check4).toBe(4);
    const check5 = await addStock(token, pid, 'IBM', 1.00, null, d);
    expect(check5).toBe(4);
  })
  it('Invalid price', async () => {
    const check1 = await addStock(token, pid, 'IBM', -2.00, 1, d);
    expect(check1).toBe(5);
    const check2 = await addStock(token, pid, 'IBM', 0.00, 1, d);
    expect(check2).toBe(5);
    const check3 = await addStock(token, pid, 'IBM', 'fakeprice', 1, d);
    expect(check3).toBe(5);
    const check4 = await addStock(token, pid, 'IBM', null, 1, d);
    expect(check4).toBe(5);
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Add stock endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })

  let token = null;
  let pid = null;

  it('200 on valid stock adding', async () => {
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
    pid = resp.body.pid;

    const add = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: 2,
    })
    expect(add.statusCode).toBe(200);
  })
  it('401 on invalid token', async () => {
    const add = await request(app).post(`/user/stocks/add`).send({
      token: 'faketoken',
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: 2,
    })
    expect(add.statusCode).toBe(401);
    expect(add.body.error).toBe("Invalid token");
  })
  it('403 on invalid stock', async () => {
    const add = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid,
      stock: 'fakestock',
      price: 1.00,
      quantity: 2,
    })
    expect(add.statusCode).toBe(403);
    expect(add.body.error).toBe("Invalid stock");
  })
  it('403 on invalid pid', async () => {
    const add = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: 'fakepid',
      stock: 'IBM',
      price: 1.00,
      quantity: 2,
    })
    expect(add.statusCode).toBe(403);
    expect(add.body.error).toBe("Invalid pid");
  })
  it('400 on invalid quantity', async () => {
    const add1 = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: 0
    })
    expect(add1.statusCode).toBe(400);
    expect(add1.body.error).toBe('Must include valid quantity purchased')
    const add2 = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: -2
    })
    expect(add2.statusCode).toBe(400);
    expect(add2.body.error).toBe('Must include valid quantity purchased')
    const add3 = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: 2.4
    })
    expect(add3.statusCode).toBe(400);
    expect(add3.body.error).toBe('Must include valid quantity purchased')
    const add4 = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: 'fakequantity'
    })
    expect(add4.statusCode).toBe(400);
    expect(add4.body.error).toBe('Must include valid quantity purchased')
    const add5 = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: null
    })
    expect(add5.statusCode).toBe(400);
    expect(add5.body.error).toBe('Must include valid quantity purchased')
  })
  it('400 on invalid price', async () => {
    const add1 = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: -2.00,
      quantity: 1
    })
    expect(add1.statusCode).toBe(400);
    expect(add1.body.error).toBe('Must include valid price purchased at');
    const add2 = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: -2.00,
      quantity: 1
    })
    expect(add2.statusCode).toBe(400);
    expect(add2.body.error).toBe('Must include valid price purchased at');
    const add3 = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: -2.00,
      quantity: 1
    })
    expect(add3.statusCode).toBe(400);
    expect(add3.body.error).toBe('Must include valid price purchased at');
    const add4 = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: -2.00,
      quantity: 1
    })
    expect(add4.statusCode).toBe(400);
    expect(add4.body.error).toBe('Must include valid price purchased at');
  })

  afterAll(async () => {
    await database.disconnect();
  })
})

describe('Modify stock', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  let token = null;
  let pid = null;

  it('Create new user and portfolio and adding a stock', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    token = rego.token;
    const getPid = await createPf(token, 'myPf', d);
    pid = getPid.pid;
    await addStock(token, pid, 'IBM', 1.00, 2, d);
  })
  it('Adding to existing stock', async () => {
    const resp = await modifyStock(token, pid, 'IBM', .5, 2, 1, d);
    expect(resp).toBe(-1);
    const stock = await d.getStock(pid, 'IBM');
    expect(stock).toMatchObject({
      stock: 'IBM',
      avgPrice: .75,
      quantity: 4,
    })
  })
  it('Selling part of a stock', async () => {
    const resp = await modifyStock(token, pid, 'IBM', .5, 2, 0, d);
    expect(resp).toBe(-1);
    const stock = await d.getStock(pid, 'IBM');
    expect(stock).toMatchObject({
      stock: 'IBM',
      avgPrice: .75,
      quantity: 2,
    })
  })
  it('Selling more stock than owned', async () => {
    const resp = await modifyStock(token, pid, 'IBM', 1, 555, 0, d);
    expect(resp).toBe(4);
    const stock = await d.getStock(pid, 'IBM');
    expect(stock).toMatchObject({
      stock: 'IBM',
      avgPrice: .75,
      quantity: 2,
    })
  })
  it('Invalid stock', async () => {
    const resp = await modifyStock(token, pid, 'Jono', 1, 2, 0, d);
    expect(resp).toBe(2);
  })
  it('Selling whole stock', async () => {
    const resp = await modifyStock(token, pid, 'IBM', 1, 2, 0, d);
    expect(resp).toBe(-1);
    const stock = await d.getStock(pid, 'IBM');
    expect(stock).toBe(null);
  })
  it('Stock is valid but not in portfolio', async () => {
    const resp = await modifyStock(token, pid, 'IBM', 1, 2, 0, d);
    expect(resp).toBe(5);
  })
  it('Invalid token', async () => {
    const resp = await modifyStock('token', pid, 'IBM', 1, 2, 0, d);
    expect(resp).toBe(1);
  })
  it('Invalid pid', async () => {
    const resp = await modifyStock(token, 'pid', 'IBM', 1, 2, 0, d);
    expect(resp).toBe(3);
  })
  it('Invalid quantity', async () => {
    const check1 = await modifyStock(token, pid, 'IBM', 1.00, 0, 0, d);
    expect(check1).toBe(6);
    const check2 = await modifyStock(token, pid, 'IBM', 1.00, -2, 0, d);
    expect(check2).toBe(6);
    const check3 = await modifyStock(token, pid, 'IBM', 1.00, 2.4, 0, d);
    expect(check3).toBe(6);
    const check4 = await modifyStock(token, pid, 'IBM', 1.00, 'fakequantity', 0, d);
    expect(check4).toBe(6);
    const check5 = await modifyStock(token, pid, 'IBM', 1.00, null, 0, d);
    expect(check5).toBe(6);
  })
  it('Invalid price', async () => {
    const check1 = await modifyStock(token, pid, 'IBM', -2.00, 1, 0, d);
    expect(check1).toBe(7);
    const check2 = await modifyStock(token, pid, 'IBM', 0.00, 1, 0, d);
    expect(check2).toBe(7);
    const check3 = await modifyStock(token, pid, 'IBM', 'fakeprice', 1, 0, d);
    expect(check3).toBe(7);
    const check4 = await modifyStock(token, pid, 'IBM', null, 1, 0, d);
    expect(check4).toBe(7);
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Modify stock endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })

  let token = null;
  let pid = null;

  it('200 on valid stock modifying and adding', async () => {
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
    pid = resp.body.pid;

    const add = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: 2,
    })
    expect(add.statusCode).toBe(200);

    const mod = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: .5,
      quantity: 2,
      option: 1,
    })
    expect(mod.statusCode).toBe(200);

    const stock = await database.getStock(pid, 'IBM');
    expect(stock).toMatchObject({
      stock: 'IBM',
      avgPrice: .75,
      quantity: 4,
    })
  })
  it('200 on valid stock selling', async () => {
    const sell = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: .5,
      quantity: 2,
      option: 0,
    })
    expect(sell.statusCode).toBe(200);

    const stock = await database.getStock(pid, 'IBM');
    expect(stock).toMatchObject({
      stock: 'IBM',
      avgPrice: .75,
      quantity: 2,
    })
  })
  it('401 on invalid token', async () => {
    const add = await request(app).put(`/user/stocks/edit`).send({
      token: 'faketoken',
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: 2,
      option: 1,
    })
    expect(add.statusCode).toBe(401);
    expect(add.body.error).toBe("Invalid token");
  })
  it('403 on invalid stock', async () => {
    const add = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'fakestock',
      price: 1.00,
      quantity: 2,
      option: 1,
    })
    expect(add.statusCode).toBe(403);
    expect(add.body.error).toBe("Invalid stock");
  })
  it('403 on invalid pid', async () => {
    const add = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: 'fakepid',
      stock: 'IBM',
      price: 1.00,
      quantity: 2,
      option: 1,
    })
    expect(add.statusCode).toBe(403);
    expect(add.body.error).toBe("Invalid pid");
  })
  it('403 on invalid selling quantity', async () => {
    const mod = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: 155,
      option: 0,
    })
    expect(mod.statusCode).toBe(403);
    expect(mod.body.error).toBe("Quantity to sell too high");
  })
  it('200 on selling entire stock', async() => {
    const mod = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: 2.00,
      option: 0,
    })
    expect(mod.statusCode).toBe(200);
    const stock = await database.getStock(pid, 'IBM');
    expect(stock).toBe(null);
  })
  it('404 on valid stock not in portfolio', async() => {
    const mod = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: 2,
      option: 0,
    })
    expect(mod.statusCode).toBe(404);
    expect(mod.body.error).toBe("Stock is not in portfolio");
  })
  it('400 on invalid quantity', async () => {
    const add1 = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: 0,
      option: 0,
    })
    expect(add1.statusCode).toBe(400);
    expect(add1.body.error).toBe('Must include valid quantity purchased')
    const add2 = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: -2,
      option: 0,
    })
    expect(add2.statusCode).toBe(400);
    expect(add2.body.error).toBe('Must include valid quantity purchased')
    const add3 = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: 2.4,
      option: 0,
    })
    expect(add3.statusCode).toBe(400);
    expect(add3.body.error).toBe('Must include valid quantity purchased')
    const add4 = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: 'fakequantity',
      option: 0,
    })
    expect(add4.statusCode).toBe(400);
    expect(add4.body.error).toBe('Must include valid quantity purchased')
    const add5 = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: 1.00,
      quantity: null,
      option: 0,
    })
    expect(add5.statusCode).toBe(400);
    expect(add5.body.error).toBe('Must include valid quantity purchased')
  })
  it('400 on invalid price', async () => {
    const add1 = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: -2.00,
      quantity: 1,
      option: 0,
    })
    expect(add1.statusCode).toBe(400);
    expect(add1.body.error).toBe('Must include valid price purchased at');
    const add2 = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: -2.00,
      quantity: 1,
      option: 0,
    })
    expect(add2.statusCode).toBe(400);
    expect(add2.body.error).toBe('Must include valid price purchased at');
    const add3 = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: -2.00,
      quantity: 1,
      option: 0,
    })
    expect(add3.statusCode).toBe(400);
    expect(add3.body.error).toBe('Must include valid price purchased at');
    const add4 = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid,
      stock: 'IBM',
      price: -2.00,
      quantity: 1,
      option: 0,
    })
    expect(add4.statusCode).toBe(400);
    expect(add4.body.error).toBe('Must include valid price purchased at');
  })

  afterAll(async () => {
    await database.disconnect();
  })
})