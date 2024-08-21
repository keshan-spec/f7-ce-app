import {
    API_URL
} from "./consts.js"
import {
    getSessionUser
} from "./auth.js";

export const addUserProfileLinks = async ({
    link,
    type,
}) => {
    const user = await getSessionUser();
    if (!user) return null;

    const response = await fetch(`${API_URL}/wp-json/app/v1/add-profile-links`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: user.id,
            link,
            type
        }),
    });

    const data = await response.json();
    return data;
};

export const updateSocialLinks = async (links) => {
    const user = await getSessionUser();
    if (!user) return;

    const response = await fetch(`${API_URL}/wp-json/app/v1/update-social-links`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: user.id,
            links
        }),
    });

    const data = await response.json();
    return data;
};

export const removeProfileLink = async (linkId) => {
    const user = await getSessionUser();
    if (!user) return;

    const response = await fetch(`${API_URL}/wp-json/app/v1/remove-profile-link`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: user.id,
            link_id: linkId
        }),
    });

    const data = await response.json();
    console.log(response);

    if (response.status !== 200 || data.error) {
        return false
    }

    return true;
};

export const updateUserDetails = async (details, email_changed) => {
    const user = await getSessionUser();
    if (!user) return;

    const response = await fetch(`${API_URL}/wp-json/app/v1/update-user-details`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: user.id,
            ...details,
            email_changed
        }),
    });

    const data = await response.json();
    return data;
};

export const updateProfileImage = async (image) => {
    const user = await getSessionUser();
    if (!user) return;

    const response = await fetch(`${API_URL}/wp-json/app/v1/update-profile-image`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: user.id,
            image
        }),
    });

    const data = await response.json();
    return data;
};

export const updateCoverImage = async (image) => {
    const user = await getSessionUser();
    if (!user) return;

    const response = await fetch(`${API_URL}/wp-json/app/v1/update-cover-image`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: user.id,
            image
        }),
    });

    const data = await response.json();
    return data;
};

export const maybeFollowUser = async (profileId) => {
    const user = await getSessionUser();
    if (!user) return;

    const response = await fetch(`${API_URL}/wp-json/app/v1/follow-user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            following_id: profileId,
            follower_id: user.id
        }),
    });

    const data = await response.json();
    return data;
};