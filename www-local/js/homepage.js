import app, {
  showToast
} from "./app.js"
import store from "./store.js"

import {
  formatPostDate
} from './utils.js'
import {
  fetchComments,
  maybeLikePost,
  maybeLikeComment,
  addComment,
  deletePost,
  deleteComment
} from './api/posts.js'
import {
  getSessionUser
} from "./api/auth.js"

var $ = Dom7
var currentPostsPage = 1
var currentFollowingPostsPage = 1

var postsStore = store.getters.posts
var followingPostsStore = store.getters.followingPosts

var totalPostPages = 0
var totalFPostPages = 0

// Infinite Scroll Event
var isFetchingPosts = false
var activeTab = 'latest'
var refreshed = false

postsStore.onUpdated((data) => {
  totalPostPages = data.total_pages


  if ((data.page == data.total_pages) || (data.new_data.length == 0)) {
    $('.infinite-scroll-preloader.home-posts').hide()

    if (data.data.length == 0) {
      $('#tab-latest .data').html('<p class="text-center">No posts</p>')
      return;
    }
  }

  displayPosts(data.new_data)
})

followingPostsStore.onUpdated((data) => {
  totalFPostPages = data.total_pages

  if ((data.page == data.total_pages) || (data.new_data.length == 0)) {
    $('.infinite-scroll-preloader.home-following-posts').hide()
    if (data.data.length == 0) {
      $('#tab-following .data').html('<p class="text-center">No posts</p>')
      return;
    }
  }

  displayPosts(data.new_data, true)
})

// Pull to refresh content
const ptrContent = app.ptr.get('.ptr-content')
ptrContent.on('refresh', async function () {
  console.log('refreshed home');

  refreshed = true
  const storeName = activeTab === 'following' ? 'getFollowingPosts' : 'getPosts'

  // if (currentPage >= totalPages) {
  //   app.infiniteScroll.destroy(infiniteScrollContent)
  //   app.ptr.done()
  //   return
  // }

  if (isFetchingPosts) return

  isFetchingPosts = true

  if (activeTab === 'following') {
    currentFollowingPostsPage++
  } else {
    currentPostsPage++
  }

  await store.dispatch(storeName, 1)

  isFetchingPosts = false
  app.ptr.done()
})

/* Based on this http://jsfiddle.net/brettwp/J4djY/*/
export function detectDoubleTapClosure(callback) {
  let lastTap = 0
  let timeout

  return function detectDoubleTap(event) {

    const curTime = new Date().getTime()
    const tapLen = curTime - lastTap
    if (tapLen < 500 && tapLen > 0) {
      event.preventDefault()

      // pass the event target to the callback
      callback(event.target)
    } else {
      timeout = setTimeout(() => {
        clearTimeout(timeout)
      }, 500)
    }

    lastTap = curTime
  }
}

// event listener for tab change
$('.tab-link').on('click', async function (e) {
  const type = this.getAttribute('data-type')
  activeTab = type
})

const infiniteScrollContent = document.querySelector('.infinite-scroll-content')
infiniteScrollContent.addEventListener('infinite', async function () {
  const totalPages = activeTab === 'following' ? totalFPostPages : totalPostPages
  const storeName = activeTab === 'following' ? 'getFollowingPosts' : 'getPosts'
  const currentPage = activeTab === 'following' ? currentFollowingPostsPage : currentPostsPage

  if (currentPage >= totalPages) {
    app.infiniteScroll.destroy(infiniteScrollContent)
    return
  }

  if (isFetchingPosts) return

  isFetchingPosts = true

  if (activeTab === 'following') {
    currentFollowingPostsPage++
  } else {
    currentPostsPage++
  }

  await store.dispatch(storeName, currentPage)
  isFetchingPosts = false
})

