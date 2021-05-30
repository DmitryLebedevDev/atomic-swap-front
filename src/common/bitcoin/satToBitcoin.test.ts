import {satToBitcoin} from "./satToBitcoin";
import {bitcoinToSat} from "./bitcoinToSat";

test('satToBitcoin check convert', () => {
  expect(satToBitcoin(100000000)).toBe(1)
  expect(satToBitcoin(150000000)).toBe(1.5)
  expect(satToBitcoin(200000000)).toBe(2)
})