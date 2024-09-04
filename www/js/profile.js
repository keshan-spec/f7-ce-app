import store from "./store.js"
import app, {
  showToast
} from "./app.js"
import {
  addVehicleToGarage,
  deleteVehicleFromGarage,
  getGargeById,
  updateVehicleInGarage
} from "./api/garage.js"
import {
  getSessionUser
} from "./api/auth.js"
import {
  sendRNMessage
} from "./api/consts.js"
var $ = Dom7

var garageStore = store.getters.myGarage
var myPostsStore = store.getters.myPosts
var myTagsStore = store.getters.myTags
var pathStore = store.getters.getPathData
var userStore = store.getters.user
var refreshed = false;

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

// export function displayProfile(user, container = 'profile') {
//   if (!user) return

//   const containerElem = $(`.page[data-name="${container}"]`)

//   // Profile Head
//   document.querySelector('.profile-head .profile-username').textContent = `@${user.username}`
//   document.querySelector('.profile-head .profile-name').textContent = `${user.first_name} ${user.last_name}`

//   // Profile Image
//   const profileImage = document.querySelector('.profile-head .profile-image')
//   profileImage.style.backgroundImage = `url('${user.profile_image || 'assets/img/profile-placeholder.jpg'}')`

//   if (user.cover_image) {
//     $('.profile-background').css('background-image', `url('${user.cover_image}')`)
//   }

//   // Profile Links
//   const profileLinks = user.profile_links

//   if (profileLinks.instagram) {
//     document.querySelector('#instagram').setAttribute('href', `https://www.instagram.com/${profileLinks.instagram}`)
//   }

//   if (profileLinks.facebook) {
//     document.querySelector('#facebook').setAttribute('href', `https://www.facebook.com/${profileLinks.facebook}`)
//   }

//   if (profileLinks.tiktok) {
//     document.querySelector('#tiktok').setAttribute('href', `https://www.tiktok.com/${profileLinks.tiktok}`)
//   }

//   if (profileLinks.youtube) {
//     document.querySelector('#youtube').setAttribute('href', `https://www.youtube.com/${profileLinks.youtube}`)
//   }

//   // Display External Links
//   const externalLinks = profileLinks.external_links // Assuming this is an array like the example you provided
//   const linksList = document.querySelector('.profile-external-links ul')
//   linksList.innerHTML = '' // Clear any existing links

//   if (externalLinks && externalLinks.length > 0) {
//     externalLinks.forEach(linkObj => {
//       const listItem = document.createElement('li')
//       const link = document.createElement('a')
//       link.href = linkObj.link.url
//       link.target = '_blank'
//       link.textContent = linkObj.link.label
//       listItem.appendChild(link)
//       linksList.appendChild(listItem)
//     })
//   } else {
//     // Optionally handle the case where there are no external links
//     const noLinksItem = document.createElement('li')
//     noLinksItem.textContent = 'No external links available'
//     linksList.appendChild(noLinksItem)
//   }
// }

