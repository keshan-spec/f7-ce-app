import { fetchPosts } from './api/posts.js'
var createStore = Framework7.createStore;

const store = createStore({
  state: {
    posts: {
      data: [],
      total_pages: 0,
      page: 1,
      limit: 10,
    },
  },
  getters: {
    posts({ state }) {
      return state.posts;
    },
  },
  actions: {
    async getPosts({ state }, page) {
      const posts = await fetchPosts(page);
      state.posts = posts;
    },
  },
})

export default store;