async function displayPosts(posts, following = false) {
  const postsContainer = $(following ? '#tab-following .data' : '#tab-latest .data');

  if (refreshed) {
    postsContainer.html('')
    refreshed = false
  }

  const user = await getSessionUser()

  posts.forEach(post => {
    let post_actions = `
      <div class="media-post-actions">
        <div class="media-post-like" data-post-id="${post.id}">
          <i class="icon f7-icons ${post.is_liked ? 'text-red' : ''}" data-post-id="${post.id}">${post.is_liked ? 'heart_fill' : 'heart'}</i>
        </div>
        <div class="media-post-comment popup-open" data-popup=".comments-popup" data-post-id="${post.id}">
          <i class="icon f7-icons">chat_bubble</i>
        </div>
        <div class="media-post-share popup-open" data-popup=".share-popup">
          <i class="icon f7-icons">paperplane</i>
        </div>
    `;

    if (post.user_id == user.id) {
      post_actions += `
        <div class="media-post-edit popup-open" data-popup=".edit-post-popup" data-post-id="${post.id}">
          <i class="icon f7-icons">gear_alt</i>
        </div>
      `;
    }

    post_actions += `</div>`;

    const date = formatPostDate(post.post_date);
    const maxDescriptionLength = 100; // Set your character limit here
    const isLongDescription = post.caption.length > maxDescriptionLength;
    const shortDescription = isLongDescription ? post.caption.slice(0, maxDescriptionLength) : post.caption;

    let imageHeight = 400;

    if (post.media.length > 0) {
      imageHeight = post.media[0].media_height;

      if (imageHeight > 800) {
        imageHeight = 'auto';
      }
    }

    let profile_link = `/profile-view/${post.user_id}`;

    if (post.user_id == user.id) {
      profile_link = '/profile/';
    }

    const postItem = `
      <div class="media-post" data-post-id="${post.id}" data-is-liked="${post.is_liked}">
        <div class="media-post-content">
          <div class="media-post-header">
            <a href="${profile_link}">
              <div class="media-post-avatar" style="background-image: url('${post.user_profile_image || 'assets/img/profile-placeholder.jpg'}');"></div>
              <div class="media-post-user">${post.username}</div>
            </a>
            <div class="media-post-date">${date}</div>
          </div>
          <div class="media-post-content">
            <div class="swiper-container">
              <div class="swiper-wrapper">
                ${post.media.map(mediaItem => `
                  <div class="swiper-slide post-media" style="height: ${imageHeight}; ">
                    ${mediaItem.media_type === 'video' ? 
                    // `
                    //   <video autoplay loop muted playsinline class="video-background media-post-video" id="${mediaItem.id}">
                    //     <source src="${mediaItem.media_url}" type="${mediaItem.media_mime_type}" />
                    //   </video>
                    // `
                    'Disabled for testing'
                     : `
                      <img src="${mediaItem.media_url}" alt="${mediaItem.media_alt}" />
                    `}
                  </div>
                `).join('')}
              </div>
              <div class="swiper-pagination"></div>
            </div>
          </div>
          ${post_actions}
          <div class="media-post-likecount" data-like-count="${post.likes_count}">${post.likes_count} likes</div>
          <div class="media-post-description">
            <strong>${post.username}</strong> <br/> <span class="post-caption">${shortDescription}</span>
            <span class="full-description hidden">${post.caption}</span>
            ${isLongDescription ? `<span class="media-post-readmore">... more</span>` : ''}
          </div>
          ${post.comments_count > 0 ? `<div class="media-post-commentcount popup-open" data-popup=".comments-popup" data-post-id="${post.id}">View ${post.comments_count} comments</div>` : ''}
        </div>
      </div>
    `;

    postsContainer.append(postItem);
  });
}

$(document).on('click', '.media-post-readmore', function () {
  const postDescription = this.previousElementSibling.previousElementSibling; // The short description
  const fullDescription = this.previousElementSibling; // The full description

  if (fullDescription.classList.contains('hidden')) {
    postDescription.classList.add('hidden');
    fullDescription.classList.remove('hidden');
    this.textContent = '... less';
  } else {
    postDescription.classList.remove('hidden');
    fullDescription.classList.add('hidden');
    this.textContent = '... more';
  }
});

$(document).on('click', '.media-post-like i', (e) => {
  const postId = e.target.getAttribute('data-post-id')

  const parent = e.target.closest('.media-post')
  const isSingle = parent.classList.contains('single') ? true : false

  togglePostLike(postId, isSingle)
})

// media-post-edit click
// set the post id as a data attribute from the edit post popup
$(document).on('click', '.media-post-edit', function () {
  const postId = $(this).closest('.media-post').attr('data-post-id')
  $('.edit-post-popup').attr('data-post-id', postId)
})

