import {ECPairInterface} from "bitcoinjs-lib"

export type IuserWallets = Record<"testnet" | "regnet", Iwallet>
export interface Iwallet {
  ECPair: ECPairInterface,
  address: string,
  balance: number
}