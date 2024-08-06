//------------------------------------------ CORE ------------------------------------------//
import store from './store.js'
import {formatPostDate} from './utils.js'
import { fetchComments, maybeLikePost, maybeLikeComment, addComment } from './api/posts.js'

var $ = Dom7
var currentPage = 1

var app = new Framework7({
  name: 'DriveLife',
  theme: 'ios',
  //theme: 'auto',
  cache: false,
  el: '#app', // App root element
  on: {
    init: function () {
      store.dispatch('getPosts', currentPage)
    },
  },
  // App store
  store: store,
  // App routes
  routes: routes,
})

//------------------------------------------ CUSTOM ------------------------------------------//
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

// Init slider
app.swiper.create('.swiper-container', {
  speed: 400,
  spaceBetween: 0,
  observer: true,
  pagination: '.swiper-pagination'
})

var postsStore = store.getters.posts
var totalPages = 0;

postsStore.onUpdated((data)=> {
  totalPages = data.total_pages
  displayPosts(data.data)
})

// Pull to refresh content
const ptrContent = document.querySelector('.ptr-content')
ptrContent.addEventListener('ptr:refresh', function (e) {
  currentPage = 1
  store.dispatch('getPosts', currentPage)
  app.ptr.done()
})

// Infinite Scroll Event
const infiniteScrollContent = document.querySelector('.infinite-scroll-content')
infiniteScrollContent.addEventListener('infinite', function () {
  if (currentPage >= totalPages) {
    app.infiniteScroll.destroy(infiniteScrollContent)
    return
  }

  currentPage++
  store.dispatch('getPosts', currentPage)
})

//Comments Popup
var CommentsPopup = app.popup.create({
  el: '.comments-popup',
  swipeToClose: 'to-bottom'
});

function displayPosts(posts) {
  const postsContainer = document.getElementById('tab-latest')
  postsContainer.innerHTML = '' // Clear any existing posts

  posts.forEach(post => {
    const post_actions = `
     <div class="media-post-actions">
        <div class="media-post-like" data-post-id="${post.id}">
          <i class="icon f7-icons ${post.is_liked ? 'text-red' : ''}">${post.is_liked ? 'heart_fill' : 'heart'}</i>
        </div>
        <div class="media-post-comment popup-open" data-popup=".comments-popup" data-post-id="${post.id}">
          <i class="icon f7-icons">chat_bubble</i>
        </div>
        <div class="media-post-share">
          <i class="icon f7-icons">paperplane</i>
        </div>
        <div class="media-post-edit">
          <i class="icon f7-icons">gear_alt</i>
        </div>
      </div>
    `

    const date = formatPostDate(post.post_date)
    const postItem = `
          <div class="media-post" data-post-id="${post.id}" data-is-liked="${post.is_liked}">
            <div class="media-post-content">
              <div class="media-post-header">
                <div class="media-post-avatar" style="background-image: url('${post.user_profile_image || 'assets/img/avatar1.jpg'}');"></div>
                <div class="media-post-user">${post.username}</div>
                <div class="media-post-date">${date}</div>
              </div>
              <div class="media-post-content">
                <div class="swiper-container">
                  <div class="swiper-wrapper">
                    ${post.media.map(mediaItem => `
                      <div class="swiper-slide">
                        ${mediaItem.media_type === 'video' ? `
                          <video autoplay loop muted playsinline class="video-background">
                            <source src ="${mediaItem.media_url}" type ="${mediaItem.media_mime_type}" />
                          </video>
                        ` : `
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
              <div class="media-post-description"><strong>${post.username}</strong> • ${post.caption}
                <span class="media-post-readmore">... more</span>
              </div>
              ${post.comments_count > 0 ? `<div class="media-post-commentcount popup-open" data-popup=".comments-popup" data-post-id="${post.id}">View ${post.comments_count} comments</div>` : ''}
            </div>
          </div>
        `
    postsContainer.insertAdjacentHTML('beforeend', postItem)
  })

  // Initialize swiper for the dynamically added content
  app.swiper.create('.swiper-container', {
    pagination: {
      el: '.swiper-pagination',
    },
  })

  // Add click event listener for liking a post
  const likeButtons = document.querySelectorAll('.media-post-like')
  likeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const postId = event.currentTarget.getAttribute('data-post-id')
      togglePostLike(postId)
    })
  })
}

