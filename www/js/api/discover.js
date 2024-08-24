import {
    getSessionUser
} from "./auth.js";
import {
    API_URL
} from "./consts.js";

/**
 * Fetches the discover data
 * 
 * @param {string} search
 * @param {'users' | 'events' | 'venues' | 'all'} type 
 * @param {number} page default 1
 * 
 */
export const getDiscoverData = async (search, type, page = 1, signal) => {
    const user = await getSessionUser();

    const response = await fetch(`${API_URL}/wp-json/app/v1/discover-search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            search,
            user_id: user?.id,
            page,
            type,
            per_page: 10
        }),
        signal
    });

    const data = await response.json();
    return data;
};

export const fetchEvent = async (eventId) => {
    let user;
    try {
        user = await getSessionUser();
    } catch (e) {
        console.error("Error fetching user no session");
    }

    const response = await fetch(`${API_URL}/wp-json/app/v1/get-event`, {
        cache: "no-cache",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            event_id: eventId,
            user_id: user?.id
        }),
    });

    const data = await response.json();
    if (response.status !== 200) {
        throw new Error(data.message);
    }

    return data;
};

export const fetchTrendingEvents = async (page, paginate = false, filters = null) => {
    try {
        const user = await getSessionUser();

        if (!user) {
            throw new Error('Session user not found');
        }

        const response = await fetch(`${API_URL}/wp-json/app/v1/get-events-trending`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user.id,
                page,
                per_page: 10,
                paginate,
                filters
            }),
        });

        const data = await response.json();

        if (!data) {
            throw new Error('Failed to fetch trending events');
        }

        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const fetchTrendingVenues = async (page, paginate = false, filters = '{}') => {
    try {
        const user = await getSessionUser();

        if (!user) {
            throw new Error('Session user not found');
        }

        const response = await fetch(`${API_URL}/wp-json/app/v1/get-venues-trending`, {
            method: "POST",
            cache: "force-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user.id,
                page,
                per_page: 10,
                paginate,
                filters
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getEventCategories = async () => {
    const response = await fetch(`${API_URL}/wp-json/app/v1/get-event-categories`, {
        method: "GET",
        cache: "force-cache",
    });

    const data = await response.json();
    return data;
};

export const maybeFavoriteEvent = async (eventId) => {
    const user = await getSessionUser();

    if (!user || !user.id) {
        return null;
    }

    const response = await fetch(`${API_URL}/wp-json/app/v1/favourite-event`, {
        cache: "no-cache",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            event_id: eventId,
            user_id: user.id
        }),
    });

    const data = await response.json();
    return data;
};