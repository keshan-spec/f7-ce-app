//------------------------------------------ CORE ------------------------------------------//
import {
  getSessionUser,
  handleSignUp,
  updateAboutUserIds,
  updateContentIds,
  updateUsername,
  verifyUser
} from './api/auth.js'
import store from './store.js'
import routes from './routes.js'

import {
  displayProfile
} from './profile.js'
import {
  sendRNMessage
} from './api/consts.js'
import {
  onScanFailure,
  onScanSuccess
} from './qr-scanner.js'
import {
  handleLink,
  handleUnlink
} from './api/scanner.js'

var $ = Dom7
var userStore = store.getters.user
var toolbarEl = $('.footer')[0]

var html5QrCode

var app = new Framework7({
  initOnDeviceReady: true,
  view: {
    pushState: true,
    stackPages: true
  },
  name: 'DriveLife',
  theme: 'ios',
  //theme: 'auto',
  panel: {
    swipe: 'right',
  },
  smartSelect: {
    closeOnSelect: true,
  },
  cache: true,
  el: '#app', // App root element
  on: {
    init: async function () {
      await store.dispatch('checkAuth')

      const isAuthenticated = store.getters.isAuthenticated.value

      if (!isAuthenticated) {
        toolbarEl.style.display = 'none'
        this.views.main.router.navigate('/auth/')
      }

      setTimeout(() => {
        $('.init-loader').hide()
      }, 200)

      const deeplink = getQueryParameter('deeplink')
      if (deeplink) {
        // get the page from the deeplink and navigate to it
        // ex; http://localhost:3000/post-view/308
        // get the /post-view/308 and navigate to it
        const path = deeplink.split('/').slice(3).join('/')
        this.views.main.router.navigate(path)
        // remove the query parameter from the URL
        window.history.pushState({}, document.title, window.location.pathname)
      }
    },
    pageInit: function (page) {
      if (page.name === 'profile') {
        userStore.onUpdated((data) => {
          displayProfile(data)
          store.dispatch('getMyGarage')

          if (data && !data.refreshed) {
            store.dispatch('getFollowingPosts')
            store.dispatch('getMyPosts')
            store.dispatch('getMyTags')
          }
        })
      }

      if (page.name === 'discover') {
        store.dispatch('getTrendingEvents')
        store.dispatch('getTrendingVenues')
        store.dispatch('fetchEventCategories')
      }

      if (page.name === 'signup-step2') {
        const registerData = store.getters.getRegisterData.value

        const userNameEl = document.getElementsByName('username')[0]
        userNameEl.value = registerData.username
      }
    },
  },
  store: store,
  routes: routes,
})

// Function to parse query parameters from the URL
function getQueryParameter(name) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

export function onBackKeyDown() {
  var view = app.views.current

  var leftp = app.panel.left && app.panel.left.opened
  var rightp = app.panel.right && app.panel.right.opened

  window.ReactNativeWebView.postMessage(JSON.stringify({
    his: view.history,
    url: app.views.main.router.url,
    leftp,
    rightp
  }))

  if (leftp || rightp) {
    app.panel.close()
    return false
  } else if ($('.modal-in').length > 0) {
    app.dialog.close()
    app.popup.close()
    return false
  } else if (view.history[0] == '/') {
    window.ReactNativeWebView.postMessage('exit_app')
    return true
  } else {

    if (view.history.length < 2) {
      $('.tab-link[href="#view-home"]').click()
      return
    }

    view.router.back()
    return false
  }
}
window.onAppBackKey = onBackKeyDown

const renderResult = (result) => {
  const user = store.getters.user.value
  console.log('Result', user)

  if (!result || result.status === 'error') {
    return `<h2 class="text-center">Sorry, this QR code is not valid</h2>`
  }

  if (result.available) {
    return (
      `<h2 class="text-center">Congrats! This QR code is up for grabs</h2>
        <button id="link-profile">
          Link Profile
        </button>`
    )
  }

  if (!result.available) {
    return (
      `
        <h2 class="text-center">Sorry, this QR code is already linked</h2>
        ${result.data && result.data.linked_to == user?.id ? (
        `<button id="unlink-profile"
          onClick={handleUnlink}
        >
          Unlink Profile
        </button>`
      ) : '  '}
      `
    )
  }
}

// Function to create and open the modal with default content
function openModal() {
  const myModal = app.dialog.create({
    title: 'Scan QR Code',
    content: `
      <div id="custom-modal-content">
        <div id="reader" width="600px"></div>
      </div>
    `,
    buttons: [{
      text: 'Close',
      onClick: function () {
        try {
          if (html5QrCode) {
            html5QrCode.stop()
          }

          store.dispatch('setScannedData', null)
        } catch (error) {
          console.error('Error stopping qr code', error)
        }
      }
    }]
  })

  // Open the modal
  myModal.open()
}

