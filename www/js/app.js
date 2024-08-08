//------------------------------------------ CORE ------------------------------------------//
import { handleSignUp, updateAboutUserIds, updateContentIds, updateUsername, verifyUser } from './api/auth.js'
import store from './store.js'
import routes from './routes.js'

import { displayProfile } from './profile.js'

var $ = Dom7
var userStore = store.getters.user
var toolbarEl = $('.footer')[0]

var app = new Framework7({
  name: 'DriveLife',
  theme: 'ios',
  //theme: 'auto',
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
    },
    pageInit: function (page) {
      if (page.name === 'profile') {
        userStore.onUpdated((data) => {
          displayProfile(data)
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

userStore.onUpdated((data) => {
  store.dispatch('getPosts')
})

// Action Sheet with Grid Layout
var actionSheet = app.actions.create({
  grid: true,
  buttons: [
    [
      {
        text: '<div class="actions-grid-item">Add Post</div>',
        icon: '<img src="assets/img/actionsheet-img1.jpg" width="48" style="max-width: 100%; border-radius: 8px"/>',
        onClick: function () {
          app.dialog.alert('Button 1 clicked')
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
      await store.dispatch('login', { token: response.token })
      app.views.main.router.navigate('/')
      toolbarEl.style.display = 'block'
      return
    }
  } catch (error) {
    app.dialog.alert('Login failed, please try again')
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

    store.dispatch('setRegisterData', { email, password, user_id: response.user_id, username: response.username })
    app.views.main.router.navigate('/signup-step2/')
  } catch (error) {
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

      store.dispatch('setRegisterData', { ...registerData, username })
    }

    app.views.main.router.navigate('/signup-step3/')
  } catch (error) {
    app.dialog.alert(error.message || 'An error occurred, please try again')
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
      await store.dispatch('login', { token: response.token })
      app.views.main.router.navigate('/')
      toolbarEl.style.display = 'block'
      return
    }
  } catch (error) {
    app.dialog.alert('Login failed, please try again')
  }
})

export default app