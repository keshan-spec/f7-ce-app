import store from "./store.js"
import app from "./app.js"
var $ = Dom7

const garageStore = store.getters.myGarage
const myPostsStore = store.getters.myPosts
const myTagsStore = store.getters.myTags

var isFetchingPosts = false
var totalPostPages = 1
var totalFPostPages = 1

var currentPostPage = 1
var currentFPostPage = 1

export function displayProfile(user) {
  if (!user) return
  // Profile Head
  document.querySelector('.profile-head .profile-username').textContent = `@${user.username}`
  document.querySelector('.profile-head .profile-name').textContent = `${user.first_name} ${user.last_name}`

  // Profile Image
  const profileImage = document.querySelector('.profile-head .profile-image')
  if (user.profile_image) {
    profileImage.style.backgroundImage = `url('${user.profile_image}')`
  } else {
    profileImage.style.backgroundImage = `url('assets/img/default-profile.png')` // Fallback image
  }

  // Profile Links
  const profileLinks = user.profile_links
  if (profileLinks.instagram) {
    document.querySelector('#instagram').setAttribute('href', `https://www.instagram.com/${profileLinks.instagram}`)
  }
  if (profileLinks.facebook) {
    document.querySelector('#facebook').setAttribute('href', `https://www.facebook.com/${profileLinks.facebook}`)
  }
  if (profileLinks.tiktok) {
    document.querySelector('#tiktok').setAttribute('href', `https://www.tiktok.com/${profileLinks.tiktok}`)
  }
  if (profileLinks.youtube) {
    document.querySelector('#youtube').setAttribute('href', `https://www.youtube.com/${profileLinks.youtube}`)
  }
}

export function displayGarage(garage) {
  if (!garage) return

  const garageContainer = document.getElementById('profile-garage') // Make sure you have a container with this ID
  garageContainer.innerHTML = createGarageContent(garage)
}

function createGarageContent(garages) {
  // Elements for current and past vehicles
  const currentVehiclesList = document.querySelector('.current-vehicles-list')
  const pastVehiclesList = document.querySelector('.past-vehicles-list')

  // Function to generate vehicle HTML
  function generateVehicleHTML(vehicle) {
    return `
    <li>
        <a href="/profile-garage-vehicle-view/${vehicle.id}" class="item">
            <div class="imageWrapper">
                <div class="image-square image-rounded"
                    style="background-image:url('${vehicle.cover_photo}');"></div>
            </div>
            <div class="in">
                <div>
                    ${vehicle.make} ${vehicle.model} - ${vehicle.variant || ''}
                </div>
            </div>
        </a>
    </li>
    `
  }

  // Sort vehicles into current and past vehicles
  garages.forEach(vehicle => {
    if (vehicle.owned_until === "" || vehicle.owned_until.toLowerCase() === "present") {
      currentVehiclesList.innerHTML += generateVehicleHTML(vehicle)
    } else {
      pastVehiclesList.innerHTML += generateVehicleHTML(vehicle)
    }
  })
}

function generatePostGridItem(post) {
  return post.media.map(media => {
    const isVideo = media.media_type === "video" || media.media_url.includes('.mp4')
    if (isVideo) {
      return `
        <a href="profile-post-view?id=${post.id}" class="grid-item" data-src="${media.media_url}">
          <div class="video-square">
            <video>
              <source src="${media.media_url}" type="video/mp4" />
            </video>
          </div>
        </a>`
    } else {
      return `
      <a href="profile-post-view?id=${post.id}" class="grid-item" data-src="${media.media_url}">
          <div class="image-square" style="background-image:url('${media.media_url}');"></div>
      </a>`
    }
  }).join('')
}

// Function to add empty grid items to fill the grid
function addEmptyGridItems(count) {
  let emptyItems = ''
  for (let i = 0; i < count; i++) {
    emptyItems += `
            <div class="grid-item empty-item">
                <div class="image-square" style="background-color: #f0f0f0;"></div>
            </div>`
  }
  return emptyItems
}

garageStore.onUpdated((garage) => {
  if (garage) {
    createGarageContent(garage)
  }
})

