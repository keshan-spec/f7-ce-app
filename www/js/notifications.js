import {
    getSessionUser
} from "./api/auth.js"
import {
    maybeFollowUser
} from "./api/profile.js"
import app from "./app.js"
import store from "./store.js"

var $ = Dom7
var notificationsStore = store.getters.getNotifications
var refreshed = false

$(document).on('page:afterin', '.page[data-name="notifications"]', async function (e) {
    const data = notificationsStore.value

    if (!data || !data.success) {
        return
    }

    // a list if all unread notification ids
    const unreadNotificationIds = [
        ...data.data.recent,
        ...data.data.last_week,
        ...data.data.last_30_days,
    ].filter((item) => item.is_read === "0").map((item) => item._id);

    if (unreadNotificationIds.length > 0) {
        store.dispatch('markNotificationsAsRead', unreadNotificationIds)
    }
})

notificationsStore.onUpdated(async (data) => {
    if (!data || !data.success) {
        $('.notification-wrap').html('<p class="text-center">No notifications</p>')
        return
    }

    const notifications = data.data

    const recentContainer = document.getElementById('recent');
    const thisWeekContainer = document.getElementById('this-week');

    if (refreshed) {
        recentContainer.innerHTML = '';
        thisWeekContainer.innerHTML = '';
        refreshed = false
    }

    document.querySelectorAll('.notification-title').forEach(elem => {
        elem.innerHTML = elem.getAttribute('data-title')
    })

    var user = await getSessionUser()

    if (!notifications.recent.length) {
        recentContainer.innerHTML = '<p class="text-center">No recent notifications</p>';
    }

    if (!notifications.last_week.length) {
        thisWeekContainer.innerHTML = '<p class="text-center">No notifications from this week</p>';
    }

    notifications.recent.forEach(notification => {
        const notificationItem = createNotificationItem(notification, user);
        recentContainer.appendChild(notificationItem);
    });

    notifications.last_week.forEach(notification => {
        const notificationItem = createNotificationItem(notification, user);
        thisWeekContainer.appendChild(notificationItem);
    });
})

function timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    return diffInHours > 24 ? `${Math.floor(diffInHours / 24)}d ago` : `${diffInHours}h ago`;
}

function createNotificationItem(notification, user) {
    const container = document.createElement('div');

    let isReadClass = notification.is_read == "0" ? "unread-notif" : "";

    container.className = `notification-item ${isReadClass}`;

    // Profile image and notification content container
    const leftContainer = document.createElement('a');
    leftContainer.href = `/profile-view/${notification.entity.user_id}`;
    leftContainer.className = 'notification-left';

    const imageDiv = document.createElement('div');
    imageDiv.className = 'image-square image-rounded';
    imageDiv.style.backgroundImage = `url('${notification.entity.initiator_data.profile_image || 'assets/img/profile-placeholder.jpg'}')`;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'notification-info';

    let content = '';

    // Conditional content rendering based on the type
    if (notification.type === 'like') {
        content = `
            <div class="notification-text">
                <strong>${notification.entity.initiator_data.display_name}</strong> liked your ${notification.entity.entity_type}
                ${notification.entity.entity_data.comment ? `<span class="inline font-semibold text-black">: "${notification.entity.entity_data.comment}"</span>` : ''}
                <span class=""></span>
            </div>
        `;
    } else if (notification.type === 'comment') {
        content = `
            <div class="notification-text">
                <strong>${notification.entity.initiator_data.display_name}</strong> commented on your post: 
                <span class="block font-semibold text-black">"${notification.entity.entity_data.comment}"</span>
                <span class="${isReadClass}"></span>
            </div>
        `;
    } else if (notification.type === 'follow') {
        content = `
            <div class="notification-text">
                <strong>${notification.entity.initiator_data.display_name}</strong> followed you
                <span class="${isReadClass}"></span>
            </div>
        `;
    } else if (notification.type === 'mention') {
        content = `
            <div class="notification-text">
                <strong>${notification.entity.initiator_data.display_name}</strong> mentioned you in a ${notification.entity.entity_type}
                ${notification.entity.entity_data.comment ? `<span class="block font-semibold text-black">"${notification.entity.entity_data.comment}"</span>` : ''}
                <span class="${isReadClass}"></span>
            </div>
        `;
    } else if (notification.type === 'post') {
        content = `
            <div class="notification-text">
                <strong>${notification.entity.initiator_data.display_name}</strong> has posted ${notification.entity.entity_type === 'car' ? "your car" : "a post"} 
                <a href="/profile/garage/${notification.entity.entity_data?.garage?.id}" class="font-semibold hover:cursor-pointer hover:text-customblue">
                    ${notification.entity.entity_data?.garage?.make || ''} ${notification.entity.entity_data?.garage?.model || ''}
                </a>
                <span class="${isReadClass}"></span>
            </div>
        `;
    } else if (notification.type === 'tag') {
        content = `
            <div class="notification-text">
                <strong>${notification.entity.initiator_data.display_name}</strong> ${notification.entity.entity_type === 'car' ? "tagged your car in a post" : "tagged you in a post"}
                <span class="${isReadClass}"></span>
            </div>
        `;
    }

    // Add time ago
    const timeSpan = document.createElement('span');
    timeSpan.className = 'notification-time';
    timeSpan.textContent = timeAgo(notification.date);


    infoDiv.innerHTML = `${content} ${timeSpan.outerHTML}`;

    // Adding profile image and content to the left container
    leftContainer.appendChild(imageDiv);
    leftContainer.appendChild(infoDiv);

    // Append left container to the main container
    container.appendChild(leftContainer);

    if (notification.type === 'follow') {
        const isFollowing = user.following.includes(notification.entity.user_id);
        let followBtn = `<div class="btn btn-primary btn-sm toggle-follow" data-is-following="${isFollowing}" data-user-id="${notification.entity.user_id}">
            ${isFollowing ? 'Unfollow' : 'Follow'}
        </div>`;

        container.innerHTML += followBtn;
    } else {
        const rightContainer = document.createElement('a');
        rightContainer.className = 'notification-left';
        let path;

        if (notification.entity.entity_type === 'car') {
            path = 'car';
        } else if (notification.entity.entity_type === 'post') {
            path = 'post-view';
        }

        rightContainer.href = `/${path}/${notification.entity.entity_id}`;

        const imageDiv = document.createElement('div');
        imageDiv.className = 'image-square image-rounded';
        imageDiv.style.backgroundImage = `url('${notification.entity.entity_data.media || 'assets/img/profile-placeholder.jpg'}')`;

        rightContainer.appendChild(imageDiv);
        container.appendChild(rightContainer)
    }

    return container;
}

$(document).on('click', '.toggle-follow', async function (e) {
    const userId = e.target.dataset.userId;
    const isFollowing = e.target.dataset.isFollowing === 'true';

    // update the button text
    e.target.textContent = isFollowing ? 'Follow' : 'Unfollow';
    e.target.dataset.isFollowing = !isFollowing;

    await maybeFollowUser(userId);
    store.dispatch('updateUserDetails')
});

$(document).on('ptr:refresh', '.notification-page.ptr-content', async function (e) {
    refreshed = true

    try {
        await store.dispatch('notificationCount')
        await store.dispatch('fetchNotifications')
    } catch (error) {
        console.log(error);
    }

    app.ptr.get('.notification-page.ptr-content').done()
})