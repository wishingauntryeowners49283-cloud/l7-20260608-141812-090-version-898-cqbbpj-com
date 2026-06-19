import { MOVIES } from "./search-index.js";

const form = document.querySelector("[data-search-page-form]");
const input = document.querySelector("[data-global-search-input]");
const status = document.querySelector("[data-search-status]");
const results = document.querySelector("[data-search-results]");

const normalize = (value) => String(value || "").trim().toLowerCase();
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q") || "";

const createCard = (movie) => {
    const article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = `
        <a href="./${movie.url}">
            <div class="poster">
                <img src="./${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
                <span class="play-hover">▶</span>
                <span class="year-badge">${escapeHtml(movie.year)}</span>
            </div>
            <div class="card-body">
                <div class="card-kicker">${escapeHtml(movie.category)} · ${escapeHtml(movie.type)}</div>
                <h3>${escapeHtml(movie.title)}</h3>
                <p>${escapeHtml(movie.line)}</p>
                <div class="card-meta">
                    <span>${escapeHtml(movie.region)}</span>
                    <span>${escapeHtml(movie.genre)}</span>
                </div>
            </div>
        </a>`;
    return article;
};

const escapeHtml = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const render = (query) => {
    const normalized = normalize(query);
    const matches = normalized
        ? MOVIES.filter((movie) => normalize([
            movie.title,
            movie.year,
            movie.region,
            movie.type,
            movie.genre,
            movie.category,
            movie.tags.join(" "),
            movie.line
        ].join(" ")).includes(normalized))
        : MOVIES.slice(0, 60);

    results.innerHTML = "";
    if (!matches.length) {
        status.textContent = "没有找到相关影片";
        return;
    }
    status.textContent = normalized ? "已为你整理相关影片" : "热门影片推荐";
    matches.forEach((movie) => results.appendChild(createCard(movie)));
};

if (input) {
    input.value = initialQuery;
}

form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input?.value || "";
    const url = new URL(window.location.href);
    if (query.trim()) {
        url.searchParams.set("q", query.trim());
    } else {
        url.searchParams.delete("q");
    }
    window.history.replaceState(null, "", url.toString());
    render(query);
});

render(initialQuery);