myPostsStore.onUpdated((data) => {
  if (data && data.data) {
    const posts = data.data
    totalPostPages = data.total_pages


    if (data.page === data.total_pages) {
      // hide preloader
      $('.infinite-scroll-preloader.posts-tab').hide()
    }

    // Select the container where the posts will be displayed
    const profileGrid = document.getElementById('profile-grid-posts')

    profileGrid.innerHTML = '' // Clear the grid before adding new posts

    // Calculate the number of posts and decide if we need to add empty items
    function fillGridWithPosts(posts) {
      const gridColumns = 3 // Assuming a 3-column grid
      const gridSize = posts.length
      const emptySlotsNeeded = (gridColumns - (gridSize % gridColumns)) % gridColumns

      posts.forEach(post => {
        profileGrid.innerHTML += generatePostGridItem(post)
      })

      // Add empty slots to fill the grid
      profileGrid.innerHTML += addEmptyGridItems(emptySlotsNeeded)

      // Add the "big image" as the last item, if the grid is filled correctly
      if (emptySlotsNeeded === 0 && posts.length > 0) {
        profileGrid.innerHTML += `
            <a href="profile-post-view?id=${posts[posts.length - 1].id}" class="grid-item large-item">
                <div class="image-large" style="background-image:url('${posts[posts.length - 1].media[0].media_url}');"></div>
            </a>`
      }
    }

    // Call the function to fill the grid
    fillGridWithPosts(posts)
  }
})

myTagsStore.onUpdated((data) => {
  if (data && data.data) {
    const posts = data.data
    totalFPostPages = data.total_pages

    if (data.page === data.total_pages) {
      // hide preloader
      $('.infinite-scroll-preloader.tags-tab').hide()
    }


    // Select the container where the posts will be displayed
    const profileGrid = document.getElementById('profile-grid-tags')

    profileGrid.innerHTML = '' // Clear the grid before adding new posts

    // Calculate the number of posts and decide if we need to add empty items
    function fillGridWithPosts(posts) {
      const gridColumns = 3 // Assuming a 3-column grid
      const gridSize = posts.length
      const emptySlotsNeeded = (gridColumns - (gridSize % gridColumns)) % gridColumns

      posts.forEach(post => {
        profileGrid.innerHTML += generatePostGridItem(post)
      })

      // Add empty slots to fill the grid
      profileGrid.innerHTML += addEmptyGridItems(emptySlotsNeeded)

      // Add the "big image" as the last item, if the grid is filled correctly
      if (emptySlotsNeeded === 0 && posts.length > 0) {
        profileGrid.innerHTML += `
            <a href="profile-post-view?id=${posts[posts.length - 1].id}" class="grid-item large-item">
                <div class="image-large" style="background-image:url('${posts[posts.length - 1].media[0].media_url}');"></div>
            </a>`
      }
    }

    // Call the function to fill the grid
    fillGridWithPosts(posts)
  }
})


$(document).on('page:init', '.page[data-name="profile"]', function (e) {
  app.popup.create({
    el: '.links-popup',
    swipeToClose: 'to-bottom'
  })
})

$(document).on('page:afterin', '.page[data-name="profile"]', function (e) {
  // Infinite Scroll
  const infiniteScrollContent = document.querySelector('.profile-landing-page.infinite-scroll-content')

  infiniteScrollContent.addEventListener('infinite', async function () {
    if (isFetchingPosts) return

    const activeTab = document.querySelector('.profile-tabs .tab-link-active')
    const activeTabId = activeTab.id

    if (!activeTabId || activeTabId === 'my-garage') return

    const getterFunc = activeTabId === 'my-posts' ? 'getMyPosts' : 'getMyTags'

    isFetchingPosts = true

    if (activeTabId === 'my-posts') {
      currentPostPage++

      if (currentPostPage <= totalPostPages) {
        await store.dispatch(getterFunc, currentPostPage)
        isFetchingPosts = false
      }
    } else {
      currentFPostPage++

      if (currentFPostPage <= totalFPostPages) {
        await store.dispatch(getterFunc, currentFPostPage)
        isFetchingPosts = false
      }
    }
  })
})

$(document).on('page:init', '.page[data-name="profile-garage-vehicle-view"]', function (e) {
  var garageId = e.detail.route.params.id

  if (!garageId) return

  const garage = garageStore.getGarageById(garageId)
})