// var v = 3.1;
var v = Date.now()

var routes = [
  {
    path: '/',
    url: './index.html',
  },
  {
    path: '/notifications/',
    componentUrl: './pages/notifications.html?' + v,
  },
  {
    path: '/auth/',
    url: './pages/auth.html',
    options: {
      animate: false,
    },
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
  },
  {
    path: '/store/',
    componentUrl: './pages/store.html?' + v,
  },
  {
    path: '/profile/',
    componentUrl: './pages/profile.html?' + v,
  },
  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    componentUrl: './pages/404.html?' + v,
  },
]

export default routes