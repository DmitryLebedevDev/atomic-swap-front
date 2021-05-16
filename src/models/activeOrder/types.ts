export interface IemitPubKeyToOrder {
  id: number,
  hexPubKey: string,
  keyType: 'from' | 'to'
}
export interface IemitHtlcToOrder {
  id: number,
  txid: string,
  redeem: string,
  htlcType: 'from' | 'to'
}