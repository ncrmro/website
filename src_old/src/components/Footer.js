import React from 'react'
import { OutboundLink } from 'gatsby-plugin-google-analytics'

const Footer = () => (
  <div id="footer">
    <div className="inner">
      <ul className="icons">
        <li>
          <OutboundLink
            href="https://twitter.com/ncrmro"
            className="icon fa-twitter"
          >
            <span className="label">Twitter</span>
          </OutboundLink>
        </li>
        <li>
          <OutboundLink
            href="https://github.com/ncrmro"
            className="icon fa-github"
          >
            <span className="label">Github</span>
          </OutboundLink>
        </li>
        <li>
          <OutboundLink
            href="https://www.linkedin.com/in/ncrmro/"
            className="icon fa-linkedin"
          >
            <span className="label">Linkdin</span>
          </OutboundLink>
        </li>
      </ul>
    </div>
  </div>
)

export default Footer
