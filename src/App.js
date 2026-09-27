import React, { useState, useEffect } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import PokedexPage from './pages/PokedexPage';
import TeamBuilderPage from './pages/TeambuilderPage';

const TEAM_STORAGE_KEY = 'pokemon-team';
const TEAM_SIZE_STORAGE_KEY = 'pokemon-team-size';

const getSavedTeam = () => {
  try {
    const saved = localStorage.getItem(TEAM_STORAGE_KEY);
    if (!saved) return Array(6).fill(null);

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : Array(6).fill(null);
  } catch {
    return Array(6).fill(null);
  }
};

const getSavedTeamSize = () => {
  try {
    const saved = Number(localStorage.getItem(TEAM_SIZE_STORAGE_KEY));
    return Number.isFinite(saved) && saved > 0 ? saved : 6;
  } catch {
    return 6;
  }
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pokemonList, setPokemonList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [team, setTeam] = useState(getSavedTeam);
  const [teamSize, setTeamSize] = useState(getSavedTeamSize);

  useEffect(() => {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem(TEAM_SIZE_STORAGE_KEY, String(teamSize));
  }, [teamSize]);

  useEffect(() => {
    let cancelled = false;

    const fetchPokemonDetails = async (pokemonId) => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch Pokémon ID ${pokemonId}: ${response.status}`);
      }

      return response.json();
    };

    const loadPokemon = async () => {
      setIsLoading(true);

      try {
        const dexResponse = await fetch('https://pokeapi.co/api/v2/pokedex/1');

        if (!dexResponse.ok) {
          throw new Error(`Failed to fetch National Pokédex: ${dexResponse.status}`);
        }

        const dexData = await dexResponse.json();

        const pokemonIds = (dexData.pokemon_entries || [])
          .map((entry) => {
            const speciesUrl = entry?.pokemon_species?.url;
            if (!speciesUrl) return null;
            return Number(speciesUrl.split('/').filter(Boolean).pop());
          })
          .filter((id) => id && id > 0 && id < 10000)
          .sort((a, b) => a - b);

        const batchSize = 25;
        const results = [];

        for (let i = 0; i < pokemonIds.length; i += batchSize) {
          const batch = pokemonIds.slice(i, i + batchSize);

          const batchResults = await Promise.allSettled(
            batch.map((id) => fetchPokemonDetails(id))
          );

          results.push(
            ...batchResults
              .filter((result) => result.status === 'fulfilled')
              .map((result) => result.value)
          );
        }

        if (!cancelled) {
          setPokemonList(results);
        }
      } catch (error) {
        console.error('Error loading Pokémon:', error);

        if (!cancelled) {
          setPokemonList([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPokemon();

    return () => {
      cancelled = true;
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'pokedex':
        return <PokedexPage pokemonList={pokemonList} isLoading={isLoading} />;
      case 'teambuilder':
        return (
          <TeamBuilderPage
            pokemonList={pokemonList}
            isLoading={isLoading}
            team={team}
            setTeam={setTeam}
            teamSize={teamSize}
            setTeamSize={setTeamSize}
          />
        );
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