$(document).on('click', '#delete-post', function () {
  // set the post id as a data attribute from the edit post popup
  const postId = $('.edit-post-popup').attr('data-post-id')

  app.dialog.confirm('Are you sure you want to delete this post?', 'Delete Post', async () => {
    const response = await deletePost(postId)
    if (response) {
      showToast('Post deleted successfully')
      // remove the post from the DOM
      $(`.media-post[data-post-id="${postId}"]`).remove()
      app.popup.close('.edit-post-popup')
    } else {
      showToast('Failed to delete post')
    }
  })
})

$(document).on('touchstart', '.media-post-content .swiper-wrapper', detectDoubleTapClosure((e) => {
  const parent = e.closest('.media-post')
  const postId = parent.getAttribute('data-post-id')
  const isLiked = parent.getAttribute('data-is-liked') === 'true'

  if (isLiked) {
    return
  }

  togglePostLike(postId)
}), {
  passive: false
})

// media-post-video click
$(document).on('click', '.media-post-video', function () {
  if (this.paused) {
    this.play()
  } else {
    this.pause()
  }
})

export function togglePostLike(postId, single = false) {
  // Find the post element and its like icon
  let container = single ? `.media-post.single[data-post-id="${postId}"]` : `.media-post[data-post-id="${postId}"]`
  const postElement = document.querySelector(container)
  const likeIcon = postElement.querySelector('.media-post-like i')
  const isLiked = postElement.getAttribute('data-is-liked') === 'true'
  const likeCountElem = postElement.querySelector('.media-post-likecount')
  let likeCount = parseInt(likeCountElem.getAttribute('data-like-count'))

  // Toggle the like state
  if (isLiked) {
    likeIcon.classList.remove('text-red')
    likeIcon.innerText = 'heart'
    likeCount--
    postElement.setAttribute('data-is-liked', 'false')
  } else {
    likeIcon.classList.add('text-red')
    likeIcon.innerText = 'heart_fill'
    likeCount++
    postElement.setAttribute('data-is-liked', 'true')
  }

  // Update like count
  likeCountElem.innerText = `${likeCount} likes`
  likeCountElem.setAttribute('data-like-count', likeCount)

  // Optionally, make an API call to update the like status on the server
  // fetch(`/api/posts/${postId}/like`, { method: 'POST' });
  maybeLikePost(postId)
}

