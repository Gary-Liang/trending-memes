import SearchBar from './Components/SearchBar';
import './Components/Title'
import Title from './Components/Title';
import SearchResults from './Components/SearchResults';

export default function App() {
  return (
    <div className="App">
      <Title /*name='The Trending Memes'*//>

      <SearchBar/>
      <SearchResults/>
    </div>
  );
}


// const appStyle = {
//   margin: 'auto',
// }


