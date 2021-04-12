import React, { memo } from 'react'
import { useStore } from 'effector-react'
import { $orders } from '../../../models/orders'
import { OrderCard } from './OrderCard'

export const ActiveOrdersList = memo(() => {
  const activeOrders = useStore($orders)

  return (
    <div>{
      activeOrders.map(order => (
        <OrderCard {...order} key={order.id}/>)
      )
    }</div>
  )
})

