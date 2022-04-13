import React, { useState } from 'react'
import Data from '../Data/MOCK_DATA.json'

export default function SearchResults({query}) {

  return (
    <>
      <div className='box' style={divStyle}>
        {
          Data.filter(post => {
              if (query == "" || query == null) {
                  // if query is empty
                  return post;
              } else if (post.first_name.toLowerCase().includes(query.toLowerCase()) || post.last_name.toLowerCase().includes(query.toLowerCase())) {
                  return post;
              }
          }).map((post, id) => (
              <div key={post.id} style={searchResults}>
                <p>{post.first_name + " " + post.last_name}</p>
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