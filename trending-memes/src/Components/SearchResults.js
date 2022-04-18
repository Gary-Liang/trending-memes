import React, { useState } from 'react'
import Data from '../Data/MOCK_DATA.json'

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
              <div key={data.id} style={searchResults}>
                <p>{data.first_name + " " + data.last_name}</p>
              </div>
          ))
        }
      </div>
    </>
  )
}


const divStyle = {
    color: 'blue',
    padding: '6px',
    align: 'center',
    border: '1px solid blue',
    textAlign: 'center',
    alignItems: 'center',

}

const searchResults = {
    border: 'black ridge 1px',
    borderRadius: '15px',
    margin: 'auto',
    width: '30rem',
    alignItems: 'center',
}