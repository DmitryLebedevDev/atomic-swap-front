import {bitcoinToSat} from "./bitcoinToSat";

test('bitcoinToSat check convert', () => {
  expect(bitcoinToSat(1)).toBe(100000000)
  expect(bitcoinToSat(1.5)).toBe(150000000)
  expect(bitcoinToSat(2)).toBe(200000000)
})