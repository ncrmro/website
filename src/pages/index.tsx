import React from 'react'
import { withSiteData } from 'react-static'

export default withSiteData(({title}:{title:string}) => (
  <div style={{ textAlign: 'center' }}>
    <h1>
      {title}
    </h1>
  </div>
))
