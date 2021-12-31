import {
  keyBy,
  defaultsDeep,
  forIn,
  compact,
  flatten,
  map,
  mapValues,
  values,
  valuesIn,
  groupBy,
  defaults,
  zipObject,
  isString,
  isEqual,
} from '../../utils/lodashToNative';
import '@testing-library/jest-dom';
import BigNumber from 'bignumber.js';

describe('keyBy', () => {
  const testArray = [
    {
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      balance: new BigNumber(100),
    },
    {
      address: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
      balance: new BigNumber(200),
    },
    {
      address: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
      balance: new BigNumber(300),
    },
  ];

  const testStringKeyedArray = {
    '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      balance: new BigNumber(100),
    },
    '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b': {
      address: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
      balance: new BigNumber(200),
    },
    '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c': {
      address: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
      balance: new BigNumber(300),
    },
  };

  test('array is keyed correctly by string property', () => {
    expect(keyBy(testArray, 'address')).toEqual(testStringKeyedArray);
  });

  const testBNKeyedArray = {
    '100': {
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      balance: new BigNumber(100),
    },
    '200': {
      address: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
      balance: new BigNumber(200),
    },
    '300': {
      address: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
      balance: new BigNumber(300),
    },
  };

  test('array is keyed correctly by BigNumber property', () => {
    expect(keyBy(testArray, 'balance')).toEqual(testBNKeyedArray);
  });

  const testRepeatedArray = [
    {
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      balance: new BigNumber(100),
    },
    {
      address: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
      balance: new BigNumber(200),
    },
    {
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      balance: new BigNumber(300),
    },
  ];

  // Objects with repeated keys get merged and the properties of the last one are kept
  const testRepeatedKeyedArray = {
    '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      balance: new BigNumber(300),
    },
    '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b': {
      address: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
      balance: new BigNumber(200),
    },
  };

  test('array is keyed correctly with a repeated key value', () => {
    expect(keyBy(testRepeatedArray, 'address')).toEqual(testRepeatedKeyedArray);
  });
});

describe('forIn', () => {
  const testArray = {
    '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      balance: new BigNumber(100),
    },
    '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b': {
      address: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
      balance: new BigNumber(200),
    },
    '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c': {
      address: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
      balance: new BigNumber(300),
    },
  };

  test('Properties of object are manipulated correctly with iterative function', () => {
    let sum = new BigNumber(0);
    const addresses: string[] = [];

    forIn(testArray, (token) => {
      sum = sum.plus(token.balance);
      addresses.push(token.address);
    });
    expect(sum).toEqual(new BigNumber(600));
    expect(addresses).toEqual([
      '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
      '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
    ]);
  });
});

describe('compact', () => {
  test('Array with null is compacted correctly', () => {
    const array = ['1', null, '2'];
    expect(compact(array)).toEqual(['1', '2']);
  });

  test('Array with undefined is compacted correctly', () => {
    const array = ['1', undefined, '2'];
    expect(compact(array)).toEqual(['1', '2']);
  });

  test('Array with false is compacted correctly', () => {
    const array = [true, false, true];
    expect(compact(array)).toEqual([true, true]);
  });

  test('Array with empty string is compacted correctly', () => {
    const array = ['1', '', '2'];
    expect(compact(array)).toEqual(['1', '2']);
  });

  test('Array with 0 is compacted correctly', () => {
    const array = [0, 1, 2];
    expect(compact(array)).toEqual([1, 2]);
  });

  test('Array with NaN is compacted correctly', () => {
    const array = [NaN, 1, 2];
    expect(compact(array)).toEqual([1, 2]);
  });

  test('Array with multiple falsey values is compacted correctly', () => {
    const array = [NaN, 0, undefined, '', null, false, 1, 2];
    expect(compact(array)).toEqual([1, 2]);
  });
});

describe('flatten', () => {
  test('Flattens two layer array correctly', () => {
    const array = [1, 2, [3, 4], 5, NaN];
    expect(flatten(array)).toEqual([1, 2, 3, 4, 5, NaN]);
  });
});

describe('map', () => {
  const square = (n: number) => {
    return n * n;
  };

  test('Maps number array to square function correctly', () => {
    const array = [1, 2, 3, 4];
    expect(map(array, square)).toEqual([1, 4, 9, 16]);
  });

  test('Maps stringed keyed array with numbers to square function correctly', () => {
    const array = { a: 1, b: 2, c: 3, d: 4 };
    expect(map(array, square)).toEqual([1, 4, 9, 16]);
  });
});

