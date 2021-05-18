import {IuserNetworkKeys} from "../../models/user/types";
import {getTransactionReq} from "../../api/rest";
import {sleep} from "../functions/sleep";

export const pendingConfirmsTransaction
  = (network: IuserNetworkKeys, txid: string, confirms: number) => {
    return new Promise(async (res, rej) => {
      try {
        let transaction = await getTransactionReq(network, txid);
        while ((transaction.confirmations || 0) < confirms) {
          await sleep(2000);
          transaction = await getTransactionReq(network, txid);
        }
        res(null);
      } catch (e) {
        console.log(e)
        rej()
      }
    })
  }