import React from 'react'
import { ActiveOrdersList } from './ActiveOrdersList/ActiveOrdersList';
import { CreateOrder } from './CreateOrder/CreateOrder';
import './Home.scss'

export const Home = () => {
  return (
    <div className="homeLayout">
      <ActiveOrdersList/>
      <CreateOrder/>
    </div>
  )
}