export function displayProfile(user, container = 'profile') {
  if (!user) return;

  // Select the container element
  const containerElem = document.querySelector(`.page[data-name="${container}"]`);
  if (!containerElem) {
    console.error(`Container element with data-name="${container}" not found.`);
    return;
  }

  // Profile Head
  const usernameElem = containerElem.querySelector('.profile-head .profile-username');
  const nameElem = containerElem.querySelector('.profile-head .profile-name');
  if (usernameElem) usernameElem.textContent = `@${user.username}`;
  if (nameElem) nameElem.textContent = `${user.first_name} ${user.last_name}`;

  // Profile Image
  const profileImageElem = containerElem.querySelector('.profile-head .profile-image');
  if (profileImageElem) {
    profileImageElem.style.backgroundImage = `url('${user.profile_image || 'assets/img/profile-placeholder.jpg'}')`;
  }

  // Cover Image
  if (user.cover_image) {
    const profileBackgroundElem = containerElem.querySelector('.profile-background');
    if (profileBackgroundElem) {
      profileBackgroundElem.style.backgroundImage = `url('${user.cover_image}')`;
    }
  }

  // Profile Links
  const profileLinks = user.profile_links || {};

  const setLinkHref = (selector, url) => {
    const linkElem = containerElem.querySelector(selector);
    if (linkElem) linkElem.setAttribute('href', url);
  };

  if (profileLinks.instagram) {
    setLinkHref('#instagram', `https://www.instagram.com/${profileLinks.instagram}`);
  } else {
    // set opacity to 0.5
    const instagramElem = containerElem.querySelector('#instagram');
    if (instagramElem) {
      instagramElem.style.opacity = 0.5;
      // disable the link
      instagramElem.onclick = (e) => e.preventDefault();
    }
  }

  if (profileLinks.facebook) {
    setLinkHref('#facebook', `https://www.facebook.com/${profileLinks.facebook}`);
  } else {
    // set opacity to 0.5
    const facebookElem = containerElem.querySelector('#facebook');
    if (facebookElem) {
      facebookElem.style.opacity = 0.5;
      // disable the link
      facebookElem.onclick = (e) => e.preventDefault();
    }
  }

  if (profileLinks.tiktok) {
    setLinkHref('#tiktok', `https://www.tiktok.com/${profileLinks.tiktok}`);
  } else {
    // set opacity to 0.5
    const tiktokElem = containerElem.querySelector('#tiktok');
    if (tiktokElem) {
      tiktokElem.style.opacity = 0.5;
      // disable the link
      tiktokElem.onclick = (e) => e.preventDefault();
    }
  }

  if (profileLinks.youtube) {
    setLinkHref('#youtube', `https://www.youtube.com/${profileLinks.youtube}`);
  } else {
    // set opacity to 0.5
    const youtubeElem = containerElem.querySelector('#youtube');
    if (youtubeElem) {
      youtubeElem.style.opacity = 0.5;
      // disable the link
      youtubeElem.onclick = (e) => e.preventDefault();
    }
  }

  // Display External Links
  const externalLinks = profileLinks.external_links || []; // Assuming this is an array
  const linksList = containerElem.querySelector('.profile-external-links ul');
  if (linksList) {
    linksList.innerHTML = ''; // Clear any existing links

    if (externalLinks.length > 0) {
      externalLinks.forEach(linkObj => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = linkObj.link.url;

        link.target = '_blank';
        link.textContent = linkObj.link.label;
        listItem.appendChild(link);
        linksList.appendChild(listItem);
      });
    } else {
      // Optionally handle the case where there are no external links
      const noLinksItem = document.createElement('li');
      noLinksItem.textContent = 'No external links available';
      linksList.appendChild(noLinksItem);
    }
  }
}


$(document).on('click', '.profile-external-links ul li a', function (e) {
  e.preventDefault()
  const url = new URL(e.target.href)
  console.log(url);
  window.open(url, '_blank')
})

export function displayGarage(garage) {
  if (!garage) return

  const garageContainer = document.getElementById('profile-garage') // Make sure you have a container with this ID
  garageContainer.innerHTML = createGarageContent(garage)
}