describe('mapValues', () => {
  const array = {
    token1: { name: 'bDigg', balance: 100 },
    token2: { name: 'bBadger', balance: 300 },
  };

  test('Object is created with selected string property', () => {
    const result = mapValues(array, (obj) => {
      return obj.name;
    });
    expect(result).toEqual({ token1: 'bDigg', token2: 'bBadger' });
  });

  test('Object is created with selected number property', () => {
    const result = mapValues(array, (obj) => {
      return obj.balance;
    });
    expect(result).toEqual({ token1: 100, token2: 300 });
  });
});

describe('values', () => {
  test("Array is created from a simple object's own properties", () => {
    const object: any = { name: 'bDigg', balance: 100 };
    expect(values(object)).toEqual(['bDigg', 100]);
  });

  test("Array is created from an string keyed object's own properties", () => {
    const object: any = {
      token1: { name: 'bDigg', balance: 100 },
      token2: { name: 'bBadger', balance: 300 },
    };
    expect(values(object)).toEqual([
      { name: 'bDigg', balance: 100 },
      { name: 'bBadger', balance: 300 },
    ]);
  });
});

describe('valuesIn', () => {
  test("Array is created from a simple object's own and inherited properties", () => {
    const object: any = { name: 'bDigg', balance: 100 };
    object['totalSupply'] = 1000;

    expect(valuesIn(object)).toEqual(['bDigg', 100, 1000]);
  });

  test("Array is created from an string keyed object's own and inherited properties", () => {
    const object: any = {
      token1: { name: 'bDigg', balance: 100 },
      token2: { name: 'bBadger', balance: 300 },
    };
    object['token3'] = { name: 'BTC', balance: 1 };

    expect(valuesIn(object)).toEqual([
      { name: 'bDigg', balance: 100 },
      { name: 'bBadger', balance: 300 },
      { name: 'BTC', balance: 1 },
    ]);
  });
});

describe('groupBy', () => {
  test('Object is created with numerically processed keys', () => {
    const array = [6.1, 4.2, 6.3];

    expect(groupBy(array, Math.floor)).toEqual({ '4': [4.2], '6': [6.1, 6.3] });
  });

  test('Object is created from string keyed array with iterative processing function', () => {
    const array = {
      token1: { name: 'bDigg', balance: 100 },
      token2: { name: 'bBadger', balance: 300 },
    };

    const result = groupBy(array, (token: any) => {
      return token.name;
    });

    const resultArray = {
      bDigg: [{ name: 'bDigg', balance: 100 }],
      bBadger: [{ name: 'bBadger', balance: 300 }],
    };

    expect(result).toEqual(resultArray);
  });
});

describe('defaults', () => {
  test('Sources are merged correctly into simple destination object', () => {
    expect(defaults({ a: 3 }, { b: 1 }, { c: 5 }, { d: 5 }, { e: 5 })).toEqual({ a: 3, b: 1, c: 5, d: 5, e: 5 });
  });

  test('Sources are merged correctly into simple destination object with repeated keys', () => {
    expect(defaults({ a: 3 }, { b: 1 }, { a: 5 }, { d: 5 }, { b: 5 })).toEqual({ a: 3, b: 1, d: 5 });
  });

  test('Sources are merged correctly into string keyed destination object with repeated keys', () => {
    const array = {
      token1: { name: 'bDigg', balance: 100 },
      token2: { name: 'bBadger', balance: 300 },
    };

    // Repeated keys
    const source1 = {
      token1: { name: 'bDigg', balance: 300 },
      token2: { name: 'bBadger', balance: 500 },
    };
    // Different keys
    const source2 = {
      token3: { name: 'BTC', balance: 1 },
    };

    const result = {
      token1: { name: 'bDigg', balance: 100 },
      token2: { name: 'bBadger', balance: 300 },
      token3: { name: 'BTC', balance: 1 },
    };

    expect(defaults(array, source1, source2)).toEqual(result);
  });
});

