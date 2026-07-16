const contenedor = document.querySelector("#catalogo");

//--------- Carga la base de datos por primera vez ----------------

let pokedexLocal = [];
async function cargarPokemons() {
  try {
    pokedexLocal = [];

    contenedor.innerHTML = `<p class="font">Cargando la Pokédex, por favor espera...</p>`;

    for (let i = 1; i <= 150; i++) {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);

      if (!res.ok) {
        throw new Error("El servidor no responde: " + res.status);
      }

      const data = await res.json();
      pokedexLocal.push(data);
    }

    console.log("Carga completa:", pokedexLocal);
    // pintamos los 150 pokemons en pantalla al tener la data lista
    renderizarPokemons("ver todos");

    Toastify({
      text: "¡Los 150 Pokémon han sido cargados en memoria!",
      duration: 3000,
      destination: "https://github.com/apvarun/toastify-js",
      newWindow: true,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #eb0400, #efef07)",
        color: "black",
      },
      onClick: function () {},
    }).showToast();
  } catch (error) {
    console.error("Hubo un error cargando la PokeAPI:", error);
    contenedor.innerHTML = "<p>Hubo un error al cargar los datos.</p>";
  }
}

cargarPokemons();

// --------- INSERCION DE LAS TARJETAS POKEMON ---------------

function insertarTarjeta(pokemon, filtro) {
  let tarjeta = document.createElement("div");
  tarjeta.classList.add("pokeContenedor");

  // agregamos los colores para las clases

  const pokeColores = {
    normal: "#A8A77A",
    grass: "#7AC74C",
    fire: "#EE8130",
    water: "#6390F0",
    electric: "#F7D02C",
    fight: "#C22E28",
    poison: "#A33EA1",
    dragon: "#6F35FC",
    ice: "#96D9D6",
    ground: "#E2BF65",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    fairy: "#D685AD",
    psychic: "#F95587",
  };

  // guardamos el tipo que se muestra en la tarjeta por default

  let tipoAMostrar = pokemon.types[0].type.name;

  if (filtro !== "ver todos") {
    let tipoCoincidente = pokemon.types.find((t) => t.type.name === filtro);

    if (tipoCoincidente) {
      tipoAMostrar = tipoCoincidente.type.name;
    }
  }

  // insertamos en el HTML la tarjeta con sus clases dinamicas

  tarjeta.innerHTML = `
            <img src="${pokemon.sprites.other.dream_world.front_default}" alt="" class="pokeImg">
            <h2 class="pokeName">${pokemon.name}</h2>
            <div class="pokeClass ${tipoAMostrar}"><p>${tipoAMostrar}</p></div>
            <button class="pokeInfo" id="info${pokemon.id}">Pokedex info</button>
    `;

  contenedor.appendChild(tarjeta);

  const botonInfo = tarjeta.querySelector(`#info${pokemon.id}`);

  botonInfo.addEventListener("click", function () {
    console.log("¡Hiciste clic en el botón de:", pokemon.name);
    // 1. Creamos el contenedor del modal
    let modal = document.createElement("div");
    modal.classList.add("pantallaModal");

    // 2. Extraemos algunos datos útiles para mostrar
    const altura = pokemon.height / 10; // Convertimos decímetros a metros
    const peso = pokemon.weight / 10; // Convertimos hectogramos a kg

    const BadgesTipos = pokemon.types
      .map(
        (t) =>
          `<div class="pokeClasses ${t.type.name}"><p>${t.type.name}</p></div>`,
      )
      .join("");
    // 3. Rellenamos el HTML con las propiedades del objeto `pokemon`
    modal.innerHTML = `
      <div class="contenedorInfoModal">
        <button class="cerrarModal" id="cerrarModal">&times;</button>
        <img src="${pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default}" alt="${pokemon.name}" class="modalImg">
        <h2>#${pokemon.id} - ${pokemon.name.toUpperCase()}</h2>
        <div class="contenedorClases">
          ${BadgesTipos}
        </div>
        <div class="modalDetalles">
          <p><strong>Altura:  </strong> ${altura} m</p>
          <p><strong>Peso:  </strong> ${peso} kg</p>
        </div>

        <div class="modalStats">
          <h3 class="titulo">Estadísticas base</h3>
          <ul>
            ${pokemon.stats.map((stat) => `<li><strong>${stat.stat.name.toUpperCase()}:  </strong> ${stat.base_stat}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;

    // 4. Agregamos el modal al body
    contenedor.appendChild(modal);

    // 5. Lógica para cerrar el modal al hacer clic en el botón 'X'
    const btnCerrar = modal.querySelector("#cerrarModal");
    btnCerrar.addEventListener("click", () => {
      modal.remove();
    });

    // 6. Opcional: cerrar el modal al hacer clic fuera del contenido
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  });
  // cambiamos la propiedad dinamica de css para que sea del color del boton

  const divClase = tarjeta.querySelector(`.pokeClass`);
  const colorElegido = pokeColores[tipoAMostrar];

  divClase.style.setProperty("--color-dinamico", colorElegido);
}

// --------------- FILTRO SEGUN EL BOTON --------------------

function renderizarPokemons(filtro) {
  contenedor.innerHTML = "";

  if (filtro === "ver todos") {
    pokedexLocal.forEach((pokemon) => insertarTarjeta(pokemon));
  } else {
    // aplicamos el filtro
    const pokemonsFiltrados = pokedexLocal.filter((pokemon) =>
      pokemon.types.some((tipo) => tipo.type.name === filtro),
    );
    // pasamos el pokemon y el filtro a insertarTarjeta
    // para que nos permita jugar con las clases
    pokemonsFiltrados.forEach((pokemon) => insertarTarjeta(pokemon, filtro));
  }
}

// ------------ MAPEO DE BOTONES y callbacks activos por eventos -------------------

const btn = document.querySelectorAll(".btn");

btn.forEach((btn) => {
  btn.addEventListener("click", (evento) => {
    const botonOpimido = btn.textContent.toLowerCase();
    renderizarPokemons(botonOpimido);
  });
});