export function createGarageContent(garages, currentList, pastList) {
  // Elements for current and past vehicles
  const currentVehiclesList = document.querySelector(currentList)
  const pastVehiclesList = document.querySelector(pastList)

  if (!currentVehiclesList || !pastVehiclesList) {
    console.log('Invalid elements provided for current and past vehicles');
    return
  }

  currentVehiclesList.innerHTML = '' // Clear the list before adding new vehicles
  pastVehiclesList.innerHTML = '' // Clear the list before adding new vehicles

  if (garages.error) {
    currentVehiclesList.innerHTML = '<li>No current vehicles</li>'
    pastVehiclesList.innerHTML = '<li>No past vehicles</li>'
    return
  }

  // Function to generate vehicle HTML
  function generateVehicleHTML(vehicle) {
    return `
    <li>
        <a href="/profile-garage-vehicle-view/${vehicle.id}" class="item">
            <div class="imageWrapper">
                <div class="image-square image-rounded"
                    style="background-image:url('${vehicle.cover_photo || 'assets/img/placeholder1.jpg'}');">
                    </div>
            </div>
            <div class="in">
                <div>
                    ${vehicle.make} ${vehicle.model}
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

  if (currentVehiclesList.innerHTML === '') {
    currentVehiclesList.innerHTML = '<li>No current vehicles</li>'
  }

  if (pastVehiclesList.innerHTML === '') {
    pastVehiclesList.innerHTML = '<li>No past vehicles</li>'
  }
}

function generatePostGridItem(post) {
  if (!post.media || post.media.length === 0) return ''

  const media = post.media[0] // Get the first media item
  const isVideo = media.media_type === "video" || media.media_url.includes('.mp4')

  // <video playsinline>
  //           <source src="${media.media_url}" type="video/mp4" />
  //         </video>
  if (isVideo) {
    return `
      <a href="/post-view/${post.id}" class="grid-item" data-src="${media.media_url}">
        <div class="video-square">
          
        </div>
      </a>`
  } else {
    return `
      <a href="/post-view/${post.id}" class="grid-item" data-src="${media.media_url}">
        <div class="image-square" style="background-image:url('${media.media_url}');"></div>
      </a>`
  }
}

// Calculate the number of posts and decide if we need to add empty items
export function fillGridWithPosts(posts, profileGridID, reset = false) {
  // Select the container where the posts will be displayed
  const profileGrid = document.getElementById(profileGridID)

  if (reset) {
    profileGrid.innerHTML = '' // Clear the grid before adding new posts
  }

  const gridColumns = 3 // Assuming a 3-column grid
  const gridSize = posts.filter(post => post.media && post.media.length > 0).length
  const emptySlotsNeeded = (gridColumns - (gridSize % gridColumns)) % gridColumns

  posts.forEach(post => {
    profileGrid.innerHTML += generatePostGridItem(post)
  })

  if (emptySlotsNeeded > 0) {
    // Add empty slots to fill the grid
    profileGrid.innerHTML += addEmptyGridItems(emptySlotsNeeded)
  }


  // Add the "big image" as the last item, if the grid is filled correctly
  if (emptySlotsNeeded === 0 && posts.length > 0) {
    profileGrid.innerHTML += `
      <a href="/post-view/${posts[posts.length - 1].id}" class="grid-item large-item">
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
  // clear path data
  store.dispatch('clearPathData')
  createGarageContent(garage, '.current-vehicles-list', '.past-vehicles-list')
})

myPostsStore.onUpdated((data) => {
  if (data && data.new_data) {
    const posts = data.new_data
    totalPostPages = data.total_pages

    if ((data.page === data.total_pages) || (data.total_pages == 0)) {
      // hide preloader
      $('.infinite-scroll-preloader.posts-tab').hide()
    }

    // Call the function to fill the grid
    fillGridWithPosts(posts, 'profile-grid-posts', refreshed)
  }
})

myTagsStore.onUpdated((data) => {
  if (data && data.new_data) {
    const posts = data.new_data
    totalFPostPages = data.total_pages

    if ((data.page === data.total_pages) || (data.total_pages == 0)) {
      // hide preloader
      $('.infinite-scroll-preloader.tags-tab').hide()
    }

    // Call the function to fill the grid
    fillGridWithPosts(posts, 'profile-grid-tags', refreshed)
  }
})

