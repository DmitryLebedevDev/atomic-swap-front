import {bitcoinToSat} from "./bitcoinToSat";

test('bitcoinToSat check convert', () => {
  expect(bitcoinToSat(1)).toBe(100000000)
})