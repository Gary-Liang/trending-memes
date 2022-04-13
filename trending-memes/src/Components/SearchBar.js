import React, {useState} from 'react'
import SearchResults from './SearchResults';




export default function SearchBar({query, setQuery}) {

  const searchValue = (e) => {
    setQuery(e.target.value);
  }

  return (
    <div>
          <input placeholder="Search Here!" style={styleSearch} onChange={query}/>
    </div>
  );
}



const styleSearch = {
  margin: 'auto',
  padding: '5px',
  alignItems: 'center',
}





