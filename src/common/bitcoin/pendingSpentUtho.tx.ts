import {IuserNetworkKeys} from "../../models/user/types";
import {getVinForUtxoTransactionReq} from "../../api/rest";
import {getInfoTxOutputError} from "../../api/types";
import {sleep} from "../functions/sleep";

export const pendingSpentUtxoTx
  = async (
    network: IuserNetworkKeys,
    txid: string,
    n: number,
    stopTimeMs?: number
) => {
  let vinInfo = await getVinForUtxoTransactionReq(network, txid, n)
  while(
    !vinInfo.success
  ) {
    await sleep(2000)
    vinInfo = await getVinForUtxoTransactionReq(network, txid, n)
    if(!vinInfo.success && stopTimeMs && +new Date() >= stopTimeMs) {
      throw new Error('end time');
    }
  }

  return vinInfo.vin
}