import store from "./store.js"
import app from "./app.js"
import { getGargeById } from "./api/garage.js"
var $ = Dom7

const garageStore = store.getters.myGarage
const myPostsStore = store.getters.myPosts
const myTagsStore = store.getters.myTags
const pathStore = store.getters.getPathData

var isFetchingPosts = false
var totalPostPages = 1
var totalFPostPages = 1

var currentPostPage = 1
var currentFPostPage = 1


// Garage posts
var totalGaragePostPages = 1
var currentGaragePostPage = 1

// Garage tags
var totalGarageTagPages = 1
var currentGarageTagPage = 1

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

// Calculate the number of posts and decide if we need to add empty items
function fillGridWithPosts(posts, profileGridID) {
  // Select the container where the posts will be displayed
  const profileGrid = document.getElementById(profileGridID)

  profileGrid.innerHTML = '' // Clear the grid before adding new posts

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

    // Call the function to fill the grid
    fillGridWithPosts(posts, 'profile-grid-posts')
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

    // Call the function to fill the grid
    fillGridWithPosts(posts, 'profile-grid-tags')
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

$(document).on('page:init', '.page[data-name="profile-garage-vehicle-view"]', async function (e) {
  var garageId = e.detail.route.params.id

  if (!garageId) {
    app.dialog.alert('Garage not found')
    app.views.main.router.back()
    return
  }

  let cachedData = null
  try {
    if (pathStore && pathStore.value[`/garage/${garageId}`]) {
      cachedData = pathStore.value[`/garage/${garageId}`]
    }
  } catch (error) {
    console.error('Error fetching cached data:', error)
  }

  // Infinite Scroll
  const infiniteScrollContent = document.querySelector('.profile-landing-page.infinite-scroll-content')

  infiniteScrollContent.addEventListener('infinite', async function () {
    if (isFetchingPosts) return

    const activeTab = document.querySelector('.profile-tabs .tab-link-active')
    const activeTabId = activeTab.id

    if (!activeTabId) return

    const getterFunc = activeTabId === 'garage-posts' ? 'setGarageViewPosts' : 'setGarageViewTags'

    isFetchingPosts = true

    if (activeTabId === 'garage-posts') {
      currentGaragePostPage++

      if (currentGaragePostPage <= totalGaragePostPages) {
        await store.dispatch(getterFunc, garageId, currentGaragePostPage)
        isFetchingPosts = false
      }
    } else {
      currentGarageTagPage++

      if (currentGarageTagPage <= totalGarageTagPages) {
        await store.dispatch(getterFunc, garageId, currentGarageTagPage)
        isFetchingPosts = false
      }
    }
  })

  if (cachedData) {
    store.dispatch('setGarageViewPosts', garageId, 1)
    store.dispatch('setGarageViewTags', garageId, 1)
    updateProfilePage(cachedData)
    return
  }

  $('.init-loader').show()

  const garage = await getGargeById(garageId)
  if (!garage) {
    $('.init-loader').hide()
    app.dialog.alert('Garage not found')
    app.views.main.router.back()
    return
  }

  // Assuming `path` is a dynamic path like '/garage/2'
  store.dispatch('setPathData', {
    path: `/garage/${garageId}`,
    data: garage,
  })

  // Call the function to update the page
  updateProfilePage(garage)
  $('.init-loader').hide()
  store.dispatch('setGarageViewPosts', garageId, 1)
  store.dispatch('setGarageViewTags', garageId, 1)
})

store.getters.getGarageViewPosts.onUpdated((data) => {
  if (data && data.data) {
    const posts = data.data

    totalGaragePostPages = data.total_pages

    // if there is only one page of posts or no posts
    if ((data.page == data.total_pages) || (data.total_pages == 0)) {
      // hide preloader
      $('.infinite-scroll-preloader.garage-posts-tab').hide()
    }

    // Call the function to fill the grid
    fillGridWithPosts(posts, 'garage-posts-tab')
  }
})

store.getters.getGarageViewTags.onUpdated((data) => {
  if (data && data.data) {
    const posts = data.data
    totalGarageTagPages = data.total_pages

    // if there is only one page of posts or no posts
    if ((data.page == data.total_pages) || (data.total_pages == 0)) {
      // hide preloader
      $('.infinite-scroll-preloader.garage-tags-tab').hide()
    }

    // Call the function to fill the grid
    fillGridWithPosts(posts, 'garage-tags-tab')
  }
})

// Function to update the HTML with the data
function updateProfilePage(data) {
  // Update the cover photo
  const coverPhotoElement = document.querySelector('.vehicle-profile-background')
  if (coverPhotoElement) {
    coverPhotoElement.style.backgroundImage = `url('${data.cover_photo}')`
  }

  // Update the profile image
  const profileImageElement = document.querySelector('.vehicle-profile-image')
  if (profileImageElement) {
    profileImageElement.style.backgroundImage = `url('${data.owner.profile_image}')`
    profileImageElement.setAttribute('href', `/profile/${data.owner_id}`)
  }

  // Update the vehicle make and model
  const vehicleTitleElement = document.querySelector('.profile-garage-intro h1')
  if (vehicleTitleElement) {
    vehicleTitleElement.textContent = `${data.make} ${data.model}`
  }

  // Update the ownership information
  const ownershipInfoElement = document.querySelector('.garage-owned-information')
  if (ownershipInfoElement) {
    const ownedUntilText = data.owned_until ? ` - ${data.owned_until}` : ' - Present'
    ownershipInfoElement.textContent = `Owned from ${data.owned_since}${ownedUntilText}`
  }

  // Update the vehicle description
  const vehicleDescriptionElement = document.querySelector('.garage-vehicle-description')
  if (vehicleDescriptionElement) {
    vehicleDescriptionElement.textContent = data.short_description
  }

  // Additional updates (like posts, tags, etc.) can be handled here
  // Assuming you would dynamically update the posts or tags based on the data provided
}