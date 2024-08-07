import { getSessionUser, getUserDetails } from './api/auth.js'
import { fetchPosts } from './api/posts.js'

var createStore = Framework7.createStore

const store = createStore({
  state: {
    user: null,
    posts: {
      data: [],
      total_pages: 0,
      page: 1,
      limit: 10,
    },
  },
  getters: {
    user({ state }) {
      return state.user
    },
    isAuthenticated({ state }) {
      return !!state.user
    },
    posts({ state }) {
      return state.posts
    },
  },
  actions: {
    async login({ state }, { token }) {
      try {
        const userDetails = await getUserDetails(token)
        if (!userDetails) {
          window.localStorage.removeItem('token')
          throw new Error('User not found')
        }

        state.user = userDetails.user
        window.localStorage.setItem('token', token)
      } catch (error) {
        console.error('Login failed', error)
      }
    },
    logout({ state }) {
      state.user = null
      window.localStorage.removeItem('token')
    },
    async checkAuth(context) {
      const token = await getSessionUser()

      if (token) {
        await context.dispatch('login', { token: token })
      } else {
        window.localStorage.removeItem('token')
      }
    },
    async getPosts({ state }, page = 1) {
      const posts = await fetchPosts(page)
      state.posts = posts
    },
  },
})

export default store