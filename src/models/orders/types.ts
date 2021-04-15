import { isMainOrder } from ".";

export interface Iorder {
  id: number,
  fromValue: number,
  fromValuePair: 'regnet' | 'testnet',
  toValue: number,
  toValuePair: 'regnet' | 'testnet',
  [isMainOrder]?: boolean
}

export interface IcreateOrderDto {
  fromValue: number,
  fromValuePair: 'regnet' | 'testnet',
  toValue: number,
  toValuePair: 'regnet' | 'testnet'
}