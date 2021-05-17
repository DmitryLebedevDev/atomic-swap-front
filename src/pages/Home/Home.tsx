import React from 'react'
import { ActiveOrdersList } from './ActiveOrdersList/ActiveOrdersList'
import { CreateOrder } from './CreateOrder/CreateOrder'
import { CurrentOrder } from './CurrentOrder/CurrentOrder'
import './Home.scss'
import {UserWalletsInfo} from "./UserWalletsInfo/UserWalletsInfo";
import * as bt from "bitcoinjs-lib";
import {bufferFromHex} from "../../common/functions/bufferFromHex";

(window as any).bt = bt;
(window as any).bufferFromHex = bufferFromHex

export const Home = () => {

  return (
    <div className="homeLayout">
      <ActiveOrdersList/>
      <CreateOrder/>
      <CurrentOrder/>
      <UserWalletsInfo/>
    </div>
  )
}
