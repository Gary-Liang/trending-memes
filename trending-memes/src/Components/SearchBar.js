import React, {useRef, useState} from 'react'


export default function SearchBar({setQuery}) {

  // const searchValue = (e) => {
  //   setQuery(e.target.value);
  // }

  const inputRef = useRef();

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && inputRef.current) {
      event.preventDefault();
      setQuery(inputRef.current.value);
    }
    document.addEventListener('keydown', handleKeyDown);

    // Don't forget to clean up
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
    } 
  };

  return (
    <>
      <div style={styleDiv}>
          {/*input type matters for e.target.value or else it will return an undefined object  */}
          <input type="string" placeholder="Search Here!" style={styleSearch} ref={inputRef} onKeyDown={handleKeyDown}/>
          <button className='searchButton' style={styleSearchButton} onClick={() => setQuery(inputRef.current.value)}>Q</button>
      </div>
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
  // alignItems: 'right',
  display: 'flex',
  // justifyContent: 'right',
  // marginBottom: '15px',
  marginLeft: '10px',
  padding: '10px',
  WebkitAppearance: 'none',
  border: '0'
}





