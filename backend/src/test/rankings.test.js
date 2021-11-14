import { authRegister } from "../auth";
import { createPf, userPfs, openPf } from "../portfolio";
import { calcPf, getFriendRankings, rankAll } from "../performance";
import { addStock, modifyStock, getStock } from "../stocks";
import { Database } from "../database";
import { calcAll } from "../performance";
import request from 'supertest';
import { app, database } from "../index";
import { getDefBroker, setDefBroker } from "../user";
import { addFriend } from "../social";

describe('Rank multiple user portfolio performances', () => {
	const d = new Database(true);
	beforeAll(async () => {
	  await d.connect();
	})
  
	jest.setTimeout(30000);
  
	let token1 = null;
  let uid1 = null;
	let pid1 = null;

  let token2 = null;
  let uid2 = null;
  let pid2 = null;

  let token3 = null;
  let uid3 = null;
  let pid3 = null;
  let pid4 = null;
  
	const now = new Date();
	const today = new Date(now);
	const time = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
	const date = time.toString();

  let daysCalced = 0;
  
	it('Register user and create portfolios', async () => {
	  const rego = await authRegister('Ashley', 'strongpassword', d);
	  token1 = rego.token;
    uid1 = rego.uid;
	  const create = await createPf(token1, 'pf', d);
	  expect(create).toMatchObject({
		  pid: expect.any(String),
	  })
	  pid1 = create.pid;

    const rego2 = await authRegister('Richard', 'strongpassword', d);
    token2 = rego2.token;
    uid2 = rego2.uid;
    const create2 = await createPf(token2, 'pf', d);
    expect(create2).toMatchObject({
      pid: expect.any(String),
    })
    pid2 = create2.pid;

    const rego3 = await authRegister('Jono', 'strongpassword', d);
    token3 = rego3.token;
    uid3 = rego3.uid;
    const create3 = await createPf(token3, 'pf', d);
    expect(create3).toMatchObject({
      pid: expect.any(String),
    })
    pid3 = create3.pid;
    const create4 = await createPf(token3, 'pf2', d);
    expect(create4).toMatchObject({
      pid: expect.any(String),
    })
    pid4 = create4.pid;
    // console.log(create4);
	})
	it('Set default brokerage costs', async () => {
	  const resp = await setDefBroker(token1, '5', '1', d);
	  expect(resp).toBe(1);

    const resp2 = await setDefBroker(token2, '0', '0', d);
	  expect(resp2).toBe(1);

    const resp3 = await setDefBroker(token3, '50', '0', d);
    expect(resp3).toBe(1);
	})
  it('Add friends', async () => {
    const friend1 = await addFriend(token1, uid2, d);
    expect(friend1).toBe(true);
    const friend2 = await addFriend(token1, uid3, d);
    expect(friend2).toBe(true);
    const friend3 = await addFriend(token2, uid1, d);
    expect(friend3).toBe(true);
    const friend4 = await addFriend(token2, uid3, d);
    expect(friend4).toBe(true);
    const friend5 = await addFriend(token3, uid1, d);
    expect(friend5).toBe(true);
    const friend6 = await addFriend(token3, uid3, d);
    expect(friend6).toBe(true);
  })
	it('Add stocks to portfolio', async () => {
    daysCalced = 10;
    const test = new Date();
    test.setDate(today.getDate() - daysCalced);
    const testDate = test.getFullYear() + '-' + ('0' + (test.getMonth() + 1)).slice(-2) + '-' + ('0' + test.getDate()).slice(-2);

    let values = await getStock(2, 'AAPL', 'daily', testDate);
    let price = values.data.history.day[0].close;
	  const add1 = await addStock(token1, pid1, 'AAPL', price, 2, null, null, d);
	  expect(add1).toBe(-1);

    const add1_ = await addStock(token2, pid2, 'AAPL', price, 2, null, null, d);
	  expect(add1_).toBe(-1);

    const add1__ = await addStock(token3, pid3, 'AAPL', price, 2, null, null, d);
	  expect(add1__).toBe(-1);

    values = await getStock(2, 'NVDA', 'daily', testDate);
    price = values.data.history.day[0].close;
    const add1_1 = await addStock(token3, pid4, 'NVDA', price, 2, null, null, d);
    expect(add1_1).toBe(-1);

    values = await getStock(2, 'AMZN', 'daily', testDate);
    price = values.data.history.day[0].close;
	  const add2 = await addStock(token1, pid1, 'AMZN', price, 2, null, null, d);
	  expect(add2).toBe(-1);

    const add2_ = await addStock(token2, pid2, 'AMZN', price, 2, null, null, d);
	  expect(add2_).toBe(-1);

    const add2__ = await addStock(token3, pid3, 'AMZN', price, 2, null, null, d);
	  expect(add2__).toBe(-1);

    values = await getStock(2, 'MSFT', 'daily', testDate);
    price = values.data.history.day[0].close;
    const add2_1 = await addStock(token3, pid4, 'MSFT', price, 2, null, null, d);
    expect(add2_1).toBe(-1);

    values = await getStock(2, 'IBM', 'daily', testDate);
    price = values.data.history.day[0].close;
	  const add3 = await addStock(token1, pid1, 'IBM', price, 1, null, null, d);
	  expect(add3).toBe(-1);

    const add3_ = await addStock(token2, pid2, 'IBM', price, 1, null, null, d);
	  expect(add3_).toBe(-1);

    const add3__ = await addStock(token3, pid3, 'IBM', price, 1, null, null, d);
	  expect(add3__).toBe(-1);

    values = await getStock(2, 'FB', 'daily', testDate);
    price = values.data.history.day[0].close;
    const add3_1 = await addStock(token3, pid4, 'FB', price, 2, null, null, d);
    expect(add3_1).toBe(-1);

    // const check = await openPf(token3, pid4, d);
    // console.dir(check, {depth:null});
	})
	it('Calculate portfolio performance first', async () => {
    const test = new Date();
    test.setDate(today.getDate() - daysCalced);
    const testDate = test.getFullYear() + '-' + ('0' + (test.getMonth() + 1)).slice(-2) + '-' + ('0' + test.getDate()).slice(-2);
    const calc1 = await calcPf(token1, pid1, d, 'yes', 'yes', testDate, 3);
    const calc2 = await calcPf(token2, pid2, d, 'yes', 'yes', testDate, 3);
    const calc3 = await calcPf(token3, pid3, d, 'yes', 'yes', testDate, 3);
    const calc4 = await calcPf(token3, pid4, d, 'yes', 'yes', testDate, 3);
    daysCalced -= 4;
    expect(calc1).not.toBe(null);
    expect(calc2).not.toBe(null);
    expect(calc3).not.toBe(null);
    expect(calc4).not.toBe(null);	  // const stocks = await openPf(token1, pid1, d);
    // const stocks1 = await openPf(token1, pid1, d);
    // const stocks2 = await openPf(token2, pid2, d);
    // console.dir(stocks1, { depth: null });
    // console.dir(stocks2, { depth: null });
	  // console.dir(stocks, { depth: null });
    // console.log(daysCalced);
	})
	it('Buy extra of all stocks in portfolio', async () => {
    const test = new Date();
    test.setDate(today.getDate() - daysCalced);
    const testDate = test.getFullYear() + '-' + ('0' + (test.getMonth() + 1)).slice(-2) + '-' + ('0' + test.getDate()).slice(-2);

    let values = await getStock(2, 'AAPL', 'daily', testDate);
    let price = values.data.history.day[0].close;
	  const add1 = await addStock(token1, pid1, 'AAPL', price, 2, null, null, d);
	  expect(add1).toBe(-1);

    const add1_ = await addStock(token2, pid2, 'AAPL', price, 2, null, null, d);
	  expect(add1_).toBe(-1);

    values = await getStock(2, 'AMZN', 'daily', testDate);
    price = values.data.history.day[0].close;
	  const add2 = await addStock(token1, pid1, 'AMZN', price, 2, null, null, d);
	  expect(add2).toBe(-1);

    const add2_ = await addStock(token2, pid2, 'AMZN', price, 2, null, null, d);
	  expect(add2_).toBe(-1);

    values = await getStock(2, 'IBM', 'daily', testDate);
    price = values.data.history.day[0].close;
	  const add3 = await addStock(token1, pid1, 'IBM', price, 1, null, null, d);
	  expect(add3).toBe(-1);

    const add3_ = await addStock(token2, pid2, 'IBM', price, 1, null, null, d);
	  expect(add3_).toBe(-1);
	})
	it('Calculate portfolio performance second', async () => {
	  const test = new Date();
    test.setDate(today.getDate() - daysCalced);
    const testDate = test.getFullYear() + '-' + ('0' + (test.getMonth() + 1)).slice(-2) + '-' + ('0' + test.getDate()).slice(-2);
    const calc1 = await calcPf(token1, pid1, d, 'yes', 'yes', testDate, 2);
    const calc2 = await calcPf(token2, pid2, d, 'yes', 'yes', testDate, 2);
    const calc3 = await calcPf(token3, pid3, d, 'yes', 'yes', testDate, 2);
    const calc4 = await calcPf(token3, pid4, d, 'yes', 'yes', testDate, 2);
    daysCalced -= 3;
    expect(calc1).not.toBe(null);
    expect(calc2).not.toBe(null);
    expect(calc3).not.toBe(null);
    expect(calc4).not.toBe(null);
	  // console.log("calc is " + calc);
	  // const stocks1 = await openPf(token1, pid1, d);
    // const stocks2 = await openPf(token2, pid2, d);
    // const stocks3 = await openPf(token3, pid3, d);
    // const stocks4 = await openPf(token3, pid4, d);
	  // console.dir(stocks1, { depth: null });
    // console.dir(stocks2, { depth: null });
    // console.dir(stocks3, { depth: null });
    // console.dir(stocks4, { depth: null });
    // console.log(daysCalced);
	})
	it('Rank portfolios', async () => {
		await rankAll(d);
		const rankings = await d.getRankings();
		console.dir(rankings, { depth: null });
	})
	it('CalcAll', async () => {
		await calcAll(d, true);
    let rankings = null;
    // setTimeout(async () => {
      rankings = await d.getRankings();
    // }, 10000);
    console.dir(rankings, { depth: null });
    expect(rankings).not.toBe(null);
	})
  // it('Test friend rank 1', async () => {
  //   const friendRank = await getFriendRankings1(token1, d);
  //   expect(friendRank).not.toBe(null);
  //   console.dir(friendRank, {depth:null});
  // })
  it('Test friend ranks', async () => {
    const friendRank = await getFriendRankings(token1, d);
    expect(friendRank).not.toBe(null);
    console.dir(friendRank, {depth:null});
  })
  
	afterAll(async () => {
	  await d.disconnect();
	})
})