describe('defaultsDeep', () => {
  const dest = {
    '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
      name: 'token1',
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      balance: 100,
      methods: [
        {
          name: 'getPricePerFullShare',
        },
      ],
    },
    '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c': {
      name: 'token3',
      address: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
      balance: 200,
    },
  };

  // Adding existing and non-existing property
  const source1 = {
    '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      balance: 200,
      ethValue: new BigNumber(100),
    },
  };
  // Adding non-existing property
  const source2 = {
    '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
      decimals: 12,
    },
  };
  // Adding existing array property
  const source3 = {
    '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
      methods: [
        {
          name: 'balanceOf',
        },
        {
          name: 'totalSupply',
        },
      ],
    },
  };
  // Adding object with different key
  const source4 = {
    '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b': {
      name: 'token2',
    },
  };
  // Adding non-existing property
  const source5 = {
    '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b': {
      decimals: 18,
    },
  };

  const result = {
    '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
      name: 'token1',
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      balance: 100,
      ethValue: new BigNumber(100),
      decimals: 12,
      methods: [
        {
          name: 'getPricePerFullShare',
        },
        {
          name: 'totalSupply',
        },
      ],
    },
    '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b': {
      name: 'token2',
      decimals: 18,
    },
    '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c': {
      name: 'token3',
      address: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
      balance: 200,
    },
  };

  test('Sources are merged correctly into destination', () => {
    expect(defaultsDeep(dest, source1, source2, source3, source4, source5)).toEqual(result);
  });
});

describe('zipObject', () => {
  test('Returns zipped object from two simple arrays', () => {
    expect(zipObject(['a', 'b'], [1, 2])).toEqual({ a: 1, b: 2 });
  });

  test('Returns zipped object from array of strings and array of objects', () => {
    const props = [
      '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
      '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
    ];
    const values = [
      {
        address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
        balance: new BigNumber(100),
      },
      {
        address: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
        balance: new BigNumber(200),
      },
      {
        address: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
        balance: new BigNumber(300),
      },
    ];

    const result = {
      '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
        address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
        balance: new BigNumber(100),
      },
      '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b': {
        address: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
        balance: new BigNumber(200),
      },
      '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c': {
        address: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
        balance: new BigNumber(300),
      },
    };
    expect(zipObject(props, values)).toEqual(result);
  });
});

describe('isString', () => {
  test('Returns false for a number input', () => {
    expect(isString(2)).toEqual(false);
  });

  test('Returns false for a boolean input', () => {
    expect(isString(true)).toEqual(false);
  });

  test('Returns false for a BigNumber input', () => {
    expect(isString(new BigNumber(2))).toEqual(false);
  });

  test('Returns false for an Object input', () => {
    expect(isString({ a: 3 })).toEqual(false);
  });

  test('Returns false for a undefined input', () => {
    expect(isString(undefined)).toEqual(false);
  });

  test('Returns false for a NaN input', () => {
    expect(isString(NaN)).toEqual(false);
  });

  test('Returns true for a string input', () => {
    expect(isString('test')).toEqual(true);
  });
});

describe('isEqual', () => {
  const obj = {
    '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
      name: 'token1',
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      balance: new BigNumber(100),
      methods: [
        {
          name: 'getPricePerFullShare',
        },
      ],
    },
    '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c': {
      name: 'token3',
      address: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
      balance: 200,
    },
  };

  const equalsObj = {
    '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
      name: 'token1',
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      balance: new BigNumber(100),
      methods: [
        {
          name: 'getPricePerFullShare',
        },
      ],
    },
    '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c': {
      name: 'token3',
      address: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
      balance: 200,
    },
  };

  const diffBigNumberObj = {
    '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
      name: 'token1',
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      balance: new BigNumber(1000),
      methods: [
        {
          name: 'getPricePerFullShare',
        },
      ],
    },
    '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c': {
      name: 'token3',
      address: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
      balance: 200,
    },
  };

  const smallObj = {
    '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
      name: 'token1',
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      balance: new BigNumber(100),
      methods: [
        {
          name: 'getPricePerFullShare',
        },
      ],
    },
  };

  test('Objects are equal if they are same reference', () => {
    expect(isEqual(obj, obj)).toEqual(true);
  });
  test('Objects are equal if all keys and values are equal', () => {
    expect(isEqual(obj, equalsObj)).toEqual(true);
  });
  test('Objects are unequal if BigNumbers have different values', () => {
    expect(isEqual(obj, diffBigNumberObj)).toEqual(false);
  });
  test('Objects are unequal if they have different keys', () => {
    expect(isEqual(obj, smallObj)).toEqual(false);
  });
});
