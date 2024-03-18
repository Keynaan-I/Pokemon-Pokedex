import React, { useState, useEffect } from 'react';
import './App.css';

//Type images instead of text
import normalTypeImage from './Typeicons/Normal.png';
import fightingTypeImage from './Typeicons/Fighting.png';
import flyingTypeImage from './Typeicons/Flying.png';
import poisonTypeImage from './Typeicons/Poison.png';
import groundTypeImage from './Typeicons/Ground.png';
import rockTypeImage from './Typeicons/Rock.png';
import bugTypeImage from './Typeicons/bug.png';
import ghostTypeImage from './Typeicons/Ghost.png';
import steelTypeImage from './Typeicons/Steel.png';
import fireTypeImage from './Typeicons/Fire.png';
import waterTypeImage from './Typeicons/Water.png';
import grassTypeImage from './Typeicons/grass.png';
import electricTypeImage from './Typeicons/electric.png';
import psychicTypeImage from './Typeicons/Psychic.png';
import iceTypeImage from './Typeicons/Ice.png';
import dragonTypeImage from './Typeicons/dragon.png';
import darkTypeImage from './Typeicons/dark.png';
import fairyTypeImage from './Typeicons/Fairy.png';

const PokemonTeamBuilder = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  //used for searching and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');

  const typeImages = {
    normal: normalTypeImage,
    fighting: fightingTypeImage,
    flying: flyingTypeImage,
    poison: poisonTypeImage,
    ground: groundTypeImage,
    rock: rockTypeImage,
    bug: bugTypeImage,
    ghost: ghostTypeImage,
    steel: steelTypeImage,
    fire: fireTypeImage,
    water: waterTypeImage,
    grass: grassTypeImage,
    electric: electricTypeImage,
    psychic: psychicTypeImage,
    ice: iceTypeImage,
    dragon: dragonTypeImage,
    dark: darkTypeImage,
    fairy: fairyTypeImage,
  };

  const getTypeEffectiveness = (type) => {
   //What types are effective on others
    const typeChart = {
      normal: { effective: [], weakness: ['fighting'], resistance: [], immunity: ['ghost'] },
      fighting: { effective: ['normal', 'dark','steel', 'rock', 'ice'], weakness: ['flying', 'psychic', 'fairy'], resistance: ['rock', 'bug', 'dark'], immunity: [] },
      flying: {effective: ['fighting', 'bug', 'grass'], weakness: ['rock','electic','ice'], resistance: ['fighting','bug','grass'], immunity: ['ground']},
      poison: {effective: ['grass', 'fairy'], weakness: ['ground','psychic'], resistance: ['fighting','poison','bug','grass','fairy'], immunity: []},
      ground: { effective: ['fire', 'electric', 'poison', 'rock', 'steel'], weakness: ['water', 'ice', 'grass'], resistance: ['poison', 'rock'], immunity: ['electric'] },
      rock: { effective: ['flying', 'bug', 'fire', 'ice'], weakness: ['water', 'grass', 'fighting', 'ground', 'steel'], resistance: ['normal', 'flying', 'poison', 'fire'], immunity: [] },
      bug: { effective: [ 'grass', 'psychic', 'dark'], weakness: ['flying', 'rock', 'fire'], resistance: ['fighting', 'ground', 'grass'], immunity: [] },
      ghost: { effective: ['ghost', 'psychic'], weakness: ['ghost', 'dark'], resistance: ['poison', 'bug'], immunity: ['normal', 'fighting', 'normal'] },
      steel: { effective: ['ice', 'rock', 'fairy'], weakness: ['fighting', 'ground', 'fire'], resistance: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'], immunity: ['poison'] },
      fire: { effective: ['bug', 'grass', 'ice', 'steel'], weakness: ['water', 'rock', 'ground'], resistance: ['bug', 'steel', 'fire', 'grass', 'ice', 'fairy'], immunity: [] },
      water: { effective: ['fire', 'ground', 'rock'], weakness: ['electric', 'grass'], resistance: ['steel', 'fire', 'water', 'ice'], immunity: [] },
      grass: { effective: ['water', 'ground', 'rock'], weakness: ['fire', 'ice', 'poison', 'flying', 'bug'], resistance: ['ground', 'water', 'grass', 'electric'], immunity: [] },
      electric: { effective: ['water', 'flying'], weakness: ['ground'], resistance: ['flying', 'steel', 'electric'], immunity: [] },
      psychic: { effective: [ 'fighting', 'poison'], weakness: ['bug', 'ghost', 'dark'], resistance: ['fighting', 'psychic'], immunity: [] },
      ice: { effective: ['dragon', 'flying', 'ground', 'grass'], weakness: ['fire', 'fighting', 'rock', 'steel'], resistance: ['ice'], immunity: [] },
      dragon: { effective: ['dragon'], weakness: ['ice', 'dragon', 'fairy'], resistance: ['fire', 'water', 'grass', 'electric'], immunity: [] },
      dark: { effective: ['ghost', 'psychic'], weakness: ['fighting', 'bug', 'fairy'], resistance: ['ghost', 'dark'], immunity: ['psychic'] },
      fairy: { effective: ['dark', 'dragon', 'fighting'], weakness: ['poison', 'steel'], resistance: ['fighting', 'bug', 'dark'], immunity: ['dragon'] },
    };

    return typeChart[type] || { effective:[], weakness: [], resistance: [], immunity: [] };
  };

  //Function that finds what type is super effective on a pokemon
  const getTypeMatchup = (types, type2) => {
    var effectiveness = 1
    //If the pokemon only has 1 type
    if (types.length===1) {
      
       if (getTypeEffectiveness(types[0].type.name).weakness.includes(type2)) {
        return 2
      }

      if (getTypeEffectiveness(types[0].type.name).resistance.includes(type2)) {
        return 0.5
      }
      
      if (getTypeEffectiveness(types[0].type.name).immunity.includes(type2)) {
        return 0
      } 
      return 1
    }

    //If a pokemon has 2 types
    else if (types.length===2) {
      
      if (getTypeEffectiveness(types[0].type.name).weakness.includes(type2)) {
        effectiveness=effectiveness*2
     }

     else if (getTypeEffectiveness(types[0].type.name).resistance.includes(type2)) {
        effectiveness=effectiveness*0.5
     }
     
     else if (getTypeEffectiveness(types[0].type.name).immunity.includes(type2)) {
        effectiveness=effectiveness* 0
     } 

     if (getTypeEffectiveness(types[1].type.name).weakness.includes(type2)) {
        effectiveness=effectiveness*2
   }

   else if (getTypeEffectiveness(types[1].type.name).resistance.includes(type2)) {
      effectiveness=effectiveness*0.5
   }
   
   else if (getTypeEffectiveness(types[1].type.name).immunity.includes(type2)) {
      effectiveness=effectiveness* 0
   } 
   return effectiveness;
   }

  }


  //Gets all the pokemon from the pokemon api which has their data, like images, types, abilities etc.
  useEffect(() => {
    const fetchPokemonDetails = async (pokemonName) => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
      const data = await response.json();
      return data;
    };

     fetch('https://pokeapi.co/api/v2/pokemon?limit=2000')
      .then((response) => response.json())
      .then(async (data) => {
        const pokemonDetailsPromises = data.results.map(async (pokemon) => {
          const details = await fetchPokemonDetails(pokemon.name);
          return details;
        });
        const pokemonDetails = await Promise.all(pokemonDetailsPromises);
        setPokemonList(pokemonDetails);
      });
  }, []);


  const closeDetails = () => {    
    setSelectedPokemon(null)
  };

  const handlePokemonClick = async (pokemon) => {
    setSelectedPokemon(pokemon);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilterChange = (e) => {
    setSelectedTypeFilter(e.target.value);
  };

  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchesType = !selectedTypeFilter || pokemon.types.some((type) => type.type.name === selectedTypeFilter);
    const matchesSearchTerm = pokemon.name.includes(searchTerm.toLowerCase());
    return matchesType && matchesSearchTerm;
  });

  

  const handleSort = (columnName) => {
    if (columnName === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  const sortedPokemon = filteredPokemon.sort((a, b) => {
    if (sortColumn === 'Pokedex number') {
      const idA = parseInt(a.id);
      const idB = parseInt(b.id);
      return sortDirection === 'asc' ? idA - idB : idB - idA;
    }else if (sortColumn === 'name') {
      return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else if (sortColumn === 'type') {
      const typeA = a.types[0].type.name;
      const typeB = b.types[0].type.name;
      return sortDirection === 'asc' ? typeA.localeCompare(typeB) : typeB.localeCompare(typeA);
    } else if (sortColumn === 'baseStatTotal') {
      const totalA = a.stats.reduce((acc, stat) => acc + stat.base_stat, 0);
      const totalB = b.stats.reduce((acc, stat) => acc + stat.base_stat, 0);
      return sortDirection === 'asc' ? totalA - totalB : totalB - totalA;
    } 
    return 0;
  });

  const renderSortIcon = (columnName) => {
    if (sortColumn === columnName) {
      return sortDirection === 'asc' ? '▲' : '▼';
    }
    return null;
  };

  const Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  

  return (
    <div className='WholePage'>
      <body>
      <h1>Pokedex</h1>
      
      {/* If a pokemon has been selected open the detailed view, otherwise show the table of all pokemon */}
      {selectedPokemon ? (<div class='details'>
        {/* Detail page -------------------------------------------------- */}
        <button onClick={closeDetails} className='closeDetails'>Return to search table</button>
        
        <span className='detailedSpan'>
          <h2>Pokemon</h2>
          Pokedex #{selectedPokemon.id}
        
          <br></br>
          <h3>{Capitalize(selectedPokemon.name)}</h3>
          <br></br>
          <img
            src={selectedPokemon.sprites.other['official-artwork'].front_default}
            alt=""
            class='detailImage'
          />
          <br></br>
          
            <h2>Types</h2>
            {selectedPokemon.types.map((type) => (
              <img key={type.type.name} src={typeImages[type.type.name]} alt={type.type.name} />
            ))}
            <h2>Abilities</h2>
            {selectedPokemon.abilities.map((ability) => (
              <span key={ability.ability.name}>-{ability.ability.name} </span>
            ))}
        </span>
        <span className='detailedSpan'>
        <h2>Base Stats</h2>
        <h3>HP</h3>
        {selectedPokemon.stats[0].base_stat}
        <h3>Attack</h3>
        {selectedPokemon.stats[1].base_stat}
        <h3>Defense</h3>
        {selectedPokemon.stats[2].base_stat}
        <h3>Sp.Atk</h3>
        {selectedPokemon.stats[3].base_stat}
        <h3>Sp.Def</h3>
        {selectedPokemon.stats[4].base_stat}
        <h3>Speed</h3>
        {selectedPokemon.stats[5].base_stat}
        <h3>Total</h3>
        {selectedPokemon.stats[0].base_stat+selectedPokemon.stats[1].base_stat+selectedPokemon.stats[2].base_stat+selectedPokemon.stats[3].base_stat+selectedPokemon.stats[4].base_stat+selectedPokemon.stats[5].base_stat}
        </span>
        
        <span className='detailedSpan'>
        <h2>Defensive Stats</h2>
        aka what types are super effective or not very effective on this pokemon
        <br></br>
        <br></br>
        x2 = Super effective damage
        <br></br>
        x1 = Neutral damage
        <br></br>
        x0.5 and x0.25 = Not very effective 
        <br></br>
        x0 = This pokemon is immune to this type
        <br></br>
        <br></br>
            
            {/* This table can use loops but due to time copy and paste was quicker to implement */}
            <table>
              <th>Normal</th>
              <th>Fighting</th>
              <th>Flying</th>
              <th>Poison</th>
              <th>Ground</th>
              <th>Rock</th>
              
              <tr>
                <td>x{getTypeMatchup(selectedPokemon.types,"normal")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"fighting")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"flying")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"poison")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"ground")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"rock")}</td>        
              </tr>

              <th>Bug</th>
              <th>Ghost</th>
              <th>Steel</th>
              <th>Fire</th>
              <th>Water</th>
              <th>Grass</th>
              <tr>
                <td>x{getTypeMatchup(selectedPokemon.types,"bug")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"ghost")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"steel")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"fire")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"water")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"grass")}</td>
              </tr>
              <th>Electric</th>
              <th>Psychic</th>
              <th>Ice</th>
              <th>Dragon</th>
              <th>Dark</th>
              <th>Fairy</th>

              <tr>
              <td>x{getTypeMatchup(selectedPokemon.types,"electric")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"psychic")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"ice")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"dragon")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"dark")}</td>
                <td>x{getTypeMatchup(selectedPokemon.types,"fairy")}</td>
              </tr>
            </table>
            <br></br>
            <br></br>
            More information on this pokemon can be found at <a href={"https://pokemondb.net/pokedex/"+ selectedPokemon.name }> here</a>
         </span>

      </div>) : (
        // This is the page with all the pokemon -------------------------------------------------------------
      <div>
      <h1>Search and click on pokemon for more details</h1>

      <h3>Filter pokemon by name</h3>
        <input
          type="text"
          placeholder="Search Pokemon by Name"
          value={searchTerm}
          onChange={handleSearch}
          className='nameFilter'
        />
      <h3>Filter pokemon by type</h3>
        <select id="typeFilter" className='typeFilter' onChange={handleTypeFilterChange}>
          <option value="">No filter</option>
          <option value="normal">Normal</option>
          <option value="fighting">Fighting</option>
          <option value="flying">Flying</option>
          <option value="poison">Poison</option>
          <option value="ground">Ground</option>
          <option value="rock">Rock</option>
          <option value="bug">Bug</option>
          <option value="ghost">Ghost</option>
          <option value="steel">Steel</option>
          <option value="fire">Fire</option>
          <option value="water">Water</option>
          <option value="grass">Grass</option>
          <option value="electric">Electric</option>
          <option value="psychic">Psychic</option>
          <option value="ice">Ice</option>
          <option value="dragon">Dragon</option>
          <option value="dark">Dark</option>
          <option value="fairy">Fairy</option>
        </select>

        <div className="pokemon-list">
          <h3>Clcik on the coloumn headers to sort from acending to descending or vise versa</h3>
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('Pokedex number')}> 
                  Pokedex number {renderSortIcon('Pokedex number')}
                </th>

                <th>Pokemon</th>
                
                <th onClick={() => handleSort('name')}>
                  Name {renderSortIcon('name')}
                </th>
                
                <th onClick={() => handleSort('type')}>
                  Type {renderSortIcon('type')}
                </th>
                
                <th onClick={() => handleSort('baseStatTotal')}>
                  Base Stat Total {renderSortIcon('baseStatTotal')}
                </th>
              </tr>
            </thead>
            <tbody>
            {sortedPokemon.map((pokemon) => (
            
            
              <tr key={pokemon.name} className="pokemon-item" onClick={() => handlePokemonClick(pokemon)}>
              <td>{pokemon.id}</td>
              <td>
                <img
                src={pokemon.sprites.front_default}
                alt=""
                className='tableImages'
                />
              </td>
              <td>
                {Capitalize(pokemon.name)}
              </td>
              <td>
                
                {pokemon?.types?.map((type) => (
                  <img key={type.type.name} src={typeImages[type.type.name]} alt={type.type.name} />
                ))}
              </td>
              <td>
                {pokemon.stats[0].base_stat+pokemon.stats[1].base_stat+pokemon.stats[2].base_stat+pokemon.stats[3].base_stat+pokemon.stats[4].base_stat+pokemon.stats[5].base_stat}
              </td>
              
            </tr> 
           ))}
           
          </tbody>
          </table>
        </div>
      </div>
      )}
      </body>
    </div>
  );
};

export default PokemonTeamBuilder;
