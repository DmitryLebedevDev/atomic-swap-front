export enum WsStatus {
  success = 0,
  error = 1,
}
export interface Ivin {
  txid: string,
  vout: number,
  scriptSig: {
    asm: string,
    hex: string
  },
  sequence: number
}
export interface Ivout {
  value: number,
  n: number,
  scriptPubKey: {
    asm: string,
    hex: string,
    reqSigs?: number,
    type: string,
    addresses: string[]
  }
}
export interface Itransaction {
  hash: string,
  txid: string,
  locktime: number,
  confirmations: number,
  vin: Ivin[],
  blockhash?: string,
  vout: Ivout[],
  outputs: [{
    addresses: [string],
  }, {
    addresses: [string],
  }],
}
export interface IgetTransactionReq {
  success: boolean,
  transaction: Itransaction
}
export interface IunspentTransaction {
  txid: string,
  n: number,
  value: number,
  script_pub_key: {
    hex: string
  },
  confirmations: number
}
export interface IunspentTransactionsRes {
  unspent: IunspentTransaction[]
}

export interface IaddressInfoRes {
  address: {
    address: string,
    total: {
      balance: string
    },
    confirmed: {
      balance: string
    },
    transactions: Itransaction[]
  }
}
export interface IResStatus {
  success: string
}
export enum getInfoTxOutputError {
  notExistTransaction,
  utxoNotUnspent,
  notExistVout
}
export interface Iblock {
  tx: string[],
  nextblockhash?: string
}
export type IrequestResponse<Success, Error>
  = {success: true} & Success |
    {success: false} & Error