const routes = [
  {
    path: '/',
    url: './index.html',
  },
  {
    path: '/discover/',
    componentUrl: './pages/discover.html',
  },
  {
    path: '/store/',
    componentUrl: './pages/store.html',
  },
  {
    path: '/profile/',
    componentUrl: './pages/profile.html',
  },
  {
    path: '/login/',
    componentUrl: './pages/login.html',
  },

  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    componentUrl: './pages/404.html',
  },
]

export default routes