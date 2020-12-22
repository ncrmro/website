import React from 'react'
import { Link } from 'gatsby'

import Footer from './Footer'
import avatar from '../assets/images/avatar.jpg'

const Header = () => (
  <header id="header">
    <div className="inner">
      <Link href="/" className="image avatar">
        <img src={avatar} alt="" />
      </Link>
      <h1>
        <strong>Nicholas Romero</strong>
        <br />
        @ncrmro
      </h1>
    </div>
    <Footer />
  </header>
)

export default Header
