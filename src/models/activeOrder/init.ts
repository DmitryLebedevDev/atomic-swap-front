import {
  $activeOrder,
  activeOrderFx, clearActiveOrderEvent,
  onActiveOrderFx,
  onSendFromPairPubKey,
  onSendToPairPubKey, sendHtlcToOrderFx,
  sendPubKeyToOrderFx,
  setActiveOrderEvent,
  setFromPubKeyForActiveOrderEvent,
  setToPubKeyForActiveOrderEvent,
  startAcceptedOrderFx
} from ".";
import { wsClient, wsClientEmitP, wsClientOnP } from "../../api/ws";
import { isMainOrder } from "../orders"
import { Iorder } from "../orders/types"
import { bufferFromHex } from "../../common/functions/bufferFromHex"
import {$userWallets, startUpdateBalanceFx, updateAllBalanceFx} from "../user";
import * as bitcoinjs from 'bitcoinjs-lib';
import {createHtlcScript, HtclCodesIndex} from "../../common/bitcoin/createHtlcScript";
import {txIdToHash} from "../../common/bitcoin/txIdToHash";
import { createEffect } from "effector/effector.cjs";
import {IemitHtlcToOrder, IemitPubKeyToOrder} from "./types";
import {createHtlcContract, feeForCreateHtlc} from "../../common/bitcoin/createHtlcContract";
import {dateToUtcDate} from "../../common/functions/dateToUtcDate";
// @ts-ignore
import * as bip65 from 'bip65'
import {getTransactionReq, sendTransactionReq} from "../../api/rest";
import {validateP2shVoutScriptHash} from "../../common/bitcoin/validateP2shVoutScriptHash";
import {validateHtlcScript} from "../../common/bitcoin/validateHtlcScript";
import {pendingConfirmsTransaction} from "../../common/bitcoin/pendingConfirmsTransaction";
import {confirmHtlcContract} from "../../common/bitcoin/confirmHtlcContract";
import {pendingSpentUtxoTx} from "../../common/bitcoin/pendingSpentUtho.tx";
import {Itransaction, Ivin} from "../../api/types";
import {msToSec} from "../../common/functions/msToSec";
import {Time} from "../../common/constants/Time";
import {sleep} from "../../common/functions/sleep";

wsClient.on('sendToPairPubKey', onSendToPairPubKey)
wsClient.on('sendFromPairPubKey', onSendFromPairPubKey)

sendPubKeyToOrderFx.use(async (sendInfo) => {
  const {keyType, ...idOrderAndPubkey} = sendInfo
  return wsClientEmitP(
    keyType === 'from' ? 'sendFromPairPubKey' : 'sendToPairPubKey',
    idOrderAndPubkey
  )
})
sendHtlcToOrderFx.use(async (sendInfo) => {
  const {htlcType, ...htlcInfo} = sendInfo;
  return wsClientEmitP(
    htlcType === 'from' ? 'sendFromPairHTLC' : 'sendToPairHTLC',
    htlcInfo
  )
})