function togglePostLike(postId) {
  // Find the post element and its like icon
  const postElement = document.querySelector(`.media-post[data-post-id="${postId}"]`)
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
  const commentsContainer = document.getElementById('comments-list')
  // reset the comments container
  commentsContainer.innerHTML = ''
  const commentForm = document.getElementById('comment-form')

  if (!comments.length) {
    commentsContainer.innerHTML = '<div class="no-comments">No comments found</div>'
    commentForm.setAttribute('data-post-id', '')
    return
  }

  commentForm.setAttribute('data-post-id', postId)

  comments.forEach(comment => {
    const replyItems = comment.replies.length > 0 ? `
      <div class="comment-replies">
            <span class="comment-replies-toggle" data-replies-count="${comment.replies.length}">
            Show ${comment.replies.length} replies
            </span>
            <div class="comment-replies-container">
              ${comment.replies.map(reply => `
                <div class="comment" data-comment-id="${reply.id}" data-is-liked="${reply.liked}" data-owner-id="${reply.user_id}">
                  <div class="comment-profile-img" style="background-image:url('${reply.profile_image}');"></div>
                  <div class="comment-content-container">
                    <div class="comment-username">${reply.display_name}</div>
                    <div class="comment-content">${reply.comment}</div>
                    <div class="comment-actions">
                      <div class="comment-like">
                        <i class="icon f7-icons ${reply.liked && 'text-red'}">${reply.liked ? 'heart_fill' : 'heart'}</i> 
                        <span class="comment-likes-count" data-likes-count="${reply.likes_count}">
                        ${reply.likes_count}
                        </span>
                      </div>
                      <div class="comment-reply">
                        <i class="icon f7-icons">chat_bubble</i> <span>Reply</span>
                      </div>
                    </div>
                  </div>
                  <div class="clearfix"></div>
                </div>
              `).join('')}
            </div>
      </div>
    ` : ''

    const commentItem = `
      <div class="comment" 
        data-comment-id="${comment.id}" 
        data-is-liked="${comment.liked}" 
        data-owner-id="${comment.user_id}"
        data-owner-name="${comment.display_name}">
        <div class="comment-profile-img" style="background-image:url('${comment.profile_image}');"></div>
        <div class="comment-content-container">
          <div class="comment-username">${comment.display_name}</div>
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
$(document).on('click', '.popup-open', async function  () {
  document.getElementById('comments-list').innerHTML = '<div class="preloader"></div>'
  document.getElementById('comment-form').reset()

  // update the post id in the comment form
  document.getElementById('comment-form').setAttribute('data-post-id', '')
  document.getElementById('comment-form').removeAttribute('data-comment-id')

  document.getElementById('comment-form').querySelector('.replying-to').innerHTML = ''


  const postId = this.getAttribute('data-post-id')
  const comments = await fetchComments(postId)

  displayComments(comments, postId)
  CommentsPopup.open()
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
    app.dialog.alert('Please enter a comment')
    return
  }

  const response = await addComment(postId, comment, commentId)

  if (response) {
    app.dialog.alert('Comment added successfully')
    this.reset()
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

  console.log('Replying to comment', commentId, 'by', ownerId, ownerName);

  // add something above the comment form to show the user they are replying to a comment
  // add the comment id to the form
  document.getElementById('comment-form').setAttribute('data-comment-id', commentId)
  document.getElementById('comment-form').comment.focus()

  // add the owner name to the form
  //  <span class="replying-to">Replying to <strong>m88xrk</strong></span>
  const replyingTo = document.getElementById('comment-form').querySelector('.replying-to')
  replyingTo.innerHTML = `Replying to <strong>${ownerName}</strong>`
  document.getElementById('comment-form').prepend(replyingTo)
})