import store from "./store.js"

var $ = Dom7
var notificationsStore = store.getters.getNotifications

$(document).on('page:init', '.page[data-name="notifications"]', function (e) {
    store.dispatch('fetchNotifications')
})

notificationsStore.onUpdated((data) => {

    if (!data || !data.success) {
        $('#notifications-list').html('<p class="text-center">No notifications</p>')
        return
    }

    const notifications = data.data

    console.log('Notifications updated', notifications)

    renderNotifications(notifications.recent)
    renderNotifications(notifications.last_week)
    renderNotifications(notifications.last_30_days)
})

function renderNotifications(notifications) {
    const container = document.getElementById('notifications-list')
    // container.innerHTML = '' // Clear the container

    notifications.forEach(notification => {
        const {
            entity,
            date,
            type
        } = notification
        const {
            initiator_data,
            entity_data
        } = entity

        // Create notification wrapper
        const notificationItem = document.createElement('div')
        notificationItem.className = 'notification-item'

        // User profile image
        const profileImage = document.createElement('div')
        profileImage.className = 'profile-image'
        profileImage.style.width = '40px'
        profileImage.style.height = '40px'
        profileImage.style.borderRadius = '50%'
        profileImage.style.backgroundImage = `url('${initiator_data.profile_image || 'assets/img/profile-placeholder.jpg'}')`
        profileImage.style.backgroundSize = 'cover'
        profileImage.style.backgroundPosition = 'center'
        profileImage.style.marginRight = '10px'

        // Notification content
        const notificationContent = document.createElement('div')
        notificationContent.className = 'notification-content'
        notificationContent.style.flex = '1'

        // User name and message
        const userName = document.createElement('span')
        userName.className = 'user-name'
        userName.textContent = initiator_data.display_name
        userName.style.fontWeight = 'bold'
        userName.style.marginRight = '5px'

        const message = document.createElement('span')
        message.className = 'message'
        message.textContent = `mentioned you in a ${entity.entity_type}: ${entity_data.comment}`

        // Date
        const notificationDate = document.createElement('div')
        notificationDate.className = 'notification-date'
        notificationDate.textContent = new Date(date).toLocaleDateString()
        notificationDate.style.fontSize = '12px'
        notificationDate.style.color = '#999'

        // Media preview
        const mediaPreview = document.createElement('div')
        mediaPreview.className = 'media-preview'
        mediaPreview.style.width = '40px'
        mediaPreview.style.height = '40px'
        mediaPreview.style.backgroundImage = `url('${entity_data.media}')`
        mediaPreview.style.backgroundSize = 'cover'
        mediaPreview.style.backgroundPosition = 'center'
        mediaPreview.style.borderRadius = '4px'
        mediaPreview.style.marginLeft = '10px'

        // Append elements
        notificationContent.appendChild(userName)
        notificationContent.appendChild(message)
        notificationContent.appendChild(notificationDate)

        notificationItem.appendChild(profileImage)
        notificationItem.appendChild(notificationContent)
        if (entity_data.media) {
            notificationItem.appendChild(mediaPreview)
        }

        container.appendChild(notificationItem)
    })
}