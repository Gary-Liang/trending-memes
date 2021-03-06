import React, { useEffect, useState } from 'react'
//import Data from '../Data/MOCK_DATA (4).json'

export default function SearchResults({query}) {

  // create state variable to get backend API 
 const [data, setData] = useState([{}]);

 // Purpose of useEffect is to define some anonymous lambda function inside the parameters to use it after 
 useEffect(() => {
    fetch("/json").then(
      // Promise
      res => res.json()
    ).then(
      data => {
        setData(data)
        console.log(data)
      }
    )
  }, [])  // render once

  return (
    <>
      { <div className='box' style={divStyle}>
        {
          data.filter(data => {
              if (query == "") {
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
      </div>}
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