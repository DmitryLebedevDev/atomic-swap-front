import * as bitcoinjs from 'bitcoinjs-lib'
import {bufferFromHex} from "../functions/bufferFromHex";
import {createHtlcScript} from "./createHtlcScript";

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
}