import Login from './Components/Login';
import Registration from './Components/Registration';
import NavBar from './Components/NavBar';
import Title from './Components/Title';
import SearchBar from './Components/SearchBar';
import SearchResults from './Components/SearchResults';
import ViewMedia from './Components/ViewMedia';
import LoadingScreen from './Components/LoadingScreen';
// Used routing to navigate to a different page in react
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';


import React, {useState} from 'react'

export default function App() {
  // use State
  const [query, setQuery] = useState("");
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
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
        <NavBar setShowRegistrationModal={setShowRegistrationModal} setShowLoginModal={setShowLoginModal}/>
        <Title /*name='The Trending Memes'*//>
        <SearchBar setQuery={setQuery} />
        {loadingScreen && <LoadingScreen></LoadingScreen>}
        {showLoginModal && <Login></Login>}
        {showRegistrationModal && <Registration></Registration>}
        <SearchResults query={query} setMediaInfo={setMediaInfo} setAlbumInfo={setAlbumInfo} setLoadingScreen={setLoadingScreen} />
        <ViewMedia mediaInfo={mediaInfo} setMediaInfo={setMediaInfo} albumInfo={albumInfo} />
      
      </div>
  );
}


