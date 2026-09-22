const { MiniMaple } = require("../src/miniMaple");

const maple = new MiniMaple();

test('diff of 4*x^3 with respect to x is 12*x^2', () => {
  expect(maple.diff('4*x^3', 'x')).toBe('12*x^2');
});

test('diff of 4*x^3 with respect to y is 0', () => {
  expect(maple.diff('4*x^3', 'y')).toBe('0');
});

test('diff of 4*x^3-x^2 with respect to x is 12*x^2-2*x', () => {
  expect(maple.diff('4*x^3-x^2', 'x')).toBe('12*x^2-2*x');
});

test('diff of x^2 with respect to x is 2*x', () => {
  expect(maple.diff('x^2', 'x')).toBe('2*x');
});

test('diff of x with respect to x is 1', () => {
  expect(maple.diff('x', 'x')).toBe('1');
});

test('diff of constant with respect to x is 0', () => {
  expect(maple.diff('5', 'x')).toBe('0');
});

test('diff of x^3+2*x^2+x with respect to x is 3*x^2+4*x+1', () => {
  expect(maple.diff('x^3+2*x^2+x', 'x')).toBe('3*x^2+4*x+1');
});

test('throws on invalid character', () => {
  expect(() => maple.diff('4*x$3', 'x')).toThrow();
});

test('throws on syntax error', () => {
  expect(() => maple.diff('4*x^', 'x')).toThrow();
});