let defaultConfig = {
  qrbox: {
    width: 250,
    height: 250
  },
  fps: 60,
  showTorchButtonIfSupported: true,
  showZoomSliderIfSupported: true,
  // aspectRatio: 1.7777778
}

// on link profile
$(document).on('click', '#link-profile', async function () {
  const result = store.getters.scannedData.value
  // close the modal
  app.dialog.close()

  if (result) {
    const response = await handleLink(result)
    if (response.type === 'success') {
      app.dialog.alert(response.text)
    }

    // reset the scanned data
    store.dispatch('setScannedData', null)
  }
})

// unlink profile
$(document).on('click', '#unlink-profile', async function () {
  const result = store.getters.scannedData.value
  // close the modal
  app.dialog.close()

  if (result) {
    const response = await handleUnlink(result)
    if (response.type === 'success') {
      app.dialog.alert(response.text)
    }

    // reset the scanned data
    store.dispatch('setScannedData', null)
  }
})

$(document).on('click', '.open-qr-modal', function () {
  openModal()

  html5QrCode = new Html5Qrcode("reader")

  html5QrCode?.start({
      facingMode: "environment"
    },
    defaultConfig,
    onScanSuccess,
    onScanFailure
  )
})

store.getters.scannedData.onUpdated((data) => {
  if (data && html5QrCode) {
    html5QrCode.stop()

    document.getElementById('custom-modal-content').innerHTML = renderResult(data)
  }
})

userStore.onUpdated((data) => {
  store.dispatch('getPosts')
})

// Action Sheet with Grid Layout
var actionSheet = app.actions.create({
  grid: true,
  buttons: [
    [{
        text: '<div class="actions-grid-item">Add Post</div>',
        icon: '<img src="assets/img/actionsheet-img1.jpg" width="48" style="max-width: 100%; border-radius: 8px"/>',
        onClick: async function () {
          const user = await getSessionUser()
          if (user) {
            sendRNMessage({
              type: "createPost",
              user_id: user.id,
              page: 'create-post',
            })
          }
        }
      },
      {
        text: '<div class="actions-grid-item">Scan QR Code</div>',
        icon: '<img src="assets/img/actionsheet-img1.jpg" width="48" style="max-width: 100%; border-radius: 8px"/>',
        onClick: function () {
          app.dialog.alert('Button 2 clicked')
        }
      },
      {
        text: '<div class="actions-grid-item">Add Vehicle</div>',
        icon: '<img src="assets/img/actionsheet-img1.jpg" width="48" style="max-width: 100%; border-radius: 8px"/>',
        onClick: function () {
          app.dialog.alert('Button 3 clicked')
        }
      }
    ],
  ]
})

// Init slider
var swiper = new Swiper('.swiper-container', {
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  // other parameters
})

//Comments Popup
var CommentsPopup = app.popup.create({
  el: '.comments-popup',
  swipeToClose: 'to-bottom'
})

//Share Popup
var SharePopup = app.popup.create({
  el: '.share-popup',
  swipeToClose: 'to-bottom'
})

//Share Popup
var EditPostPopup = app.popup.create({
  el: '.edit-post-popup',
  swipeToClose: 'to-bottom'
})

$(document).on('page:init', '.page[data-name="profile"]', function (e) {
  var LinksPopup = app.popup.create({
    el: '.links-popup',
    swipeToClose: 'to-bottom'
  })

})

document.getElementById('open-action-sheet').addEventListener('click', function () {
  actionSheet.open()
})

// Handle login form submission
$(document).on('submit', '.login-screen-content form', async function (e) {
  e.preventDefault()

  var username = $(this).find('input[name="username"]').val()
  var password = $(this).find('input[name="password"]').val()

  if (!username) {
    app.dialog.alert('Username is required')
    return
  }

  if (!password) {
    app.dialog.alert('Password is required')
    return
  }


  try {
    app.preloader.show()
    const response = await verifyUser({
      email: username,
      password
    })

    app.preloader.hide()

    if (!response || response.error) {
      app.dialog.alert(response.error || 'Login failed, please try again')
      return
    }

    if (response.success) {
      app.dialog.alert('Login successful')
      await store.dispatch('login', {
        token: response.token
      })
      app.views.main.router.navigate('/')
      toolbarEl.style.display = 'block'
      return
    }
  } catch (error) {
    app.dialog.alert('Login failed, please try again')
  }
})

