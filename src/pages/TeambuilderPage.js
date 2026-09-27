import React, { useState, useEffect } from 'react';
import '../App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import PokedexPage1 from './PokedexPage';
import HomePage from './HomePage';

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
import pokeballImg from '../Typeicons/Pokeball.png';

const TeamBuilderPage = ({
  pokemonList: pokemonListFromApp = [],
  isLoading: isLoadingFromApp = true,
  team = Array(6).fill(null),
  setTeam = () => {},
  teamSize = 6,
  setTeamSize = () => {},
}) => {
  // Capitalize a name to keep UI display cleaner.
  const Capitalize = (str) => {
    if (!str) return '';
    return str
      .split(/[-\s]+/)
      .map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1) : '')
      .join(' ');
  };
  // Main Pokémon list state
  // This holds all loaded Pokémon data from the National Pokédex.
  const [pokemonList, setPokemonList] = useState([]);

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
  const [isLoading, setIsLoading] = useState(true);

  // used for searching and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [selectedAbilityFilter, setSelectedAbilityFilter] = useState('');
  const [selectedMoveFilter, setSelectedMoveFilter] = useState('');
  const [selectedAbilityForDefense, setSelectedAbilityForDefense] = useState('base');
  const [selectedMoveCategory, setSelectedMoveCategory] = useState('momentum');
  const [isNameDropdownOpen, setIsNameDropdownOpen] = useState(true);

  // const pokemonList = pokemonListFromApp;
  // const isLoading = isLoadingFromApp;

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
  const EXCLUDED_FORM_NAMES = new Set([
    'pikachu-original-cap',
    'pikachu-hoenn-cap',
    'pikachu-sinnoh-cap',
    'pikachu-unova-cap',
    'pikachu-kalos-cap',
    'pikachu-alola-cap',
    'pikachu-partner-cap',
    'pikachu-world-cap',
    'pikachu-rock-star',
    'pikachu-belle',
    'pikachu-pop-star',
    'pikachu-phd',
    'pikachu-libre',
    'pikachu-cosplay',
    'castform-sunny',
    'castform-rainy',
    'castform-snowy',
    'dudunsparce-three-segment',
    'basculin-blue-striped',
    'basculin-white-striped',
    'keldeo-resolute',
    'aegislash-blade',
    'magearna-original',
    'miraidon-drive-mode',
    'miraidon-aquatic-mode',
    'miraidon-glide-mode',
    'miraidon-low-power-mode',
    'koraidon-limited-build',
    'koraidon-sprinting-build',
    'koraidon-swimming-build',
    'koraidon-gliding-build',
    'gimmighoul-roaming',
    'squawkabilly-blue-plumage',
    'squawkabilly-yellow-plumage',
    'squawkabilly-white-plumage',
    'tatsugiri-curly',
    'tatsugiri-droopy',
  ]);

  const shouldExcludeForm = (name) => {
    if (!name) return false;

    if (EXCLUDED_FORM_NAMES.has(name)) {
      return true;
    }

    if (name.startsWith('pikachu-')) return true;
    if (name.startsWith('castform-')) return true;
    if (name.startsWith('basculin-') && name !== 'basculin') return true;
    if (name.startsWith('squawkabilly-') && name !== 'squawkabilly') return true;
    if (name.includes('gmax')) return true;
    if (name.includes('totem')) return true;

    return false;
  };

  // This effect runs once on page load and fetches the full National Pokédex.
  // Each Pokémon is then individually fetched so the table can display all needed stats.
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
        const dexResponse = await fetch(
          `https://pokeapi.co/api/v2/pokedex/${NATIONAL_DEX_ID}`
        );

        if (!dexResponse.ok) {
          throw new Error(`Failed to fetch National Pokédex: ${dexResponse.status}`);
        }

        const dexData = await dexResponse.json();

        const pokemonSpeciesIds = (dexData.pokemon_entries || [])
          .map((entry) => {
            const speciesUrl = entry?.pokemon_species?.url;
            if (!speciesUrl) return null;
            return Number(speciesUrl.split('/').filter(Boolean).pop());
          })
          .filter((id) => id && id > 0 && id < MAX_POKEMON_ID)
          .sort((a, b) => a - b);

        const batchSize = 25;
        const results = [];

        for (let i = 0; i < pokemonSpeciesIds.length; i += batchSize) {
          const batch = pokemonSpeciesIds.slice(i, i + batchSize);

          const batchResults = await Promise.allSettled(
            batch.map(async (speciesId) => {
              const speciesResponse = await fetch(
                `https://pokeapi.co/api/v2/pokemon-species/${speciesId}`
              );

              if (!speciesResponse.ok) {
                return [];
              }

              const speciesData = await speciesResponse.json();
              const varieties = (speciesData.varieties || []).filter(
                (variety) => !shouldExcludeForm(variety.pokemon.name)
              );

              if (!varieties.length) {
                return [await fetchPokemonDetails(speciesId)];
              }

              const expandedForms = await Promise.allSettled(
                varieties.map(async (variety) => {
                  const variantId = Number(
                    variety.pokemon.url.split('/').filter(Boolean).pop()
                  );

                  const variant = await fetchPokemonDetails(variantId);

                  return {
                    ...variant,
                    id: speciesId,
                    formLabel: variety.is_default
                      ? 'Default'
                      : formatName(variant.name),
                  };
                })
              );

              return expandedForms
                .filter((result) => result.status === 'fulfilled')
                .map((result) => result.value);
            })
          );

          results.push(
            ...batchResults.flatMap((result) =>
              result.status === 'fulfilled' ? result.value : []
            )
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

  useEffect(() => {
    setTeam((currentTeam) => {
      const resizedTeam = Array(teamSize).fill(null);

      for (let i = 0; i < Math.min(currentTeam.length, teamSize); i++) {
        resizedTeam[i] = currentTeam[i];
      }

      return resizedTeam;
    });
  }, [teamSize, setTeam]);

  const addPokemonToTeam = (pokemon) => {
    setTeam((currentTeam) => {
      const openIndex = currentTeam.findIndex((slot) => slot === null);

      if (openIndex === -1) {
        return currentTeam;
      }

      const updatedTeam = [...currentTeam];
      updatedTeam[openIndex] = pokemon;
      return updatedTeam;
    });
  };

  const removePokemonFromTeam = (teamIndex) => {
    setTeam((currentTeam) => {
      const updatedTeam = [...currentTeam];
      updatedTeam[teamIndex] = null;
      return updatedTeam;
    });
  };


  // const searchResults = pokemonList
  //   .filter((pokemon) => pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()))
  //   .slice(0, 12);
    
  // Sets search by name filter.
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setIsNameDropdownOpen(true);
  };

  // Sets type filter.
  const handleTypeFilterChange = (e) => {
    setSelectedTypeFilter(e.target.value);
  };

  const handleAbilityFilterChange = (e) => {
    setSelectedAbilityFilter(e.target.value);
  };

  const handleMoveFilterChange = (e) => {
    setSelectedMoveFilter(e.target.value);
  };

  const availableAbilities = Array.from(
    new Set(
      pokemonList.flatMap((pokemon) =>
        (pokemon.abilities || []).map((ability) => ability.ability.name)
      )
    )
  ).sort();

  const availableMoves = Array.from(
    new Set(
      pokemonList.flatMap((pokemon) =>
        (pokemon.moves || []).map((move) => move.move.name)
      )
    )
  ).sort();

  // Checks type name for filter, checks Pokémon name to filter, checks ability to filter, and checks Gen 9 move filter.
  const matchesPokemonFilters = (pokemon, currentSearchTerm = '') => {
    const normalizedSearch = currentSearchTerm.trim().toLowerCase();

    const matchesType =
      !selectedTypeFilter ||
      pokemon.types.some((type) => type.type.name === selectedTypeFilter);

    const matchesSearchTerm =
      !normalizedSearch ||
      pokemon.name.toLowerCase().includes(normalizedSearch);

    const matchesAbility =
      !selectedAbilityFilter ||
      pokemon.abilities.some((ability) => ability.ability.name === selectedAbilityFilter);

    const matchesMove =
    !selectedMoveFilter ||
      (pokemon.moves || []).some((move) => move.move.name === selectedMoveFilter);

    return matchesType && matchesSearchTerm && matchesAbility && matchesMove;
  };

  const searchResults = pokemonList
    .filter((pokemon) => matchesPokemonFilters(pokemon, searchTerm))
    .slice(0, 10000);

  // Checks type name for filter, checks Pokémon name to filter, checks ability to filter, and checks Gen 9 move filter.
  const filteredPokemon = pokemonList.filter((pokemon) => matchesPokemonFilters(pokemon, searchTerm));


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

  

  // Use the selected form if it exists; otherwise use the base Pokémon data.
  // This allows the detail panel to re-render correctly when switching tabs.
  const currentPokemon = selectedForm || selectedPokemon;
  const defensiveAbilityTabs = getAbilityDefenseTabs(currentPokemon);

  const TEAM_NOTABLE_MOVES = {
    momentum: [
      'baton-pass',
      'chilly-reception',
      'flip-turn',
      'parting-shot',
      'shed-tail',
      'teleport',
      'uturn',
      'voltswitch',
    ],
    entryHazards: [
      'spikes',
      'stealth-rock',
      'toxic-spikes',
      'sticky-web',
    ],
    hazardRemoval: [
      'defog',
      'tidy-up',
      'mortal-spin',
      'rapid-spin',
      'court-change',
      'psychic-fangs',
      'brick-break',
    ],
    healing: [
      'recover',
      'roost',
      'rest',
      'moonlight',
      'synthesis',
      'wish',
      'heal-pulse',
    ],
    positivePriority: [
      'quick-attack',
      'extreme-speed',
      'aqua-jet',
      'shadow-sneak',
      'accelerock',
      'vacuum-wave',
      'fake-out',
      'ice-shard',
      'water-shuriken',
      'mach-punch',
      'sucker-punch',
      'first-impression',
      'feint',
    ],
    setup: [
      'swords-dance',
      'nasty-plot',
      'calm-mind',
      'dragons-dance',
      'growth',
      'shell-smash',
      'coil',
      'quiver-dance',
      'bulk-up',
      'work-up',
      'agility',
      'curse',
      'meditate',
    ],
    disrupting: [
      'encore',
      'taunt',
      'torment',
      'disable',
      'imprison',
      'perish-song',
      'roar',
      'whirlwind',
      'dragon-tail',
      'trick',
      'switcheroo',
      'haze',
      'clear-smog',
      'knock-off',
    ],
  };

  const teamMembers = (team || []).filter(Boolean);

  const formatTypeName = (typeName) => {
    if (!typeName) return '';
    return typeName.charAt(0).toUpperCase() + typeName.slice(1);
  };

  // Render a type badge with the matching type icon so the team breakdown feels more like a Pokédex UI.
  const renderTypeBadge = (typeName) => {
    const icon = typeImages[typeName];
    
    return (
      <span className='type-badge'>
        <img src={icon} alt={typeName} className='type-badge-icon' />
      </span>
    );
  };

  // Team composition data for the detailed breakdown section.
  const typeDistribution = Object.entries(
    teamMembers.reduce((acc, pokemon) => {
      (pokemon.types || []).forEach(({ type }) => {
        acc[type.name] = (acc[type.name] || 0) + 1;
      });
      return acc;
    }, {})
  )
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));

  // This combines the team’s defensive coverage across all attack types.
  // It shows how many members are weak to, resist, or immune to each attack type.
  const combinedTypeBreakdown = Object.keys(typeImages)
    .map((attackType) => {
      const weakTo = teamMembers.filter(
        (pokemon) => getTypeMatchup(pokemon.types, attackType) > 1
      );
      const resistTo = teamMembers.filter((pokemon) => {
        const matchup = getTypeMatchup(pokemon.types, attackType);
        return matchup > 0 && matchup < 1;
      });
      const immuneTo = teamMembers.filter(
        (pokemon) => getTypeMatchup(pokemon.types, attackType) === 0
      );

      return {
        attackType,
        weakTo,
        resistTo,
        immuneTo,
      };
    })
    .filter(
      ({ weakTo, resistTo, immuneTo }) =>
        weakTo.length || resistTo.length || immuneTo.length
    );

  const moveCoverageByCategory = Object.entries(TEAM_NOTABLE_MOVES).reduce((acc, [categoryKey, moveNames]) => {
    const normalizedMoveNames = new Set(
      moveNames.map((moveName) => moveName.toLowerCase().trim())
    );

    const moveRows = Array.from(
      new Set(
        teamMembers
          .flatMap((pokemon) => (pokemon.moves || []).map((move) => move.move.name.toLowerCase()))
          .filter((moveName) => normalizedMoveNames.has(moveName))
      )
    )
      .map((moveName) => ({
        moveName,
        members: teamMembers.filter((pokemon) =>
          (pokemon.moves || []).some((move) => move.move.name.toLowerCase() === moveName)
        ),
      }))
      .sort((a, b) => a.moveName.localeCompare(b.moveName));

    acc[categoryKey] = moveRows;
    return acc;
  }, {});

  const selectedMoveCoverage = moveCoverageByCategory[selectedMoveCategory] || [];

  // Speed data is displayed with a red-to-green scale so slower mons are darker red
  // and faster mons approach yellow then green as they near 250 speed.
  const speedData = teamMembers.map((pokemon) => {
    const speed = pokemon.stats?.find((stat) => stat.stat.name === 'speed')?.base_stat ?? 0;
    const ratio = Math.min(Math.max(speed / 250, 0), 1);
    return {
      pokemonName: pokemon.name,
      speed,
      ratio,
      fillColor: `hsl(${ratio * 120}, 80%, 48%)`,
    };
  });

  return (
    <div className='Teambuilder-page-content'>
      <body>
        <h1>Teambuilder</h1>

        <div className='team-builder-layout'>
          <div className='filters-column'>
            <div>
              {/* Search and filter controls */}
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

              <h3>Filter by ability</h3>
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

              <h3>Filter by Gen 9 moveset</h3>
              <select
                id="moveFilter"
                className='typeFilter'
                value={selectedMoveFilter}
                onChange={handleMoveFilterChange}
              >
                <option value="">No filter</option>
                {availableMoves.map((move) => (
                  <option key={move} value={move}>
                    {Capitalize(move.replace('-', ' '))}
                  </option>
                ))}
              </select>

              <h3>Search Pokemon to add to Team</h3>
              <input
                type="text"
                placeholder="Search Pokemon by Name"
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() => setIsNameDropdownOpen(true)}
                className='nameFilter'
              />

              {isNameDropdownOpen && (
                <div className='name-search-dropdown'>
                  {searchResults.length > 0 ? (
                    searchResults.map((pokemon) => (
                      <button
                        key={pokemon.name}
                        type='button'
                        className='name-search-dropdown-button'
                        onMouseDown={(event) => {
                          event.preventDefault();
                          addPokemonToTeam(pokemon);
                          setSearchTerm('');
                          setIsNameDropdownOpen(false);
                        }}
                      >
                        <img
                          src={pokemon.sprites?.front_default || pokemon.sprites?.other?.['official-artwork']?.front_default}
                          alt={pokemon.name}
                        />
                        <span>{Capitalize(pokemon.name)}</span>
                      </button>
                    ))
                  ) : (
                    <div className='name-search-empty'>
                      No Pokémon found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {!selectedPokemon && (
            <aside className='team-panel'>
              <h3>Team</h3>

              <div className='team-size-controls'>
                <label htmlFor='team-size'>Team size: {teamSize}</label>
                <input
                  id='team-size'
                  type='range'
                  min='6'
                  max='18'
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                />
              </div>

              <div
                className='team-grid'
                style={{
                  gridTemplateColumns: `repeat(${Math.min(teamSize, 6)}, minmax(52px, 1fr))`,
                }}
              >
                {team.map((member, index) => (
                  <button
                    key={`team-slot-${index}`}
                    type='button'
                    className={member ? 'team-slot-button filled' : 'team-slot-button empty'}
                    onClick={() => member && removePokemonFromTeam(index)}
                    title={member ? `Remove ${Capitalize(member.name)} from team` : 'Empty team slot'}
                    aria-label={member ? `Remove ${Capitalize(member.name)} from team` : 'Empty team slot'}
                  >
                    {member ? (
                      <img
                        src={member.sprites?.front_default || member.sprites?.other?.['official-artwork']?.front_default}
                        alt={member.name}
                      />
                    ) : (
                      <img src={pokeballImg} alt="Empty slot" />
                    )}
                  </button>
                ))}
              </div>
            </aside>
          )}
        </div>

        <div className='team-breakdown-section'>
          <h2>Detailed Team Breakdown</h2>

          {teamMembers.length === 0 ? (
            <p className='team-breakdown-empty'>
              Add Pokémon to your team to see detailed matchups and stats.
            </p>
          ) : (
            <div className='team-breakdown-grid'>
              {/* Type count summary: how many of each type are represented on the team. */}
              <div className='team-breakdown-card'>
                <h3>Team Type Distribution</h3>
                <table className='breakdown-table'>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeDistribution.map(({ type, count }) => (
                      <tr key={type}>
                        <td>{renderTypeBadge(type)}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Defensive matchups combine all team members together, showing how many are weak to/resist each type. */}
              <div className='team-breakdown-card'>
                <h3>Combined Weaknesses / Resistances</h3>
                <table className='breakdown-table'>
                  <thead>
                    <tr>
                      <th>Attack Type</th>
                      <th>Weak</th>
                      <th>Resist</th>
                      <th>Immune</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedTypeBreakdown.map(({ attackType, weakTo, resistTo, immuneTo }) => (
                      <tr key={attackType}>
                        <td>{renderTypeBadge(attackType)}</td>
                        <td>
                          {weakTo.length
                            ? `${weakTo.length}`
                            : '0'}
                        </td>
                        <td>
                          {resistTo.length
                            ? `${resistTo.length}`
                            : '0'}
                        </td>
                        <td>
                          {immuneTo.length
                            ? `${immuneTo.length}`
                            : '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Competitive move coverage is adjustable via TEAM_NOTABLE_MOVES above. */}
              <div className='team-breakdown-card'>
                <h3>Notable Competitive Moves</h3>

                <div className='move-category-tabs'>
                  {Object.entries(TEAM_NOTABLE_MOVES).map(([categoryKey, moveNames]) => (
                    <button
                      key={categoryKey}
                      type='button'
                      className={
                        selectedMoveCategory === categoryKey
                          ? 'move-category-tab active'
                          : 'move-category-tab'
                      }
                      onClick={() => setSelectedMoveCategory(categoryKey)}
                    >
                      {categoryKey
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (letter) => letter.toUpperCase())}
                    </button>
                  ))}
                </div>

                <table className='breakdown-table notable-moves-table'>
                  <thead>
                    <tr>
                      <th>Move</th>
                      <th>Pokémon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMoveCoverage.length > 0 ? (
                      selectedMoveCoverage.map(({ moveName, members }) => (
                        <tr key={moveName}>
                          <td>{Capitalize(moveName.replace('-', ' '))}</td>
                          <td className='move-pokemon-sprites'>
                            {members.map((pokemon) => (
                              <button
                                key={`${moveName}-${pokemon.name}`}
                                type='button'
                                className='move-pokemon-sprite'
                                title={Capitalize(pokemon.name)}
                                aria-label={Capitalize(pokemon.name)}
                              >
                                <img
                                  src={pokemon.sprites?.front_default || pokemon.sprites?.other?.['official-artwork']?.front_default}
                                  alt={pokemon.name}
                                />
                              </button>
                            ))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2">No notable moves found in this category.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Speed bar: darker red = slower, yellow/green = faster. */}
              <div className='team-breakdown-card'>
                <h3>Speed Comparison</h3>
                <table className='breakdown-table'>
                  <thead>
                    <tr>
                      <th>Pokémon</th>
                      <th>Speed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {speedData.map(({ pokemonName, speed, ratio, fillColor }) => (
                      <tr key={pokemonName}>
                        <td>{Capitalize(pokemonName)}</td>
                        <td>
                          <div className='speed-row'>
                            <span className='speed-number'>{speed}</span>
                            <div className='speed-bar-track'>
                              <div
                                className='speed-bar-fill'
                                style={{
                                  width: `${Math.max(6, ratio * 100)}%`,
                                  background: `linear-gradient(90deg, rgb(255, 30, 30), ${fillColor})`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </body>
    </div>
  );
};

export default TeamBuilderPage;