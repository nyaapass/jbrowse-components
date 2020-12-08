import React from 'react'
import { observer } from 'mobx-react'

import ImportForm from './ImportForm'
import { MsaViewModel } from '../model'

export default () => {
  return observer(({ model }: { model: MsaViewModel }) => {
    const { width, height, initialized } = model

    if (!initialized) {
      return <ImportForm model={model} />
    }

    return <div style={{ height, width, overflow: 'auto' }} />
  })
}
