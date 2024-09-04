import {
    getSessionUser,
    updatePassword,
    updateUserDetails,
    updateUsername
} from "./api/auth.js"
import {
    addUserProfileLinks,
    removeProfileLink,
    updateCoverImage,
    updateProfileImage,
    updateSocialLinks
} from "./api/profile.js"
import app, {
    showToast
} from "./app.js"
import store from "./store.js"

var $ = Dom7

// --------------- Edit Profile Page ---------------
$(document).on('page:init', '.page[data-name="profile-edit-mydetails"]', async function (e) {
    var view = app.views.current

    const user = await getSessionUser()

    if (!user) {
        view.router.navigate('/login')
        return
    }

    // Example of how to fill in the form fields with the provided data
    document.querySelector('input[name="email"]').value = user.email || '';
    document.querySelector('input[name="first_name"]').value = user.first_name || '';
    document.querySelector('input[name="last_name"]').value = user.last_name || '';
    document.querySelector('input[name="tel_no"]').value = user.billing_info?.phone || '';
})

$(document).on('click', '#save-details', async function () {
    var view = app.views.current

    const user = await getSessionUser()

    // Get the values from the input fields
    const firstName = $('input[name="first_name"]').val().trim();
    const lastName = $('input[name="last_name"]').val().trim();
    const email = $('input[name="email"]').val().trim();
    const telNo = $('input[name="tel_no"]').val().trim();

    // Validate the input fields
    if (firstName === '') {
        showToast('Please enter your first name', 'Error');
        return;
    }

    if (lastName === '') {
        showToast('Please enter your last name', 'Error');
        return;
    }

    if (email === '') {
        showToast('Please enter your email', 'Error');
        return;
    }

    // Simple email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showToast('Please enter a valid email address', 'Error');
        return;
    }

    // // phone validation
    // if (telNo === '') {
    //     showToast('Please enter a valid phone number', 'Error');
    //     return
    // }

    // Prepare the data for the API request
    const requestData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: telNo,
    };

    // check if the request data is the same as userdata
    let dirtied = false;

    for (const key in requestData) {
        if (key == 'phone') {
            if (requestData[key] !== user.billing_info.phone) {
                dirtied = true
                break;
            }
            continue
        }

        if (requestData[key] !== user[key]) {
            dirtied = true
            break;
        }
    }

    if (!dirtied) {
        return
    }

    try {
        app.preloader.show()

        const response = await updateUserDetails(requestData, email !== user.email)

        app.preloader.hide()


        if (response && response.success) {
            // showToast('Details updated successfully', 'Success');
            showToast('Details updated successfully')
            view.router.navigate('/profile/')
            store.dispatch('updateUserDetails')
            return;
        }

        throw new Error(response.message);
    } catch (error) {
        app.preloader.hide()
        showToast(error.message, 'Error');
    }
});

$(document).on('click', '#update_password', async function () {
    var view = app.views.current

    // Get the values from the password input fields
    const password = $('input[name="password"]').val().trim();
    const current_password = $('input[name="current_password"]').val().trim();
    const confirmPassword = $('input[name="confirm_password"]').val().trim();

    if (current_password === '') {
        showToast('Please enter your current password', 'Error');
        return
    }

    if (password.length < 8) {
        showToast('Password must be at least 8 characters long.')
        return
    }

    // Check if password contains at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        showToast('Password must contain at least one lowercase letter.')
        return
    }

    // Check if password contains at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        showToast('Password must contain at least one uppercase letter.')
        return
    }

    // Check if password contains at least one number
    if (!/\d/.test(password)) {
        showToast('Password must contain at least one number.')
        return
    }

    if (confirmPassword === '') {
        showToast('Please confirm your password', 'Error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'Error');
        return;
    }

    try {
        app.preloader.show()

        const response = await updatePassword(password, current_password)

        app.preloader.hide()

        if (response && response.success) {
            showToast('Password updated successfully')
            view.router.navigate('/profile/')
            return;
        }

        throw new Error(response.message);
    } catch (error) {
        app.preloader.hide()
        showToast(error.message || 'Failed to update password', 'Error');
    }
})
// --------------- End Edit Profile Page ---------------


// --------------- Edit Username Page ---------------
$(document).on('page:init', '.page[data-name="profile-edit-username"]', async function (e) {
    var view = app.views.current

    const user = await getSessionUser()

    if (!user) {
        view.router.navigate('/login')
        return
    }

    // Example of how to fill in the form fields with the provided data
    document.querySelector('input[name="username"]').value = user.username || '';

    if (user.can_update_username) {
        $('#username-editable').remove()
    } else {
        document.querySelector('#username-editable').innerText = `You can change your username in ${user.next_update_username} days`
    }
})