$(document).on('page:beforein', '.page[data-name="profile"]', function (e) {
  // Infinite Scroll
  const infiniteScrollContent = document.querySelector('.profile-landing-page.infinite-scroll-content')

  infiniteScrollContent.addEventListener('infinite', async function () {
    refreshed = false

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

  const ptrContent = app.ptr.get('.profile-landing-page.ptr-content')
  ptrContent.on('refresh', async function () {
    refreshed = true

    try {
      store.dispatch('clearPathData')

      await store.dispatch('getMyGarage')
      await store.dispatch('getMyPosts')
      await store.dispatch('getMyTags')
    } catch (error) {
      console.log(error);
    }

    ptrContent.done()
  })

  createGarageContent(garageStore.value, '.current-vehicles-list', '.past-vehicles-list')

  if (userStore.value) {
    displayProfile(userStore.value)
  }

  if (myPostsStore.value) {
    const posts = myPostsStore.value.data
    totalPostPages = myPostsStore.value.total_pages

    if ((myPostsStore.value.page === myPostsStore.value.total_pages) || (myPostsStore.value.total_pages == 0)) {
      // hide preloader
      $('.infinite-scroll-preloader.posts-tab').hide()
    }

    // Call the function to fill the grid
    fillGridWithPosts(posts, 'profile-grid-posts', true)
  }

  if (myTagsStore.value) {
    const posts = myTagsStore.value.data
    totalFPostPages = myTagsStore.value.total_pages || 0

    if ((myTagsStore.value.page === totalFPostPages) || (totalFPostPages == 0)) {
      // hide preloader
      $('.infinite-scroll-preloader.tags-tab').hide()
    }

    // Call the function to fill the grid
    fillGridWithPosts(posts, 'profile-grid-tags', true)
  }
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

  if (cachedData) {
    $('.loading-fullscreen').hide()
    store.dispatch('setGarageViewPosts', garageId, 1)
    store.dispatch('setGarageViewTags', garageId, 1)
    updateProfilePage(cachedData)
    return
  }

  $('.loading-fullscreen').show()

  const garage = await getGargeById(garageId)
  if (!garage) {
    $('.loading-fullscreen').hide()

    app.dialog.alert('Garage not found')
    app.views.main.router.back()
    return
  }

  $('.loading-fullscreen').hide()

  // Assuming `path` is a dynamic path like '/garage/2'
  store.dispatch('setPathData', {
    path: `/garage/${garageId}`,
    data: garage,
  })

  // Call the function to update the page
  updateProfilePage(garage)
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
async function updateProfilePage(data) {
  const user = await getSessionUser()

  // Update the cover photo
  const coverPhotoElement = document.querySelector('.vehicle-profile-background')
  if (coverPhotoElement) {
    coverPhotoElement.style.backgroundImage = `url('${data.cover_photo}')`
  }

  // Update the profile image
  const profileImageElement = document.querySelector('.vehicle-profile-image')
  if (profileImageElement) {
    profileImageElement.style.backgroundImage = `url('${data.owner.profile_image || 'assets/img/profile-placeholder.jpg'}')`

    let profile_link = `/profile-view/${data.owner_id}`

    if (user.id == data.owner_id) {
      profile_link = '/profile/'

      profileImageElement.setAttribute('href', profile_link)
    }
  }
  // Update the vehicle make and model
  const vehicleTitleElement = document.querySelector('.profile-garage-intro h1')
  if (vehicleTitleElement) {
    vehicleTitleElement.textContent = `${data.make} ${data.model}`
  }


  const profileLinks = $('.profile-links-edit.garage')
  if (profileLinks) {
    const editLink = `<a class="profile-link" href="/profile-garage-vehicle-edit/${data.id}">Edit Vehicle</a>`
    const user = await getSessionUser()

    if (data.owner_id == user.id) {
      profileLinks.prepend(editLink)
    }

    $('.garage-add-post').attr('data-garage-id', data.id)

    $(document).on('click', '.garage-add-post', async function (e) {
      const garageId = $(this).attr('data-garage-id')

      if (!garageId) {
        app.dialog.alert('Garage not found')
        return
      }

      const user = await getSessionUser()
      if (user) {
        sendRNMessage({
          type: "createPost",
          user_id: user.id,
          page: 'profile-garage-post',
          association_id: garageId,
          association_type: 'garage',
        })
      }
    })
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
}

$(document).on('page:init', '.page[data-name="profile-garage-edit"]', async function (e) {
  const garage = garageStore.value
  createGarageContent(garage, '#garage-edit-current-list', '#garage-edit-past-list')
})

$(document).on('page:init', '.page[data-name="profile-garage-vehicle-edit"]', async function (e) {
  var garageId = e.detail.route.params.id
  var view = app.views.current

  if (!garageId) {
    app.dialog.alert('Garage not found')
    view.router.back(view.history[0], {
      force: true
    })
    return
  }

  let data = null
  try {
    if (pathStore && pathStore.value[`/garage/${garageId}`]) {
      data = pathStore.value[`/garage/${garageId}`]
    }
  } catch (error) {
    console.error('Error fetching cached data:', error)
  }

  if (!data) {
    $('.loading-fullscreen').show()
    const garage = await getGargeById(garageId)

    if (!garage) {
      app.dialog.alert('Garage not found')
      view.router.back(view.history[0], {
        force: true
      })
      return
    }

    data = garage
    // Assuming `path` is a dynamic path like '/garage/2'
    store.dispatch('setPathData', {
      path: `/garage/${garageId}`,
      data: data,
    })
  }

  $('.loading-fullscreen').hide()

  // check if user is the owner of the garage
  const user = await getSessionUser()
  if (data.owner_id != user.id) {
    app.dialog.alert('You are not authorized to edit this vehicle')
    view.router.back(view.history[0], {
      force: true
    })
    return
  }

  document.querySelector('input[name="garage_id"]').value = garageId

  // Populate form fields with garage data
  document.querySelector('select[name="vehicle_make"]').value = data.make
  document.querySelector('input[name="vehicle_model"]').value = data.model
  document.querySelector('input[name="vehicle_variant"]').value = data.variant
  document.querySelector('input[name="vehicle_reg"]').value = data.registration
  document.querySelector('input[name="vehicle_colour"]').value = data.colour
  document.querySelector('input[name="vehicle_owned_from"]').value = data.owned_since
  document.querySelector('input[name="vehicle_owned_to"]').value = data.owned_until || ''
  document.querySelector('input[name="vehicle_tagging"]').checked = data.allow_tagging === "1"

  // If a cover photo exists, use it as the background image of the upload label
  if (data.cover_photo) {
    document.querySelector('.custom-file-upload label').style.backgroundImage = `url('${data.cover_photo}')`
    document.querySelector('.custom-file-upload label').style.backgroundSize = 'cover'
  }

  // Set vehicle ownership and toggle the "Owned To" date picker
  const ownershipSelect = document.querySelector('select[name="vehicle_ownership"]')

  const toggleOwnedToDatePicker = () => {
    const ownedToInput = document.querySelector('input[name="vehicle_owned_to"]')
    const ownedToBContainer = document.querySelector('#owned-to-block')
    if (ownershipSelect.value === "current") { // Current Vehicle
      ownedToBContainer.style.display = 'none'
      ownedToInput.value = ''
    } else {
      ownedToBContainer.style.display = 'block'
    }
  }

  // Initially set the visibility based on the garage data
  const isPrimary = data.primary_car === "1" ? true : false;
  const hasOwndedTo = data.owned_until && data.owned_until.length > 1 ? true : false;
  ownershipSelect.value = hasOwndedTo ? "past" : "current"
  toggleOwnedToDatePicker()

  // Attach event listener to toggle visibility when ownership type changes
  ownershipSelect.addEventListener('change', toggleOwnedToDatePicker)

  // input vehicle_image
  $(document).on('change', 'input#fileuploadInput', function (e) {
    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = function (e) {
      document.querySelector('.custom-file-upload label').style.backgroundImage = `url('${e.target.result}')`
      document.querySelector('.custom-file-upload label').style.backgroundSize = 'cover'
    }

    reader.readAsDataURL(file)
  })

  // #delete-vehicle on click
  $(document).on('click', '#delete-vehicle', async function (e) {
    app.dialog.confirm('Are you sure you want to delete this vehicle?', async function () {
      try {
        app.preloader.show()

        const response = await deleteVehicleFromGarage(garageId)

        if (!response || !response.success) {
          throw new Error('Failed to delete vehicle')
        }

        app.preloader.hide()

        showToast('Vehicle deleted successfully')

        await store.dispatch('getMyGarage')
        view.router.back('/profile-garage-edit/', {
          force: true
        })

      } catch (error) {
        console.log(error);
        app.preloader.hide()
        showToast('Failed to delete vehicle')
      }
    })
  })
})

// submit-vehicle-form
$(document).on('click', '#submit-vehicle-form', async function (e) {
  var view = app.views.current

  // form data
  const form = $('form#vehicleForm')

  // values
  const garageId = form.find('input[name="garage_id"]').val()

  const make = form.find('select[name="vehicle_make"]').val()
  const model = form.find('input[name="vehicle_model"]').val()
  const variant = form.find('input[name="vehicle_variant"]').val()
  const reg = form.find('input[name="vehicle_reg"]').val()
  const colour = form.find('input[name="vehicle_colour"]').val()

  const owned_from = form.find('input[name="vehicle_owned_from"]').val()
  const owned_to = form.find('input[name="vehicle_owned_to"]').val()

  const primary_car = form.find('select[name="vehicle_ownership"]').val()
  const allow_tagging = form.find('input[name="vehicle_tagging"]').is(':checked') ? 1 : 0

  const cover_image = form.find('input[name="vehicle_image"]').prop('files')[0]

  if (!make || make === "0") {
    showToast('Please select a vehicle make')
    return
  }

  if (!model) {
    showToast('Please enter a vehicle model')
    return
  }

  // if (!reg) {
  //   app.dialog.alert('Please enter a vehicle registration number')
  //   return
  // }

  if (!owned_from) {
    showToast('Please enter the date you owned the vehicle from')
    return
  }

  // if primary_car is past, owned_to is required
  if (primary_car === "past" && !owned_to) {
    showToast('Please enter the date you owned the vehicle to')
    return
  }

  let base64 = null

  if (cover_image) {
    // Wrap the FileReader in a Promise to wait for it to complete
    base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(cover_image)

      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Failed to read image as base64'))
    })
  }

  try {
    app.preloader.show()

    const response = await updateVehicleInGarage({
        make,
        model,
        variant,
        registration: reg,
        colour,
        ownedFrom: owned_from,
        ownedTo: owned_to,
        primary_car,
        allow_tagging,
        cover_photo: base64,
        vehicle_period: primary_car
      },
      garageId
    )

    if (!response || !response.success) {
      throw new Error('Failed to update vehicle')
    }

    app.preloader.hide()
    showToast('Vehicle updated successfully')

    // refresh garage
    await store.dispatch('getMyGarage')

    view.router.back(view.history[0], {
      force: true
    })
  } catch (error) {
    console.log(error);
    app.preloader.hide()
    showToast('Failed to update vehicle')
  }
})

$(document).on('page:init', '.page[data-name="profile-garage-vehicle-add"]', async function (e) {
  const toggleOwnedToDatePicker = (e) => {
    const ownedToInput = document.querySelector('input[name="vehicle_owned_to"]')
    const ownedToBContainer = document.querySelector('#owned-to-block')

    const value = e.target.value

    if (value === "current") { // Current Vehicle
      ownedToBContainer.style.display = 'none'
      ownedToInput.value = ''
    } else {
      ownedToBContainer.style.display = 'block'
    }
  }

  $(document).on('change', 'select[name="vehicle_ownership"]', toggleOwnedToDatePicker)

  // input vehicle_image
  $(document).on('change', 'input[name="vehicle_image"]', function (e) {
    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = function (e) {
      document.querySelector('.custom-file-upload label').style.backgroundImage = `url('${e.target.result}')`
      document.querySelector('.custom-file-upload label').style.backgroundSize = 'cover'
    }

    reader.readAsDataURL(file)
  })
})

$(document).on('click', '#submit-add-vehicle-form', async function (e) {
  var view = app.views.current

  const form = $('form#addVehicleForm')

  // values
  const make = form.find('select[name="vehicle_make"]').val()
  const model = form.find('input[name="vehicle_model"]').val()
  const variant = form.find('input[name="vehicle_variant"]').val()
  const reg = form.find('input[name="vehicle_reg"]').val()
  const colour = form.find('input[name="vehicle_colour"]').val()

  const owned_from = form.find('input[name="vehicle_owned_from"]').val()
  const owned_to = form.find('input[name="vehicle_owned_to"]').val()

  const primary_car = form.find('select[name="vehicle_ownership"]').val()
  const allow_tagging = form.find('input[name="vehicle_tagging"]').is(':checked') ? 1 : 0

  const cover_image = form.find('input[name="vehicle_image"]').prop('files')[0]

  if (!make || make === "0") {
    app.dialog.alert('Please select a vehicle make')
    return
  }

  if (!model) {
    app.dialog.alert('Please enter a vehicle model')
    return
  }

  // if (!reg) {
  //   app.dialog.alert('Please enter a vehicle registration number')
  //   return
  // }

  if (!owned_from) {
    app.dialog.alert('Please enter the date you owned the vehicle from')
    return
  }

  // if primary_car is past, owned_to is required
  if (primary_car === "past" && !owned_to) {
    app.dialog.alert('Please enter the date you owned the vehicle to')
    return
  }

  if (!cover_image) {
    app.dialog.alert('Please upload a cover image')
    return
  }

  let base64 = null

  if (cover_image) {
    // Wrap the FileReader in a Promise to wait for it to complete
    base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(cover_image)

      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Failed to read image as base64'))
    })
  }

  try {
    app.preloader.show()

    const response = await addVehicleToGarage({
      make,
      model,
      variant,
      registration: reg,
      colour,
      ownedFrom: owned_from,
      ownedTo: owned_to,
      primary_car,
      allow_tagging,
      cover_photo: base64,
      vehicle_period: primary_car
    })

    if (!response || !response.success) {
      throw new Error('Failed to update vehicle')
    }

    app.preloader.hide()

    store.dispatch('getMyGarage')
    app.dialog.alert('Vehicle added successfully')

    // redirect to garage
    view.router.back(`/profile-garage-vehicle-view/${response.id}`, {
      force: true
    })
  } catch (error) {
    app.preloader.hide()

    app.dialog.alert('Failed to update vehicle')
  }
})