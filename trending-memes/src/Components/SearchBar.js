import React from 'react'
import Data from '../Data/MOCK_DATA.json'
import PropTypes from 'prop-types'




function SearchBar() {
  // use State


  return (
    <div>
      <form>
        <label>Search Bar</label>
        <input 
          type='text'
          style={divStyle}
        />
      </form>
    </div>
  )
}


const divStyle = {
        color: 'blue',
        padding: '6px',
        align: 'center',
        position: 'center',
        border: '1px solid blue',
}


export default SearchBar

