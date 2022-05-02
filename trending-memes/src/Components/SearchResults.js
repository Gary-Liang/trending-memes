import React, { useState } from 'react'
import Data from '../Data/MOCK_DATA (4).json'

export default function SearchResults({query}) {

  return (
    <>
      <div className='box' style={divStyle}>
        {
          Data.filter(data => {
              if (query == "" || query == null) {
                  // if query is empty
                  return data;
              } else if (data.first_name.toLowerCase().includes(query.toLowerCase()) || data.last_name.toLowerCase().includes(query.toLowerCase())) {
                  return data;
              }
          }).map((data, id) => (
              <div key={id} style={searchResults}>
                  <p>{data.first_name + " " + data.last_name}</p>
                  <img src={data.img}/>
              </div>
          ))
        }
      </div>
    </>
  )
}


const divStyle = {
    color: 'blue',
    padding: '1%',
    border: '1px solid blue',
    textAlign: 'center',
    // display: 'flex',
    display: 'grid',
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    // Condenses flex direction and flex wrap
    // flexFlow: 'row wrap',
    // alignItems: 'space-around',
    // justifyContent: 'space-around',
    // alignContent: 'space-between',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gridAutoFlow: 'row',
    minWidth: '100px',
    gap: '7.5px',
    //gridRowStart: 'span 2',

}

const searchResults = {
    border: 'black ridge 1px',
    borderRadius: '10px',
    alignSelf: 'flex-start',
    position: 'relative',
    // margin: 'auto',
    // width: '30%',
    padding: '25px',
    
}