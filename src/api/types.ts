export enum WsStatus {
  success = 0,
  error = 1,
}

export interface Itransaction {
  hash: string,
  txid: string,
  locktime: number,
  confirmations: number,
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