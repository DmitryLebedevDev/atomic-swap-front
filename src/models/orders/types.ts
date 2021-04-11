export interface Iorder {
  id: number,
  fromValue: number,
  fromValuePair: 'regnet' | 'testnet',
  toValue: number,
  toValuePair: 'regnet' | 'testnet'
}