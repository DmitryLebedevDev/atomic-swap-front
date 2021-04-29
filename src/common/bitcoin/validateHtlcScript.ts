import * as bitcoinjs from 'bitcoinjs-lib'
import {bufferFromHex} from "../functions/bufferFromHex";
import {createHtlcScript, HtclCodesIndex} from "./createHtlcScript";

export const validateHtlcScript = (
  contract: string | Buffer,
  secretNum: number,
  lockTime: number,
  mainPubKey: Buffer
) => {
  const decodeContract = bitcoinjs.script.decompile(
    typeof contract === 'string' ?
      bufferFromHex(contract)
      :
      contract
  )
  const decodeExpectedContract = bitcoinjs.script.decompile(
    createHtlcScript(secretNum, lockTime, mainPubKey, new Buffer(0))
  )
  if(decodeContract &&
     decodeExpectedContract &&
     decodeContract instanceof Buffer &&
     decodeExpectedContract instanceof Buffer
  ) {
    decodeContract[HtclCodesIndex.creator] = 0;
    decodeExpectedContract[HtclCodesIndex.lockTime] = 0;
    return decodeContract.equals(decodeExpectedContract);
  }
  return false;
}