import {IuserNetworkKeys} from "../../models/user/types";
import {getVinForUtxoTransactionReq} from "../../api/rest";
import {getInfoTxOutputError} from "../../api/types";

export const awaitSpentUtxoTx
  = async (
    network: IuserNetworkKeys,
    txid: string,
    n: number
) => {
  const vin = await getVinForUtxoTransactionReq(network, txid, n)
  while(
    !vin.success &&
    +vin.message === getInfoTxOutputError.utxoNotUnspent
  ) {

  }
}