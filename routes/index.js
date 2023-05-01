const express = require("express");
const router = express.Router();
const {
  getAllPokemons,
  getPokemons,
  getSinglePokemon,
  createPokemon,
} = require("../controllers/index");

router.get("/", getAllPokemons);
router.get("/pokemons", getPokemons);
router.get("/pokemons/:id", getSinglePokemon);
router.post("/pokemons", createPokemon);

module.exports = router;
