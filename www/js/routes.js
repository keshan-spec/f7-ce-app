// var v = Date.now()
var v = '1.0.1'

var routes = [{
  path: '/',
  url: './index.html',
  // name: 'home',
},
{
  path: '/social/',
  componentUrl: './pages/home.html?' + v,
  keepAlive: true,
},
{
  path: '/notifications/',
  componentUrl: './pages/notifications.html?' + v,
  keepAlive: true,
},
{
  path: '/auth/',
  url: './pages/auth.html',
  // options: {
  //   animate: false,
  // },
},
{
  path: '/signin/',
  url: './pages/login.html',
},
{
  path: '/signup-step1/',
  componentUrl: './pages/signup-step1.html?' + v,
},
{
  path: '/signup-step2/',
  componentUrl: './pages/signup-step2.html?' + v,
},
{
  path: '/signup-step3/',
  componentUrl: './pages/signup-step3.html?' + v,
},
{
  path: '/signup-step4/',
  componentUrl: './pages/signup-step4.html?' + v,
},
{
  path: '/signup-step5/',
  componentUrl: './pages/signup-step5.html?' + v,
},
{
  path: '/signup-complete/',
  componentUrl: './pages/signup-complete.html?' + v,
},
{
  path: '/login/',
  componentUrl: './pages/login.html?' + v,
},
{
  path: '/forgot-password/',
  componentUrl: './pages/forgot-password.html?' + v,
},
{
  path: '/discover/',
  componentUrl: './pages/discover.html?' + v,
  keepAlive: true,
},
{
  path: '/discover-view-event/:id',
  componentUrl: './pages/discover-view-event.html?' + v,
}, {
  path: '/discover-view-venue/:id',
  componentUrl: './pages/discover-view-venue.html?' + v,
},
{
  path: '/store/',
  componentUrl: './pages/store.html?' + v,
},
{
  path: '/profile/',
  componentUrl: './pages/profile.html?' + v,
  keepAlive: true,
},
{
  path: '/profile-view/:id',
  componentUrl: './pages/profile-view.html?' + v,

},
{
  path: '/profile-garage-vehicle-view/:id',
  componentUrl: './pages/profile-garage-vehicle-view.html?' + v,
},
{
  path: '/post-view/:id',
  componentUrl: './pages/post-view.html?' + v,
},
{
  path: '/profile-edit/',
  componentUrl: './pages/profile-edit.html?' + v,
},
{
  path: '/search/',
  componentUrl: './pages/search.html?' + v,
},
{
  path: '/profile-garage-edit/',
  componentUrl: './pages/profile-garage-edit.html?' + v,
},
{
  path: '/profile-garage-vehicle-add/',
  componentUrl: './pages/profile-garage-vehicle-add.html?' + v,
},
{
  path: '/profile-garage-vehicle-edit/:id',
  componentUrl: './pages/profile-garage-vehicle-edit.html?' + v,
},
{
  path: '/profile-edit-images/',
  componentUrl: './pages/profile-edit-images.html?' + v,
},
{
  path: '/profile-edit-socials/',
  componentUrl: './pages/profile-edit-socials.html?' + v,
},
{
  path: '/profile-edit-mydetails/',
  componentUrl: './pages/profile-edit-mydetails.html?' + v,
},
{
  path: '/profile-edit-username/',
  componentUrl: './pages/profile-edit-username.html?' + v,
},
{
  path: '/post-edit/:id',
  componentUrl: './pages/post-edit.html?' + v,
},
{
  path: '/profile-edit-account-settings/',
  componentUrl: './pages/profile-edit-account-settings.html?' + v,
},
// Default route (404 page). MUST BE THE LAST
{
  path: '(.*)',
  componentUrl: './pages/404.html?' + v,
},
]

export default routes