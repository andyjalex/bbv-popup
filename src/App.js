import logo from './logo.svg';
import './App.css';
import Hero from './components/Hero';
import EventInfo from './components/EventInfo';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Hero /> 
      <EventInfo />

     
    </div>
  );
}

export default App;
