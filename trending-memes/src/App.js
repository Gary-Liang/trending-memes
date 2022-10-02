import './Components/Title'
import Title from './Components/Title';
import SearchBar from './Components/SearchBar';
import SearchResults from './Components/SearchResults';
import React, {useState} from 'react'

export default function App() {
  // use State
  const [query, setQuery] = useState("");
  //const [showMedia] = useState(false); 

  return (
    <div className="App">
      <Title /*name='The Trending Memes'*//>

      <SearchBar setQuery={setQuery} />
      <SearchResults query={query}/>
    </div>
  );
}


// const appStyle = {
//   margin: 'auto',
// }