function displayComments(comments, postId) {
  const user = store.getters.user.value

  const commentsContainer = document.getElementById('comments-list')
  // reset the comments container
  commentsContainer.innerHTML = ''
  const commentForm = document.getElementById('comment-form')
  commentForm.setAttribute('data-post-id', postId)

  if (!comments.length) {
    commentsContainer.innerHTML = '<div class="no-comments">No comments found</div>'
    return
  }

  comments.forEach(comment => {
    const replyItems = comment.replies.length > 0 ? `
        <div class="comment-replies">
          <span class="comment-replies-toggle" data-replies-count="${comment.replies.length}">
            Show ${comment.replies.length} ${comment.replies.length > 1 ? 'replies' : 'reply'}
          </span>
          <div class="comment-replies-container">
            ${comment.replies.map(reply => {
              // Determine the delete button visibility
              const deleteButton = reply.user_id == user.id ? 
                `<div class="comment-delete" data-comment-id="${reply.id}">
                <i class="icon f7-icons text-red">trash</i>
                </div>` : 
                '';

              return `
                <div class="comment" data-comment-id="${reply.id}" data-is-liked="${reply.liked}" data-owner-id="${reply.user_id}"
                  data-owner-name="${reply.user_login}">
                  <div class="comment-profile-img" style="background-image:url('${reply.profile_image || 'assets/img/profile-placeholder.jpg'}');"></div>
                  <div class="comment-content-container">
                    <div class="comment-username">
                      <a href="${reply.user_id === user.id ? '/profile/' : `/profile-view/${reply.user_id}`}">
                        ${reply.user_login}
                      </a>
                      <span class="date">${formatPostDate(reply.comment_date)}</span>
                    </div>
                    <div class="comment-content">${reply.comment}</div>
                    <div class="comment-actions">
                      <div class="comment-like">
                        <i class="icon f7-icons ${reply.liked ? 'text-red' : ''}">
                          ${reply.liked ? 'heart_fill' : 'heart'}
                        </i> 
                        <span class="comment-likes-count" data-likes-count="${reply.likes_count}">
                          ${reply.likes_count}
                        </span>
                      </div>
                      <div class="comment-reply">
                        <i class="icon f7-icons">chat_bubble</i> <span>Reply</span>
                      </div>
                      ${deleteButton}
                    </div>
                  </div>
                  <div class="clearfix"></div>
                </div>`;
            }).join('')}
          </div>
        </div>` : '';

    let commenter_link = `/profile-view/${comment.user_id}`;

    if (comment.user_id == user.id) {
      commenter_link = '/profile/';
    }

    const deleteButton = comment.user_id == user.id ?
      `<div class="comment-delete" data-comment-id="${comment.id}"><i class="icon f7-icons text-red">trash</i></div>` : '';

    const commentItem = `
      <div class="comment" 
        data-comment-id="${comment.id}" 
        data-is-liked="${comment.liked}" 
        data-owner-id="${comment.user_id}"
        data-owner-name="${comment.user_login}">
        <div class="comment-profile-img" style="background-image:url('${comment.profile_image || 'assets/img/profile-placeholder.jpg'}');"></div>
        <div class="comment-content-container">
          <div class="comment-username">
           <a href="${commenter_link}">${comment.user_login}</a>
          <span class="date">${formatPostDate(comment.comment_date)}</span>
          </div>
          <div class="comment-content">${comment.comment}</div>
          <div class="comment-actions">
            <div class="comment-like">
              <i class="icon f7-icons ${comment.liked && 'text-red'}">${comment.liked ? 'heart_fill' : 'heart'}</i> 
              <span class="comment-likes-count" data-likes-count="${comment.likes_count}">
                ${comment.likes_count}
              </span>
            </div>
            <div class="comment-reply">
              <i class="icon f7-icons">chat_bubble</i> <span>Reply</span>
            </div>
            ${deleteButton}
          </div>
          ${replyItems}
        </div>
        <div class="clearfix"></div>
      </div>
    `
    commentsContainer.insertAdjacentHTML('beforeend', commentItem)
  })

  // Add click event listener for liking a comment
  const likeButtons = document.querySelectorAll('.comment-like')
  likeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const commentId = event.currentTarget.closest('.comment').getAttribute('data-comment-id')
      const ownerId = event.currentTarget.closest('.comment').getAttribute('data-owner-id')
      toggleCommentLike(commentId, ownerId)
    })
  })
}

function toggleCommentLike(commentId, ownerId) {
  // Find the comment element and its like icon
  const commentElement = document.querySelector(`.comment[data-comment-id="${commentId}"]`)
  const likeIcon = commentElement.querySelector('.comment-like i')
  const isLiked = commentElement.getAttribute('data-is-liked') === 'true'
  const likeCountElem = commentElement.querySelector('.comment-likes-count')
  let likeCount = parseInt(likeCountElem.getAttribute('data-likes-count'))

  // Toggle the like state
  if (isLiked) {
    likeIcon.classList.remove('text-red')
    likeIcon.innerText = 'heart'
    likeCount--
    commentElement.setAttribute('data-is-liked', 'false')
  } else {
    likeIcon.classList.add('text-red')
    likeIcon.innerText = 'heart_fill'
    likeCount++
    commentElement.setAttribute('data-is-liked', 'true')
  }

  // Update like count
  likeCountElem.innerText = likeCount
  likeCountElem.setAttribute('data-likes-count', likeCount)

  maybeLikeComment(commentId, ownerId)
}

// on .popup-open click
$(document).on('click', '.media-post-comment, .media-post-commentcount', async function () {
  const postId = this.getAttribute('data-post-id')

  if (!postId) {
    return
  }

  document.getElementById('comments-list').innerHTML = '<div class="preloader"></div>'
  document.getElementById('comment-form').reset()

  // update the post id in the comment form
  document.getElementById('comment-form').setAttribute('data-post-id', '')
  document.getElementById('comment-form').removeAttribute('data-comment-id')

  document.getElementById('comment-form').querySelector('.replying-to').innerHTML = ''
  document.getElementById('comment-form').querySelector('.replying-to').classList.add('hidden')

  const comments = await fetchComments(postId)

  displayComments(comments, postId)
  // CommentsPopup.open()
})

