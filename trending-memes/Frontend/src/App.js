import './Components/Title'
import Title from './Components/Title';
import SearchBar from './Components/SearchBar';
import SearchResults from './Components/SearchResults';
import ViewMedia from './Components/ViewMedia';
import LoadingIcon from './Components/LoadingIcon';

import React, {useState} from 'react'

export default function App() {
  // use State
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [mediaInfo, setMediaInfo] = useState([{
    dataInfo: null,
    isClicked: false,
    mediaLink: null,
    height: 0,
    width: 0
  }]);
  const [albumInfo, setAlbumInfo] = useState([{
    album: null,
    albumLength: null
  }]);
  //const [showMedia] = useState(false); 

  return (
      <div className="App">
        <Title /*name='The Trending Memes'*//>
        <SearchBar setQuery={setQuery} />
        {loading && <LoadingIcon></LoadingIcon>}
        <SearchResults query={query} setMediaInfo={setMediaInfo} setAlbumInfo={setAlbumInfo} setLoading={setLoading} />
        <ViewMedia mediaInfo={mediaInfo} setMediaInfo={setMediaInfo} albumInfo={albumInfo} />
      
      </div>
  );
}


