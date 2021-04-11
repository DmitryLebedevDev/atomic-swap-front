import React, { useEffect } from 'react'
import { wsClient } from '../../api/ws';
import { ActiveOrdersTable } from './ActiveOrdersTable/ActiveOrdersTable';

export const Home = () => {
  useEffect(() => {
    console.log('start');
     wsClient.emit('newOrder', {
       fromValue: 10,
       fromValuePair: 'testnet',
       toValue: 1,
       toValuePair: 'regnet'
     }, function(...args: any) {
       console.log(args);
     });
  }, [])

  return (
    <div>
      <ActiveOrdersTable/>
    </div>
  )
}
