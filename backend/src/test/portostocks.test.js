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

// Add stocks to portfolio, sell stocks

// Check how deleting portfolio affects stocks stored in it

// Modifying stocks doesn't affect portfolio

// Modifying portfolio doesn't affect stocks