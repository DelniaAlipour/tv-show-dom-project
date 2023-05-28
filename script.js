let episodeContainer;
let allShows = [];
let allEpisodes = [];
let isShowingShowsListing = true;

async function setup() {
  allShows = await getAllShows();
  const rootElem = document.getElementById("root");

  const showSelect = createShowSelect(allShows);
  const episodeSelect = createEpisodeSelect();
  episodeSelect.style.display = "none"; // Hide episode selector initially

  episodeContainer = document.createElement("div");
  episodeContainer.classList.add("episode-container");

  const showsListingContainer = document.createElement("div");
  showsListingContainer.classList.add("shows-listing-container");

  const backButton = document.createElement("button");
  backButton.textContent = "Back to Shows Listing";
  backButton.classList.add("back-button");
  backButton.style.display = "none";
  backButton.addEventListener("click", () => {
    showsListingContainer.style.display = "block";
    episodeContainer.style.display = "none";
    backButton.style.display = "none";
    episodeSelect.style.display = "none";
    searchContainer.style.display = "none";

    isShowingShowsListing = true;
    showSelect.value = "";
    episodeSelect.value = "all";
    searchInput.value = "";
    matchedCount.textContent = "";
  });

  const matchedCount = document.createElement("div");
  matchedCount.setAttribute("id", "matchedCount");
  matchedCount.classList.add("matched-count");

  const searchContainer = document.createElement("div");
  searchContainer.classList.add("search-container");
  searchContainer.style.display = "none"; // Hide search container initially

  const searchInput = document.createElement("input");
  searchInput.setAttribute("type", "text");
  searchInput.setAttribute("id", "searchInput");
  searchInput.setAttribute("placeholder", "Search episodes");
  searchInput.addEventListener("input", updateSearchResults);

  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(matchedCount);

  rootElem.appendChild(showSelect);
  rootElem.appendChild(episodeSelect);
  rootElem.appendChild(backButton);
  rootElem.appendChild(searchContainer);
  rootElem.appendChild(showsListingContainer);
  rootElem.appendChild(episodeContainer);

  showSelect.addEventListener("change", async () => {
    const selectedShowId = showSelect.value;
    const episodeList = await fetchEpisodeList(selectedShowId);

    allEpisodes = episodeList;
    makePageForEpisodes(allEpisodes, episodeContainer);
    populateEpisodeSelect(allEpisodes);
    episodeSelect.style.display = "block"; // Show episode selector for the selected show
    searchContainer.style.display = "block"; // Show search container for the selected show

    if (isShowingShowsListing) {
      showsListingContainer.style.display = "none";
      episodeContainer.style.display = "block";
      backButton.style.display = "block";
      episodeSelect.value = "all"; // Reset episode selector value
      isShowingShowsListing = false;
    }
  });

  episodeSelect.addEventListener("change", () => {
    const selectedEpisodeId = episodeSelect.value;
    if (selectedEpisodeId === "all") {
      displayAllEpisodes();
    } else {
      highlightSelectedEpisode(selectedEpisodeId);
    }
  });

  // Create shows listing
  const showsListing = document.createElement("div");
  showsListing.classList.add("shows-listing");

  allShows.forEach((show) => {
    const showCard = document.createElement("div");
    showCard.classList.add("show-card");

    const showName = document.createElement("h2");
    showName.textContent = show.name;

    const showImage = document.createElement("img");
    showImage.setAttribute("src", show.image.medium);
    showImage.setAttribute("alt", show.name);

    const showSummary = document.createElement("div");
    showSummary.innerHTML = show.summary;

    const showGenres = document.createElement("p");
    showGenres.textContent = `Genres: ${show.genres.join(", ")}`;

    const showStatus = document.createElement("p");
    showStatus.textContent = `Status: ${show.status}`;

    const showRating = document.createElement("p");
    showRating.textContent = `Rating: ${show.rating.average}`;

    const showRuntime = document.createElement("p");
    showRuntime.textContent = `Runtime: ${show.runtime} minutes`;

    showCard.appendChild(showName);
    showCard.appendChild(showImage);
    showCard.appendChild(showSummary);
    showCard.appendChild(showGenres);
    showCard.appendChild(showStatus);
    showCard.appendChild(showRating);
    showCard.appendChild(showRuntime);

    showsListing.appendChild(showCard);
  });

  showsListingContainer.appendChild(showsListing);

  // Show the shows listing by default
  showsListingContainer.style.display = "block";
  episodeContainer.style.display = "none";
  backButton.style.display = "none";
  isShowingShowsListing = true;
}

