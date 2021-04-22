import React from 'react'
import { ActiveOrdersList } from './ActiveOrdersList/ActiveOrdersList';
import { CreateOrder } from './CreateOrder/CreateOrder';
import { CurrentOrder } from './CurrentOrder/CurrentOrder';
import * as bt from 'bitcoinjs-lib'
import './Home.scss'

(window as any).bufferFromHex = (hexString: string) =>
  Buffer.from(
    new Uint8Array(
      (hexString.match(/.{1,2}/g) as string[] || [])
      .map(byteHex => parseInt(byteHex, 16))
    )
  );

(window as any).bt = bt;

export const Home = () => {
  return (
    <div className="homeLayout">
      <ActiveOrdersList/>
      <CreateOrder/>
      <CurrentOrder/>
    </div>
  )
}
