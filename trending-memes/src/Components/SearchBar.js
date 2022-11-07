import React, {useState} from 'react'
import SearchResults from './SearchResults';




export default function SearchBar({setQuery}) {

  // const searchValue = (e) => {
  //   setQuery(e.target.value);
  // }

  return (
    <div style={styleDiv}>
          {/*input type matters for e.target.value or else it will return an undefined object  */}
          <input type="string" placeholder="Search Here!" style={styleSearch} onChange={e => setQuery(e.target.value)}/>
    </div>
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
  justifyContent: 'center',
  marginBottom: '15px'

}





