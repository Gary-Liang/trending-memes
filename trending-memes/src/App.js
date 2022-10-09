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
    isClicked: false
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
      <SearchResults query={query} setMediaInfo={setMediaInfo} setAlbumInfo={setAlbumInfo} />
      <ViewMedia mediaInfo={mediaInfo} setMediaInfo={setMediaInfo} albumInfo={albumInfo} />

    </div>
  );
}


// const appStyle = {
//   margin: 'auto',
// }


