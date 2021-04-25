import openSocket from 'socket.io-client'
import { WsStatus } from './types'

export const wsClient = openSocket('http://localhost:3113')
export const wsClientEmitP:(event: string, value: any) => Promise<any>
  = (event, value) => (
    new Promise((res,rej) => {    //fix add types
      wsClient.emit(event, value, ({status, data}: any) => {
        if(WsStatus.success === status) {
          return res(data)
        }
        rej()
      })
    })
  )