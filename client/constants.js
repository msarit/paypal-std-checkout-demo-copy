const ITEMS = {
  hdqgapq9: {
    sku: "hdqgapq9",
    name: "Galaxy Shoes",
    price: "100",
    stock: 2,
  },
  rnfjwsy0: {
    sku: "rnfjwsy0",
    name: "Spaceship Earrings",
    price: "40",
    stock: 10,
  },
  zytkddw5: {
    sku: "zytkddw5",
    name: "Martian Tote",
    price: "75",
    stock: 100,
  },
};

const SHIPPING_OPTIONS = [
  {
    id: "SHIP_123",
    label: "Flat-Rate Shipping",
    type: "SHIPPING",
    selected: true,
    amount: {
      value: "3.00",
      currency_code: "USD",
    },
  },
  {
    id: "SHIP_456",
    label: "Expedited Shipping",
    type: "SHIPPING",
    selected: false,
    amount: {
      value: "15.00",
      currency_code: "USD",
    },
  },
  {
    id: "SHIP_789",
    label: "Pick up in Store",
    type: "PICKUP",
    selected: false,
    amount: {
      value: "0.00",
      currency_code: "USD",
    },
  },
];

export { ITEMS, SHIPPING_OPTIONS };
