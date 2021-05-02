import {ECPairInterface} from "bitcoinjs-lib"

export type IuserNetworkKeys = "testnet" | "regnet";

export type IuserWallets = Record<IuserNetworkKeys, Iwallet>
export interface Iwallet {
  ECPair: ECPairInterface,
  address: string,
  balance: number
}