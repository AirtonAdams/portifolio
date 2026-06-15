import '../styles/reset.css'
import '../styles/style.css'
import Swiper from 'swiper/bundle'
import 'swiper/css/bundle'

document.querySelector('#open-menu').addEventListener('click', () => {
  document.body.classList.add('menu-expanded')
})

document.querySelector('#close-menu').addEventListener('click', () => {
  document.body.classList.remove('menu-expanded')
})

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