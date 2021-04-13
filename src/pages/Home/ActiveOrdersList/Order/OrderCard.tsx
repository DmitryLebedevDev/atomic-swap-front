import React, { FC, memo } from 'react'
import { Card } from 'antd'
import { PlusOutlined } from '@ant-design/icons';
import { Iorder } from '../../../../models/orders/types';
import './OrderCard.scss'

interface Iprops {
  order: Iorder,
  acceptFn: (id: number) => void
}

export const OrderCard:FC<Iprops> = memo(({
  order: {id, fromValuePair, fromValue, toValue, toValuePair},
  acceptFn
}) => {
  return (
    <Card
      actions={[
        <PlusOutlined onClick={() => acceptFn(id)}/>
      ]}
      hoverable
    >
      <Card.Meta
        className={'order__title'}
        title={`${fromValue} ${fromValuePair} | ${toValue} ${toValuePair}`}
      />
    </Card>
  )
})
