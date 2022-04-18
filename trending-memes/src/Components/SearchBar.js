import React, {useState} from 'react'
import SearchResults from './SearchResults';




export default function SearchBar({setQuery}) {

  // const searchValue = (e) => {
  //   setQuery(e.target.value);
  // }

  return (
    <div>
          {/*input type matters for e.target.value or else it will return an undefined object  */}
          <input type="string" placeholder="Search Here!" style={styleSearch} onChange={e => setQuery(e.target.value)}/>
    </div>
  );
}



const styleSearch = {
  margin: 'auto',
  padding: '5px',
  alignItems: 'center',
}





