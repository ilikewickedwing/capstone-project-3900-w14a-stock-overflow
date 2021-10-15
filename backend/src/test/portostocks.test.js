import { authRegister } from "../auth";
import { createPf, deletePf, userPfs, openPf, getPid, editPf } from "../portfolio";
import { checkStock, addStock, modifyStock } from "../stocks";
import { Database } from "../database";
import request from 'supertest';
import { app, database } from "../index";

describe('Create and delete', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  let token = null;
  let pid1 = null;

  it('Register user and create first portfolio', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    token = rego.token;
    const create = await createPf(token, 'pf1', d);
    expect(create).toMatchObject({
      pid: expect.any(String),
    })
    pid1 = create.pid;
  })
  it('Add first stock to portfolio', async () => {
    const add = await addStock(token, pid1, 'IBM', 1, 2, d);
    expect(add).toBe(-1);
    const check = await d.getStock(pid1, 'IBM');
    expect(check).toMatchObject({
      stock: 'IBM',
      avgPrice: 1.00,
      quantity: 2
    })
  })
  it('Check portfolio details', async () => {
    const get = await userPfs(token, d);
    const pfArray = [{ name: "pf1", pid: pid1 }];
    expect(get).toEqual(expect.arrayContaining(pfArray));
    const stArray = [{
      stock: 'IBM',
      avgPrice: 1.00,
      quantity: 2,
    }]
    const pf = await openPf(pid1, d);
    expect(pf).toMatchObject({
      pid: pid1,
      name: 'pf1',
      stocks: expect.arrayContaining(stArray),
    })
  })
  it('Add multiple stocks to portfolio', async () => {
    const add1 = await addStock(token, pid1, 'AAPL', 2, 2, d);
    expect(add1).toBe(-1);
    const check1 = await d.getStock(pid1, 'AAPL');
    expect(check1).toMatchObject({
      stock: 'AAPL',
      avgPrice: 2.00,
      quantity: 2
    })
    const add2 = await addStock(token, pid1, 'AMZN', 3, 1, d);
    expect(add2).toBe(-1);
    const check2 = await d.getStock(pid1, 'AMZN');
    expect(check2).toMatchObject({
      stock: 'AMZN',
      avgPrice: 3.00,
      quantity: 1
    })
    const stArray = [
      {
        stock: 'IBM',
        avgPrice: 1.00,
        quantity: 2
      },
      {
        stock: 'AAPL',
        avgPrice: 2.00,
        quantity: 2
      },
      {
        stock: 'AMZN',
        avgPrice: 3.00,
        quantity: 1
      }
    ]
    const pf = await openPf(pid1, d);
    expect(pf).toMatchObject({
      pid: pid1,
      name: 'pf1',
      stocks: expect.arrayContaining(stArray),
    })
  })
  it('Remove first stock from portfolio', async () => {
    const sell = await modifyStock(token, pid1, 'IBM', 2, 2, 0, d);
    expect(sell).toBe(-1);
    const check = await d.getStock(pid1, 'IBM');
    expect(check).toBe(null);
    const stArray1 = [
      {
        stock: 'IBM',
        avgPrice: 1.00,
        quantity: 2
      }
    ]
    const stArray2 = [
      {
        stock: 'AAPL',
        avgPrice: 2.00,
        quantity: 2
      },
      {
        stock: 'AMZN',
        avgPrice: 3.00,
        quantity: 1
      }
    ]
    const pf = await openPf(pid1, d);
    expect(pf).toMatchObject({
      pid: pid1,
      name: 'pf1',
      stocks: expect.not.arrayContaining(stArray1)
    })
    expect(pf).toMatchObject({
      pid: pid1,
      name: 'pf1',
      stocks: expect.arrayContaining(stArray2)
    })
  })
  it('Remove all stocks from portfolio', async () => {
    const sell1 = await modifyStock(token, pid1, 'AAPL', 2, 2, 0, d);
    expect(sell1).toBe(-1);
    const check1 = await d.getStock(pid1, 'AAPL');
    expect(check1).toBe(null);
    const sell2 = await modifyStock(token, pid1, 'AMZN', 3, 1, 0, d);
    expect(sell2).toBe(-1);
    const check2 = await d.getStock(pid1, 'AMZN');
    expect(check2).toBe(null);
    const pf = await openPf(pid1, d);
    expect(pf).toMatchObject({
      pid: pid1,
      name: 'pf1',
      stocks: []
    })
  })
  it('Delete portfolio', async () => {
    const del = await deletePf(token, pid1, d);
    expect(del).toBe(1);
    const pfs = await userPfs(token, d);
    const pfArray = [{ name: 'pf1', pid: pid1 }];
    expect(pfs).toEqual(expect.not.arrayContaining(pfArray));
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Editing portfolio doesn\'t affect stocks', () => {
  const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

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
      stocks: expect.arrayContaining(stArray)
    })
  })
  it('Change portfolio name', async () => {
    const mod = await editPf(token, pid, 'newpf', d);
    expect(mod).toBe(1);
    const check1 = await userPfs(token, d);
    pfArray = [{ name: 'newpf', pid: pid }];
    expect(check1).toEqual(expect.arrayContaining(pfArray));
    const check2 = await openPf(pid, d);
    expect(check2).toMatchObject({
      name: 'newpf',
      pid: pid,
      stocks: expect.arrayContaining(stArray)
    })
  })
  it('Delete portfolio', async () => {
    const del = await deletePf(token, pid, d);
    expect(del).toBe(1);
    const check1 = await userPfs(token, d);
    expect(check1).toEqual(expect.not.arrayContaining(pfArray));
    const check2 = await openPf(pid, d);
    expect(check2).toBe(null);
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Editing stocks doesn\'t affect portfolios', () => {
  const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

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
      stocks: expect.arrayContaining(stArray)
    })
  })
  it('Buy extra of first stock in portfolio', async () => {
    const add = await modifyStock(token, pid, 'AAPL', 3, 2, 1, d);
    expect(add).toBe(-1);
    const stock = await d.getStock(pid, 'AAPL');
    const newStock = {
      stock: 'AAPL',
      avgPrice: 2.5,
      quantity: 4
    }
    expect(stock).toMatchObject(newStock)
    const pfs = await userPfs(token, d);
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const pf = await openPf(pid, d);
    stArray[0] = newStock;
    expect(pf).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray)
    })
  })
  it('Buy extra of all stocks in portfolio', async () => {
    const add1 = await modifyStock(token, pid, 'AMZN', 1, 3, 1, d);
    expect(add1).toBe(-1);
    const stock1 = await d.getStock(pid, 'AMZN');
    const newStock1 = {
      stock: 'AMZN',
      avgPrice: 1.8,
      quantity: 5
    }
    expect(stock1).toMatchObject(newStock1);
    const add2 = await modifyStock(token, pid, 'IBM', 5, 3, 1, d);
    expect(add2).toBe(-1);
    const stock2 = await d.getStock(pid, 'IBM');
    const newStock2 = {
      stock: 'IBM',
      avgPrice: 4,
      quantity: 4
    }
    expect(stock2).toMatchObject(newStock2);
    const pfs = await userPfs(token, d);
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const pf = await openPf(pid, d);
    stArray[1] = newStock1;
    stArray[2] = newStock2;
    expect(pf).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray)
    })
  })
  it('Sell some of first stock in portfolio', async () => {
    const add = await modifyStock(token, pid, 'AAPL', 2, 2, 0, d);
    expect(add).toBe(-1);
    const stock = await d.getStock(pid, 'AAPL');
    const newStock = {
      stock: 'AAPL',
      avgPrice: 2.5,
      quantity: 2
    }
    expect(stock).toMatchObject(newStock)
    const pfs = await userPfs(token, d);
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const pf = await openPf(pid, d);
    stArray[0] = newStock;
    expect(pf).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray)
    })
  })
  it('Sell some of all stocks in portfolio', async () => {
    const add1 = await modifyStock(token, pid, 'AMZN', 1.5, 2, 0, d);
    expect(add1).toBe(-1);
    const stock1 = await d.getStock(pid, 'AMZN');
    const newStock1 = {
      stock: 'AMZN',
      avgPrice: 1.8,
      quantity: 3
    }
    expect(stock1).toMatchObject(newStock1);
    const add2 = await modifyStock(token, pid, 'IBM', 1, 2, 0, d);
    expect(add2).toBe(-1);
    const stock2 = await d.getStock(pid, 'IBM');
    const newStock2 = {
      stock: 'IBM',
      avgPrice: 4,
      quantity: 2
    }
    expect(stock2).toMatchObject(newStock2);
    const pfs = await userPfs(token, d);
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const pf = await openPf(pid, d);
    stArray[1] = newStock1;
    stArray[2] = newStock2;
    expect(pf).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray)
    })
  })
  it('Sell rest of first stock in portfolio', async () => {
    const add = await modifyStock(token, pid, 'AAPL', 3, 2, 0, d);
    expect(add).toBe(-1);
    const stock = await d.getStock(pid, 'AAPL');
    expect(stock).toBe(null);
    const pfs = await userPfs(token, d);
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const pf = await openPf(pid, d);
    stArray.splice(0, 1);
    expect(pf).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray)
    })
  })
  it('Sell rest of all stocks in portfolio', async () => {
    const add1 = await modifyStock(token, pid, 'AMZN', 2, 3, 0, d);
    expect(add1).toBe(-1);
    const stock1 = await d.getStock(pid, 'AMZN');
    expect(stock1).toBe(null);
    const add2 = await modifyStock(token, pid, 'IBM', 5, 2, 0, d);
    expect(add2).toBe(-1);
    const stock2 = await d.getStock(pid, 'IBM');
    expect(stock2).toBe(null);
    const pfs = await userPfs(token, d);
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const pf = await openPf(pid, d);
    stArray.splice(0, 2);
    expect(pf).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray)
    })
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Adding stocks to watchlist', () => {
  
})

describe('Stress testing of portfolio and stocks', () => {

})