$(document).on('click', '.toggle-password', function () {
  var input = $(this).prev('input')
  if (input.attr('type') === 'password') {
    input.attr('type', 'text')
    $(this).html('<i class="fa fa-eye-slash"></i>')
  } else {
    input.attr('type', 'password')
    $(this).html('<i class="fa fa-eye"></i>')
  }
})

// Register forms
// Step 1
$(document).on('submit', 'form#sign-up-step1', async function (e) {
  e.preventDefault()
  // app.views.main.router.navigate('/signup-step2/')
  // store.dispatch('setRegisterData', { username: 'test', user_id: 65251 })
  // return

  var firstName = $(this).find('input[name="first_name"]').val().trim()
  var lastName = $(this).find('input[name="last_name"]').val().trim()
  var email = $(this).find('input[name="email"]').val().trim()
  var password = $(this).find('input[name="password"]').val().trim()
  var confirmPassword = $(this).find('input[name="confirm_password"]').val().trim()
  var agreeTerms = $(this).find('input[name="agree_terms"]').is(':checked')
  var agreePrivacy = $(this).find('input[name="agree_privacy"]').is(':checked')

  if (!firstName) {
    app.dialog.alert('First name is required')
    return
  }

  if (!lastName) {
    app.dialog.alert('Last name is required')
    return
  }

  if (!email) {
    app.dialog.alert('Email is required')
    return
  }

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    app.dialog.alert('Please enter a valid email address')
    return
  }

  if (!password) {
    app.dialog.alert('Password is required')
    return
  }

  // Check if password has at least 8 characters
  if (password.length < 8) {
    app.dialog.alert('Password must be at least 8 characters long.')
    return
  }

  // Check if password contains at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    app.dialog.alert('Password must contain at least one lowercase letter.')
    return
  }

  // Check if password contains at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    app.dialog.alert('Password must contain at least one uppercase letter.')
    return
  }

  // Check if password contains at least one number
  if (!/\d/.test(password)) {
    app.dialog.alert('Password must contain at least one number.')
    return
  }

  if (password.length < 8) {
    app.dialog.alert('Password must be at least 8 characters long')
    return
  }

  if (!confirmPassword) {
    app.dialog.alert('Please confirm your password')
    return
  }

  if (password !== confirmPassword) {
    app.dialog.alert('Passwords do not match')
    return
  }

  if (!agreeTerms) {
    app.dialog.alert('You must agree to the Terms & Conditions')
    return
  }

  if (!agreePrivacy) {
    app.dialog.alert('You must agree to the Privacy Policy')
    return
  }

  // add a loader to the login button
  var loginButton = $(this).find('button[type="submit"]')[0]
  loginButton.innerHTML = '<div class="preloader color-white"></div>'

  try {
    app.preloader.show()

    const response = await handleSignUp({
      full_name: `${firstName} ${lastName}`,
      email,
      password
    })

    app.preloader.hide()

    if (!response || !response.success) {
      app.dialog.alert(response.message || 'An error occurred, please try again')
      loginButton.innerHTML = 'Next'
      return
    }

    store.dispatch('setRegisterData', {
      email,
      password,
      user_id: response.user_id,
      username: response.username
    })
    app.views.main.router.navigate('/signup-step2/')
  } catch (error) {
    console.log(error)
    app.dialog.alert(error.message || 'An error occurred, please try again')
    loginButton.innerHTML = 'Next'
    return
  }
})

// Step 2
$(document).on('submit', 'form#sign-up-step2', async function (e) {
  e.preventDefault()

  var username = $(this).find('input[name="username"]').val().trim()

  if (!username) {
    app.dialog.alert('Username is required')
    return
  }

  let registerData = store.getters.getRegisterData.value
  try {
    if (registerData.username !== username) {
      app.preloader.show()

      const response = await updateUsername({
        user_id: registerData.user_id,
        username,
      })

      app.preloader.hide()

      if (!response || !response.success) {
        switch (response?.code) {
          case "username_exists":
            app.dialog.alert('Username already exists, please choose another one')
            break
          default:
            app.dialog.alert(response.message || 'An error occurred, please try again')
            break
        }
        return
      }

      store.dispatch('setRegisterData', {
        ...registerData,
        username
      })
    }

    app.views.main.router.navigate('/signup-step3/')
  } catch (error) {
    app.dialog.alert(error.message || 'Failed to update username')
    return
  }
})

