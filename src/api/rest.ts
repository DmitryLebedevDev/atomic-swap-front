import axios from "axios";
import { IuserNetworkKeys } from "../models/user/types";
import {
  IaddressInfoRes,
  Itransaction,
  IunspentTransaction,
  IunspentTransactionsRes
} from "./types";
import {IrequestResponse, Ivin} from "./types";


export const regnetApi = axios.create({
  baseURL: process.env.REACT_APP_REGNET_URL
})
export const testnetApi = axios.create({
  baseURL: process.env.REACT_APP_TESTNET_URL
})
const getApi = (networkType: IuserNetworkKeys) => {
  switch (networkType) {
    case "regnet": return regnetApi;
    case "testnet": return testnetApi;
  }
}
export const getVinForUtxoTransactionReq
  = (networkType: IuserNetworkKeys, txid: string, n: number) => (
    getApi(networkType).get<
      IrequestResponse<{vin: Ivin}, {message: string}>
    >
    (`/getVinForUtxoTransaction/${txid}?n=${n}`)
    .then(({data}) => data)
  )
export const getAddressBalanceReq
  = (networkType: IuserNetworkKeys, address: string) => (
    getApi(networkType).get<IaddressInfoRes>(
      `address/${address}`
    ).then((info) => {
        const {
          data: {
            address: {
              total: {balance}
            }
          }
        } = info;
        return +balance;
      }
    )
  )
export const getUnspentTransactionsReq
  = (networkType: IuserNetworkKeys, address: string) => (
    getApi(networkType).get<IunspentTransactionsRes>(
      `address/${address}/unspent`
    ).then<IunspentTransaction[]>(({
        data: {
          unspent
        }
      }) => unspent
    )
  )
export const sendTransactionReq
  = (networkType: IuserNetworkKeys, hex: string) => (
    getApi(networkType).post<
      IrequestResponse<{txid: string}, {message: string}>
    >(
      `/pushtx`,
      {hex}
    ).then(({data}) => data)
  )
export const getTransactionReq
  = (networkType: IuserNetworkKeys, txId: string) => (
    getApi(networkType).get<
      IrequestResponse<{transaction: Itransaction}, {message: string}>
    >(`/tx/${txId}`)
    .then(({data: info}) => {
      return info.success ? info.transaction : Promise.reject()
    })
  )