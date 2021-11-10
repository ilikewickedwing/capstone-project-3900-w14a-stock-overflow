import { authRegister } from "../auth";
import { createPf, userPfs, openPf } from "../portfolio";
import { calcPf, rankAll } from "../performance";
import { addStock, modifyStock, getStock } from "../stocks";
import { Database } from "../database";
import request from 'supertest';
import { app, database } from "../index";
import { getDefBroker, setDefBroker } from "../user";



describe('Calculate portfolio performance', () => {
	const d = new Database(true);
	beforeAll(async () => {
	  await d.connect();
	})
  
	jest.setTimeout(10000);
  
	let token1 = null;
	let pid1 = null;
	let pfArray = null;

  let token2 = null;
  let pid2 = null;
  
	const now = new Date();
	const today = new Date(now);
	const time = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
	const date = time.toString();

  let daysCalced = 0;
  
	it('Register user and create first portfolio', async () => {
	  const rego = await authRegister('Ashley', 'strongpassword', d);
	  token1 = rego.token;
	  const create = await createPf(token1, 'pf', d);
	  expect(create).toMatchObject({
		  pid: expect.any(String),
	  })
	  pid1 = create.pid;

    const rego2 = await authRegister('Richard', 'strongpassword', d);
    token2 = rego2.token;
    const create2 = await createPf(token2, 'pf', d);
    expect(create2).toMatchObject({
      pid: expect.any(String),
    })
    pid2 = create2.pid;
	})
	it('Set default brokerage cost', async () => {
	  const resp = await setDefBroker(token1, '0', '0', d);
	  expect(resp).toBe(1);
	  const broker = await getDefBroker(token1, d);
	  expect(broker.defBroker).toBe(0);

    const resp2 = await setDefBroker(token2, '5', '1', d);
	  expect(resp2).toBe(1);
	  const broker2 = await getDefBroker(token2, d);
	  expect(broker2.defBroker).toBe(5);
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
	it('Calculate portfolio performance first', async () => {
    const test = new Date();
    test.setDate(today.getDate() - daysCalced);
    const testDate = test.getFullYear() + '-' + ('0' + (test.getMonth() + 1)).slice(-2) + '-' + ('0' + test.getDate()).slice(-2);
    const calc1 = await calcPf(token1, pid1, d, 'yes', 'yes', testDate, 3);
    const calc2 = await calcPf(token2, pid2, d, 'yes', 'yes', testDate, 3);
    daysCalced -= 4;
    expect(calc1).not.toBe(null);
    expect(calc2).not.toBe(null);	  // const stocks = await openPf(token1, pid1, d);
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
    daysCalced -= 3;
    expect(calc1).not.toBe(null);
    expect(calc2).not.toBe(null);
	  // console.log("calc is " + calc);
	  // const stocks1 = await openPf(token1, pid1, d);
    // const stocks2 = await openPf(token2, pid2, d);
	  // console.dir(stocks1, { depth: null });
    // console.dir(stocks2, { depth: null });
    // console.log(daysCalced);
	})
  it('Rank portfolios', async () => {
    await rankAll(d);
    const rankings = await d.getRankings();
    console.dir(rankings, { depth: null });
  })
	/* it('Sell some of first stock in portfolio', async () => {
	  const add = await modifyStock(token1, pid1, 'AAPL', 2, 2, 0, null, null, d);
	  expect(add).toBe(-1);
	  const stock = await d.getStock(pid1, 'AAPL');
	  const newStock = {
		stock: 'AAPL',
		avgPrice: 2.5,
		performance: [
		  {
			date: date,
			performance: 0
		  }
		],
		quantity: 2
	  }
	  expect(stock).toMatchObject(newStock)
	  const pfs = await userPfs(token1, d);
	  expect(pfs).toEqual(expect.arrayContaining(pfArray));
	  const pf = await openPf(token1, pid1, d);
	  stArray[0] = newStock;
	  expect(pf).toMatchObject({
		pid1: pid1,
		name: 'pf',
		stocks: expect.arrayContaining(stArray)
	  })
	})
	it('Calculate portfolio performance third', async () => {
	  const calc = await calcPf(token1, pid1, d);
	  expect(calc).not.toBe(null);
	  // console.log("calc is " + calc);
	})
	it('Sell some of all stocks in portfolio', async () => {
	  const add1 = await modifyStock(token1, pid1, 'AMZN', 1.5, 2, 0, null, null, d);
	  expect(add1).toBe(-1);
	  const stock1 = await d.getStock(pid1, 'AMZN');
	  const newStock1 = {
		stock: 'AMZN',
		avgPrice: 1.8,
		performance: [
		  {
			date: date,
			performance: 0
		  }
		],
		quantity: 3
	  }
	  expect(stock1).toMatchObject(newStock1);
	  const add2 = await modifyStock(token1, pid1, 'IBM', 1, 2, 0, null, null, d);
	  expect(add2).toBe(-1);
	  const stock2 = await d.getStock(pid1, 'IBM');
	  const newStock2 = {
		stock: 'IBM',
		avgPrice: 4,
		performance: [
		  {
			date: date,
			performance: 0
		  }
		],
		quantity: 2
	  }
	  expect(stock2).toMatchObject(newStock2);
	  const pfs = await userPfs(token1, d);
	  expect(pfs).toEqual(expect.arrayContaining(pfArray));
	  const pf = await openPf(token1, pid1, d);
	  stArray[1] = newStock1;
	  stArray[2] = newStock2;
	  expect(pf).toMatchObject({
		pid1: pid1,
		name: 'pf',
		stocks: expect.arrayContaining(stArray)
	  })
	})
	it('Calculate portfolio performance fourth', async () => {
	  const calc = await calcPf(token1, pid1, d);
	  expect(calc).not.toBe(null);
	  // console.log("calc is " + calc);
	})
	it('Sell rest of first stock in portfolio', async () => {
	  const add = await modifyStock(token1, pid1, 'AAPL', 3, 2, 0, null, null, d);
	  expect(add).toBe(-1);
	  const newStock = {
		stock: 'AAPL',
		avgPrice: 2.5,
		performance: [
		  {
			date: date,
			performance: 0
		  }
		],
		quantity: 0
	  }
	  const stock = await d.getStock(pid1, 'AAPL');
	  expect(stock).toStrictEqual(newStock);
	  const pfs = await userPfs(token1, d);
	  expect(pfs).toEqual(expect.arrayContaining(pfArray));
	  const pf = await openPf(token1, pid1, d);
	  stArray[0] = newStock;
	  expect(pf).toMatchObject({
		pid1: pid1,
		name: 'pf',
		stocks: expect.arrayContaining(stArray)
	  })
	})
	it('Calculate portfolio performance fifth', async () => {
	  const calc = await calcPf(token1, pid1, d);
	  expect(calc).not.toBe(null);
	  // console.log("calc is " + calc);
	})
	it('Sell rest of all stocks in portfolio', async () => {
	  const add1 = await modifyStock(token1, pid1, 'AMZN', 2, 3, 0, null, null, d);
	  expect(add1).toBe(-1);
	  const newStock1 = {
		stock: 'AMZN',
		avgPrice: 1.8,
		performance: [
		  {
			date: date,
			performance: 0
		  }
		],
		quantity: 0
	  }
	  const stock1 = await d.getStock(pid1, 'AMZN');
	  expect(stock1).toStrictEqual(newStock1);
	  const add2 = await modifyStock(token1, pid1, 'IBM', 5, 2, 0, null, null, d);
	  expect(add2).toBe(-1);
	  const newStock2 = {
		stock: 'IBM',
		avgPrice: 4,
		performance: [
		  {
			date: date,
			performance: 0
		  }
		],
		quantity: 0
	  }
	  const stock2 = await d.getStock(pid1, 'IBM');
	  expect(stock2).toStrictEqual(newStock2);
	  const pfs = await userPfs(token1, d);
	  expect(pfs).toEqual(expect.arrayContaining(pfArray));
	  const pf = await openPf(token1, pid1, d);
	  stArray[1] = newStock1;
	  stArray[2] = newStock2;
	  expect(pf).toMatchObject({
		pid1: pid1,
		name: 'pf',
		stocks: expect.arrayContaining(stArray)
	  })
	})
	it('Calculate portfolio performance sixth', async () => {
	  const calc = await calcPf(token1, pid1, d);
	  expect(calc).not.toBe(null);
	  // console.log("calc is " + calc);
	}) */
  
	afterAll(async () => {
	  await d.disconnect();
	})
})