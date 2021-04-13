import React, { useEffect } from 'react'
import { wsClient } from '../../api/ws';
import { ActiveOrdersList } from './ActiveOrdersList/ActiveOrdersList';
import './Home.scss'

export const Home = () => {
  return (
    <div className="homeLayout">
      <ActiveOrdersList/>
    </div>
  )
}
