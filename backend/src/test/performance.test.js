import { authRegister } from "../auth";
import { createPf, deletePf, userPfs, openPf, getPid, editPf, calcPf } from "../portfolio";
import { checkStock, addStock, modifyStock, getStock, getStockDaily, getStockWeekly, getStockPrice, getStockInfo, alphavantage } from "../stocks";
import { API } from "../api";
import { Database } from "../database";
import request from 'supertest';
import { app, database } from "../index";


/* describe('Retrieve stock information', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  jest.setTimeout(10000);
  
  const today = new Date();
  const now = new Date(today);
  

  it('Get stock information', async () => {
    const resp = await getStock('0', 'AAPL');
    expect(resp).not.toBe(null);
    expect(resp).toMatchObject({
      symbol: 'AAPL',
      param: 0,
      data: expect.anything(),
      time: expect.any(Date)
    })
    // console.log(resp.data);
  })
  it('Get single stock quotes', async () => {
    const resp = await getStock('1', 'AAPL');
    expect(resp).not.toBe(null);
    expect(resp).toMatchObject({
      symbol: 'AAPL',
      param: 1,
      data: expect.anything(),
      time: expect.any(Date)
    })
    // console.log(resp.data);
  })
  it('Get multiple stock quotes', async () => {
    const resp = await getStock('1', 'AAPL,AMZN,IBM');
    expect(resp).not.toBe(null);
    expect(resp).toMatchObject({
      symbol: 'AAPL,AMZN,IBM',
      param: 1,
      data: expect.anything(),
      time: expect.any(Date)
    })
    // console.log(resp.data.quotes);
  })
  it('Get stock history: 1 day, 1 minute interval', async () => {
    const start = new Date();
    start.setDate(now.getDate()-1);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2) + " 00:00";
    const resp = await getStock('3', 'IBM', '1min', time.toString());
    expect(resp).not.toBe(null);
    // console.log(resp.data.series);
  }) 
  it('Get stock history: 1 day, 5 minute interval', async () => {
    const start = new Date();
    start.setDate(now.getDate()-1);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2) + " 00:00";
    const resp = await getStock('3', 'IBM', '5min', time.toString());
    expect(resp).not.toBe(null);
    // console.log(resp.data.series);
  }) 
  it('Get stock history: 1 day, 15 minute interval', async () => {
    const start = new Date();
    start.setDate(now.getDate()-1);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2) + " 00:00";
    const resp = await getStock('3', 'IBM', '15min', time.toString());
    expect(resp).not.toBe(null);
    // console.log(resp.data.series);
  }) 
  it('Get stock history: 1 month, daily interval', async () => {
    const start = new Date();
    start.setMonth(now.getMonth() - 1);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
    // console.log(time);
    const resp = await getStock('2', 'IBM', 'daily', time.toString());
    expect(resp).not.toBe(null);
    // console.log(resp.data.history);
  })
  it('Get stock history: 6 months, daily interval', async () => {
    const start = new Date();
    start.setMonth(now.getMonth() - 6);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
    // console.log(time);
    const resp = await getStock('2', 'IBM', 'daily', time.toString());
    expect(resp).not.toBe(null);
    // console.log(resp.data.history);
  })
  it('Get stock history: 1 year, weekly interval', async () => {
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
    // console.log(time);
    const resp = await getStock('2', 'IBM', 'weekly', time.toString());
    expect(resp).not.toBe(null);
    // console.log(resp.data.history);
  })
  it('Get stock history: 5 years, weekly interval', async () => {
    const start = new Date();
    start.setFullYear(start.getFullYear() - 5);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
    // console.log(time);
    const resp = await getStock('2', 'IBM', 'weekly', time.toString());
    expect(resp).not.toBe(null);
    // console.log(resp.data.history);
  })
  it('Get stock history: 10 years, monthly interval', async () => {
    const start = new Date();
    start.setFullYear(start.getFullYear() - 10);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
    // console.log(time);
    const resp = await getStock('2', 'IBM', 'monthly', time.toString());
    expect(resp).not.toBe(null);
    // console.log(resp.data.history);
  })
  it('Test multiple invalid stocks', async () => {
    const resp1 = await getStock('0', 'Jono');
    expect(resp1).toBe(-1);
    const resp2 = await getStock('0', 'AAPL,Jono');
    expect(resp2).toBe(-1);
    const resp3 = await getStock('0', 'Jono,AAPL');
    expect(resp3).toBe(-1);
    const resp4 = await getStock('0', 'AAPL,Jono,IBM');
    expect(resp4).toBe(-1);
  })
  it('Test invalid types', async () => {
    const resp1 = await getStock(-1, 'AAPL');
    expect(resp1).toBe(-2);
    const resp2 = await getStock(5, 'AAPL');
    expect(resp2).toBe(-2);
    const resp3 = await getStock(null, 'AAPL');
    expect(resp3).toBe(-2);
    const resp4 = await getStock(1.2, 'AAPL');
    expect(resp4).toBe(-2);
    const resp5 = await getStock('yes', 'AAPL');
    expect(resp5).toBe(-2);
  })
  it('Test invalid intervals', async () => {
    const resp1 = await getStock('2', 'AAPL', 'fakeinterval');
    expect(resp1).toBe(-3);
    const resp2 = await getStock('3', 'AAPL', 'fakeinterval');
    expect(resp2).toBe(-3);
    const resp3 = await getStock('2', 'AAPL', 2);
    expect(resp3).toBe(-3);
    const resp4 = await getStock('3', 'AAPL', 2);
    expect(resp4).toBe(-3);
    const resp5 = await getStock('2', 'AAPL', '1min');
    expect(resp5).toBe(-3);
    const resp6 = await getStock('2', 'AAPL', '5min');
    expect(resp6).toBe(-3);
    const resp7 = await getStock('2', 'AAPL', '15min');
    expect(resp7).toBe(-3);
    const resp8 = await getStock('3', 'AAPL', 'daily');
    expect(resp8).toBe(-3);
    const resp9 = await getStock('3', 'AAPL', 'weekly');
    expect(resp9).toBe(-3);
    const resp10 = await getStock('3', 'AAPL', 'monthly');
    expect(resp10).toBe(-3);
    const resp11 = await getStock('2', 'AAPL', null);
    expect(resp11).toBe(-3);
    const resp12 = await getStock('3', 'AAPL', null);
    expect(resp12).toBe(-3);
    const resp13 = await getStock('2', 'AAPL');
    expect(resp13).toBe(-3);
    const resp14 = await getStock('3', 'AAPL');
    expect(resp14).toBe(-3);
  })
  it('Test invalid starts', async () => {
    const resp1 = await getStock('2', 'AAPL', 'daily', 'fakedate');
    expect(resp1).toBe(-4);
    const resp2 = await getStock('2', 'AAPL', 'daily', 12345);
    expect(resp2).toBe(-4);
    const resp3 = await getStock('2', 'AAPL', 'daily', '31/10/2021');
    expect(resp3).toBe(-4);
    const resp4 = await getStock('2', 'AAPL', 'daily', '2021-10-31 00:00');
    expect(resp4).toBe(-4);
    const resp5 = await getStock('2', 'AAPL', 'daily', '2021/10/31');
    expect(resp5).toBe(-4);
    const resp6 = await getStock('2', 'AAPL', 'daily', '2021-31-10');
    expect(resp6).toBe(-4);
    const resp7 = await getStock('2', 'AAPL', 'daily', '2021-12-31');
    expect(resp7).toBe(-4);
    const resp8 = await getStock('3', 'AAPL', '1min', 'fakedate');
    expect(resp8).toBe(-4);
    const resp9 = await getStock('3', 'AAPL', '1min', 12345);
    expect(resp9).toBe(-4);
    const resp10 = await getStock('3', 'AAPL', '1min', '2021-10-31 25:00');
    expect(resp10).toBe(-4);
    const resp11 = await getStock('3', 'AAPL', '1min', '31-10-2021 00:00');
    expect(resp11).toBe(-4);
    const resp12 = await getStock('3', 'AAPL', '1min', '2021/31/10 00:60');
    expect(resp12).toBe(-4);
    const resp13 = await getStock('3', 'AAPL', '1min', '2021-31-10 1:10');
    expect(resp13).toBe(-4);
    const resp14 = await getStock('3', 'AAPL', '1min', '2021-12-31 00:00');
    expect(resp14).toBe(-4);
  })

  
  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Retrieve stock information endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })

  jest.setTimeout(30000);
  const today = new Date();
  const now = new Date(today);

  it('200 on successful get stock information', async () => {
    const resp = await request(app).get(`/stocks/info?type=0&stocks=AAPL`).send();
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toMatchObject({
      symbol: 'AAPL',
      param: 0,
      data: expect.anything(),
      time: expect.any(String)
    })
  })
  it('200 on successful get single stock quote', async () => {
    const resp = await request(app).get(`/stocks/info?type=1&stocks=AAPL`).send();
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toMatchObject({
      symbol: 'AAPL',
      param: 1,
      data: expect.anything(),
      time: expect.any(String)
    })
  })
  it('200 on successful get multiple stock quotes', async () => {
    const resp = await request(app).get(`/stocks/info?type=1&stocks=AAPL,AMZN,IBM`).send();
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toMatchObject({
      symbol: 'AAPL,AMZN,IBM',
      param: 1,
      data: expect.anything(),
      time: expect.any(String)
    })
  })
  it('200 on successful get stock history: 1 day, 1 minute interval', async () => {
    const start = new Date();
    start.setDate(now.getDate()-1);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2) + " 00:00";
    const resp = await request(app).get(`/stocks/info?type=3&stocks=AAPL&interval=1min&start=${time}`).send();
    expect(resp.statusCode).toBe(200);
    // console.log(resp.body);
  })
  it('200 on successful get stock history: 1 day, 5 minute interval', async () => {
    const start = new Date();
    start.setDate(now.getDate()-1);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2) + " 00:00";
    const resp = await request(app).get(`/stocks/info?type=3&stocks=AAPL&interval=5min&start=${time}`).send();
    expect(resp.statusCode).toBe(200);
    // console.log(resp.body);
  }) 
  it('200 on successful get stock history: 1 day, 15 minute interval', async () => {
    const start = new Date();
    start.setDate(now.getDate()-1);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2) + " 00:00";
    const resp = await request(app).get(`/stocks/info?type=3&stocks=AAPL&interval=15min&start=${time}`).send();
    expect(resp.statusCode).toBe(200);
    // console.log(resp.body);
  }) 
  it('200 on successful get stock history: 1 month, daily interval', async () => {
    const start = new Date();
    start.setMonth(now.getMonth() - 1);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
    const resp = await request(app).get(`/stocks/info?type=2&stocks=AAPL&interval=daily&start=${time}`).send();
    expect(resp.statusCode).toBe(200);
    // console.log(resp.body);
  })
  it('200 on successful get stock history: 6 months, daily interval', async () => {
    const start = new Date();
    start.setMonth(now.getMonth() - 6);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
    const resp = await request(app).get(`/stocks/info?type=2&stocks=AAPL&interval=daily&start=${time}`).send();
    expect(resp.statusCode).toBe(200);
    // console.log(resp.body);
  })
  it('200 on successful get stock history: 1 year, weekly interval', async () => {
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
    const resp = await request(app).get(`/stocks/info?type=2&stocks=AAPL&interval=weekly&start=${time}`).send();
    expect(resp.statusCode).toBe(200);
    // console.log(resp.body);
  })
  it('200 on successful get stock history: 5 years, weekly interval', async () => {
    const start = new Date();
    start.setFullYear(start.getFullYear() - 5);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
    const resp = await request(app).get(`/stocks/info?type=2&stocks=AAPL&interval=weekly&start=${time}`).send();
    expect(resp.statusCode).toBe(200);
    // console.log(resp.body);
  })
  it('200 on successful get stock history: 10 years, monthly interval', async () => {
    const start = new Date();
    start.setFullYear(start.getFullYear() - 10);
    var time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
    const resp = await request(app).get(`/stocks/info?type=2&stocks=AAPL&interval=monthly&start=${time}`).send();
    expect(resp.statusCode).toBe(200);
    // console.log(resp.body);
  })
  it('403 on invalid stock name', async () => {
    const resp = await request(app).get(`/stocks/info?type=0&stocks=fakestock`).send();
    expect(resp.statusCode).toBe(403);
    expect(resp.body.error).toMatch('Invalid stock');
  })
  it('403 on invalid type', async () => {
    const resp = await request(app).get(`/stocks/info?type=-1&stocks=AAPL`).send();
    expect(resp.statusCode).toBe(403);
    expect(resp.body.error).toMatch('Invalid type');
  })
  it('403 on invalid interval', async () => {
    const resp = await request(app).get(`/stocks/info?type=2&stocks=AAPL&interval=fakeinterval`).send();
    expect(resp.statusCode).toBe(403);
    expect(resp.body.error).toMatch('Invalid interval');
  })
  it('403 on invalid start', async () => {
    const resp = await request(app).get(`/stocks/info?type=2&stocks=AAPL&interval=daily&start=fakedate`).send();
    expect(resp.statusCode).toBe(403);
    expect(resp.body.error).toMatch('Invalid start');
  })
  

  afterAll(async() => {
    await database.disconnect();
  })
}) */

describe('Calculate portfolio performance', () => {
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
    expect(calc).toBe(expect.any(Number));
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
})

/* describe('We be having funsies', () => {
  const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  // jest.setTimeout(100000);

  it('Calling a bunch of stocks', async () => {
    // const a = await getStock('a', 1);
    // const a = await alphavantage._callTradier(1,'AAPL,AMZN,IBM');
    // console.log(a.quotes.quote);

    const b = await getStock('1', 'AAPL', '15min', '2021-10-29 00:00');
    // console.log(b.data.quotes);

  })
  

  afterAll(async () => {
    await d.disconnect();
  })
}) */