wsClient.on('acceptOrder', onActiveOrderFx)
startAcceptedOrderFx.use(
  async ({acceptedOrderId, orders, userWallets}) => {
    const order = orders.find(
      (order) => order.id === acceptedOrderId && order[isMainOrder]
    )
    if(!order) {throw new Error('not find main order')}

    const fromPubKey
      = userWallets[order.toValuePair]
          .ECPair
          .publicKey
    const toPubKey
      = await wsClientOnP(
        'sendToPairPubKey',
        ({hexPubKey}: Omit<IemitPubKeyToOrder, 'keyType'>) => {
          return bufferFromHex(hexPubKey);
        }
      )

    setActiveOrderEvent({
      ...order,
      fromPubKey
    });
    setToPubKeyForActiveOrderEvent({pubKey: toPubKey});

    await sendPubKeyToOrderFx({
      id: order.id,
      hexPubKey: fromPubKey.toString('hex'),
      keyType: 'from'
    })

    const {txid: fromHtlcTxid, redeem: fromHtlcRedeem}
      = await wsClientOnP(
        'sendFromPairHTLC',
      (htlcForFromInfo: Omit<IemitHtlcToOrder, 'htlcType'>) => {
        console.log(htlcForFromInfo)
        return {
          ...htlcForFromInfo,
          redeem: bufferFromHex(htlcForFromInfo.redeem)
        }
      }, +new Date + Time.minuteMs)
    const dateGetFromHtlc = new Date()

    const fromHtlcTransaction
      = await getTransactionReq(order.fromValuePair, fromHtlcTxid)

    if(
      ( fromHtlcTransaction.vout[0].value -
        (order.toValue + feeForCreateHtlc) < 0.000000001 &&
        fromHtlcTransaction.vout[0].value -
        (order.toValue + feeForCreateHtlc) >= 0
      ) &&
      !validateP2shVoutScriptHash(fromHtlcTransaction?.vout[0], fromHtlcRedeem) &&
      !validateHtlcScript(
        fromHtlcRedeem,
        null,
        bip65.encode({
          utc: msToSec(+dateToUtcDate(dateGetFromHtlc) + Time.hourMs * 4)
        }),
        5,
        fromPubKey
      )
    ) {
      throw new Error('incorrect from htlc')
    }
    console.log('from htlc ok')
    await pendingConfirmsTransaction(
      order.toValuePair,
      fromHtlcTransaction.txid,
      6,
      +dateGetFromHtlc + Time.hourMs
    )
    console.log('from htlc transaction confirmed');

    const redeemFromDecompile = bitcoinjs.script.decompile(fromHtlcRedeem) as (number | Buffer)[]
    const dateCreateHtlcTo = new Date();
    const lockTimeHtlcToMs = Time.hourMs * 2
    const htlcForTo = await createHtlcContract(
      order.fromValuePair,
      userWallets[order.fromValuePair].ECPair,
      toPubKey,
      order.fromValue + feeForCreateHtlc,
      redeemFromDecompile[HtclCodesIndex.secretNum] as Buffer,
      bip65.encode({
        utc: msToSec(
          +dateToUtcDate(dateCreateHtlcTo) + lockTimeHtlcToMs
        )
      })
    )
    const pushToHtlcTransaction
      = await sendTransactionReq(
          order.fromValuePair,
          htlcForTo.hex
        )
    console.log(pushToHtlcTransaction, 'sendToHtlc');
    if(!pushToHtlcTransaction.success) {
      throw new Error('not send toHtlc')
    }
    await sendHtlcToOrderFx({
      id: order.id,
      txid: pushToHtlcTransaction.txid,
      redeem: htlcForTo.redeem.toString('hex'),
      htlcType: 'to'
    })

    let toHtlcSpentUtxo: Ivin;
    try {
      toHtlcSpentUtxo = await pendingSpentUtxoTx(
        order.fromValuePair,
        pushToHtlcTransaction.txid,
        0,
        +dateCreateHtlcTo + lockTimeHtlcToMs
      )
    } catch (e) {
      const cancelToHtlcContract = await sendTransactionReq(
        order.fromValuePair,
        confirmHtlcContract(
          pushToHtlcTransaction.txid,
          order.fromValue + feeForCreateHtlc,
          bip65.encode({utc: msToSec(+dateToUtcDate(new Date()))}),
          -1,
          htlcForTo.redeem,
          userWallets[order.fromValuePair].ECPair
        )
      )
      if(cancelToHtlcContract.success) {
        await pendingConfirmsTransaction(
          order.fromValuePair,
          cancelToHtlcContract.txid,
          6
        )
        await startUpdateBalanceFx();
        clearActiveOrderEvent();
        throw e
      } else {
        console.info('cancel transaction send after spent utxo')
        toHtlcSpentUtxo = await pendingSpentUtxoTx(
          order.fromValuePair,
          pushToHtlcTransaction.txid,
          0,
          +dateCreateHtlcTo + lockTimeHtlcToMs
        )
      }
    }

    const secretNum = bitcoinjs.script.number.decode(
      bufferFromHex(
        toHtlcSpentUtxo.scriptSig.asm.split(' ')[1]
      ), 5
    )
    const confirmFromHtlcTransaction = await sendTransactionReq(
      order.toValuePair,
      confirmHtlcContract(
        fromHtlcTxid,
        order.toValue+feeForCreateHtlc,
        bip65.encode({utc: msToSec(+dateToUtcDate(new Date()))}),
        secretNum,
        fromHtlcRedeem,
        userWallets[order.toValuePair].ECPair
      )
    );
    if(!confirmFromHtlcTransaction.success) {
      throw new Error('confirm to Htlc transaction not send')
    }
    await pendingConfirmsTransaction(
      order.toValuePair,
      confirmFromHtlcTransaction.txid,
      6
    )
    await startUpdateBalanceFx();
    clearActiveOrderEvent();
  }
)

