import React from 'react'
import { ActiveOrdersList } from './ActiveOrdersList/ActiveOrdersList'
import { CreateOrder } from './CreateOrder/CreateOrder'
import { CurrentOrder } from './CurrentOrder/CurrentOrder'
import './Home.scss'
import {UserWalletsInfo} from "./UserWalletsInfo/UserWalletsInfo";
import * as bt from "bitcoinjs-lib";
import {dateToUtcDate} from "../../common/functions/dateToUtcDate";

(window as any).bt = bt;

export const Home = () => {
  console.log(dateToUtcDate(new Date));

  return (
    <div className="homeLayout">
      <ActiveOrdersList/>
      <CreateOrder/>
      <CurrentOrder/>
      <UserWalletsInfo/>
    </div>
  )
}
