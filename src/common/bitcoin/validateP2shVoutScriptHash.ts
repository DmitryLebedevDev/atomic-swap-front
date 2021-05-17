import {Ivout} from "../../api/types";
import * as bitcoinjs from 'bitcoinjs-lib';

export const validateP2shVoutScriptHash = (
  vout: Ivout | undefined,
  redeem: Buffer
) => {
  const scriptPubKey = vout?.scriptPubKey.asm.split(' ')
  console.log(scriptPubKey)
  return (
    scriptPubKey &&
    scriptPubKey.length === 3 &&
    scriptPubKey[1] === bitcoinjs.crypto.hash160(redeem).toString('hex')
  )
}