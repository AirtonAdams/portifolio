import '../styles/reset.css'
import '../styles/style.css'
import Swiper from 'swiper/bundle'
import 'swiper/css/bundle'

const btnAbrir = document.querySelector('#open-menu')
const btnFechar = document.querySelector('#close-menu')
const linksNav = document.querySelectorAll('.nav__link a')

btnAbrir.addEventListener('click', () => {
  document.body.classList.add('menu-expanded')
})

btnFechar.addEventListener('click', () => {
  document.body.classList.remove('menu-expanded')
})

linksNav.forEach(link => {
  link.addEventListener('click', () => {
    document.body.classList.remove('menu-expanded')
  })
})

// Importa todas as imagens da pasta como URLs
const languageIcons = import.meta.glob('/src/images/languagesLogos/*.svg', {
  eager: true,
  query: '?url',
  import: 'default'
});

// Função auxiliar pra buscar a URL certa pelo nome da linguagem
function getLanguageIconUrl(languageName) {
  const key = `/src/images/languagesLogos/${languageName.toLowerCase()}-original.svg`;
  return languageIcons[key] || '';
}

const token = import.meta.env.VITE_GITHUB_TOKEN
const usuario = 'AirtonAdams'
const CACHE_KEY = 'github_repos'

async function buscarRepositorios() {
  const cache = sessionStorage.getItem(CACHE_KEY)

  if (cache) {
    //console.log('usando cache')
    renderizarRepos(JSON.parse(cache))
    return
  }

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `{
        user(login: "${usuario}") {
          repositories(first: 100) {
            nodes {
              databaseId
              name
              description
              url
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  size
                  node {
                    name
                  }
                }
              }
            }
          }
        }
      }`
    })
  })

  const json = await response.json()

  if (json.errors) {
    console.error('Erro da API:', json.errors)
    return
  }

  const repos = json.data.user.repositories.nodes
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(repos))
  renderizarRepos(repos)
}

function renderizarRepos(repos) {
  const container = document.querySelector('#repositorios')

  repos.forEach(repo => {
    container.innerHTML += `
      <div class="repo swiper-slide">
        <a href="${repo.url}" target="_blank">
          <p class="repo-name">${repo.name}</p>
          <p class="repo-description">${repo.description || 'Sem descrição'}</p>
          <div class="repo-languages">
            ${repo.languages.edges.map(lang => `
              <span class="repo-language">
                <img src="${getLanguageIconUrl(lang.node.name)}" alt="${lang.node.name}" />
              </span>
            `).join('')}
          </div>
        </a>
      </div>
    `
  })

  const swiper = new Swiper('.swiper', {
  // Optional parameters
  direction: 'horizontal',
  loop: true,
  effect: "coverflow",
  coverflowEffect: {
    rotate: 5,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: true,
  },
  slidesPerView: "auto",
  spaceBetween: 25,
  grabCursor: true,
  centeredSlides: true,

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

}

buscarRepositorios()