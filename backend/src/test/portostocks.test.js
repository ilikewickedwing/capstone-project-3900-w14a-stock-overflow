import { authRegister } from "../auth";
import { createPf, deletePf, userPfs, openPf, getPid, editPf } from "../portfolio";
import { checkStock, addStock, modifyStock } from "../stocks";
import { Database } from "../database";
import request from 'supertest';
import { app, database } from "../index";
import { getDefBroker, setDefBroker } from "../user";

describe('Create and delete', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  jest.setTimeout(10000);

  let token = null;
  let uid = null;
  let pid1 = null;
  let stArray = null;
  const now = new Date();
  const today = new Date(now);
  const time = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
  const date = time.toString();

  it('Register user and create first portfolio', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    token = rego.token;
    uid = rego.uid;
    const create = await createPf(token, 'pf1', d);
    expect(create).toMatchObject({
      pid: expect.any(String),
    })
    pid1 = create.pid;
  })
  it('Set default brokerage cost to flat fee 0', async () => {
    const resp = await setDefBroker(token, '0', '0', d);
    expect(resp).toBe(1);
    const broker = await getDefBroker(token, d);
    expect(broker.defBroker).toBe(0);
  })
  it('Add first stock to portfolio', async () => {
    const add = await addStock(token, pid1, 'IBM', 1, 2, null, null, d);
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
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 2,
			sold: 0,
			quantitySold: 0
    }]
    const pf = await openPf(token, pid1, d);
    expect(pf).toMatchObject({
      pid: pid1,
      name: 'pf1',
      stocks: expect.arrayContaining(stArray),
      value: {
        spent: 2,
        sold: 0,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('Add multiple stocks to portfolio', async () => {
    const add1 = await addStock(token, pid1, 'AAPL', 2, 2, null, null, d);
    expect(add1).toBe(-1);
    const check1 = await d.getStock(pid1, 'AAPL');
    expect(check1).toMatchObject({
      stock: 'AAPL',
      avgPrice: 2.00,
      quantity: 2
    })
    const add2 = await addStock(token, pid1, 'AMZN', 3, 1, null, null, d);
    expect(add2).toBe(-1);
    const check2 = await d.getStock(pid1, 'AMZN');
    expect(check2).toMatchObject({
      stock: 'AMZN',
      avgPrice: 3.00,
      quantity: 1
    })
    stArray = [
      {
        stock: 'IBM',
        avgPrice: 1.00,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 2,
				sold: 0,
				quantitySold: 0
      },
      {
        stock: 'AAPL',
        avgPrice: 2.00,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 2,
				sold: 0,
				quantitySold: 0
      },
      {
        stock: 'AMZN',
        avgPrice: 3.00,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 1,
				sold: 0,
				quantitySold: 0
      }
    ]
    const pf = await openPf(token, pid1, d);
    expect(pf).toMatchObject({
      pid: pid1,
      name: 'pf1',
      stocks: expect.arrayContaining(stArray),
      value: {
        spent: 9,
        sold: 0,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('Remove first stock from portfolio', async () => {
    const sell = await modifyStock(token, pid1, 'IBM', 2, 2, 0, null, null, d);
    expect(sell).toBe(-1);
    const check = await d.getStock(pid1, 'IBM');
    expect(check).toMatchObject({
      stock: 'IBM',
      avgPrice: 1.00,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 0,
			sold: 4,
			quantitySold: 2
    });
    stArray = [
      {
        stock: 'IBM',
        avgPrice: 1.00,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 0,
				sold: 4,
				quantitySold: 2
      },
      {
        stock: 'AAPL',
        avgPrice: 2.00,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 2,
				sold: 0,
				quantitySold: 0
      },
      {
        stock: 'AMZN',
        avgPrice: 3.00,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 1,
				sold: 0,
				quantitySold: 0
      }
    ]
    const pf = await openPf(token, pid1, d);
    expect(pf).toMatchObject({
      pid: pid1,
      name: 'pf1',
      stocks: expect.arrayContaining(stArray),
      value: {
        spent: 9,
        sold: 4,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('Remove all stocks from portfolio', async () => {
    const sell1 = await modifyStock(token, pid1, 'AAPL', 2, 2, 0, null, null, d);
    expect(sell1).toBe(-1);
    const check1 = await d.getStock(pid1, 'AAPL');
    expect(check1).toMatchObject({
      stock: 'AAPL',
      avgPrice: 2.00,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 0,
			sold: 4,
			quantitySold: 2
    });
    const sell2 = await modifyStock(token, pid1, 'AMZN', 3, 1, 0, null, null, d);
    expect(sell2).toBe(-1);
    const check2 = await d.getStock(pid1, 'AMZN');
    expect(check2).toMatchObject({
      stock: 'AMZN',
      avgPrice: 3.00,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 0,
			sold: 3,
			quantitySold: 1
    });
    
    stArray = [
      {
        stock: 'IBM',
        avgPrice: 1.00,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 0,
				sold: 4,
				quantitySold: 2
      },
      {
        stock: 'AAPL',
        avgPrice: 2.00,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 0,
				sold: 4,
				quantitySold: 2
      },
      {
        stock: 'AMZN',
        avgPrice: 3.00,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 0,
				sold: 3,
				quantitySold: 1
      }
    ]
    const pf = await openPf(token, pid1, d);
    expect(pf).toMatchObject({
      pid: pid1,
      name: 'pf1',
      stocks: expect.arrayContaining(stArray),
      value: {
        spent: 9,
        sold: 11,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
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
  const now = new Date();
  const today = new Date(now);
  const time = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
  const date = time.toString();

  it('Register user and create first portfolio', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    token = rego.token;
    const create = await createPf(token, 'pf', d);
    expect(create).toMatchObject({
      pid: expect.any(String),
    })
    pid = create.pid;
  })
  it('Set default brokerage cost to flat fee 0', async () => {
    const resp = await setDefBroker(token, '0', '0', d);
    expect(resp).toBe(1);
    const broker = await getDefBroker(token, d);
    expect(broker.defBroker).toBe(0);
  })
  it('Add stocks to portfolio', async () => {
    const add1 = await addStock(token, pid, 'AAPL', 2, 2, null, null, d);
    expect(add1).toBe(-1);
    const check1 = await d.getStock(pid, 'AAPL');
    expect(check1).toMatchObject({
      stock: 'AAPL',
      avgPrice: 2,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 2,
			sold: 0,
			quantitySold: 0
    })
    const add2 = await addStock(token, pid, 'AMZN', 3, 2, null, null, d);
    expect(add2).toBe(-1);
    const check2 = await d.getStock(pid, 'AMZN');
    expect(check2).toMatchObject({
      stock: 'AMZN',
      avgPrice: 3,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 2,
			sold: 0,
			quantitySold: 0
    })
    const add3 = await addStock(token, pid, 'IBM', 1, 1, null, null, d);
    expect(add3).toBe(-1);
    const check3 = await d.getStock(pid, 'IBM');
    expect(check3).toMatchObject({
      stock: 'IBM',
      avgPrice: 1,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 1,
			sold: 0,
			quantitySold: 0
    })
    const pfs = await userPfs(token, d);
    pfArray = [{ name: 'pf', pid: pid }];
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const stocks = await openPf(token, pid, d);
    stArray = [
      {
        stock: 'AAPL',
        avgPrice: 2,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 2,
				sold: 0,
				quantitySold: 0
      },
      {
        stock: 'AMZN',
        avgPrice: 3,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 2,
				sold: 0,
				quantitySold: 0
      },
      {
        stock: 'IBM',
        avgPrice: 1,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 1,
				sold: 0,
				quantitySold: 0
      }
    ]
    expect(stocks).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray),
      value: {
        spent: 11,
        sold: 0,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('Change portfolio name', async () => {
    const mod = await editPf(token, pid, 'newpf', d);
    expect(mod).toBe(1);
    const check1 = await userPfs(token, d);
    pfArray = [{ name: 'newpf', pid: pid }];
    expect(check1).toEqual(expect.arrayContaining(pfArray));
    const check2 = await openPf(token, pid, d);
    expect(check2).toMatchObject({
      name: 'newpf',
      pid: pid,
      stocks: expect.arrayContaining(stArray),
      value: {
        spent: 11,
        sold: 0,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('Delete portfolio', async () => {
    const del = await deletePf(token, pid, d);
    expect(del).toBe(1);
    const check1 = await userPfs(token, d);
    expect(check1).toEqual(expect.not.arrayContaining(pfArray));
    const check2 = await openPf(token, pid, d);
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
  const now = new Date();
  const today = new Date(now);
  const time = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
  const date = time.toString();

  it('Register user and create first portfolio', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    token = rego.token;
    const create = await createPf(token, 'pf', d);
    expect(create).toMatchObject({
      pid: expect.any(String),
    })
    pid = create.pid;
  })
  it('Set default brokerage cost to flat fee 0', async () => {
    const resp = await setDefBroker(token, '0', '0', d);
    expect(resp).toBe(1);
    const broker = await getDefBroker(token, d);
    expect(broker.defBroker).toBe(0);
  })
  it('Add stocks to portfolio', async () => {
    const add1 = await addStock(token, pid, 'AAPL', 2, 2, null, null, d);
    expect(add1).toBe(-1);
    const check1 = await d.getStock(pid, 'AAPL');
    expect(check1).toMatchObject({
      stock: 'AAPL',
      avgPrice: 2,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 2,
			sold: 0,
			quantitySold: 0
    })
    const add2 = await addStock(token, pid, 'AMZN', 3, 2, null, null, d);
    expect(add2).toBe(-1);
    const check2 = await d.getStock(pid, 'AMZN');
    expect(check2).toMatchObject({
      stock: 'AMZN',
      avgPrice: 3,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 2,
			sold: 0,
			quantitySold: 0
    })
    const add3 = await addStock(token, pid, 'IBM', 1, 1, null, null, d);
    expect(add3).toBe(-1);
    const check3 = await d.getStock(pid, 'IBM');
    expect(check3).toMatchObject({
      stock: 'IBM',
      avgPrice: 1,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 1,
			sold: 0,
			quantitySold: 0
    })
    const pfs = await userPfs(token, d);
    pfArray = [{ name: 'pf', pid: pid }];
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const stocks = await openPf(token, pid, d);
    stArray = [
      {
        stock: 'AAPL',
        avgPrice: 2,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 2,
				sold: 0,
				quantitySold: 0
      },
      {
        stock: 'AMZN',
        avgPrice: 3,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 2,
				sold: 0,
				quantitySold: 0
      },
      {
        stock: 'IBM',
        avgPrice: 1,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 1,
				sold: 0,
				quantitySold: 0
      }
    ]
    expect(stocks).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray),
      value: {
        spent: 11,
        sold: 0,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('Buy extra of first stock in portfolio', async () => {
    const add = await modifyStock(token, pid, 'AAPL', 3, 2, 1, null, null, d);
    expect(add).toBe(-1);
    const stock = await d.getStock(pid, 'AAPL');
    const newStock = {
      stock: 'AAPL',
      avgPrice: 2.5,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 4,
			sold: 0,
			quantitySold: 0
    }
    expect(stock).toMatchObject(newStock)
    const pfs = await userPfs(token, d);
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const pf = await openPf(token, pid, d);
    stArray[0] = newStock;
    expect(pf).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray),
      value: {
        spent: 17,
        sold: 0,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('Buy extra of all stocks in portfolio', async () => {
    const add1 = await modifyStock(token, pid, 'AMZN', 1, 3, 1, null, null, d);
    expect(add1).toBe(-1);
    const stock1 = await d.getStock(pid, 'AMZN');
    const newStock1 = {
      stock: 'AMZN',
      avgPrice: 1.8,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 5,
			sold: 0,
			quantitySold: 0
    }
    expect(stock1).toMatchObject(newStock1);
    const add2 = await modifyStock(token, pid, 'IBM', 5, 3, 1, null, null, d);
    expect(add2).toBe(-1);
    const stock2 = await d.getStock(pid, 'IBM');
    const newStock2 = {
      stock: 'IBM',
      avgPrice: 4,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 4,
			sold: 0,
			quantitySold: 0
    }
    expect(stock2).toMatchObject(newStock2);
    const pfs = await userPfs(token, d);
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const pf = await openPf(token, pid, d);
    stArray[1] = newStock1;
    stArray[2] = newStock2;
    expect(pf).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray),
      value: {
        spent: 35,
        sold: 0,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('Sell some of first stock in portfolio', async () => {
    const add = await modifyStock(token, pid, 'AAPL', 2, 2, 0, null, null, d);
    expect(add).toBe(-1);
    const stock = await d.getStock(pid, 'AAPL');
    const newStock = {
      stock: 'AAPL',
      avgPrice: 2.5,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 2,
			sold: 4,
			quantitySold: 2
    }
    expect(stock).toMatchObject(newStock)
    const pfs = await userPfs(token, d);
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const pf = await openPf(token, pid, d);
    stArray[0] = newStock;
    expect(pf).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray),
      value: {
        spent: 35,
        sold: 4,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('Sell some of all stocks in portfolio', async () => {
    const add1 = await modifyStock(token, pid, 'AMZN', 1.5, 2, 0, null, null, d);
    expect(add1).toBe(-1);
    const stock1 = await d.getStock(pid, 'AMZN');
    const newStock1 = {
      stock: 'AMZN',
      avgPrice: 1.8,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 3,
			sold: 3,
			quantitySold: 2
    }
    expect(stock1).toMatchObject(newStock1);
    const add2 = await modifyStock(token, pid, 'IBM', 1, 2, 0, null, null, d);
    expect(add2).toBe(-1);
    const stock2 = await d.getStock(pid, 'IBM');
    const newStock2 = {
      stock: 'IBM',
      avgPrice: 4,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 2,
			sold: 2,
			quantitySold: 2
    }
    expect(stock2).toMatchObject(newStock2);
    const pfs = await userPfs(token, d);
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const pf = await openPf(token, pid, d);
    stArray[1] = newStock1;
    stArray[2] = newStock2;
    expect(pf).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray),
      value: {
        spent: 35,
        sold: 9,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('Sell rest of first stock in portfolio', async () => {
    const add = await modifyStock(token, pid, 'AAPL', 3, 2, 0, null, null, d);
    expect(add).toBe(-1);
    const stock = await d.getStock(pid, 'AAPL');
    const newStock = {
      stock: 'AAPL',
      avgPrice: 2.5,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 0,
			sold: 10,
			quantitySold: 4
    }
    expect(stock).toMatchObject(newStock);
    const pfs = await userPfs(token, d);
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const pf = await openPf(token, pid, d);
    stArray[0] = newStock;
    expect(pf).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray),
      value: {
        spent: 35,
        sold: 15,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('Sell rest of all stocks in portfolio', async () => {
    const add1 = await modifyStock(token, pid, 'AMZN', 2, 3, 0, null, null, d);
    expect(add1).toBe(-1);
    const stock1 = await d.getStock(pid, 'AMZN');
    const newStock1 = {
      stock: 'AMZN',
      avgPrice: 1.8,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 0,
			sold: 9,
			quantitySold: 5
    }
    expect(stock1).toMatchObject(newStock1);
    const add2 = await modifyStock(token, pid, 'IBM', 5, 2, 0, null, null, d);
    expect(add2).toBe(-1);
    const stock2 = await d.getStock(pid, 'IBM');
    const newStock2 = {
      stock: 'IBM',
      avgPrice: 4,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 0,
			sold: 12,
			quantitySold: 4
    }
    expect(stock2).toMatchObject(newStock2);
    const pfs = await userPfs(token, d);
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const pf = await openPf(token, pid, d);
    stArray[1] = newStock1;
    stArray[2] = newStock2;
    expect(pf).toMatchObject({
      pid: pid,
      name: 'pf',
      stocks: expect.arrayContaining(stArray),
      value: {
        spent: 35,
        sold: 31,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Portfolio and stocks endpoint test', () => {
  beforeAll(async () => {
    await database.connect();
  })

  let token = null;
  let pid1 = null;
  let pid2 = null;
  let pid3 = null;
  let pfArray = null;
  let stArray = null;
  const now = new Date();
  const today = new Date(now);
  const time = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
  const date = time.toString();

  it('200 on first valid portfolio creation', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', database);
    token = rego.token;
    const resp = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'myPf'
    })
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toMatchObject({
      pid: expect.any(String)
    })
    pid1 = resp.body.pid;
    pfArray = [{ name: 'myPf', pid: pid1 }];
    const userPfs = await request(app).get(`/user/portfolios?token=${token}`).send()
    expect(userPfs.statusCode).toBe(200);
    expect(userPfs.body).toEqual(expect.arrayContaining(pfArray));
  })
  it('200 on valid set default brokerage value to flat fee 0', async () => {
    const resp = await request(app).post(`/user/setDefBroker`).send({
      token: token,
      defBroker: '0',
      brokerFlag: '0'
    })
    expect(resp.statusCode).toBe(200);
  })
  it('200 on valid get default brokerage value', async() => {
    const check = await request(app).get(`/user/getDefBroker?token=${token}`).send();    
    expect(check.statusCode).toBe(200);
    expect(check.body.defBroker.defBroker).toBe(0);
  })
  it('200 on first valid stock addition', async () => {
    const add = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid1,
      stock: 'IBM',
      price: 1.00,
      quantity: 2,
      brokerage: null
    })
    expect(add.statusCode).toBe(200);

    const get = await userPfs(token, database);
    const pfArray = [{ name: 'myPf', pid: pid1 }];
    expect(get).toEqual(expect.arrayContaining(pfArray));
    const stArray = [{
      stock: 'IBM',
      avgPrice: 1.00,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 2,
			sold: 0,
			quantitySold: 0
    }]
    const pf = await openPf(token, pid1, database);
    expect(pf).toMatchObject({
      pid: pid1,
      name: 'myPf',
      stocks: expect.arrayContaining(stArray),
      value: { 
        spent: 2,
        sold: 0,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('200 on subsequent valid stock additions', async () => {
    const add1 = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid1,
      stock: 'AAPL',
      price: 2.00,
      quantity: 2,
      brokerage: null
    })
    expect(add1.statusCode).toBe(200);

    const add2 = await request(app).post(`/user/stocks/add`).send({
      token: token,
      pid: pid1,
      stock: 'AMZN',
      price: 3.00,
      quantity: 1,
      brokerage: null
    })
    expect(add2.statusCode).toBe(200);

    stArray = [
      {
        stock: 'IBM',
        avgPrice: 1.00,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 2,
				sold: 0,
				quantitySold: 0
      },
      {
        stock: 'AAPL',
        avgPrice: 2.00,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 2,
				sold: 0,
				quantitySold: 0
      },
      {
        stock: 'AMZN',
        avgPrice: 3.00,
        performance: [
          {
            date: date,
            performance: 0
          }
        ],
        quantity: 1,
				sold: 0,
				quantitySold: 0
      }
    ]
    const pf = await openPf(token, pid1, database);
    expect(pf).toMatchObject({
      pid: pid1,
      name: 'myPf',
      stocks: expect.arrayContaining(stArray),
      value: { 
        spent: 9,
        sold: 0,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('200 on first valid stock sale', async () => {
    const sell = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid1,
      stock: 'IBM',
      price: 1.00,
      quantity: 2,
      option: 0,
      brokerage: null
    })
    expect(sell.statusCode).toBe(200);

    const newStock = {
      stock: 'IBM',
      avgPrice: 1.00,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 0,
			sold: 2,
			quantitySold: 2
    };

    stArray[0] = newStock;
    
    const pf = await openPf(token, pid1, database);
    expect(pf).toMatchObject({
      pid: pid1,
      name: 'myPf',
      stocks: expect.arrayContaining(stArray),
      value: { 
        spent: 9,
        sold: 2,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('200 on subsequent valid stock sales', async () => {
    const sell1 = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid1,
      stock: 'AAPL',
      price: 2.00,
      quantity: 2,
      option: 0,
      brokerage: null
    })
    expect(sell1.statusCode).toBe(200);
    const sell2 = await request(app).put(`/user/stocks/edit`).send({
      token: token,
      pid: pid1,
      stock: 'AMZN',
      price: 3.00,
      quantity: 1,
      option: 0,
      brokerage: null
    })
    expect(sell2.statusCode).toBe(200);

    const newStock1 = {
      stock: 'AAPL',
      avgPrice: 2.00,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 0,
			sold: 4,
			quantitySold: 2
    };

    const newStock2 = {
      stock: 'AMZN',
      avgPrice: 3.00,
      performance: [
        {
          date: date,
          performance: 0
        }
      ],
      quantity: 0,
			sold: 3,
			quantitySold: 1
    };

    stArray[1] = newStock1;
    stArray[2] = newStock2;

    const pf = await openPf(token, pid1, database);
    expect(pf).toMatchObject({
      pid: pid1,
      name: 'myPf',
      stocks: expect.arrayContaining(stArray),
      value: { 
        spent: 9,
        sold: 9,
        performance: [
          {
            date: date,
            performance: 0
          }
        ]
      }
    })
  })
  it('200 on subsequent valid portfolio creations', async () => {
    const resp1 = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'myPf2'
    })
    expect(resp1.statusCode).toBe(200);
    expect(resp1.body).toMatchObject({
      pid: expect.any(String)
    })
    pid2 = resp1.body.pid;
    const resp2 = await request(app).post(`/user/portfolios/create`).send({
      token: token,
      name: 'myPf3'
    })
    expect(resp2.statusCode).toBe(200);
    expect(resp2.body).toMatchObject({
      pid: expect.any(String)
    })
    pid3 = resp2.body.pid;
    pfArray.push({ name: 'myPf2', pid: pid2 }, { name: 'myPf3', pid: pid3 });
    const userPfs = await request(app).get(`/user/portfolios?token=${token}`).send()
    expect(userPfs.statusCode).toBe(200);
    expect(userPfs.body).toEqual(expect.arrayContaining(pfArray));
  })

  afterAll(async() => {
    await database.disconnect();
  })
})

describe('Adding stocks to watchlist', () => {
  const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  let token = null;
  let pid = null;
  let pfArray = null;
  let stArray = null;

  it('Register user and check watchlist', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    token = rego.token;
    pid = await getPid(token, 'Watchlist', d);
    expect(pid).not.toBe(null);
    pfArray = [{ name: 'Watchlist', pid: pid}];
    const pfs = await userPfs(token, d);
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const pf = await openPf(token, pid, d);
    expect(pf).toMatchObject({
      pid: pid,
      name: 'Watchlist',
      stocks: [],
    })
  })
  it('Add first stock to watchlist', async () => {
    const add = await addStock(token, pid, 'AAPL', null, null, null, null, d);
    expect(add).toBe(-1);
    const check = await d.getStock(pid, 'AAPL');
    expect(check).toMatchObject({
      stock: 'AAPL',
      avgPrice: null,
      performance: [
        {
          date: null,
          performance: null
        }
      ],
      quantity: null,
			sold: null,
			quantitySold: null
    })
    const pfs = await userPfs(token, d);
    pfArray = [{ name: 'Watchlist', pid: pid }];
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const stocks = await openPf(token, pid, d);
    stArray = [
      {
        stock: 'AAPL',
        avgPrice: null,
        performance: [
          {
            date: null,
            performance: null
          }
        ],
        quantity: null,
				sold: null,
				quantitySold: null
      }
    ]
    expect(stocks).toMatchObject({
      pid: pid,
      name: 'Watchlist',
      stocks: expect.arrayContaining(stArray)
    })
  })
  it('Add all stocks to watchlist', async () => {
    const add1 = await addStock(token, pid, 'AMZN', null, null, null, null, d);
    expect(add1).toBe(-1);
    const check1 = await d.getStock(pid, 'AMZN');
    expect(check1).toMatchObject({
      stock: 'AMZN',
      avgPrice: null,
      quantity: null,
    })
    const add2 = await addStock(token, pid, 'IBM', null, null, null, null, d);
    expect(add2).toBe(-1);
    const check2 = await d.getStock(pid, 'IBM');
    expect(check2).toMatchObject({
      stock: 'IBM',
      avgPrice: null,
      quantity: null
    })
    const pfs = await userPfs(token, d);
    expect(pfs).toEqual(expect.arrayContaining(pfArray));
    const stocks = await openPf(token, pid, d);
    stArray = [
      {
        stock: 'AAPL',
        avgPrice: null,
        performance: [
          {
            date: null,
            performance: null
          }
        ],
        quantity: null,
				sold: null,
				quantitySold: null
      },
      { 
        stock: 'AMZN',
        avgPrice: null,
        performance: [
          {
            date: null,
            performance: null
          }
        ],
        quantity: null,
				sold: null,
				quantitySold: null
      },
      {
        stock: 'IBM',
        avgPrice: null,
        performance: [
          {
            date: null,
            performance: null
          }
        ],
        quantity: null,
				sold: null,
				quantitySold: null
      }
    ]
    expect(stocks).toMatchObject({
      pid: pid,
      name: 'Watchlist',
      stocks: expect.arrayContaining(stArray)
    })
  })
  it('Try and add same stock to watchlist', async () => {
    const add1 = await addStock(token, pid, 'AMZN', null, null, null, null, d);
    expect(add1).toBe(6);
  })
  it('Remove first stock from watchlist', async () => {
    const rem = await modifyStock(token, pid, 'AAPL', null, null, 0, null, null, d);
    expect(rem).toBe(-1);
    const pf = await openPf(token, pid, d);
    stArray.splice(0, 1);
    expect(pf).toMatchObject({
      pid: pid,
      name: 'Watchlist',
      stocks: expect.arrayContaining(stArray)
    })
  })
  it('Remove all stocks from watchlist', async () => {
    const rem1 = await modifyStock(token, pid, 'AMZN', null, null, 0, null, null, d);
    expect(rem1).toBe(-1);
    const rem2 = await modifyStock(token, pid, 'IBM', null, null, 0, null, null, d);
    expect(rem2).toBe(-1);
    const pf = await openPf(token, pid, d);
    stArray.splice(0, 2);
    expect(pf).toMatchObject({
      pid: pid,
      name: 'Watchlist',
      stocks: expect.arrayContaining(stArray)
    })
  })

  afterAll(async () => {
    await d.disconnect();
  })
})