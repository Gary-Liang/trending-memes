import React, {useState} from 'react'




export default function SearchBar() {
  // use State
  const [query, setQuery] = useState("");

  const searchValue = (e) => {
    setQuery(e.target.value);
  }

  return (
    <div query={query}>
          <input placeholder="Search Here!" style={styleSearch} onChange={searchValue}/>
    </div>
  );
}



const styleSearch = {
  margin: 'auto',
  padding: '5px',
  alignItems: 'center',
}