async function getAllShows() {
  const response = await fetch("https://api.tvmaze.com/shows");
  const shows = await response.json();
  return shows;
}

async function fetchEpisodeList(showId) {
  const response = await fetch(
    `https://api.tvmaze.com/shows/${showId}/episodes`
  );
  const episodeList = await response.json();
  return episodeList;
}

function createShowSelect(shows) {
  const selectInput = document.createElement("select");
  selectInput.setAttribute("id", "showSelect");

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Select a show";
  defaultOption.setAttribute("value", "");
  defaultOption.disabled = true;
  defaultOption.selected = true;
  selectInput.appendChild(defaultOption);

  const sortedShows = shows.sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" })
  );
  sortedShows.forEach((show) => {
    const option = document.createElement("option");
    option.textContent = show.name;
    option.setAttribute("value", show.id);
    selectInput.appendChild(option);
  });

  return selectInput;
}

function createEpisodeSelect() {
  const selectInput = document.createElement("select");
  selectInput.setAttribute("id", "episodeSelect");

  return selectInput;
}

function makePageForEpisodes(episodeList, episodeContainer) {
  episodeContainer.innerHTML = "";

  episodeList.forEach((episode) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-episode-id", episode.id);

    const title = document.createElement("h2");
    title.innerHTML = `${episode.name} - S${zeroPad(episode.season)}E${zeroPad(
      episode.number
    )}`;

    const image = document.createElement("img");
    image.setAttribute("src", episode.image.medium);
    image.setAttribute("alt", `Poster for ${episode.name}`);

    const summary = document.createElement("div");
    const highlightedSummary = highlightMatchedWords(
      episode.summary,
      searchInput.value.toLowerCase()
    );
    summary.innerHTML = highlightedSummary;

    card.appendChild(title);
    card.appendChild(image);
    card.appendChild(summary);
    episodeContainer.appendChild(card);
  });
}

function populateEpisodeSelect(episodeList) {
  const episodeSelect = document.getElementById("episodeSelect");
  episodeSelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.textContent = "All Episodes";
  allOption.setAttribute("value", "all");
  episodeSelect.appendChild(allOption);

  episodeList.forEach((episode) => {
    const option = document.createElement("option");
    option.textContent = `S${zeroPad(episode.season)}E${zeroPad(
      episode.number
    )} - ${episode.name}`;
    option.setAttribute("value", episode.id);
    episodeSelect.appendChild(option);
  });
}

function displayAllEpisodes() {
  const episodeCards = document.querySelectorAll(".card");
  episodeCards.forEach((card) => {
    card.style.display = "block";
  });
  updateMatchedCount(episodeCards);
}

function highlightSelectedEpisode(episodeId) {
  const episodeCards = document.querySelectorAll(".card");
  episodeCards.forEach((card) => {
    if (card.getAttribute("data-episode-id") === episodeId) {
      card.style.display = "block";
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      card.style.display = "none";
    }
  });
  updateMatchedCount(episodeCards);
}

function updateSearchResults(event) {
  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput.value.toLowerCase();

  const episodeCards = document.querySelectorAll(".card");
  episodeCards.forEach((card) => {
    const episodeName = card.querySelector("h2").textContent.toLowerCase();
    const episodeSummary = card.querySelector("div");

    if (
      episodeName.includes(searchTerm) ||
      episodeSummary.textContent.toLowerCase().includes(searchTerm)
    ) {
      card.style.display = "block";
      const highlightedSummary = highlightMatchedWords(
        episodeSummary.innerHTML,
        searchTerm
      );
      episodeSummary.innerHTML = highlightedSummary;
    } else {
      card.style.display = "none";
    }
  });
  updateMatchedCount(episodeCards);
}

function highlightMatchedWords(content, searchTerm) {
  // not working properly :(
  if (!searchTerm) {
    return content;
  }

  const regex = new RegExp(`\\b${searchTerm}\\b`, "gi");
  const highlightedContent = content.replaceAll(
    regex,
    (match) => `<span class="highlight">${match}</span>`
  );

  return highlightedContent;
}

function updateMatchedCount(episodeCards) {
  const matchedCount = document.getElementById("matchedCount");
  const count = Array.from(episodeCards).filter(
    (card) => card.style.display !== "none"
  ).length;

  matchedCount.textContent = `${count} episode(s) matched`;
}

function zeroPad(num) {
  return num.toString().padStart(2, "0");
}

setup();
