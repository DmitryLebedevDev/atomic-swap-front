import axios from "axios";
import { IuserNetworkKeys } from "../models/user/types";
import {
  IaddressInfoRes,
  IResStatus,
  IunspentTransaction,
  IunspentTransactionsRes
} from "../../../wallet/src/api/api.interface";
import { IgetTransactionReq } from "./types";

export const regnetApi = axios.create({
  baseURL: process.env.REACT_REGNET_URL
})
export const testnetApi = axios.create({
  baseURL: process.env.REACT_TESTNET_URL
})
const getApi = (networkType: IuserNetworkKeys) => {
  switch (networkType) {
    case "regnet": return regnetApi;
    case "testnet": return testnetApi;
  }
}

export const getAddressBalanceReq
  = (networkType: IuserNetworkKeys, address: string) => (
    getApi(networkType).get<IaddressInfoRes>(
      `address/${address}`
    ).then(({
        data: {
          address: {
            total: {balance}
          }
        }
      }) => +balance
    )
  )
export const getUnspentTransactionsReq
  = (networkType: IuserNetworkKeys, address: number) => (
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
    getApi(networkType).post<IResStatus>(
      `/pushtx`,
      {hex}
    )
  )
export const getTransactionReq
  = (networkType: IuserNetworkKeys, txId: string) => (
    getApi(networkType).get<IgetTransactionReq>(`tx/${txId}`)
    .then(({data: {success, transaction}}) => {
      return success ? transaction : Promise.reject()
    })
  )