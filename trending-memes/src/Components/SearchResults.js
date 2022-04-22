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
              <div key={data.id} style={searchResults}>
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
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'space-around',
    justifyContent: 'space-around',
    //alignContent: 'space-between',
    gap: '7.5px',

}

const searchResults = {
    border: 'black ridge 1px',
    borderRadius: '10px',
    // margin: 'auto',
    flex: '3 4 2',
    // width: '30%',
    padding: '25px',
}