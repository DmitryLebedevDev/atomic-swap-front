import {IuserNetworkKeys} from "../../models/user/types";
import {getTransactionReq} from "../../api/rest";
import {sleep} from "../functions/sleep";

export const pendingConfirmsTransaction
  = async (
    network: IuserNetworkKeys,
    txid: string,
    confirms: number,
    stopTimeMs?: number
  ) => {
    try {
      let transaction = await getTransactionReq(network, txid);
      while ((transaction.confirmations || 0) < confirms) {
        await sleep(2000);
        transaction = await getTransactionReq(network, txid);
        if(
          (transaction.confirmations || 0) < confirms &&
          stopTimeMs &&
          +new Date() >= stopTimeMs
        ) {
          throw new Error('stopTime');
        }
      }
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  }