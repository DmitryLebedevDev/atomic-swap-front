import * as bitcoinjs from 'bitcoinjs-lib'
import {bufferFromHex} from "../functions/bufferFromHex";
import {createHtlcScript, HtclCodesIndex} from "./createHtlcScript";
// @ts-ignore
import * as bip65 from 'bip65'

export const validateHtlcScript = (
  contract: string | Buffer,
  secretNum: number | null,
  lockTime: number,
  lockTimeMissSec: number,
  mainPubKey: Buffer
) => {
  const decodeContract = bitcoinjs.script.decompile(
    typeof contract === 'string' ?
      bufferFromHex(contract)
      :
      contract
  )
  const decodeContractLockTime
    = decodeContract && decodeContract[HtclCodesIndex.lockTime]
  const decodeExpectedContract = bitcoinjs.script.decompile(
    createHtlcScript(
      secretNum ?? 0,
      lockTime,
      mainPubKey,
      new Buffer(0)
    )
  )
  if(
     Array.isArray(decodeContract) &&
     Array.isArray(decodeExpectedContract) &&
     decodeContractLockTime instanceof Buffer &&
     (Math.abs(
       bip65.decode({utc: lockTime}).blocks.utc -
       bip65.decode({utc: bitcoinjs.script.number.decode(decodeContractLockTime)}).blocks.utc
     ) <= lockTimeMissSec)
  ) {
    if(secretNum === null) {
      decodeContract[HtclCodesIndex.secretNum] = 0;
      decodeExpectedContract[HtclCodesIndex.secretNum] = 0;
    }
    decodeContract[HtclCodesIndex.creator] = 0;
    decodeContract[HtclCodesIndex.lockTime] = 0;
    decodeExpectedContract[HtclCodesIndex.creator] = 0;
    decodeExpectedContract[HtclCodesIndex.lockTime] = 0;

    return (bitcoinjs.script.compile(decodeContract).equals(
      bitcoinjs.script.compile(decodeExpectedContract)
    ));
  }

  return false;
}