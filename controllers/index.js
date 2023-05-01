const pokemons = require("../archive/pokemons.json");
const fs = require("fs");
const { faker } = require("@faker-js/faker");
const { StatusCodes } = require("http-status-codes");

const getAllPokemons = function(req, res) {
  res.status(StatusCodes.OK).json(pokemons.data);
};

const getPokemons = function(req, res) {
  const { type, name, page, limit } = req.query;

  let pokemonFilter = pokemons.data;

  if (type) {
    pokemonFilter = pokemonFilter?.filter(pokemon =>
      pokemon?.types?.includes(type.toLowerCase())
    );
  }

  if (name) {
    pokemonFilter = pokemonFilter?.filter(pokemon =>
      pokemon?.name?.includes(name.toLowerCase())
    );
  }

  if (page && limit) {
    let skip = (Number(page) - 1) * Number(limit);

    let final = pokemonFilter.slice(skip, Number(limit) + skip);

    res.status(StatusCodes.OK).json(final);
  }

  if (!page || limit) {
    res.status(StatusCodes.OK).json(pokemonFilter);
  }
};

const getSinglePokemon = function(req, res) {
  const { id } = req.params;

  let idFilter = Number(id);

  let pokemonFilter = pokemons.data;

  let indexID = pokemonFilter
    .map(pokemon => {
      return pokemon.id;
    })
    .indexOf(idFilter);

  let filterArray = {};
  if (1 < idFilter && idFilter < pokemons.totalPokemons) {
    filterArray = {
      pokemon: pokemonFilter[indexID],
      previousPokemon: pokemonFilter[indexID - 1],
      nextPokemon: pokemonFilter[indexID + 1],
    };
  }

  if (idFilter === 1) {
    filterArray = {
      pokemon: pokemonFilter[indexID],
      previousPokemon: pokemonFilter.slice(-1)[0],
      nextPokemon: pokemonFilter[indexID + 1],
    };
  }

  if (idFilter === pokemons.totalPokemons) {
    filterArray = {
      pokemon: pokemonFilter[indexID],
      previousPokemon: pokemonFilter[indexID - 1],
      nextPokemon: pokemonFilter.slice(1),
    };
  }

  if (
    idFilter > pokemons.totalPokemons &&
    pokemons.data.find(pokemon => pokemon.id === Number(id))
  ) {
    filterArray = {
      pokemon: pokemonFilter[indexID],
      previousPokemon: pokemonFilter[indexID - 1],
      nextPokemon: pokemonFilter[indexID + 1] || pokemonFilter[0],
    };
  }

  if (!pokemons.data.find(pokemon => pokemon.id === Number(id))) {
    const error = new Error("The Pokémon does not exists.");
    error.statusCode = 400;
    throw error;
  }
  res.status(StatusCodes.OK).json(filterArray);
};

const createPokemon = function(req, res, next) {
  const { name, id, types, url } = req.body;

  try {
    // Check for missing required data in request body
    if (!id || !name || !types || !url) {
      const error = new Error("Missing required data.");
      error.statusCode = 404;
      throw error;
    }

    // Pokemons can only have one or two types
    if (types?.length > 2) {
      const error = new Error("Pokémon can only have one or two types.");
      error.statusCode = 404;
      throw error;
    }

    const pokemonTypes = [
      "bug",
      "dragon",
      "fairy",
      "fire",
      "ghost",
      "ground",
      "normal",
      "psychic",
      "steel",
      "dark",
      "electric",
      "fighting",
      "flyingText",
      "grass",
      "ice",
      "poison",
      "rock",
      "water",
    ];
    // Check if the pokemon types are valid
    if (!types?.map(type => pokemonTypes.includes(type))) {
      const error = new Error("Pokémon’s type is invalid.");
      error.statusCode = 404;
      throw error;
    }

    // Check if the pokemon already exists in the database
    let dataPokemons = JSON.parse(fs.readFileSync("./archive/pokemons.json"));

    if (dataPokemons?.data.find(pokemon => pokemon.id === Number(id))) {
      const error = new Error("The Pokémon already exists.");
      error.statusCode = 500;
      throw error;
    }

    if (dataPokemons?.data.find(pokemon => pokemon.name === name)) {
      const error = new Error("The Pokémon already exists.");
      error.statusCode = 500;
      throw error;
    }

    // Create the new pokemon
    const newPokemon = {
      id: Number(id),
      name: name,
      types: types,
      height: faker.datatype.number({ max: 100 }),
      weight: faker.datatype.number({ max: 100 }),
      url: url,
      description: faker.company.catchPhrase(),
      abilities: faker.company.catchPhraseAdjective(),
    };
    res.status(StatusCodes.CREATED).json(newPokemon);

    // Add the new pokemon to the database
    dataPokemons.data.push(newPokemon);
    dataPokemons.totalPokemons = dataPokemons.data.length;

    // Save to the database
    fs.writeFileSync("./archive/pokemons.json", JSON.stringify(dataPokemons));
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json(error.message);
    next(error);
  }
};

module.exports = {
  getAllPokemons,
  getPokemons,
  getSinglePokemon,
  createPokemon,
};
