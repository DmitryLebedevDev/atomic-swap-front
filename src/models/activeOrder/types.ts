export interface IemitPubKeyToOrder {
  id: number,
  hexPubKey: string,
  keyType: 'from' | 'to'
}