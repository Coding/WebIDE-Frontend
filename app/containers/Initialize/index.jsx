import React, { Component, PropTypes } from 'react'
import { observer } from 'mobx-react'
import state from './state'
import config from 'config'

@observer
class Initialize extends Component {
  render () {
    let info = (
      <div className='loading-info'>
        Loading workspace...
      </div>
    )
    if (state.errorInfo) {
      info = (
        <div className='loading-info error'>
          Load workspace failed.
        </div>
      )
    }

    return (
      <div className='initialize-container'>
        {config.isPlatform && <div className='coding-loading'></div>}
        {/* <div className='monkey splash-logo'></div> */}
        {info}
        {state.errorInfo && <div className='loading-error'>
          <i className='fa fa-exclamation-triangle' />
          {state.errorInfo}
        </div>}
      </div>
    )
  }
}

export default Initialize
