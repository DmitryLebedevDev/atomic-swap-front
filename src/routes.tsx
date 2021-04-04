import React from 'react'

import { Route, Switch } from 'react-router'
import { Home } from './pages/Home/Home'

export const Routes = () => {
  return (
    <Switch>
      <Route path="/" component={Home}/>
    </Switch>
  )
}
