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

    function generatePostGridItem(post) {
      return post.media.map(media => {
        const isVideo = media.media_type === "video" || media.media_url.includes('.mp4')
        if (isVideo) {
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

myTagsStore.onUpdated((posts) => {
  if (posts) {
    // Select the container where the posts will be displayed
    const profileGrid = document.getElementById('profile-grid-tags')

    profileGrid.innerHTML = '' // Clear the grid before adding new posts

    // Function to generate the HTML for a post
    function generatePostGridItem(post) {
      return post.media.map(media => {
        const isVideo = media.media_type === "video" || media.media_url.includes('.mp4')
        if (isVideo) {
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


let allowInfinite = true  // To control whether infinite scroll should be allowed

// Infinite Scroll for Posts Tab
$('#profile-grid-posts').on('infinite', function () {
  console.log('Infinite scroll triggered')

  // Exit if loading or all items are loaded
  if (!allowInfinite) return

  // Set loading state
  allowInfinite = false

  // Simulate an Ajax request to load more items
  setTimeout(function () {
    // Here you would make an actual request to fetch more posts
    // For this example, we'll simulate appending new content
    const newPosts = [
      {
        "id": "312",
        "media": [
          {
            "media_type": "image",
            "media_url": "https://example.com/image2.jpg",
            "media_mime_type": "image/jpg"
          }
        ]
      },
      // Add more posts as needed...
    ]

    // Append new posts
    newPosts.forEach(post => {
      $$('#profile-grid-posts').append(generatePostGridItem(post))
    })

    // Reset allowInfinite to true to allow more loading
    allowInfinite = true

    // If there are no more items to load, you can remove the infinite scroll
    // $$('tab[id="tab-2"]').off('infinite');
    // $$('.infinite-scroll-preloader').remove();

  }, 1000)  // Simulated delay for loading
})

// Function to generate post HTML (same as previous function)
function generatePostGridItem(post) {
  return post.media.map(media => {
    if (media.media_type === "video") {
      return `
                <a href="profile-post-view?id=${post.id}" class="grid-item">
                    <video class="video-square" controls>
                        <source src="${media.media_url}" type="${media.media_mime_type}">
                        Your browser does not support the video tag.
                    </video>
                </a>`
    } else {
      return `
                <a href="profile-post-view?id=${post.id}" class="grid-item">
                    <div class="image-square" style="background-image:url('${media.media_url}');"></div>
                </a>`
    }
  }).join('')
}