// .media-post-share
$(document).on('click', '.media-post-share', function () {
  // set the post id as a data attribute 
  const postId = $(this).closest('.media-post').attr('data-post-id')
  $('.share-popup').attr('data-post-id', postId)
  $('#copy-link').attr('data-clipboard-text', `${window.location.origin}/post-view/${postId}`)
})

$(document).on('click', '#share-post-email', function () {
  const postId = $(this).closest('.popup').attr('data-post-id')
  const postLink = `${window.location.origin}/post-view/${postId}`

  // open the email composer
  window.open(`mailto:?subject=Check out this post&body=${postLink}`)
})

// data-clipboard-text click
$(document).on('click', '#copy-link', function () {
  const copyText = $(this).attr('data-clipboard-text')
  navigator.clipboard.writeText(copyText)

  app.toast.create({
    text: 'Link copied to clipboard',
    closeTimeout: 2000
  }).open()
})

// on .comment-replies-toggle click
$(document).on('click', '.comment-replies-toggle', function () {
  const commentRepliesContainer = this.nextElementSibling
  commentRepliesContainer.classList.toggle('show')
  const repliesCount = this.getAttribute('data-replies-count')

  this.innerText = this.innerText === `Show ${repliesCount} replies` ? `Hide ${repliesCount} replies` : `Show ${repliesCount} replies`
})

// on comment form submit
$('#comment-form').on('submit', async function (e) {
  e.preventDefault()

  const postId = this.getAttribute('data-post-id')
  const commentId = this.getAttribute('data-comment-id')
  const comment = this.comment.value

  if (!comment) {
    // app.dialog.alert('Please enter a comment')
    return
  }

  app.preloader.show()

  const response = await addComment(postId, comment, commentId)

  app.preloader.hide()

  if (response) {
    this.reset()
    this.removeAttribute('data-comment-id')
    this.querySelector('.replying-to').innerHTML = ''
    this.querySelector('.replying-to').classList.add('hidden')
    const comments = await fetchComments(postId)
    displayComments(comments, postId)
  } else {
    app.dialog.alert('Failed to add comment')
  }
})

//.comment-reply click
$(document).on('click', '.comment-reply', function () {
  // get the comment id, and comment owner id
  const commentId = this.closest('.comment').getAttribute('data-comment-id')
  const ownerId = this.closest('.comment').getAttribute('data-owner-id')
  const ownerName = this.closest('.comment').getAttribute('data-owner-name')

  console.log('Replying to comment', commentId, 'by', ownerId, ownerName)

  // add something above the comment form to show the user they are replying to a comment
  // add the comment id to the form
  document.getElementById('comment-form').setAttribute('data-comment-id', commentId)
  document.getElementById('comment-form').comment.focus()

  // add the owner name to the form
  //  <span class="replying-to">Replying to <strong>m88xrk</strong></span>
  const replyingTo = document.getElementById('comment-form').querySelector('.replying-to')
  replyingTo.innerHTML = `Replying to <strong>${ownerName}</strong>`
  replyingTo.classList.remove('hidden')
  document.getElementById('comment-form').prepend(replyingTo)
})

$(document).on('click', '.comment-delete', async function () {


  app.dialog.confirm('Are you sure you want to delete this comment? This will remove all replies to this comment', 'Delete Comment', async () => {
    try {
      const commentId = this.getAttribute('data-comment-id')
      const response = await deleteComment(commentId)

      if (response && response.success) {
        // remove the comment from the DOM
        $(`.comment[data-comment-id="${commentId}"]`).remove()
        showToast('Comment deleted successfully')
      }
    } catch (error) {
      app.dialog.alert('Failed to delete comment')
    }
  })
})

$(document).on('page:afterin', '.page[data-name="home"]', function (e) {
  console.log('Home page after in');
  store.dispatch('getPosts', 1)
  store.dispatch('getFollowingPosts', 1)
})

$(document).on('click', '.comment-username a', function (e) {
  // hide the comments popup
  app.popup.close()
})