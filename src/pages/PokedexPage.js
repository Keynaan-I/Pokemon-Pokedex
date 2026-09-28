import React, { useState, useEffect } from 'react';
import '../App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import PokedexPage1 from './PokedexPage';
import TeamBuilderPage from './TeambuilderPage';
import HomePage from './HomePage';

// Type images instead of text
// These image imports are used to display a Pokémon's typing in the table and the detail panel.
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

const PokedexPage = ({
  pokemonList: pokemonListFromApp = [],
  isLoading: isLoadingFromApp = true,
}) => {
  // Main Pokémon list state
  // This holds all loaded Pokémon data from the National Pokédex.
  const [pokemonList, setPokemonList] = useState(pokemonListFromApp);

  // Selected Pokémon state
  // When a Pokémon is clicked from the table, its full details are shown in the panel.
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  // Form selection state
  // When the selected Pokémon has alternate forms, this stores the currently selected form.
  const [selectedForm, setSelectedForm] = useState(null);

  // Alternate form list
  // This stores all forms available for the selected Pokémon.
  const [formVariants, setFormVariants] = useState([]);

  // Loading state for the form fetch
  // Used to show a loading indicator while the alternate form data is being retrieved.
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Standard page loading state
  // Used while the National Dex is being loaded.
  const [isLoading, setIsLoading] = useState(isLoadingFromApp);

  useEffect(() => {
    setPokemonList(pokemonListFromApp);
    setIsLoading(isLoadingFromApp);
  }, [pokemonListFromApp, isLoadingFromApp]);

  // used for searching and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [selectedAbilityFilter, setSelectedAbilityFilter] = useState('');
  const [selectedAbilityForDefense, setSelectedAbilityForDefense] = useState('base');

  const NATIONAL_DEX_ID = 1;
  const MAX_POKEMON_ID = 15000;

  // Format names like "rotom-wash" into "Rotom Wash".
  // This helps display clean names in the UI and in form tabs.
  const formatName = (name) => {
    if (!name) return '';
    return name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  // This loads alternate forms (e.g. Mega, Galar, Alolan, etc.) for a clicked Pokémon.
  // The function fetches the Pokémon species and then its different varieties.
  // Each variant is added to formVariants so that tabs can be rendered.
  const loadPokemonForms = async (pokemon) => {
    // If no species URL exists, there are no alternate forms to fetch.
    if (!pokemon?.species?.url) {
      setFormVariants([]);
      setSelectedForm(null);
      return;
    }

    try {
      const speciesResponse = await fetch(pokemon.species.url);

      if (!speciesResponse.ok) {
        throw new Error(`Failed to fetch Pokémon species: ${speciesResponse.status}`);
      }

      const speciesData = await speciesResponse.json();
      const varieties = speciesData.varieties || [];

      // If there is only one variety, the Pokémon has no different forms to show.
      if (varieties.length <= 1) {
        setFormVariants([]);
        setSelectedForm(null);
        return;
      }

      // Fetch each variant's Pokémon data.
      // We keep the original data and add a label and default flag.
      const loadedForms = await Promise.all(
        varieties.map(async (variety) => {
          const variantResponse = await fetch(variety.pokemon.url);

          if (!variantResponse.ok) {
            return null;
          }

          const variantData = await variantResponse.json();

          return {
            ...variantData,
            isDefault: Boolean(variety.is_default),
            formLabel: variety.is_default ? 'Default' : formatName(variantData.name),
          };
        })
      );

      const validForms = loadedForms.filter(Boolean);

      // If valid forms were found, set them as the available tabs.
      // The default or base form is selected first.
      if (validForms.length > 0) {
        const defaultForm =
          validForms.find((form) => form.isDefault) || validForms[0];

        setFormVariants(validForms);
        setSelectedForm(defaultForm);
        return;
      }
    } catch (error) {
      console.error('Error loading Pokémon forms:', error);
    }

    // Fallback if loading the species fails.
    setFormVariants([]);
    setSelectedForm(null);
  };

  // This effect runs once on page load and fetches the full National Pokédex.
  // If the app has already loaded the shared list, reuse it instead of refetching.
  useEffect(() => {
    if (pokemonListFromApp.length > 0) {
      setPokemonList(pokemonListFromApp);
      setIsLoading(false);
      return undefined;
    }

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
        const dexResponse = await fetch(
          `https://pokeapi.co/api/v2/pokedex/${NATIONAL_DEX_ID}`
        );

        if (!dexResponse.ok) {
          throw new Error(`Failed to fetch National Pokédex: ${dexResponse.status}`);
        }

        const dexData = await dexResponse.json();

        // Extract every Pokémon species ID from the National Dex entries.
        const pokemonIds = (dexData.pokemon_entries || [])
          .map((entry) => {
            const speciesUrl = entry?.pokemon_species?.url;
            if (!speciesUrl) return null;
            return Number(speciesUrl.split('/').filter(Boolean).pop());
          })
          .filter((id) => id && id > 0 && id < MAX_POKEMON_ID)
          .sort((a, b) => a - b);

        const batchSize = 25;
        const results = [];

        // Load in batches to reduce simultaneous network pressure.
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
  }, [pokemonListFromApp]);

  // Map each type name to its PNG icon.
  // This lets the page show a type badge image instead of plain text.
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

  // List/variable to get what types are effective on others.
  // This uses a simplified type chart that matches the Pokémon's defensive stats.
  // For a given type, it returns:
  // - effective: attack types that are strong against it
  // - weakness: attack types it is weak to
  // - resistance: attack types it resists
  // - immunity: attack types it ignores
  const getTypeEffectiveness = (type) => {
    const typeChart = {
      normal: { effective: [], weakness: ['fighting'], resistance: [], immunity: ['ghost'] },
      fighting: { effective: ['normal', 'dark', 'steel', 'rock', 'ice'], weakness: ['flying', 'psychic', 'fairy'], resistance: ['rock', 'bug', 'dark'], immunity: [] },
      flying: { effective: ['fighting', 'bug', 'grass'], weakness: ['rock', 'electic', 'ice'], resistance: ['fighting', 'bug', 'grass'], immunity: ['ground'] },
      poison: { effective: ['grass', 'fairy'], weakness: ['ground', 'psychic'], resistance: ['fighting', 'poison', 'bug', 'grass', 'fairy'], immunity: [] },
      ground: { effective: ['fire', 'electric', 'poison', 'rock', 'steel'], weakness: ['water', 'ice', 'grass'], resistance: ['poison', 'rock'], immunity: ['electric'] },
      rock: { effective: ['flying', 'bug', 'fire', 'ice'], weakness: ['water', 'grass', 'fighting', 'ground', 'steel'], resistance: ['normal', 'flying', 'poison', 'fire'], immunity: [] },
      bug: { effective: ['grass', 'psychic', 'dark'], weakness: ['flying', 'rock', 'fire'], resistance: ['fighting', 'ground', 'grass'], immunity: [] },
      ghost: { effective: ['ghost', 'psychic'], weakness: ['ghost', 'dark'], resistance: ['poison', 'bug'], immunity: ['normal', 'fighting'] },
      steel: { effective: ['ice', 'rock', 'fairy'], weakness: ['fighting', 'ground', 'fire'], resistance: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'], immunity: ['poison'] },
      fire: { effective: ['bug', 'grass', 'ice', 'steel'], weakness: ['water', 'rock', 'ground'], resistance: ['bug', 'steel', 'fire', 'grass', 'ice', 'fairy'], immunity: [] },
      water: { effective: ['fire', 'ground', 'rock'], weakness: ['electric', 'grass'], resistance: ['steel', 'fire', 'water', 'ice'], immunity: [] },
      grass: { effective: ['water', 'ground', 'rock'], weakness: ['fire', 'ice', 'poison', 'flying', 'bug'], resistance: ['ground', 'water', 'grass', 'electric'], immunity: [] },
      electric: { effective: ['water', 'flying'], weakness: ['ground'], resistance: ['flying', 'steel', 'electric'], immunity: [] },
      psychic: { effective: ['fighting', 'poison'], weakness: ['bug', 'ghost', 'dark'], resistance: ['fighting', 'psychic'], immunity: [] },
      ice: { effective: ['dragon', 'flying', 'ground', 'grass'], weakness: ['fire', 'fighting', 'rock', 'steel'], resistance: ['ice'], immunity: [] },
      dragon: { effective: ['dragon'], weakness: ['ice', 'dragon', 'fairy'], resistance: ['fire', 'water', 'grass', 'electric'], immunity: [] },
      dark: { effective: ['ghost', 'psychic'], weakness: ['fighting', 'bug', 'fairy'], resistance: ['ghost', 'dark'], immunity: ['psychic'] },
      fairy: { effective: ['dark', 'dragon', 'fighting'], weakness: ['poison', 'steel'], resistance: ['fighting', 'bug', 'dark'], immunity: ['dragon'] },
    };

    return typeChart[type] || { effective: [], weakness: [], resistance: [], immunity: [] };
  };

  // Function that finds what type is super effective on a Pokémon.
  // Returns:
  // 2 = super effective
  // 1 = neutral
  // 0.5 = not very effective
  // 0.25 = very not very effective
  // 0 = immunity
  // 4 = double super-effective (for dual typing)
  const getTypeMatchup = (types, type2) => {
    let effectiveness = 1;

    if (types.length === 1) {
      if (getTypeEffectiveness(types[0].type.name).weakness.includes(type2)) {
        return 2;
      }

      if (getTypeEffectiveness(types[0].type.name).resistance.includes(type2)) {
        return 0.5;
      }

      if (getTypeEffectiveness(types[0].type.name).immunity.includes(type2)) {
        return 0;
      }

      return 1;
    } else if (types.length === 2) {
      if (getTypeEffectiveness(types[0].type.name).weakness.includes(type2)) {
        effectiveness *= 2;
      } else if (getTypeEffectiveness(types[0].type.name).resistance.includes(type2)) {
        effectiveness *= 0.5;
      } else if (getTypeEffectiveness(types[0].type.name).immunity.includes(type2)) {
        effectiveness *= 0;
      }

      if (getTypeEffectiveness(types[1].type.name).weakness.includes(type2)) {
        effectiveness *= 2;
      } else if (getTypeEffectiveness(types[1].type.name).resistance.includes(type2)) {
        effectiveness *= 0.5;
      } else if (getTypeEffectiveness(types[1].type.name).immunity.includes(type2)) {
        effectiveness *= 0;
      }

      return effectiveness;
    }

    return effectiveness;
  };

  // Returns a CSS class name based on how effective a type is against this Pokémon.
  // This lets different cells in the defensive stats table be color coded.
  

  // This object defines which defensive abilities can change a Pokémon's type matchups.
  // Each entry maps an ability name to its custom effect for the defensive table.
  // This is used so the defensive stats can change when a supported ability is selected.
  const DEFENSIVE_ABILITY_EFFECTS = {
    'flash-fire': { label: 'Flash Fire', modifiers: { fire: 0 } },
    'levitate': { label: 'Levitate', modifiers: { ground: 0 } },
    'water-absorb': { label: 'Water Absorb', modifiers: { water: 0 } },
    'volt-absorb': { label: 'Volt Absorb', modifiers: { electric: 0 } },
    'lightning-rod': { label: 'Lightning Rod', modifiers: { electric: 0 } },
    'storm-drain': { label: 'Storm Drain', modifiers: { water: 0 } },
    'motor-drive': { label: 'Motor Drive', modifiers: { electric: 0 } },
    'sap-sipper': { label: 'Sap Sipper', modifiers: { grass: 0 } },
    'thick-fat': { label: 'Thick Fat', modifiers: { fire: 0.5, ice: 0.5 } },
    'heatproof': { label: 'Heatproof', modifiers: { fire: 0.5 } },
    'dry-skin': { label: 'Dry Skin', modifiers: { fire: 2, water: 0 } },
    'well-baked-body': { label: 'Well-Baked Body', modifiers: { fire: 0 } },
    'eelevate': { label: 'Eelevate', modifiers: { ground: 0 } },
    'filter': { label: 'Filter', modifiers: { __reducedSuperEffective: 0.75 } },
    'fluffy': { label: 'Fluffy', modifiers: { fire: 2} },
    'solid-rock': { label: 'Solid Rock', modifiers: { __reducedSuperEffective: 0.75 } },
    'water-bubble': { label: 'Water Bubble', modifiers: { water: 0.5 } },
  };

  // This function returns the default "Base" tab plus any supported defensive ability tabs.
  // This ensures the defensive table can show either normal matchups or an ability-adjusted matchup.
  const getAbilityDefenseTabs = (pokemon) => {
    const tabs = [{ id: 'base', label: 'Other abilities' }];

    if (!pokemon?.abilities?.length) {
      return tabs;
    }

    pokemon.abilities.forEach((entry) => {
      const abilityName = entry.ability.name;
      const support = DEFENSIVE_ABILITY_EFFECTS[abilityName];

      if (support) {
        tabs.push({
          id: abilityName,
          label: support.label,
        });
      }
    });

    return tabs;
  };

  // This returns the matchup value for a given attacking type after applying any defensive ability.
  // If no supported ability is active, it falls back to the normal Pokémon matchup.
  const getAbilityAdjustedMatchup = (types, attackingType, activeAbility = 'base') => {
    const baseMatchup = getTypeMatchup(types, attackingType);

    if (activeAbility === 'base') {
      return baseMatchup;
    }

    const abilityConfig = DEFENSIVE_ABILITY_EFFECTS[activeAbility];
    if (!abilityConfig) {
      return baseMatchup;
    }

    // Special case for abilities that reduce super-effective damage.
    // Filter and Solid Rock reduce damage taken from super-effective attacks by 25%.
    if (
      abilityConfig.modifiers.__reducedSuperEffective &&
      baseMatchup > 1
    ) {
      return Number((baseMatchup * abilityConfig.modifiers.__reducedSuperEffective).toFixed(2));
    }

    if (Object.prototype.hasOwnProperty.call(abilityConfig.modifiers, attackingType)) {
      return abilityConfig.modifiers[attackingType];
    }

    return baseMatchup;
  };

  // This updates the defensive table coloring logic to reflect the selected ability.
  // Example: Flash Fire makes Fire-type attacks x0 instead of normal defense.
  const effectiveString = (types, type, abilityName = 'base') => {
    const number = getAbilityAdjustedMatchup(types, type, abilityName);

    if (number === 0.25) {
      return 'veryVeryNotEffective';
    } else if (number === 0.5) {
      return 'notVeryEffective';
    } else if (number === 1) {
      return 'neutral';
    } else if (number > 1 && number <= 2) {
      return 'superEffective';
    } else if (number > 2 && number <= 4) {
      return 'superDuperEffective';
    } else {
      return 'immune';
    }
  };

  // When a Pokémon is clicked, reset the defensive ability tabs to the default "Base" view.
  const handlePokemonClick = async (pokemon) => {
    setSelectedPokemon(pokemon);
    setSelectedForm(null);
    setFormVariants([]);
    setSelectedAbilityForDefense('base');
    setIsFormLoading(true);

    try {
      await loadPokemonForms(pokemon);
    } finally {
      setIsFormLoading(false);
    }
  };

  // When the detail panel closes, reset the defensive ability state as well.
  const closeDetails = () => {
    setSelectedPokemon(null);
    setSelectedForm(null);
    setFormVariants([]);
    setSelectedAbilityForDefense('base');
  };

  // Sets search by name filter.
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Sets type filter.
  const handleTypeFilterChange = (e) => {
    setSelectedTypeFilter(e.target.value);
  };

  const handleAbilityFilterChange = (e) => {
    setSelectedAbilityFilter(e.target.value);
  };

  const availableAbilities = Array.from(
    new Set(
      pokemonList.flatMap((pokemon) =>
        (pokemon.abilities || []).map((ability) => ability.ability.name)
      )
    )
  ).sort();

  // Checks type name, Pokémon name, and ability to filter the table.
  const filteredPokemon = pokemonList.filter((pokemon) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesType =
      !selectedTypeFilter ||
      pokemon.types.some((type) => type.type.name === selectedTypeFilter);
    const matchesSearchTerm =
      !normalizedSearch ||
      pokemon.name.toLowerCase().includes(normalizedSearch);
    const matchesAbility =
      !selectedAbilityFilter ||
      (pokemon.abilities || []).some(
        (ability) => ability.ability.name === selectedAbilityFilter
      );

    return matchesType && matchesSearchTerm && matchesAbility;
  });

  // handles sorting columns by ascending or descending
  const handleSort = (columnName) => {
    if (columnName === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  // Sorts the Pokédex number, name, type and stats column by ascending or descending.
  const sortedPokemon = filteredPokemon.sort((a, b) => {
    if (sortColumn === 'Pokedex number') {
      const idA = parseInt(a.id);
      const idB = parseInt(b.id);
      return sortDirection === 'asc' ? idA - idB : idB - idA;
    } else if (sortColumn === 'name') {
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

  // Changes icon from up to down depending on whether the column is sorted ascending or descending.
  const renderSortIcon = (columnName) => {
    if (sortColumn === columnName) {
      return sortDirection === 'asc' ? '▲' : '▼';
    }
    return null;
  };

  // Capitalize a name to keep UI display cleaner.
  const Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Use the selected form if it exists; otherwise use the base Pokémon data.
  // This allows the detail panel to re-render correctly when switching tabs.
  const currentPokemon = selectedForm || selectedPokemon;
  const defensiveAbilityTabs = getAbilityDefenseTabs(currentPokemon);

  return (
    <div className='pokedex-page-content'>
      <body>
        <h1>Pokedex</h1>

        {selectedPokemon ? (
          <div className='details'>
            {/* Detail page (when a Pokémon is clicked) ------------------------------------------ */}
            <button onClick={closeDetails} className='closeDetails'>Return to search table</button>

            {/* Render alternate form tabs if the Pokémon has more than one form. */}
            {isFormLoading && <div className='form-loading'>Loading forms...</div>}

            {formVariants.length > 0 && (
              <div className='form-tabs'>
                {formVariants.map((form) => (
                  <button
                    key={form.name}
                    type='button'
                    className={selectedForm?.name === form.name ? 'active-form-tab' : 'form-tab'}
                    onClick={() => {
                      setSelectedForm(form);
                      setSelectedAbilityForDefense('base');
                    }}
                  >
                    {form.formLabel || formatName(form.name)}
                  </button>
                ))}
              </div>
            )}

            <span className='detailedSpan'>
              <h2>Pokemon</h2>
              Pokedex #{currentPokemon.id}

              <br></br>
              <h3>{Capitalize(currentPokemon.name)}</h3>
              <br></br>
              <img
                src={currentPokemon.sprites.other['official-artwork'].front_default}
                alt=""
                className='detailImage'
              />
              <br></br>

              <h2>Types</h2>
              {currentPokemon.types.map((type) => (
                <img key={type.type.name} src={typeImages[type.type.name]} alt={type.type.name} />
              ))}
              <h2>Abilities</h2>
              {currentPokemon.abilities.map((ability) => (
                <span key={ability.ability.name}>-{ability.ability.name} </span>
              ))}
            </span>

            <span className='detailedSpan'>
              <h2>Base Stats</h2>
              <h3>HP</h3>
              {currentPokemon.stats[0].base_stat}
              <h3>Attack</h3>
              {currentPokemon.stats[1].base_stat}
              <h3>Defense</h3>
              {currentPokemon.stats[2].base_stat}
              <h3>Sp.Atk</h3>
              {currentPokemon.stats[3].base_stat}
              <h3>Sp.Def</h3>
              {currentPokemon.stats[4].base_stat}
              <h3>Speed</h3>
              {currentPokemon.stats[5].base_stat}
              <h3>Total</h3>
              {currentPokemon.stats[0].base_stat +
                currentPokemon.stats[1].base_stat +
                currentPokemon.stats[2].base_stat +
                currentPokemon.stats[3].base_stat +
                currentPokemon.stats[4].base_stat +
                currentPokemon.stats[5].base_stat}
            </span>

            <span className='detailedSpan'>
              <h2>Defensive Stats</h2>
              aka what types are super effective or not very effective on this pokemon
              <br></br>
              <br></br>
              x2 and x4 = Super effective damage
              <br></br>
              x1 = Neutral damage
              <br></br>
              x0.5 and x0.25 = Not very effective
              <br></br>
              x0 = This pokemon is immune to this type
              <br></br>
              <br></br>

              <table className='defensive-stat-table'>
                <thead>
                  <tr>
                    <th>Normal</th>
                    <th>Fighting</th>
                    <th>Flying</th>
                    <th>Poison</th>
                    <th>Ground</th>
                    <th>Rock</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className={effectiveString(currentPokemon.types, 'normal', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'normal', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'fighting', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'fighting', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'flying', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'flying', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'poison', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'poison', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'ground', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'ground', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'rock', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'rock', selectedAbilityForDefense)}
                    </td>
                  </tr>

                  <tr>
                    <th>Bug</th>
                    <th>Ghost</th>
                    <th>Steel</th>
                    <th>Fire</th>
                    <th>Water</th>
                    <th>Grass</th>
                  </tr>

                  <tr>
                    <td className={effectiveString(currentPokemon.types, 'bug', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'bug', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'ghost', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'ghost', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'steel', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'steel', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'fire', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'fire', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'water', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'water', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'grass', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'grass', selectedAbilityForDefense)}
                    </td>
                  </tr>

                  <tr>
                    <th>Electric</th>
                    <th>Psychic</th>
                    <th>Ice</th>
                    <th>Dragon</th>
                    <th>Dark</th>
                    <th>Fairy</th>
                  </tr>

                  <tr>
                    <td className={effectiveString(currentPokemon.types, 'electric', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'electric', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'psychic', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'psychic', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'ice', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'ice', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'dragon', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'dragon', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'dark', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'dark', selectedAbilityForDefense)}
                    </td>
                    <td className={effectiveString(currentPokemon.types, 'fairy', selectedAbilityForDefense)}>
                      x{getAbilityAdjustedMatchup(currentPokemon.types, 'fairy', selectedAbilityForDefense)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* These tabs appear only when the selected Pokémon has a supported defensive ability. */}
              {defensiveAbilityTabs.length > 1 && (
                <div className='ability-defense-tabs'>
                  {defensiveAbilityTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type='button'
                      className={selectedAbilityForDefense === tab.id ? 'active-form-tab' : 'form-tab'}
                      onClick={() => setSelectedAbilityForDefense(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              <br></br>
              More information like moveset or in-game location<br></br> of this pokemon can be found <a href={"https://pokemondb.net/pokedex/" + currentPokemon.name} target="_blank" rel="noreferrer"> here</a>
            </span>
          </div>
        ) : (
          // This is the page with all the Pokémon (initial page) ----------------------------------
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

            <h3>Filter pokemon by ability</h3>
                <select
                  id="abilityFilter"
                  className='typeFilter'
                  value={selectedAbilityFilter}
                  onChange={handleAbilityFilterChange}
                >
                  <option value="">No filter</option>
                  {availableAbilities.map((ability) => (
                    <option key={ability} value={ability}>
                      {Capitalize(ability.replace('-', ' '))}
                    </option>
                  ))}
                </select>

            {/* The Pokémon table */}
            <div className="pokemon-list">
              <h3>Click on the coloumn headers to sort from acending to descending or vise versa</h3>
              <table className="pokemon-table">
                {/* Table headers */}
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

                {/* Table body / Pokémon entries */}
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
                        {pokemon.stats[0].base_stat + pokemon.stats[1].base_stat + pokemon.stats[2].base_stat + pokemon.stats[3].base_stat + pokemon.stats[4].base_stat + pokemon.stats[5].base_stat}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {isLoading && (
                <div className="loading-container" aria-live="polite">
                  <div className="loading-spinner" />
                </div>
              )}
            </div>
          </div>
        )}
      </body>
    </div>
  );
};

export default PokedexPage;

