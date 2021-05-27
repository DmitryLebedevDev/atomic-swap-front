import {pendingSpentUtxoTx} from "./pendingSpentUtxo";
import * as api from "../../api/rest";
import {getVinForUtxoTransactionReq} from "../../api/rest";
import {Ivin} from "../../api/types";

const testVin: Ivin = {
  txid: "test",
  scriptSig: {
    hex: "hex",
    asm: "asm"
  },
  vout: 0,
  sequence: 0,
}

test('pendingSpentUtxo check return value', async () => {
  const mockGetVinForUtxoTransactionReq
    = jest.spyOn(api, "getVinForUtxoTransactionReq")
          .mockReturnValueOnce(Promise.resolve({success: false, message: 'test'}))
          .mockReturnValueOnce(Promise.resolve({success: true, vin: testVin}))
  await expect(
    pendingSpentUtxoTx("testnet", "txid", 0)
  ).resolves.toEqual(testVin)
  expect(mockGetVinForUtxoTransactionReq.mock.calls.length).toBe(2)
  expect(mockGetVinForUtxoTransactionReq.mock.calls[0]).toEqual(["testnet", "txid", 0])
  expect(mockGetVinForUtxoTransactionReq.mock.calls[1]).toEqual(["testnet", "txid", 0])
})
test('pendingSpentUtxo check await fn', async () => {
  const mockGetVinForUtxoTransactionReq
    = jest.spyOn(api, "getVinForUtxoTransactionReq")
    .mockReturnValueOnce(Promise.resolve({success: false, message: 'test'}))
    .mockReturnValueOnce(Promise.resolve({success: false, message: 'test'}))
    .mockReturnValueOnce(Promise.resolve({success: true, vin: testVin}))
  await expect(
    pendingSpentUtxoTx("testnet", "txid", 0, 2000)
  ).rejects.toThrowError('end time')
  expect(mockGetVinForUtxoTransactionReq.mock.calls.length).toBe(2)
  expect(mockGetVinForUtxoTransactionReq.mock.calls[0]).toEqual(["testnet", "txid", 0])
  expect(mockGetVinForUtxoTransactionReq.mock.calls[1]).toEqual(["testnet", "txid", 0])
})