$(document).on('click', '#save-username', async function () {
    var view = app.views.current

    const user = await getSessionUser()

    if (!user.can_update_username) {
        return
    }

    const username = $('input[name="username"]').val()

    if (username === '') {
        showToast('Please enter a username', 'Error')
        return
    }

    // username can only have letters, numbers, and underscores
    var usernamePattern = /^[a-zA-Z0-9_]+$/
    if (!usernamePattern.test(username)) {
        showToast('Username can only contain letters, numbers, and underscores')
        return
    }

    // username must be at least 3 characters long
    if (username.length < 3) {
        showToast('Username must be at least 3 characters long')
        return
    }

    app.preloader.show()

    const response = await updateUsername(username)

    app.preloader.hide()

    if (response && response.success) {
        showToast('Username updated successfully', 'Success')
        view.router.navigate('/profile/')

        store.dispatch('updateUserDetails')
    } else {
        showToast('Failed to update username', 'Error')
    }
})
// --------------- End Edit Username Page ---------------


// --------------- Edit Profile images Page ---------------
$(document).on('page:init', '.page[data-name="profile-edit-images"]', async function (e) {
    var view = app.views.current

    const user = await getSessionUser()

    if (!user) {
        view.router.navigate('/login')
        return
    }

    // If a cover photo exists, use it as the background image of the upload label
    if (user.cover_image) {
        $('input[name="cover_image"]').closest('.custom-file-upload').find('label').css('background-image', `url('${user.cover_image}')`)
        $('input[name="cover_image"]').closest('.custom-file-upload').find('label').css('background-size', 'cover')
    }

    if (user.profile_image) {
        $('input[name="profile_image"]').closest('.custom-file-upload').find('label').css('background-image', `url('${user.profile_image}')`)
        $('input[name="profile_image"]').closest('.custom-file-upload').find('label').css('background-size', 'contain')
        $('input[name="profile_image"]').closest('.custom-file-upload').find('label').css('background-position', 'center')
        $('input[name="profile_image"]').closest('.custom-file-upload').find('label').css('background-repeat', 'no-repeat')
    }
})

$(document).on('click', '#save-profile-images', async function () {
    var view = app.views.current

    const cover_image = $('input[name="cover_image"]').prop('files')[0]
    const profile_image = $('input[name="profile_image"]').prop('files')[0]


    let coverBase64 = null
    let profileBase64 = null

    if (cover_image) {
        // Wrap the FileReader in a Promise to wait for it to complete
        coverBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(cover_image)

            reader.onload = () => resolve(reader.result)
            reader.onerror = () => reject(new Error('Failed to read image as base64'))
        })
    }

    if (profile_image) {
        // Wrap the FileReader in a Promise to wait for it to complete
        profileBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(profile_image)

            reader.onload = () => resolve(reader.result)
            reader.onerror = () => reject(new Error('Failed to read image as base64'))
        })
    }

    if (!coverBase64 && !profileBase64) {
        return
    }

    try {
        app.preloader.show()

        let promises = []

        if (profileBase64) {
            promises.push(updateProfileImage(profileBase64))
        }

        if (coverBase64) {
            promises.push(updateCoverImage(coverBase64))
        }

        const responses = await Promise.all(promises)
        app.preloader.hide()

        if (responses.every(response => response && response.success)) {
            showToast('Images updated successfully', 'Success')
            view.router.navigate('/profile/')

            store.dispatch('updateUserDetails')
            return
        }

        if (responses.some(response => response && !response.success)) {
            throw new Error('Failed to update images')
        }
    } catch (error) {
        showToast('Failed to update images', 'Error')
    }
})

$(document).on('change', 'input[name="cover_image"]', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        console.log($('.custom-file-upload.cover'));

        $('.custom-file-upload.cover')
            .find('label')
            .css('background-image', `url('${event.target.result}')`)
            .css('background-size', 'cover');
    };

    if (file) {
        reader.readAsDataURL(file);
    }
});

$(document).on('change', 'input[name="profile_image"]', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        console.log($('.custom-file-upload.profile'));

        $('.custom-file-upload.profile')
            .find('label')
            .css('background-image', `url('${event.target.result}')`)
            .css('background-size', 'cover');
    };

    if (file) {
        reader.readAsDataURL(file);
    }
});
// --------------- End Profile images Page ---------------


