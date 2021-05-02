import openSocket from 'socket.io-client'
import { WsStatus } from './types'

export const wsClient = openSocket(process.env.REACT_APP_BACK_URL as string)
export const wsClientEmitP:(event: string, value: any) => Promise<any> = (
  event, value
) => (
  new Promise((res,rej) => {    //fix add types
    wsClient.emit(event, value, ({status, data}: any) => {
      if(WsStatus.success === status) {
        return res(data)
      }
      rej()
    })
  })
)

export const wsClientOnP = <T,Y>(
  event: string,
  handleData: (data: T) => Y
) => (
  new Promise<Y>((res) => {
    const onFn = (data: T) => {
      wsClient.off('event', onFn);

      return res(handleData(data));
    };
    wsClient.on(event, onFn);
  })
)