import { authRegister } from "../auth";
import { createPf, deletePf, userPfs, openPf, getPid, editPf, calcPf } from "../portfolio";
import { checkStock, addStock, modifyStock, getStock, getStockDaily, getStockWeekly, getStockPrice, getStockInfo } from "../stocks";
import { Database } from "../database";
import request from 'supertest';
import { app, database } from "../index";


/* describe('Retrieve stock information', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  it('Get stock', async () => {
	const resp = await getStock('IBM', 0);
  const daily = await getStockDaily('IBM');
  const weekly = await getStockWeekly('IBM');
  const price = await getStockPrice('IBM');
  const info = await getStockInfo('IBM');

  expect(resp).toMatchObject({
    symbol: 'IBM',
    data: {
      daily: expect.objectContaining(daily),
      weekly: expect.objectContaining(weekly),
      price: expect.objectContaining(price),
      info: expect.objectContaining(info),
    },
    time: expect.any(Date),
  })
  //console.log(resp.info.daily['Meta Data']);
  // for(let i = 0; i < resp.info.daily.'Meta Data'.length(); i++) {

  // }
  })
  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Retrieve stock info endpoint test', () => {
  jest.setTimeout(30000);
  beforeAll(async () => {
    await database.connect();
  })

  it('200 on successful get stock', async () => {
    console.log('200 on successful get stock');
    const resp = await request(app).get(`/stocks/info?stock=IBM`).send();
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toMatchObject({
      symbol: 'IBM',
      data: {
        intraday: expect.anything(),
        daily: expect.anything(),
        weekly: expect.anything(),
        monthly: expect.anything(),
        price: expect.anything(),
        info: expect.anything()
      },
      time: expect.any(String),
    })
  })
  it('403 on invalid stock', async () => {
    console.log('403 on invalid stock');
    const resp = await request(app).get(`/stocks/info?stock=fakestock`).send();
    expect(resp.statusCode).toBe(403);
    expect(resp.body.error).toBe("Invalid stock");
  })

  afterAll(async() => {
    await database.disconnect();
  })
})

describe('Editing stocks doesn\'t affect portfolios', () => {
  const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  jest.setTimeout(10000);

  let token = null;
  let pid = null;
  let pfArray = null;
  let stArray = null;

  it('Register user and create first portfolio', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    token = rego.token;
    const create = await createPf(token, 'pf', d);
    expect(create).toMatchObject({
      pid: expect.any(String),
    })
    pid = create.pid;
  })
  it('Add stocks to portfolio', async () => {
    const add1 = await addStock(token, pid, 'AAPL', 2, 2, d);
    expect(add1).toBe(-1);
    const check1 = await d.getStock(pid, 'AAPL');
    expect(check1).toMatchObject({
      stock: 'AAPL',
      avgPrice: 2,
      quantity: 2
    })
    const add2 = await addStock(token, pid, 'AMZN', 3, 2, d);
    expect(add2).toBe(-1);
    const check2 = await d.getStock(pid, 'AMZN');
    expect(check2).toMatchObject({
      stock: 'AMZN',
      avgPrice: 3,
      quantity: 2
    })
    const add3 = await addStock(token, pid, 'IBM', 1, 1, d);
    expect(add3).toBe(-1);
    const check3 = await d.getStock(pid, 'IBM');
    expect(check3).toMatchObject({
      stock: 'IBM',
      avgPrice: 1,
      quantity: 1
    })
    const pfs = await userPfs(token, d);
    pfArray = [{ name: 'pf', pid: pid }];
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const stocks = await openPf(pid, d);
    stArray = [
      {
        stock: 'AAPL',
        avgPrice: 2,
        quantity: 2
      },
      {
        stock: 'AMZN',
        avgPrice: 3,
        quantity: 2
      },
      {
        stock: 'IBM',
        avgPrice: 1,
        quantity: 1
      }
    ]
    expect(stocks).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray),
      value: {
        spent: 11,
        sold: 0
      }
    })
  })
  it('Calculate portfolio performance', async () => {
    const calc = await calcPf(token, pid, d);
    expect(calc).not.toBe(null);
    console.log("calc is " + calc);
  })
  // it('Buy extra of first stock in portfolio', async () => {
  //   const add = await modifyStock(token, pid, 'AAPL', 3, 2, 1, d);
  //   expect(add).toBe(-1);
  //   const stock = await d.getStock(pid, 'AAPL');
  //   const newStock = {
  //     stock: 'AAPL',
  //     avgPrice: 2.5,
  //     quantity: 4
  //   }
  //   expect(stock).toMatchObject(newStock)
  //   const pfs = await userPfs(token, d);
  //   expect(pfs).toEqual(expect.arrayContaining(pfArray));
  //   const pf = await openPf(pid, d);
  //   stArray[0] = newStock;
  //   expect(pf).toMatchObject({
  //     pid: pid,
  //     name: 'pf',
  //     stocks: expect.arrayContaining(stArray)
  //   })
  // })
  // it('Buy extra of all stocks in portfolio', async () => {
  //   const add1 = await modifyStock(token, pid, 'AMZN', 1, 3, 1, d);
  //   expect(add1).toBe(-1);
  //   const stock1 = await d.getStock(pid, 'AMZN');
  //   const newStock1 = {
  //     stock: 'AMZN',
  //     avgPrice: 1.8,
  //     quantity: 5
  //   }
  //   expect(stock1).toMatchObject(newStock1);
  //   const add2 = await modifyStock(token, pid, 'IBM', 5, 3, 1, d);
  //   expect(add2).toBe(-1);
  //   const stock2 = await d.getStock(pid, 'IBM');
  //   const newStock2 = {
  //     stock: 'IBM',
  //     avgPrice: 4,
  //     quantity: 4
  //   }
  //   expect(stock2).toMatchObject(newStock2);
  //   const pfs = await userPfs(token, d);
  //   expect(pfs).toEqual(expect.arrayContaining(pfArray));
  //   const pf = await openPf(pid, d);
  //   stArray[1] = newStock1;
  //   stArray[2] = newStock2;
  //   expect(pf).toMatchObject({
  //     pid: pid,
  //     name: 'pf',
  //     stocks: expect.arrayContaining(stArray)
  //   })
  // })
  // it('Sell some of first stock in portfolio', async () => {
  //   const add = await modifyStock(token, pid, 'AAPL', 2, 2, 0, d);
  //   expect(add).toBe(-1);
  //   const stock = await d.getStock(pid, 'AAPL');
  //   const newStock = {
  //     stock: 'AAPL',
  //     avgPrice: 2.5,
  //     quantity: 2
  //   }
  //   expect(stock).toMatchObject(newStock)
  //   const pfs = await userPfs(token, d);
  //   expect(pfs).toEqual(expect.arrayContaining(pfArray));
  //   const pf = await openPf(pid, d);
  //   stArray[0] = newStock;
  //   expect(pf).toMatchObject({
  //     pid: pid,
  //     name: 'pf',
  //     stocks: expect.arrayContaining(stArray)
  //   })
  // })
  // it('Sell some of all stocks in portfolio', async () => {
  //   const add1 = await modifyStock(token, pid, 'AMZN', 1.5, 2, 0, d);
  //   expect(add1).toBe(-1);
  //   const stock1 = await d.getStock(pid, 'AMZN');
  //   const newStock1 = {
  //     stock: 'AMZN',
  //     avgPrice: 1.8,
  //     quantity: 3
  //   }
  //   expect(stock1).toMatchObject(newStock1);
  //   const add2 = await modifyStock(token, pid, 'IBM', 1, 2, 0, d);
  //   expect(add2).toBe(-1);
  //   const stock2 = await d.getStock(pid, 'IBM');
  //   const newStock2 = {
  //     stock: 'IBM',
  //     avgPrice: 4,
  //     quantity: 2
  //   }
  //   expect(stock2).toMatchObject(newStock2);
  //   const pfs = await userPfs(token, d);
  //   expect(pfs).toEqual(expect.arrayContaining(pfArray));
  //   const pf = await openPf(pid, d);
  //   stArray[1] = newStock1;
  //   stArray[2] = newStock2;
  //   expect(pf).toMatchObject({
  //     pid: pid,
  //     name: 'pf',
  //     stocks: expect.arrayContaining(stArray)
  //   })
  // })
  // it('Sell rest of first stock in portfolio', async () => {
  //   const add = await modifyStock(token, pid, 'AAPL', 3, 2, 0, d);
  //   expect(add).toBe(-1);
  //   const stock = await d.getStock(pid, 'AAPL');
  //   expect(stock).toBe(null);
  //   const pfs = await userPfs(token, d);
  //   expect(pfs).toEqual(expect.arrayContaining(pfArray));
  //   const pf = await openPf(pid, d);
  //   stArray.splice(0, 1);
  //   expect(pf).toMatchObject({
  //     pid: pid,
  //     name: 'pf',
  //     stocks: expect.arrayContaining(stArray)
  //   })
  // })
  // it('Sell rest of all stocks in portfolio', async () => {
  //   const add1 = await modifyStock(token, pid, 'AMZN', 2, 3, 0, d);
  //   expect(add1).toBe(-1);
  //   const stock1 = await d.getStock(pid, 'AMZN');
  //   expect(stock1).toBe(null);
  //   const add2 = await modifyStock(token, pid, 'IBM', 5, 2, 0, d);
  //   expect(add2).toBe(-1);
  //   const stock2 = await d.getStock(pid, 'IBM');
  //   expect(stock2).toBe(null);
  //   const pfs = await userPfs(token, d);
  //   expect(pfs).toEqual(expect.arrayContaining(pfArray));
  //   const pf = await openPf(pid, d);
  //   stArray.splice(0, 2);
  //   expect(pf).toMatchObject({
  //     pid: pid,
  //     name: 'pf',
  //     stocks: expect.arrayContaining(stArray)
  //   })
  // })

  afterAll(async () => {
    await d.disconnect();
  })
}) */

describe('We be having funsies', () => {
  const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  jest.setTimeout(100000);

  it('Calling a bunch of stocks', async () => {
    const a = await getStock('AAPL', 1);
    const b = await getStock('AAPL', 2);
    const c = await getStock('AAPL', 3);
    const d1 = await getStock('AAPL', 4);
    const b2 = await getStock('AAPL', 5);
    const b3 = await getStock('AAPL', 6);
    const b4 = await getStock('AMZN', 1);
    const b5 = await getStock('AMZN', 2);
    const b52 = await getStock('AMZN', 3);
    const b51 = await getStock('AMZN', 4);
    const b53 = await getStock('AMZN', 5);
    const b54 = await getStock('AMZN', 6);
    const b6 = await getStock('IBM', 1);
    const b7 = await getStock('IBM', 2);
    const b8 = await getStock('IBM', 3);
    await getStock('IBM', 4);
    await getStock('IBM', 5);
    await getStock('IBM', 6);

  })
  

  afterAll(async () => {
    await d.disconnect();
  })
})