import {IuserNetworkKeys} from "../../models/user/types";
import {getVinForUtxoTransactionReq} from "../../api/rest";
import {getInfoTxOutputError} from "../../api/types";
import {sleep} from "../functions/sleep";

export const pendingSpentUtxoTx
  = async (
    network: IuserNetworkKeys,
    txid: string,
    n: number
) => {
  let vinInfo = await getVinForUtxoTransactionReq(network, txid, n)
  while(
    !vinInfo.success &&
    +vinInfo.message === getInfoTxOutputError.utxoNotUnspent
  ) {
    await sleep(2000)
    vinInfo = await getVinForUtxoTransactionReq(network, txid, n)
  }
  if(!vinInfo.success) {
    throw new Error(`transaction or utxo not exist code ${vinInfo.message}`);
  }
  return vinInfo.vin
}