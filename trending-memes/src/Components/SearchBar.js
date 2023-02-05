import React, {useState} from 'react'


export default function SearchBar({setQuery}) {

  // const searchValue = (e) => {
  //   setQuery(e.target.value);
  // }

  return (
    <>
      <div style={styleDiv}>
          {/*input type matters for e.target.value or else it will return an undefined object  */}
          <input type="string" placeholder="Search Here!" style={styleSearch} onChange={e => setQuery(e.target.value)}/>
      </div>
      <button className='searchButton' style={styleSearchButton}>O</button>
    </>
  );
}


const styleSearch = {
  padding: '10px',
  width: '25%',
  WebkitAppearance: 'none'
}

const styleDiv = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  marginBottom: '15px'

}

const styleSearchButton = {
  alignItems: 'right',
  display: 'flex',
  justifyContent: 'right',
  // marginBottom: '15px',
}





