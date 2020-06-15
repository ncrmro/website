import React from 'react'
import Helmet from 'react-helmet'

import Posts from '../components/Posts'
import Layout from '../components/layout'

const HomeIndex = () => {
  const siteTitle = 'Nicholas Romero'
  const siteDescription = 'Personal site of Nicholas Romero'
  return (
    <Layout>
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
      </Helmet>
      <div id="main">
        <section id="one">
          <header className="major">
            <h2>Nicholas Romero</h2>
          </header>
          <p>
            Howdy, I'm Nic. I live in Houston/Austin. I'm a senor engineer and
            consultant. I've spoken at PyCon India in 2017. I enjoy dabling in
            music production and been known to dj here and there. Plants are
            Jazz and Animals my diggs.
          </p>
        </section>

        <section id="two">
          <h2>Posts</h2>
          <Posts />
        </section>
      </div>
    </Layout>
  )
}

export default HomeIndex