// Step 3
$(document).on('submit', '#car-selection-form', async function (e) {
  e.preventDefault()

  // Get all checked checkboxes' values
  var selectedCarTypes = []
  $(this).find('input[name="car_type"]:checked').each(function () {
    selectedCarTypes.push($(this).val())
  })

  // Check if at least one checkbox is selected
  if (selectedCarTypes.length === 0) {
    app.dialog.alert('Please select at least one car type')
    return
  }

  // For demonstration, log the selected values to the console
  let registerData = store.getters.getRegisterData.value

  try {
    app.preloader.show()
    const response = await updateContentIds(selectedCarTypes, registerData.user_id)

    if (!response || !response.success) {
      app.dialog.alert(response.message || 'Oops, Unable to save your selection.')
    }

    app.preloader.hide()
    app.views.main.router.navigate('/signup-step4/')
  } catch (error) {
    console.log(error)
    app.dialog.alert('An error occurred, please try again')
    return
  }

  // Redirect to the next step (this can be customized as needed)
  app.views.main.router.navigate('/signup-step4/')
})

// Step 4
$(document).on('submit', '#interest-selection-form', async function (e) {
  e.preventDefault()

  // Get all checked checkboxes' values
  var selectedInterests = []
  $(this).find('input[name="interest"]:checked').each(function () {
    selectedInterests.push($(this).val())
  })

  // Check if at least one checkbox is selected
  if (selectedInterests.length === 0) {
    app.dialog.alert('Please select at least one interest')
    return
  }

  let registerData = store.getters.getRegisterData.value

  try {
    app.preloader.show()
    const response = await updateAboutUserIds(selectedInterests, registerData.user_id)

    if (!response || !response.success) {
      app.dialog.alert(response.message || 'Oops, Unable to save your selection.')
    }

    app.preloader.hide()

    app.views.main.router.navigate('/signup-complete/')
  } catch (error) {
    console.log(error)
    app.dialog.alert('An error occurred, please try again')
    return
  }
})

// Signup complete
$(document).on('click', '#signup-complete', async function (e) {
  const registerData = store.getters.getRegisterData.value

  if (!registerData || !registerData.user_id || !registerData.email || !registerData.password) {
    app.dialog.alert('An error occurred, please try again')
    return
  }

  try {
    app.preloader.show()

    const response = await verifyUser({
      email: registerData.email,
      password: registerData.password
    })

    app.preloader.hide()

    if (!response || response.error) {
      app.dialog.alert(response.error || 'Login failed, please try again')
      app.views.main.router.navigate('/auth/')
      loginButton.innerHTML = 'Next'
      return
    }

    if (response.success) {
      await store.dispatch('login', {
        token: response.token
      })
      app.views.main.router.navigate('/')
      toolbarEl.style.display = 'block'
      return
    }
  } catch (error) {
    app.dialog.alert('Login failed, please try again')
  }
})

//GARAGE - DATE PICKER
$(document).on('page:init', '.page[data-name="profile-garage-vehicle-add"]', function (e) {
  app.calendar.create({
    inputEl: '#owned-from',
    openIn: 'customModal',
    header: true,
    footer: true,
    dateFormat: 'dd/mm/yyyy',
    maxDate: new Date()
  })

  app.calendar.create({
    inputEl: '#owned-to',
    openIn: 'customModal',
    header: true,
    footer: true,
    dateFormat: 'dd/mm/yyyy',
    minDate: new Date()
  })
})

$(document).on('page:init', '.page[data-name="profile-garage-vehicle-edit"]', function (e) {
  app.calendar.create({
    inputEl: '#owned-from',
    openIn: 'customModal',
    header: true,
    footer: true,
    dateFormat: 'yyyy-mm-dd',
    maxDate: new Date()
  })

  app.calendar.create({
    inputEl: '#owned-to',
    openIn: 'customModal',
    header: true,
    footer: true,
    dateFormat: 'yyyy-mm-dd',
    minDate: new Date()
  })
})

//PROFILE SECTION
$(document).on('page:init', '.page[data-name="profile"]', function (e) {
  app.popup.create({
    el: '.links-popup',
    swipeToClose: 'to-bottom'
  });
});

$(document).on('page:init', '.page[data-name="profile-edit-socials"]', function (e) {
  app.popup.create({
    el: '.add-link-popup',
    swipeToClose: 'to-bottom'
  });
});

// logout-button
$(document).on('click', '.logout-button', async function (e) {
  app.dialog.close()
  app.popup.close()
  app.panel.close()

  await store.dispatch('logout')
  toolbarEl.style.display = 'none'

  app.views.current.router.navigate('/auth/')
})

export default app