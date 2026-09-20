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
        <h1>Key's Pokemon hub </h1>
        <nav className="nav-buttons">
          <button className="nav-button" onClick={() => setCurrentPage('home')}>Home Page</button>
          <button className="nav-button" onClick={() => setCurrentPage('pokedex')}>Pokedex</button>
          <button className="nav-button" onClick={() => setCurrentPage('teambuilder')}>Team Builder</button>
        </nav>
      </header>

      {renderPage()}
    </div>
  );
};

export default App;
