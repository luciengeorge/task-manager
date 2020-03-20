const { calculateTip, fahrenheitToCelcius, celciusToFahrenheit } = require('../src/math');

test('should calculate total with tip', () => {
  const total = calculateTip(10, 0.3);
  expect(total).toBe(13);
});

test('should calculate total with default tip', () => {
  const total = calculateTip(10);
  expect(total).toBe(12.5);
});

test('should convert 32 degrees fahrenheit to 0 degrees celcius', () => {
  const celcius = fahrenheitToCelcius(32);
  expect(celcius).toBe(0);
});

test('should convert 0 degrees celcius to 32 degrees fahrenheit', () => {
  const fahrenheit = celciusToFahrenheit(0);
  expect(fahrenheit).toBe(32);
});
