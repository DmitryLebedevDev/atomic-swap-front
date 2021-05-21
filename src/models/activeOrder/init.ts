import {
  $activeOrder,
  activeOrderFx,
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
    const acceptedOrder = orders.find(
      (order) => order.id === acceptedOrderId && order[isMainOrder]
    )
    if(!acceptedOrder) {throw new Error('not find main order')}

    const fromPubKey
      = userWallets[acceptedOrder.toValuePair]
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
      ...acceptedOrder,
      fromPubKey
    });
    setToPubKeyForActiveOrderEvent({pubKey: toPubKey});

    await sendPubKeyToOrderFx({
      id: acceptedOrder.id,
      hexPubKey: fromPubKey.toString('hex'),
      keyType: 'from'
    })

    const {txid, redeem}
      = await wsClientOnP(
        'sendFromPairHTLC',
      (htlcForFromInfo: Omit<IemitHtlcToOrder, 'htlcType'>) => {
        console.log(htlcForFromInfo)
        return {
          ...htlcForFromInfo,
          redeem: bufferFromHex(htlcForFromInfo.redeem)
        }
      })

    const fromHtlcTransaction
      = await getTransactionReq(acceptedOrder.fromValuePair, txid)

    if(
      ( fromHtlcTransaction.vout[0].value -
        (acceptedOrder.toValue + feeForCreateHtlc) < 0.000000001 &&
        fromHtlcTransaction.vout[0].value -
        (acceptedOrder.toValue + feeForCreateHtlc) >= 0
      ) &&
      !validateP2shVoutScriptHash(fromHtlcTransaction?.vout[0], redeem) &&
      !validateHtlcScript(
        redeem,
        null,
        bip65.encode({
          utc: (+dateToUtcDate(new Date())+(60*240))/1000^0
        }),
        5,
        fromPubKey
      )
    ) {
      throw new Error('incorrect from htlc')
    }
    console.log('from ok htlc')
    await pendingConfirmsTransaction(
      acceptedOrder.toValuePair,
      fromHtlcTransaction.txid,
      6,
    );
    console.log('from htlc transaction confirmed');
    const redeemFromDecompile = bitcoinjs.script.decompile(redeem) as (number | Buffer)[]
    const dateCreateHtlcToUtcSec = +dateToUtcDate(new Date()) / 1000 ^ 0
    const htlcFormTo = await createHtlcContract(
      acceptedOrder.fromValuePair,
      userWallets[acceptedOrder.fromValuePair].ECPair,
      toPubKey,
      acceptedOrder.fromValue + feeForCreateHtlc,
      redeemFromDecompile[HtclCodesIndex.secretNum] as Buffer,
      bip65.encode({utc: dateCreateHtlcToUtcSec+60*120}),
    )
    const pushToHtlcTransactionInfo = await sendTransactionReq(acceptedOrder.fromValuePair, htlcFormTo.hex)
    console.log(pushToHtlcTransactionInfo, 'sendToHtlc');
    if(!pushToHtlcTransactionInfo.success) {throw new Error('not send toHtlc')}
    await sendHtlcToOrderFx({
      id: acceptedOrder.id,
      txid: pushToHtlcTransactionInfo.txid,
      redeem: htlcFormTo.redeem.toString('hex'),
      htlcType: 'to'
    })
    const toHtlcSpentUtxo = await pendingSpentUtxoTx(
      acceptedOrder.fromValuePair,
      pushToHtlcTransactionInfo.txid,
      0
    )
    const secretNum = +toHtlcSpentUtxo.scriptSig.asm.split(' ')[1]
    const confirmToHtlcTransaction = await sendTransactionReq(
      acceptedOrder.toValuePair,
      confirmHtlcContract(
        txid,
        acceptedOrder.toValue+feeForCreateHtlc + feeForCreateHtlc,
        bip65.encode({utc: +dateToUtcDate(new Date())/1000^0}),
        secretNum,
        redeem,
        userWallets[acceptedOrder.toValuePair].ECPair
      )
    );
    if(!confirmToHtlcTransaction.success) {
      throw new Error('******')
    }
    await pendingConfirmsTransaction(
      acceptedOrder.toValuePair,
      confirmToHtlcTransaction.txid,
      6
    )
    await startUpdateBalanceFx()
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

  const dateCreateHtlcFromUtcSec = +dateToUtcDate(new Date()) / 1000 ^ 0
  const secretNum = window.crypto.getRandomValues(new Uint32Array(1))[0];

  const htlcForFrom
    = await createHtlcContract(
    order.toValuePair,
    userWallets[order.toValuePair].ECPair,
    fromPubKey,
    order.toValue + feeForCreateHtlc,
    secretNum,
    bip65.encode({utc: dateCreateHtlcFromUtcSec+60*240})
  )
  console.log(htlcForFrom)
  const pushFromTransactionInfo
    = await sendTransactionReq(
      order.toValuePair,
      htlcForFrom.hex
    )

  if(!pushFromTransactionInfo.success) {throw new Error(pushFromTransactionInfo.message)}
  await sendHtlcToOrderFx({
    id: order.id,
    txid: pushFromTransactionInfo.txid,
    redeem: htlcForFrom.redeem.toString('hex'),
    htlcType: 'from'
  })

  const {txid, redeem}
    = await wsClientOnP(
    'sendToPairHTLC',
    (htlcForFromInfo: Omit<IemitHtlcToOrder, 'htlcType'>) => {
      console.log(htlcForFromInfo)
      return {
        ...htlcForFromInfo,
        redeem: bufferFromHex(htlcForFromInfo.redeem)
      }
    })
  const toHtlcTransaction
    = await getTransactionReq(order.fromValuePair, txid);
  console.log(toHtlcTransaction, 'toHtlc');
  if(
    ( toHtlcTransaction.vout[0].value -
      (order.toValue + feeForCreateHtlc) < 0.000000001 &&
      toHtlcTransaction.vout[0].value -
      (order.toValue + feeForCreateHtlc) >= 0
    ) &&
    !validateP2shVoutScriptHash(toHtlcTransaction?.vout[0], redeem) &&
    !validateHtlcScript(
      redeem,
      secretNum,
      bip65.encode({
        utc: (+dateToUtcDate(new Date())+(60*120))/1000^0
      }),
      60*40,
      fromPubKey
    )
  ) {
    throw new Error('incorrect from htlc')
  }
  console.log('to htlc ok')
  await pendingConfirmsTransaction(
    order.fromValuePair,
    toHtlcTransaction.txid,
    6
  )
  console.log('to htlc transaction confirmed')
  const confirmToHtlcTransaction
    = await sendTransactionReq(
      order.fromValuePair,
      confirmHtlcContract(
        toHtlcTransaction.txid,
        order.fromValue + feeForCreateHtlc,
        bip65.encode({utc: +dateToUtcDate(new Date)/1000^0}),
        secretNum,
        redeem,
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
})
startAcceptedOrderFx.failData.watch((data) => console.log(data));

$activeOrder
  .on(setActiveOrderEvent, (_, order) => order)
  .on(
    setToPubKeyForActiveOrderEvent,
    (order, {pubKey: toPubKey}) => order ? ({...order, toPubKey}) : null
  )
  .on(
    setFromPubKeyForActiveOrderEvent,
    (order, {pubKey: fromPubKey}) => order ? ({...order, fromPubKey}) : null
  )
