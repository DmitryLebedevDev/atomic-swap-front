import React from 'react'
import { ActiveOrdersList } from './ActiveOrdersList/ActiveOrdersList';
import './Home.scss'

export const Home = () => {
  return (
    <div className="homeLayout">
      <ActiveOrdersList/>
    </div>
  )
}
