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
  getIDFromQrCode
} from './api/scanner.js'
import {
  openQRModal
} from './qr.js'
import {
  sendRNMessage
} from './api/consts.js'


var $ = Dom7
var userStore = store.getters.user
var notificationCountStore = store.getters.getNotifCount
var networkErrors = store.getters.checkPoorNetworkError

var toolbarEl = $('.footer')[0]

var app = new Framework7({
  initOnDeviceReady: true,
  view: {
    pushState: false,
    stackPages: true,
    xhrCache: true,
    preloadPreviousPage: true,
    // browserHistory: true,
  },
  notification: {
    title: 'DriveLife',
    closeTimeout: 10000,
    closeOnClick: true,
    icon: '<img src="assets/icons/favicon.png"/>',
  },
  toast: {
    closeTimeout: 3000,
    closeButton: true,
  },
  name: 'DriveLife',
  theme: 'ios',
  smartSelect: {
    closeOnSelect: true,
  },
  cache: true,
  el: '#app', // App root element
  on: {
    init: async function () {
      // toolbarEl.style.display = 'none'

      await store.dispatch('checkAuth')

      const isAuthenticated = store.getters.isAuthenticated.value

      if (!isAuthenticated) {
        this.views.main.router.navigate('/auth/')
      } else {
        $('.init-loader').hide()
        $('.start-link').click();
        // toolbarEl.style.display = 'block'
      }

      const deeplink = getQueryParameter('deeplink')
      if (deeplink) {
        // get the page from the deeplink and navigate to it
        // ex; http://localhost:3000/post-view/308
        // get the /post-view/308 and navigate to it
        let path = deeplink.split('/').slice(3).join('/')

        if (!path.startsWith('/')) {
          path = `/${path}`
        }

        this.views.main.router.navigate(path)
        // remove the query parameter from the URL
        window.history.pushState({}, document.title, window.location.pathname)
      }

      const qrCode = getQueryParameter('qr')
      if (qrCode) {
        maybeRedirectToProfile(qrCode)
      }
    },
    pageInit: function (page) {
      if (page.name === 'profile') {
        userStore.onUpdated((data) => {
          if (data && data.id && !data.external_refresh) {
            displayProfile(data, 'profile')
            store.dispatch('getMyGarage')
          }

          if (data && data.id && !data.refreshed) {
            store.dispatch('getMyPosts', {
              page: 1,
              clear: true
            })
            store.dispatch('getMyTags', {
              page: 1,
              clear: true
            })
          }
        })
      }

      if (page.name === 'discover') {
        userStore.onUpdated((data) => {
          if (data && data.id && !data.refreshed) {
            store.dispatch('getTrendingEvents')
            store.dispatch('getTrendingVenues')
            store.dispatch('filterTrendingUsers')
            store.dispatch('fetchEventCategories')
          }
        })
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

$(document).on('mousedown', '.toolbar-bottom a', function (e) {
  var targetHref = $(this).attr('href');
  var validTabs = ['#view-social', '#view-discover', '#view-store', '#view-profile'];

  if ($(this).hasClass('tab-link-active') && validTabs.includes(targetHref)) {
    var view = app.views.current;
    if (view.history.length > 1) {
      view.router.back(view.history[0], {
        force: true
      });
    }
  }
});

export function showToast(message, type = 'Message', position = 'bottom') {
  app.toast.create({
    text: message,
    position: position,
    closeTimeout: 3000,
  }).open()
}

async function maybeRedirectToProfile(qrCode) {
  try {
    $('.init-loader').show()
    const response = await getIDFromQrCode(qrCode)

    const id = response?.data?.linked_to;

    if (id) {
      app.views.main.router.navigate(`/profile-view/${id}`)
      // remove the query parameter from the URL
      window.history.pushState({}, document.title, window.location.pathname)
      $('.init-loader').hide()
    }
  } catch (error) {
    console.log(error);
    window.history.pushState({}, document.title, window.location.pathname)
    app.dialog.alert('Oops, Unable to find the profile linked to this QR code.')
    $('.init-loader').hide()
  }
}

// Function to parse query parameters from the URL
function getQueryParameter(name) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

function isAndroid() {
  const toMatch = [
    /Android/i,
    // /webOS/i,
    // /iPhone/i,
    // /iPad/i,
    // /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}

export function onBackKeyDown() {
  // check if the device is an android device
  if (!isAndroid()) {
    return
  }

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

userStore.onUpdated((data) => {
  if (data && data.id && !data.external_refresh && !data.refreshed) {
    store.dispatch('getPosts')
    store.dispatch('notificationCount')
    store.dispatch('fetchNotifications')
  }
})

notificationCountStore.onUpdated((data) => {
  document.querySelectorAll('.notification-count').forEach((el) => {
    el.innerHTML = data
    el.style.display = data > 0 ? 'flex' : 'none'
  })
})

networkErrors.onUpdated((data) => {
  console.log(data);

  if (data) {
    app.dialog.alert('Poor network connection. Please check your internet connection and try again.')
  }
})

// $(document).on('click', '.footer-links', function (e) {
//   var view = app.views.current

//   // const routesMap = {
//   //   "#view-home": "/home/",
//   //   "#view-discover": "/discover/",
//   //   "#view-store": "/store/",
//   //   "#view-profile": "/profile/",
//   // }

//   // const linkElem = e.target.closest('a')
//   // const href = linkElem.getAttribute('href')

//   // app.views.main.router.navigate(routesMap[href])


//   if (view.history[0] == '/profile') {
//     return;
//   }

//   if (view.history.length > 1) {
//     const authRoutes = ['auth', 'login', 'signup-step1', 'signup-step2', 'signup-step3', 'signup-step4', 'signup-complete'];

//     // Check if any item in the view.history array contains any of the authRoutes
//     if (view.history.some(historyItem => authRoutes.some(route => historyItem.includes(`/${route}/`)))) {
//       app.views.main.router.navigate('/');
//       return;
//     }


//     view.router.back({
//       url: view.history[0],
//       history: true, // Update the history stack correctly
//       animate: true, // Optional: enable animation if you want
//       reloadCurrent: true // Optional: force reload of the current page if needed
//     });
//   }
// })

// Action Sheet with Grid Layout
var actionSheet = app.actions.create({
  grid: true,
  buttons: [
    [{
        text: '<div class="actions-grid-item">Add Post</div>',
        icon: '<img src="assets/img/icon-add-post.svg" width="48" style="max-width: 100%"/>',
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
        icon: '<img src="assets/img/icon-qr-code.svg" width="48" style="max-width: 100%;"/>',
        onClick: function () {
          openQRModal()
        }
      },
      {
        text: '<div class="actions-grid-item">Add Vehicle</div>',
        icon: '<img src="assets/img/icon-vehicle-add.svg" width="48" style="max-width: 100%;"/>',
        onClick: function () {
          app.views.main.router.navigate('/profile-garage-vehicle-add/');
        }
      }
    ],
  ]
});

// Init slider
new Swiper('.swiper-container', {
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
})

//Comments Popup
app.popup.create({
  el: '.comments-popup',
  swipeToClose: 'to-bottom'
})

//Share Popup
app.popup.create({
  el: '.share-popup',
  swipeToClose: 'to-bottom'
})

//Share Popup
app.popup.create({
  el: '.edit-post-popup',
  swipeToClose: 'to-bottom'
})


$(document).on('click', '#open-action-sheet', function () {
  actionSheet.open()
})

// Handle login form submission
$(document).on('submit', '.login-screen-content form', async function (e) {
  e.preventDefault()

  var username = $(this).find('input[name="username"]').val()
  var password = $(this).find('input[name="password"]').val()

  if (!username) {
    showToast('Username is required')
    return
  }

  if (!password) {
    showToast('Password is required')
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
      showToast('Login successful')
      await store.dispatch('login', {
        token: response.token
      })

      app.views.main.router.navigate('/')
      $('.start-link').click();

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

  var firstName = $(this).find('input[name="first_name"]').val().trim()
  var lastName = $(this).find('input[name="last_name"]').val().trim()
  var email = $(this).find('input[name="email"]').val().trim()
  var password = $(this).find('input[name="password"]').val().trim()
  var confirmPassword = $(this).find('input[name="confirm_password"]').val().trim()
  var agreeTerms = $(this).find('input[name="agree_terms"]').is(':checked')
  var agreePrivacy = $(this).find('input[name="agree_privacy"]').is(':checked')

  if (!firstName) {
    showToast('First name is required')
    return
  }

  if (!lastName) {
    showToast('Last name is required')
    return
  }

  if (!email) {
    showToast('Email is required')
    return
  }

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    showToast('Please enter a valid email address')
    return
  }

  if (!password) {
    showToast('Password is required')
    return
  }

  // Check if password has at least 8 characters
  if (password.length < 8) {
    showToast('Password must be at least 8 characters long.')
    return
  }

  // Check if password contains at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    showToast('Password must contain at least one lowercase letter.')
    return
  }

  // Check if password contains at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    showToast('Password must contain at least one uppercase letter.')
    return
  }

  // Check if password contains at least one number
  if (!/\d/.test(password)) {
    showToast('Password must contain at least one number.')
    return
  }

  if (password.length < 8) {
    showToast('Password must be at least 8 characters long')
    return
  }

  if (!confirmPassword) {
    showToast('Please confirm your password')
    return
  }

  if (password !== confirmPassword) {
    showToast('Passwords do not match')
    return
  }

  if (!agreeTerms) {
    showToast('You must agree to the Terms & Conditions')
    return
  }

  if (!agreePrivacy) {
    showToast('You must agree to the Privacy Policy')
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
    showToast('Username is required')
    return
  }

  // username can only have letters, numbers, and underscores
  var usernamePattern = /^[a-zA-Z0-9_]+$/
  if (!usernamePattern.test(username)) {
    showToast('Username can only contain letters, numbers, and underscores')
    return
  }

  // username must be at least 3 characters long
  if (username.length < 3) {
    showToast('Username must be at least 3 characters long')
    return
  }

  let registerData = store.getters.getRegisterData.value
  try {
    if (registerData.username !== username) {
      app.preloader.show()

      const response = await updateUsername(username, registerData.user_id)

      app.preloader.hide()

      if (!response || !response.success) {
        app.notification.create({
          titleRightText: 'now',
          subtitle: 'Oops, something went wrong',
          text: error.message || 'Failed to update username',
        }).open()
        // app.dialog.alert(response.message || 'An error occurred, please try again')
        return
      }

      store.dispatch('setRegisterData', {
        ...registerData,
        username
      })
    }

    app.views.main.router.navigate('/signup-step3/')
  } catch (error) {
    console.log(error);
    app.notification.create({
      titleRightText: 'now',
      subtitle: 'Oops, something went wrong',
      text: error.message || 'Failed to update username',
    }).open()
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
    showToast('Please select at least one car type')
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
    showToast('Please select at least one interest')
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
      $('.start-link').click();

      toolbarEl.style.display = 'block'
      return
    }
  } catch (error) {
    app.dialog.alert('Login failed, please try again')
  }
})

$(document).on('page:afterin', '.page[data-name="auth"]', function (e) {
  toolbarEl.style.display = 'none'

  setTimeout(() => {
    $('.init-loader').hide()
  }, 300)
});

$(document).on('page:afterin', '.page[data-name="signup-step1"]', function (e) {
  app.popup.create({
    el: '.privacy-popup',
    swipeToClose: 'to-bottom'
  })
});

// logout-button
$(document).on('click', '.logout-button', async function (e) {
  app.dialog.close()
  app.popup.close()
  app.panel.close()

  await store.dispatch('logout')

  // reload page
  window.location.reload()
  // app.views.current.router.navigate('/auth/')
})

$(document).on('click', '.view-profile', function (e) {
  $('.view-profile-link').click()
})

$(document).on('click', '#forgot-password', function (e) {
  // open the url in a new tab
  window.open($(this).attr('href'), '_blank')
})

export default app