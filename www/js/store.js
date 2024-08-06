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
    async likePost({ state }, postId) {
      // Update state for optimistic UI
      state.posts.data = state.posts.data.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      });
      // Call API to like post
      // Update post in state
    }
  },
})

export default store;