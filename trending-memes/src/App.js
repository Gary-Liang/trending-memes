import './Components/Title'
import Title from './Components/Title';
import SearchBar from './Components/SearchBar';
import SearchResults from './Components/SearchResults';
import ViewMedia from './Components/ViewMedia';

import React, {useState} from 'react'

export default function App() {
  // use State
  const [query, setQuery] = useState("");
  const [mediaInfo, setMediaInfo] = useState([{
    dataInfo: null,
    isClicked: false,
    height: 0,
    width: 0
  }]);
  const [albumInfo, setAlbumInfo] = useState([{
    album: null,
    albumLength: null
  }]);
  //const [showMedia] = useState(false); 

  return (
    <div className='container' style={containerStyle}>
      <div className="App" style={(mediaInfo.isClicked === true) ? setOverflowInBodyOn : setOverflowInBodyOff}>
        <Title /*name='The Trending Memes'*//>
        {console.log(mediaInfo.isClicked)}
        <SearchBar setQuery={setQuery} />
        <SearchResults query={query} setMediaInfo={setMediaInfo} setAlbumInfo={setAlbumInfo} />
        {/*(mediaInfo.isClicked) ? {setOverflowInBodyOn}: {setOverflowInBodyOff}  */}
        <ViewMedia mediaInfo={mediaInfo} setMediaInfo={setMediaInfo} albumInfo={albumInfo} />
      
      </div>
    </div>
  );
}

const setOverflowInBodyOn = {
  // for overflow to have any weight we need to define it some height and width 
  overflowY: 'noscroll',
}

const setOverflowInBodyOff = {
  overflowY: 'auto',
}

const containerStyle = {
  maxHeight: '100%',
  maxWidth: '100%',
  overflowY: 'auto',
}