activeOrderFx.use(async ({order, userWallets}) => {
  await wsClientEmitP('acceptOrder', order.id)

  const toPubKey
    = userWallets[order.fromValuePair]
      .ECPair
      .publicKey;
  order.toPubKey = toPubKey;
  setActiveOrderEvent({...order});

  await sendPubKeyToOrderFx({
    id: order.id,
    hexPubKey: toPubKey.toString('hex'),
    keyType: 'to'
  })

  const fromPubKey
    = await wsClientOnP(
      'sendFromPairPubKey',
      ({hexPubKey}: Omit<IemitPubKeyToOrder, 'keyType'>) => {
        return bufferFromHex(hexPubKey);
      }
    )
  order.fromPubKey = fromPubKey;
  setFromPubKeyForActiveOrderEvent({pubKey: fromPubKey});


  const secretNum = window.crypto.getRandomValues(new Uint32Array(1))[0];
  console.log(secretNum, 'secret num');

  const dateCreateHtlcFrom = new Date
  const lockTimeHtlcFromMs = Time.hourMs * 4
  const htlcForFrom
    = await createHtlcContract(
    order.toValuePair,
    userWallets[order.toValuePair].ECPair,
    fromPubKey,
    order.toValue + feeForCreateHtlc,
    secretNum,
    bip65.encode({
      utc: msToSec(
        +dateToUtcDate(dateCreateHtlcFrom) + lockTimeHtlcFromMs
      )
    })
  )
  console.log(htlcForFrom)
  const pushFromHtlcTransaction
    = await sendTransactionReq(
      order.toValuePair,
      htlcForFrom.hex
    )
  if(!pushFromHtlcTransaction.success) {
    throw new Error(pushFromHtlcTransaction.message)
  }

  await sendHtlcToOrderFx({
    id: order.id,
    txid: pushFromHtlcTransaction.txid,
    redeem: htlcForFrom.redeem.toString('hex'),
    htlcType: 'from'
  })

  let toHtlcTxid: string, toHtlcRedeem: Buffer;
  let toHtlcTransaction: Itransaction;
  try {
    const sendToPairHTLCData
      = await wsClientOnP(
      'sendToPairHTLC',
      (htlcForFromInfo: Omit<IemitHtlcToOrder, 'htlcType'>) => {
          console.log(htlcForFromInfo)
          return {
            ...htlcForFromInfo,
            redeem: bufferFromHex(htlcForFromInfo.redeem)
          }
        },
      +new Date() + Time.hourMs
      )
    toHtlcTxid = sendToPairHTLCData.txid;
    toHtlcRedeem = sendToPairHTLCData.redeem;
    const dateGetToHtlc = new Date()

    toHtlcTransaction
      = await getTransactionReq(order.fromValuePair, toHtlcTxid);
    console.log(toHtlcTransaction, 'toHtlc');
    if(
      ( toHtlcTransaction.vout[0].value -
        (order.fromValue + feeForCreateHtlc) < 0.000000001 &&
        toHtlcTransaction.vout[0].value -
        (order.fromValue + feeForCreateHtlc) >= 0
      ) &&
      !validateP2shVoutScriptHash(toHtlcTransaction?.vout[0], toHtlcRedeem) &&
      !validateHtlcScript(
        toHtlcRedeem,
        secretNum,
        bip65.encode({
          utc: msToSec(+dateToUtcDate(dateGetToHtlc) + Time.hourMs * 2)
        }),
        5,
        toPubKey
      )
    ) {
      throw new Error('incorrect from htlc')
    }
    console.log('to htlc ok')

    await pendingConfirmsTransaction(
      order.fromValuePair,
      toHtlcTransaction.txid,
      6,
      +dateGetToHtlc + (Time.hourMs * 2) - Time.minuteMs
    )
  } catch (e) {
    await sleep(
      (+dateCreateHtlcFrom + lockTimeHtlcFromMs) - (+new Date) + Time.minuteMs
    )
    const cancelFromHtlcTransaction = await sendTransactionReq(
      order.fromValuePair,
      confirmHtlcContract(
        pushFromHtlcTransaction.txid,
        order.toValue + feeForCreateHtlc,
        bip65.encode({
          utc: msToSec(+dateToUtcDate(new Date))
        }),
        -1,
        htlcForFrom.redeem,
        userWallets[order.toValuePair].ECPair
      )
    )
    if(!cancelFromHtlcTransaction.success) {
      throw new Error('cancelFromHtlcTransaction error send')
    }
    await pendingConfirmsTransaction(
      order.fromValuePair,
      cancelFromHtlcTransaction.txid,
      6
    )
    await startUpdateBalanceFx();
    clearActiveOrderEvent();

    throw new Error(`${e} || timeout to htlc`)
  }
  console.log('to htlc transaction confirmed')
  const confirmToHtlcTransaction
    = await sendTransactionReq(
      order.fromValuePair,
      confirmHtlcContract(
        toHtlcTransaction.txid,
        order.fromValue + feeForCreateHtlc,
        bip65.encode({
          utc: msToSec(+dateToUtcDate(new Date))
        }),
        secretNum,
        toHtlcRedeem,
        userWallets[order.fromValuePair].ECPair
      )
    )
  if(!confirmToHtlcTransaction.success) {
    throw new Error('not send confirmToHtlcTransaction')
  }
  await pendingConfirmsTransaction(
    order.fromValuePair,
    confirmToHtlcTransaction.txid,
    6
  );
  await startUpdateBalanceFx()
  clearActiveOrderEvent()
})
startAcceptedOrderFx.failData.watch((data) => console.error(data));

$activeOrder
  .on(setActiveOrderEvent, (_, order) => order)
  .on(clearActiveOrderEvent, (_, __) => null)
  .on(
    setToPubKeyForActiveOrderEvent,
    (order, {pubKey: toPubKey}) => order ? ({...order, toPubKey}) : null
  )
  .on(
    setFromPubKeyForActiveOrderEvent,
    (order, {pubKey: fromPubKey}) => order ? ({...order, fromPubKey}) : null
  )
