import React from 'react'
import { Root, Routes } from 'react-static'
import Nav from "react-bootstrap/Nav"
import Figure from "react-bootstrap/Figure"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"

import './app.css'
// import FancyDiv from '@components/FancyDiv'

function Sidebar() {
  return (
    <Nav defaultActiveKey="/home" className="flex-column">

      <Nav.Link href="/home">
        <Figure>
          <Figure.Image
            width={171}
            height={180}
            alt="171x180"
            src="/images/headshot.jpg"
          />
          <Figure.Caption>
            Nicholas Romero
          </Figure.Caption>
        </Figure>

      </Nav.Link>

      {/*<Nav.Link eventKey="link-1">Bio</Nav.Link>*/}
      {/*<Nav.Link eventKey="link-2">Photography</Nav.Link>*/}
      {/*<Nav.Link eventKey="link-2">Music</Nav.Link>*/}

    </Nav>

  )
}

function App() {
  return (
    <Root>
      <div className="content">
        <Row>
        <Col>
          <Sidebar/>
        </Col>

        <Col>
          <Routes />
        </Col>
        </Row>
      </div>
    </Root>
  )
}

export default App
