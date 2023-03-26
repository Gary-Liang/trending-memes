import Title from './Components/Title';
import SearchBar from './Components/SearchBar';
import SearchResults from './Components/SearchResults';
import ViewMedia from './Components/ViewMedia';
import LoadingScreen from './Components/LoadingScreen';

import React, {useState} from 'react'

export default function App() {
  // use State
  const [query, setQuery] = useState("");
  const [loadingScreen, setLoadingScreen] = useState(false);
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
        {loadingScreen && <LoadingScreen></LoadingScreen>}
        <SearchResults query={query} setMediaInfo={setMediaInfo} setAlbumInfo={setAlbumInfo} setLoadingScreen={setLoadingScreen} />
        <ViewMedia mediaInfo={mediaInfo} setMediaInfo={setMediaInfo} albumInfo={albumInfo} />
      
      </div>
  );
}


