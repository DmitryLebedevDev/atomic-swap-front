import * as bitcoinjs from "bitcoinjs-lib";
import {txIdToHash} from "./txIdToHash";
import {bitcoinToSat} from "./bitcoinToSat";
import {feeForCreateHtlc} from "./createHtlcContract";

export const confirmHtlcContract = (
  txid: string,
  valueTx: number,
  locktime: number,
  secretNum: number,
  redeem: Buffer,
  ECPair: bitcoinjs.ECPairInterface
) => {
  const tx = new bitcoinjs.Transaction();
  tx.locktime = locktime;
  tx.addInput(txIdToHash(txid), 0, 0xfffffffe);
  tx.addOutput(
    bitcoinjs.payments.p2pkh({
      pubkey: ECPair.publicKey,
      network: ECPair.network,
    }).output as Buffer,
    bitcoinToSat(valueTx-feeForCreateHtlc)
  )
  const hash = tx.hashForSignature(
    0,
    redeem,
    bitcoinjs.Transaction.SIGHASH_ALL
  )
  tx.setInputScript(0, bitcoinjs.payments.p2sh({
    redeem: {
      input: bitcoinjs.script.compile([
        bitcoinjs.script.signature.encode(
          ECPair.sign(hash),
          bitcoinjs.Transaction.SIGHASH_ALL
        ),
        bitcoinjs.script.number.encode(secretNum)
      ]),
      output: redeem
    }
  }).input as Buffer)

  return tx.toHex();
}