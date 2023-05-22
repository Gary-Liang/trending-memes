import React, { useRef } from 'react'
import SearchButton from '../Images/searchButton.png'

export default function SearchBar({ setQuery }) {

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
        <input className='searchInput' type="string" placeholder="Search Here!" style={styleSearch} ref={inputRef} onKeyDown={handleKeyDown} />
        <button className='searchButton' style={styleSearchButton} onClick={() => setQuery(inputRef.current.value)}></button>
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
  display: 'flex',
  marginLeft: '10px',
  padding: '15px',
  WebkitAppearance: 'none',
  border: '0',
  backgroundImage: "url(" + SearchButton + ")",
  backgroundPosition: "center",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundColor: "transparent",
  outline: "none",
  cursor: 'pointer'
}





