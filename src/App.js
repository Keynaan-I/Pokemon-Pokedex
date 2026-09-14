import React, { useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import PokedexPage from './pages/PokedexPage';
import TeamBuilderPage from './pages/TeambuilderPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'pokedex':
        return <PokedexPage />;
      case 'teambuilder':
        return <TeamBuilderPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="WholePage">
      <header>
        <h1>Pokémon Hub</h1>
        <nav>
          <button onClick={() => setCurrentPage('home')}>Home</button>
          <button onClick={() => setCurrentPage('pokedex')}>Pokedex</button>
          <button onClick={() => setCurrentPage('teambuilder')}>Team Builder</button>
        </nav>
      </header>

      {renderPage()}
    </div>
  );
};

export default App;
