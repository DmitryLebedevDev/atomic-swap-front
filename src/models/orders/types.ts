import { isMainOrder } from ".";
import * as Buffer from "buffer";

export interface Iorder {
  id: number,
  fromValue: number,
  fromValuePair: 'regnet' | 'testnet',
  fromPubKey?: Buffer,
  toValue: number,
  toValuePair: 'regnet' | 'testnet',
  toPubKey?: Buffer,
  [isMainOrder]?: boolean
}

export interface IcreateOrderDto {
  fromValue: number,
  fromValuePair: 'regnet' | 'testnet',
  toValue: number,
  toValuePair: 'regnet' | 'testnet'
}