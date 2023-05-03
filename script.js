function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  const inputContainer = document.createElement("div");

  // Create a search input
  const searchInput = document.createElement("input");
  searchInput.setAttribute("type", "text");
  searchInput.setAttribute("placeholder", "Search episodes");
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredEpisodes = episodeList.filter((episode) => {
      const name = episode.name.toLowerCase();
      const summary = episode.summary
        .toLowerCase()
        .replace(/<\/?[^>]+(>|$)/g, "");
      return name.includes(searchTerm) || summary.includes(searchTerm);
    });
    renderEpisodes(filteredEpisodes);
    searchCountElem.textContent = `${filteredEpisodes.length} episode(s) match your search`;
  });

  // Create a count element for the search results
  const searchCountElem = document.createElement("p");
  searchCountElem.textContent = `${episodeList.length} episode(s)`;

  // Create a select input
  const selectInput = document.createElement("select");
  const allEpisodesOption = document.createElement("option");
  allEpisodesOption.textContent = "All Episodes";
  allEpisodesOption.setAttribute("value", "all");
  selectInput.appendChild(allEpisodesOption);
  episodeList.forEach((episode, index) => {
    const option = document.createElement("option");
    option.textContent = `S${zeroPad(episode.season)}E${zeroPad(
      episode.number
    )} - ${episode.name}`;
    option.setAttribute("value", index);
    selectInput.appendChild(option);
  });
  selectInput.addEventListener("change", () => {
    const selectedOption = selectInput.options[selectInput.selectedIndex];
    const index = selectedOption.value;
    if (index === "all") {
      renderEpisodes(episodeList);
    } else {
      const selectedEpisode = episodeList[index];
      renderEpisodes([selectedEpisode]);
    }
  });

  inputContainer.appendChild(searchInput);
  inputContainer.appendChild(searchCountElem);
  inputContainer.appendChild(selectInput);

  const episodeContainer = document.createElement("div");
  episodeContainer.classList.add("episode-container");

  function renderEpisodes(episodes) {
    episodeContainer.innerHTML = "";
    episodes.forEach((episode) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const title = document.createElement("h2");
      title.textContent = `${episode.name} - S${zeroPad(
        episode.season
      )}E${zeroPad(episode.number)}`;

      const image = document.createElement("img");
      image.setAttribute("src", episode.image.medium);
      image.setAttribute("alt", `Poster for ${episode.name}`);

      const summary = document.createElement("div");
      summary.innerHTML = episode.summary;

      card.appendChild(title);
      card.appendChild(image);
      card.appendChild(summary);
      episodeContainer.appendChild(card);
    });
    searchCountElem.textContent = `${episodes.length} episode(s)`;
  }
  rootElem.appendChild(inputContainer);
  rootElem.appendChild(episodeContainer);

  renderEpisodes(episodeList);
}

function zeroPad(num) {
  return num.toString().padStart(2, "0");
}

window.onload = setup;