// --------------- Edit Socials Page ---------------
$(document).on('page:init', '.page[data-name="profile-edit-socials"]', async function (e) {
    var view = app.views.current

    const user = await getSessionUser()

    if (!user) {
        view.router.navigate('/login')
        return
    }

    const externalLinks = user.profile_links || {};

    // Populate form fields
    document.querySelector('input[name="social_instagram"]').value = externalLinks.instagram || '';
    document.querySelector('input[name="social_facebook"]').value = externalLinks.facebook || '';
    document.querySelector('input[name="social_tiktok"]').value = externalLinks.tiktok || '';
    document.querySelector('input[name="social_youtube"]').value = externalLinks.youtube || '';
    document.querySelector('input[name="social_mivia"]').value = externalLinks.mivia || '';
    document.querySelector('input[name="social_custodian"]').value = externalLinks.custodian || '';

    // .social-other-links ul
    const externalLinksContainer = $('.social-other-links ul')[0];

    externalLinks.external_links?.forEach(linkObj => {
        const listItem = document.createElement('li');


        listItem.innerHTML = `
        <a class="item-link item-content" href="${linkObj.link.url}" data-link-id="${linkObj.id}">
            <div class="item-inner">
                <div class="item-title">
                    ${linkObj.link.label}
                </div>
                <div class="item-after delete-external-link"><i class="icon f7-icons">xmark_circle</i></div>
            </div>
        </a>
        `;
        externalLinksContainer.appendChild(listItem);
    });
})

// Add event listener for the Save button
$(document).on('click', '#add-link-btn', async function () {
    const linkTitle = $('input[name="custom_link_title"]').val();
    const linkUrl = $('input[name="custom_link_url"]').val();

    // Validate the inputs
    if (linkTitle === '') {
        console.log('Please enter a link title.', $('input[name="custom_link_title"]'));
        showToast('Please enter a link title.', 'Error');
        return;
    }

    if (linkUrl === '') {
        showToast('Please enter a link URL.', 'Error');
        return;
    }

    // Simple URL validation (basic check)
    // const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([/\w \.-]*)*\/?$/;
    // if (!urlPattern.test(linkUrl)) {
    //     showToast('Please enter a valid URL.', 'Error');
    //     return;
    // }

    const urlPattern = /^(https?:\/\/)[\da-z\.-]+\.[a-z]{2,6}\/?$/;
    if (!urlPattern.test(linkUrl)) {
        showToast('Please enter a valid URL.', 'Error');
        return;
    }


    // Mock API request (POST request)
    const requestData = {
        label: linkTitle,
        url: linkUrl
    };

    app.popup.close()

    app.preloader.show()

    const response = await addUserProfileLinks({
        type: 'external_links',
        link: requestData
    })

    if (response && response.success) {
        showToast('Link added successfully', 'Success');

        // Add the new link to the list
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <a class="item-link item-content" href="${linkUrl}" data-link-id="${response.id}">
                <div class="item-inner">
                    <div class="item-title">
                        ${linkTitle}
                    </div>
                    <div class="item-after"><i class="icon f7-icons delete-external-link">xmark_circle</i></div>
                </div>
            </a>
        `;

        const externalLinksContainer = $('.social-other-links ul')[0];
        externalLinksContainer.appendChild(listItem);
    }

    app.preloader.hide()
});

// Save social links
$(document).on('click', '#save-profile-socials', async function () {
    var view = app.views.current

    const user = await getSessionUser()

    const instagram = $('input[name="social_instagram"]').val();
    const facebook = $('input[name="social_facebook"]').val();
    const tiktok = $('input[name="social_tiktok"]').val();
    const youtube = $('input[name="social_youtube"]').val();
    const mivia = $('input[name="social_mivia"]').val();
    const custodian = $('input[name="social_custodian"]').val();

    const links = {
        instagram,
        facebook,
        tiktok,
        youtube,
        mivia,
        custodian
    };

    // check if the request data is the same as userdata
    let dirtied = false;

    for (const key in links) {
        if (links[key] !== user.profile_links[key]) {
            dirtied = true
            break;
        }
    }

    if (!dirtied) {
        return
    }

    app.preloader.show()

    const response = await updateSocialLinks(links);


    app.preloader.hide()

    if (response && response.success) {
        showToast('Social links updated successfully', 'Success');
        store.dispatch('updateUserDetails')
        view.router.navigate('/profile/')
    } else {
        showToast('Failed to update social links', 'Error');
    }
})

// Delete link
$(document).on('click', '.delete-external-link', async function (e) {
    const linkId = e.target.closest('.item-link').dataset.linkId;

    // confirm dialog
    app.dialog.confirm('Are you sure you want to delete this link?', 'Delete Link', async function () {
        app.preloader.show()

        const response = await removeProfileLink(linkId);

        app.preloader.hide()

        if (response) {
            showToast('Link deleted successfully', 'Success')
            // remove the link from the list
            e.target.closest('.item-link').remove();
            store.dispatch('updateUserDetails')

        } else {
            showToast('Failed to delete link', 'Error')
        }
    })
})
// --------------- End Edit Socials Page ---------------

$(document).on('input', '#lowercaseInput', function (event) {
    this.value = this.value.toLowerCase();
});