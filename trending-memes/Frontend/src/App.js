import Login from './Components/Login';
import Logout from './Components/Logout';
import Registration from './Components/Registration';
import NavBar from './Components/NavBar';
import Title from './Components/Title';
import SearchBar from './Components/SearchBar';
import SearchResults from './Components/SearchResults';
import SavedMemes from './Components/SavedMemes';
import ViewMedia from './Components/ViewMedia';
import LoadingScreen from './Components/LoadingScreen';
import About from './Components/About';


import React, {useState} from 'react'

export default function App() {
  // use State
  const [query, setQuery] = useState("");
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSavedMemes, setShowSavedMemes] = useState(false);
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
        <NavBar setShowRegistrationModal={setShowRegistrationModal} setShowLoginModal={setShowLoginModal} setShowAboutModal={setShowAboutModal} setShowLogoutModal={setShowLogoutModal} showSavedMemes={showSavedMemes} setShowSavedMemes={setShowSavedMemes}/>
        {!showSavedMemes ? <Title/> : <Title name='Your Memes'/>}
        {showLoginModal && <Login setShowRegistrationModal={setShowRegistrationModal} setShowLoginModal={setShowLoginModal}/>}
        {showLogoutModal && <Logout setShowLogoutModal={setShowLogoutModal} setShowSavedMemes={setShowSavedMemes}/>}
        {showRegistrationModal && <Registration setShowRegistrationModal={setShowRegistrationModal} setShowLoginModal={setShowLoginModal}/>}
        {showAboutModal && <About setShowAboutModal={setShowAboutModal}/>}
        {!showSavedMemes ? <SearchBar setQuery={setQuery} /> : <></>}
        {loadingScreen && <LoadingScreen/>}
        {!showSavedMemes ? <SearchResults query={query} setMediaInfo={setMediaInfo} setAlbumInfo={setAlbumInfo} setShowLoginModal={setShowLoginModal} setLoadingScreen={setLoadingScreen}  />
                         : <SavedMemes setMediaInfo={setMediaInfo} setAlbumInfo={setAlbumInfo} setShowLoginModal={setShowLoginModal} setLoadingScreen={setLoadingScreen} />}
        <ViewMedia mediaInfo={mediaInfo} setMediaInfo={setMediaInfo} albumInfo={albumInfo} />
      </div>
  );
}