/* describe('Rank multiple user portfolios performances endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })

  jest.setTimeout(30000);

  let token1 = null;
  let uid1 = null;
  let token2 = null;
  let uid2 = null;
  let token3 = null;
  let uid3 = null;

  let pid1 = null;
  let pid2 = null;
  let pid3 = null;
  let pid4 = null;
  
  const now = new Date();
  const today = new Date(now);
  const time = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
  const date = time.toString();

  let daysCalced = null;

  it('200 on first valid portfolio creation', async () => {
    const rego1 = await authRegister('Ashley', 'strongpassword', database);
    token1 = rego1.token;
    uid1 = rego1.uid;
    const rego2 = await authRegister('Richard', 'strongpassword', database);
    token2 = rego2.token;
    uid2 = rego2.uid;
    const rego3 = await authRegister('Jono', 'strongpassword', database);
    token3 = rego3.token;
    uid3 = rego3.uid;

    const resp1 = await request(app).post(`/user/portfolios/create`).send({
      token: token1,
      name: 'myPf'
    })
    expect(resp1.statusCode).toBe(200);
    pid1 = resp1.body.pid;
    const resp2 = await request(app).post(`/user/portfolios/create`).send({
      token: token2,
      name: 'myPf'
    })
    expect(resp2.statusCode).toBe(200);
    pid2 = resp2.body.pid;
    const resp3 = await request(app).post(`/user/portfolios/create`).send({
      token: token3,
      name: 'myPf'
    })
    expect(resp3.statusCode).toBe(200);
    pid3 = resp3.body.pid;
    const resp4 = await request(app).post(`/user/portfolios/create`).send({
      token: token3,
      name: 'myPf2'
    })
    expect(resp4.statusCode).toBe(200);
    pid4 = resp4.body.pid;
  })
  it('200 on valid set default brokerage value', async () => {
    const resp1 = await request(app).post(`/user/setDefBroker`).send({
      token: token1,
      defBroker: '5',
      brokerFlag: '1'
    })
    expect(resp1.statusCode).toBe(200);
    const resp2 = await request(app).post(`/user/setDefBroker`).send({
      token: token2,
      defBroker: '0',
      brokerFlag: '0'
    })
    expect(resp2.statusCode).toBe(200);
    const resp3 = await request(app).post(`/user/setDefBroker`).send({
      token: token3,
      defBroker: '50',
      brokerFlag: '0'
    })
    expect(resp3.statusCode).toBe(200);
  })
  it('200 on add friends', async () => {
    const resp1 = await request(app).post(`/friends/add`).send({
      token: token1,
      friendID: uid2
    })
    expect(resp1.statusCode).toBe(200);
    const resp2 = await request(app).post(`/friends/add`).send({
      token: token1,
      friendID: uid3
    })
    expect(resp2.statusCode).toBe(200);
    const resp3 = await request(app).post(`/friends/add`).send({
      token: token2,
      friendID: uid1
    })
    expect(resp3.statusCode).toBe(200);
    const resp4 = await request(app).post(`/friends/add`).send({
      token: token2,
      friendID: uid3
    })
    expect(resp4.statusCode).toBe(200);
    const resp5 = await request(app).post(`/friends/add`).send({
      token: token3,
      friendID: uid1
    })
    expect(resp5.statusCode).toBe(200);
    const resp6 = await request(app).post(`/friends/add`).send({
      token: token3,
      friendID: uid2
    })
    expect(resp6.statusCode).toBe(200);
  })
  it('200 on first valid stock addition', async () => {
    daysCalced = 10;
    const test = new Date();
    test.setDate(today.getDate() - daysCalced);
    const testDate = test.getFullYear() + '-' + ('0' + (test.getMonth() + 1)).slice(-2) + '-' + ('0' + test.getDate()).slice(-2);
    
    let values = await getStock(2, 'AAPL', 'daily', testDate);
    let price = values.data.history.day[0].close;
	  const add1 = await request(app).post(`/user/stocks/add`).send({
      token: token1, 
      pid: pid1, 
      stock: 'AAPL', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add1.statusCode).toBe(200);
    const add1_ = await request(app).post(`/user/stocks/add`).send({
      token: token2, 
      pid: pid2, 
      stock: 'AAPL', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add1_.statusCode).toBe(200);
    const add1__ = await request(app).post(`/user/stocks/add`).send({
      token: token3, 
      pid: pid3, 
      stock: 'AAPL', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add1__.statusCode).toBe(200);
    
    values = await getStock(2, 'NVDA', 'daily', testDate);
    price = values.data.history.day[0].close;
    const add1_1 = await request(app).post(`/user/stocks/add`).send({
      token: token3, 
      pid: pid4, 
      stock: 'NVDA', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add1_1.statusCode).toBe(200);

    values = await getStock(2, 'AMZN', 'daily', testDate);
    price = values.data.history.day[0].close;
    const add2 = await request(app).post(`/user/stocks/add`).send({
      token: token1, 
      pid: pid1, 
      stock: 'AMZN', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add2.statusCode).toBe(200);
    const add2_ = await request(app).post(`/user/stocks/add`).send({
      token: token2, 
      pid: pid2, 
      stock: 'AMZN', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add2_.statusCode).toBe(200);
    const add2__ = await request(app).post(`/user/stocks/add`).send({
      token: token3, 
      pid: pid3, 
      stock: 'AMZN', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add2__.statusCode).toBe(200);
    
    values = await getStock(2, 'MSFT', 'daily', testDate);
    price = values.data.history.day[0].close;
    const add2_1 = await request(app).post(`/user/stocks/add`).send({
      token: token3, 
      pid: pid4, 
      stock: 'MSFT', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add2_1.statusCode).toBe(200);

    values = await getStock(2, 'IBM', 'daily', testDate);
    price = values.data.history.day[0].close;
    const add3 = await request(app).post(`/user/stocks/add`).send({
      token: token1, 
      pid: pid1, 
      stock: 'IBM', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add3.statusCode).toBe(200);
    const add3_ = await request(app).post(`/user/stocks/add`).send({
      token: token2, 
      pid: pid2, 
      stock: 'IBM', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add3_.statusCode).toBe(200);
    const add3__ = await request(app).post(`/user/stocks/add`).send({
      token: token3, 
      pid: pid3, 
      stock: 'IBM', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add3__.statusCode).toBe(200);
    
    values = await getStock(2, 'FB', 'daily', testDate);
    price = values.data.history.day[0].close;
    const add3_1 = await request(app).post(`/user/stocks/add`).send({
      token: token3, 
      pid: pid4, 
      stock: 'FB', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add3_1.statusCode).toBe(200);})
  it('200 on first valid portfolio calculation', async () => {
    const test = new Date();
    test.setDate(today.getDate() - daysCalced);
    const testDate = test.getFullYear() + '-' + ('0' + (test.getMonth() + 1)).slice(-2) + '-' + ('0' + test.getDate()).slice(-2);
    const calc1 = await calcPf(token1, pid1, database, 'yes', 'yes', testDate, 2);
    const calc2 = await calcPf(token2, pid2, database, 'yes', 'yes', testDate, 2);
    const calc3 = await calcPf(token3, pid3, database, 'yes', 'yes', testDate, 2);
    const calc4 = await calcPf(token3, pid4, database, 'yes', 'yes', testDate, 2);
    daysCalced -= 3;
    expect(calc1).not.toBe(null);
    expect(calc2).not.toBe(null);
    expect(calc3).not.toBe(null);
    expect(calc4).not.toBe(null);
  })
  it('200 on subsequent valid stock additions', async () => {
    const test = new Date();
    test.setDate(today.getDate() - daysCalced);
    const testDate = test.getFullYear() + '-' + ('0' + (test.getMonth() + 1)).slice(-2) + '-' + ('0' + test.getDate()).slice(-2);

    let values = await getStock(2, 'AAPL', 'daily', testDate);
    let price = values.data.history.day[0].close;
	  const add1 = await request(app).post(`/user/stocks/add`).send({
      token: token1, 
      pid: pid1, 
      stock: 'AAPL', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add1.statusCode).toBe(200);
    const add1_ = await request(app).post(`/user/stocks/add`).send({
      token: token2, 
      pid: pid2, 
      stock: 'AAPL', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add1_.statusCode).toBe(200);

    values = await getStock(2, 'AMZN', 'daily', testDate);
    price = values.data.history.day[0].close;
    const add2 = await request(app).post(`/user/stocks/add`).send({
      token: token1, 
      pid: pid1, 
      stock: 'AMZN', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add2.statusCode).toBe(200);
    const add2_ = await request(app).post(`/user/stocks/add`).send({
      token: token2, 
      pid: pid2, 
      stock: 'AMZN', 
      price: price, 
      quantity: 2, 
      brokerage: null, 
      brokerFlag: null
    })
    expect(add2_.statusCode).toBe(200);

    values = await getStock(2, 'IBM', 'daily', testDate);
    price = values.data.history.day[0].close;
    const add3 = await request(app).post(`/user/stocks/add`).send({
      token: token1, 
      pid: pid1, 
      stock: 'IBM', 
      price: price, 
      quantity: 1, 
      brokerage: null, 
      brokerFlag: null
    })
	  expect(add3.statusCode).toBe(200);
    const add3_ = await request(app).post(`/user/stocks/add`).send({
      token: token2, 
      pid: pid2, 
      stock: 'IBM', 
      price: price, 
      quantity: 1, 
      brokerage: null, 
      brokerFlag: null
    })
    expect(add3_.statusCode).toBe(200);
  })
  it('200 on second valid portfolio calculation', async () => {
    const test = new Date();
    test.setDate(today.getDate() - daysCalced);
    const testDate = test.getFullYear() + '-' + ('0' + (test.getMonth() + 1)).slice(-2) + '-' + ('0' + test.getDate()).slice(-2);
    const calc1 = await calcPf(token1, pid1, database, 'yes', 'yes', testDate, 2);
    const calc2 = await calcPf(token2, pid2, database, 'yes', 'yes', testDate, 2);
    const calc3 = await calcPf(token3, pid3, database, 'yes', 'yes', testDate, 2);
    const calc4 = await calcPf(token3, pid4, database, 'yes', 'yes', testDate, 2);
    daysCalced -= 3;
    expect(calc1).not.toBe(null);
    expect(calc2).not.toBe(null);
    expect(calc3).not.toBe(null);
    expect(calc4).not.toBe(null);
    
  })
  it('Rank portfolios', async () => {
		await rankAll(database);
		const rankings = await database.getRankings();
		console.dir(rankings, { depth: null });
	})
	it('CalcAll', async () => {
		await calcAll(database, true);
    let rankings = null;
    // setTimeout(async () => {
      rankings = await database.getRankings();
    // }, 10000);
    console.dir(rankings, { depth: null });
    expect(rankings).not.toBe(null);
	})
  // it('Test friend rank 1', async () => {
  //   const friendRank = await getFriendRankings1(token1, d);
  //   expect(friendRank).not.toBe(null);
  //   console.dir(friendRank, {depth:null});
  // })
  it('Test friend ranks', async () => {
    const friendRank = await getFriendRankings(token1, database);
    expect(friendRank).not.toBe(null);
    console.dir(friendRank, {depth:null});
  })

  afterAll(async() => {
    await database.disconnect();
  })
}) */

/* describe('Calling rankAll early', () => {
  beforeAll(async () => {
    await database.connect();
  })

  it('Call rankAll', async () => {
    const resp = await request(app).get(`/rankings/global`).send()
    expect(resp).not.toBe(null);
    console.log(resp.body);
  })

  afterAll(async() => {
    await database.disconnect();
  })
}) */

/* describe('Calcing calcAll instantly', () => {
  beforeAll(async () => {
    await database.connect();
  })

  jest.setTimeout(30000);

  it('Call calcAll', async () => {
    await calcAll(database, true);
  })

  afterAll(async() => {
    await database.disconnect();
  })
}) */