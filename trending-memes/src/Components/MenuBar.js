import React from 'react'
import PropTypes from 'prop-types'

function MenuBar() {
  return (
    <div style={divStyle}>
      <div>Search Bar</div>
    </div>
  )
}


const divStyle = {
        color: 'blue',
        padding: '6px 6px 6px 6px',
        align: 'center',
        position: 'center',
        border: '1px solid',
}


export default MenuBar

