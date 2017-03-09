/* @flow weak */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'

import * as GitActions from './actions'
import Menu from '../Menu'

// add withRef to deliver ref to the wrapperedcomponent
@connect(state => state.GitState.branches,
  dispatch => bindActionCreators(GitActions, dispatch), null, {withRef: true})
export default class GitBranchWidget extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isActive: false
    }
  }
   openGitBranches() {
    this.toggleActive(true, true)
  }
  componentWillMount () {
    this.props.getCurrentBranch()
  }

  render () {
    const {current: currentBranch, local: localBranches, remote: remoteBranches} = this.props
    return (
      <div className='status-bar-menu-item' onClick={e => { e.stopPropagation(); this.toggleActive(true, true) }}>
        <span>{extension`siderBar1${this.props}`}</span>
        <span>
          <span className='fa fa-code-fork' style={{ fontWeight: 800, marginRight: '5px' }}/>
          {currentBranch}
        </span>
        { this.state.isActive ?
          <div style={{ display: 'flex', position: 'absolute', bottom: '30px', minWidth: '200px', right: '1px', flexDirection: 'column' }}>
            <div style={{ display: 'flex', zIndex: 502, backgroundColor: '#e1e1e1', height: '30px', justifyContent: 'center', alignItems: 'center' }}>
              <h2 style={{ lineHeight: '1.5', fontSize: '1em' }}>Git Branches</h2>
            </div>
            <Menu ref="abc" className={cx('bottom-up to-left', { active: this.state.isActive })}
              style={{ position: 'relative', border: 0, borderTopRightRadius: 0, borderTopLeftRadius: 0 }}
              items={this.makeBrancheMenuItems(localBranches, remoteBranches)}
              deactivate={this.toggleActive.bind(this, false)} />
          </div>
        : null }
      </div>
    )
  }

  toggleActive (isActive, isTogglingEnabled) {
    if (isTogglingEnabled)
      isActive = !this.state.isActive
    if (isActive) {
      this.props.getBranches()
    }
    this.setState({isActive})
  }

  makeBrancheMenuItems (localBranches, remoteBranches) {
    if (!localBranches && !remoteBranches)
      return [{name: 'Fetching Branches...', isDisabled: true}]

    var localBranchItems = localBranches.map(branch => ({
      name: branch,
      items: [{
        name: 'Checkout',
        command: () => { this.props.checkoutBranch(branch) }
      }, {
        name: 'Checkout as new branch',
        command: () => dispatchCommand('git:local_checkout')
      }, {
        name: 'delete',
        command: () => { this.props.gitDeleteBranch(branch) }
      }]
    }))

    var remoteBranchItems = remoteBranches.map(remoteBranch => {
      var localBranch = remoteBranch.split('/').slice(1).join('/')
      return {
        name: remoteBranch,
        items: [{
          name: 'chekout',
          command: () => { this.props.checkoutBranch(remoteBranch) }
        },{
          name: 'Checkout as new branch',
          // @todo: should prompt to input local branch name
          command: () => dispatchCommand('git:local_checkout')
        }, {
          name: 'delete',
          command: () => { this.props.gitDeleteBranch(branch) }
        }]
      }
    })
    return [
      {name: 'New Branch', command: () => dispatchCommand('git:new_branch'),
      iconElement:(<span style={{ marginRight: '4px'}}>+</span>)},
      {name: 'Synchronize', command: () => this.props.getFetch()},
      {name: '-', isDisabled: true},
      {name: 'Local Branches', isDisabled: true},
      ...localBranchItems,
      {name: '-', isDisabled: true},
      {name: 'Remote Branches', isDisabled: true},
      ...remoteBranchItems
    ]
  }
}
