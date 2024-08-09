import store from "./store.js"
var $ = Dom7

const garageStore = store.getters.myGarage
const myPostsStore = store.getters.myPosts
const myTagsStore = store.getters.myTags

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
    document.querySelector('.profile-link[data-location="https://www.instagram.com"]').setAttribute('href', `https://www.instagram.com/${profileLinks.instagram}`)
  }
  if (profileLinks.facebook) {
    document.querySelector('.profile-link[data-location="https://www.facebook.com"]').setAttribute('href', `https://www.facebook.com/${profileLinks.facebook}`)
  }
  if (profileLinks.tiktok) {
    document.querySelector('.profile-link[data-location="https://www.tiktok.com"]').setAttribute('href', `https://www.tiktok.com/${profileLinks.tiktok}`)
  }
  if (profileLinks.youtube) {
    document.querySelector('.profile-link[data-location="https://www.youtube.com"]').setAttribute('href', `https://www.youtube.com/${profileLinks.youtube}`)
  }
}

// click event for profile links
$('.profile-link').on('click', function () {
  const location = $(this).data('location')
  const username = $(this).data('username')
  console.log(location, username)

})

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
        <a href="profile-garage-car-view?id=${vehicle.id}" class="item">
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

garageStore.onUpdated((garage) => {
  if (garage) {
    createGarageContent(garage)
  }
})

myPostsStore.onUpdated((posts) => {
  if (posts) {
    // Select the container where the posts will be displayed
    const profileGrid = document.getElementById('profile-grid-posts')

    profileGrid.innerHTML = '' // Clear the grid before adding new posts

    // Function to generate the HTML for a post
    function generatePostGridItem(post) {
      return post.media.map(media => {
        if (media.media_type === "video") {
          return `
                <a href="profile-post-view?id=${post.id}" class="grid-item">
                    <video class="image-square" src="${media.media_url}"></video>
                </a>`
        } else {
          return `
                <a href="profile-post-view?id=${post.id}" class="grid-item">
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

myTagsStore.onUpdated((posts) => {
  if (posts) {
    // Select the container where the posts will be displayed
    const profileGrid = document.getElementById('profile-grid-tags')

    profileGrid.innerHTML = '' // Clear the grid before adding new posts

    // Function to generate the HTML for a post
    function generatePostGridItem(post) {
      return post.media.map(media => {
        if (media.media_type === "video") {
          return `
                <a href="profile-post-view?id=${post.id}" class="grid-item">
                  <div class="video-square">
                    <video>
                      <source src="${media.media_url}" type="video/mp4" />
                    </video>
                  </div>
                </a>`
        } else {
          return `
                <a href="profile-post-view?id=${post.id}" class="grid-item">
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
