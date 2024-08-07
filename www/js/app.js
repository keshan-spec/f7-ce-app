//------------------------------------------ CORE ------------------------------------------//
import { verifyUser } from './api/auth.js'
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

// var loginScreen = app.loginScreen.create({
//   content: '.login-screen',
//   on: {
//     opened: function () {
//       console.log('Login Screen opened')
//     }
//   }
// })

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
    const response = await verifyUser({
      email: username,
      password
    })


    if (!response || response.error) {
      app.dialog.alert(response.error || 'Login failed, please try again')
      return
    }

    if (response.success) {
      app.dialog.alert('Login successful')
      await store.dispatch('login', { token: response.token })
      // loginScreen.close()
      app.views.main.router.navigate('/')
      toolbarEl.style.display = 'block'
      return
    }


  } catch (error) {
    app.dialog.alert('Login failed, please try again')
  }
})

export default app