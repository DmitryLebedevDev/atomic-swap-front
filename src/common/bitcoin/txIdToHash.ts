export function txIdToHash(txid: string): Buffer {
  return Buffer.from(txid, 'hex').reverse()
}