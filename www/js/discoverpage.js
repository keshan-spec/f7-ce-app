import app from "./app.js";
import store from "./store.js";
var $ = Dom7;

var trendingEventsStore = store.getters.getTrendingEvents;
var trendingVenuesStore = store.getters.getTrendingVenues;
var eventCategories = store.getters.getEventCategories;
var filteredEventsStore = store.getters.getFilteredEvents;
var filteredVenuesStore = store.getters.getFilteredVenues;
var trendingUsersStore = store.getters.getTrendingUsers;

var isFetchingPosts = false
var currentEventsPage = 1
var currentVenuesPage = 1
var currentUsersPage = 1

var totalEventPages = 1
var totalVenuesPages = 1
var totalUsersPages = 1

var autocomplete;
var filters = {};

//AUTOCOMPLETE FUNCTIONS
function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById("autocomplete"), {
            types: ["establishment", "geocode"],
            componentRestrictions: {
                country: 'GB'
            }
        }
    );
    autocomplete.setFields(["geometry", "address_component"]);
    autocomplete.addListener("place_changed", fillInAddress);
}

function fillInAddress() {
    const place = autocomplete.getPlace();

    console.log(place);

    document.getElementById('lat').value = place.geometry.location.lat();
    document.getElementById('lng').value = place.geometry.location.lng();
}

function populateEventCard(data = [], isSwiper = true) {
    const swiperContainer = document.querySelector('#trending-events');
    if (isSwiper) swiperContainer.innerHTML = '';

    const eventsTabContainer = document.querySelector('#filtered-events-tab');

    data.forEach(event => {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        // const startDate = new Date(event.dates[0].start_date);
        // const endDate = new Date(event.dates[0].end_date);

        let endDateString = '';

        if (startDate.getDate() !== endDate.getDate()) {
            endDateString = `
            <div class="event-date-item">
                <p>${endDate.toLocaleString('default', { month: 'short' })}</p>
                <h5>${endDate.getDate()}</h5>
            </div>
            `
        }

        const card = `
            <div class="card event-item">
                <div class="event-image position-relative">
                    <div class="image-rectangle" style="background-image: url('${event.thumbnail}');"></div>
                    <div class="event-dates">
                        <div class="event-date-item">
                            <p>${startDate.toLocaleString('default', { month: 'short' })}</p>
                            <h5>${startDate.getDate()}</h5>
                        </div>
                        ${endDateString}
                    </div>
                </div>
                <a href="/discover-view-event/${event.id}">
                <div class="card-content">
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-info">Starts ${startDate.toLocaleString('default', { weekday: 'short' })}, ${startDate.getDate()} ${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getFullYear()}</p>
                    <div class="event-info">
                        ${event.location}
                    </div>
                    </a>
                </div>
            </div>
        `;

        if (isSwiper) {
            const swiperSlide = document.createElement('swiper-slide');
            swiperSlide.innerHTML = card;
            swiperContainer.appendChild(swiperSlide);
        }

        eventsTabContainer.innerHTML += card;
    });
}

function populateVenueCard(data = [], isSwiper = true) {
    const swiperContainer = document.querySelector('#trending-venues');

    if (isSwiper) swiperContainer.innerHTML = '';

    const eventsTabContainer = document.querySelector('#filtered-venues-tab');

    data.forEach(event => {
        const swiperSlide = document.createElement('swiper-slide');

        const card = `
            <div class="card event-item">
                <div class="event-image position-relative">
                    <div class="image-rectangle" style="background-image: url('${event.cover_image}');"></div>
                </div>
                <a href="/discover-view-venue/${event.ID}">
                <div class="card-content">
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-info">
                        ${event.venue_location}
                    </div>
                    <div class="event-info">
                        Apprx. ${event.distance} miles away
                    </div>
                </div>
                </a>
            </div>
        `;

        if (isSwiper) {
            swiperSlide.innerHTML = card;
            swiperContainer.appendChild(swiperSlide);
        }

        eventsTabContainer.innerHTML += card;
    });


}

function populateUsersCard(data = []) {
    const tabContainer = document.querySelector('#users-vehicles-tab');

    data.forEach(user => {
        let linkTo = user.type === 'user' ? `/profile-view/${user.id}` : `/profile-garage-vehicle-view/${user.id}`;
        let title;

        if (user.type === 'user') {
            title = user.name;
        }

        if (user.type === 'vehicle') {
            const userName = user.owner.name;
            const vehicleName = user.title;

            title = `${vehicleName} <br/> Owner ${userName}`;
        }


        const card = `
        <li>
            <a class="item-link search-result item-content" href="${linkTo}">
                <div class="item-media">
                    <div class="image-square image-rounded"
                        style="background-image:url('${user.thumbnail}')">
                    </div>
                </div>
                <div class="item-inner">
                    <div class="item-title">${title}</div>
                </div>
            </a>
        </li>
        `;
        tabContainer.innerHTML += card;
    });
}

// Event listener for the submit button
$(document).on('click', '.apply-filters', function (e) {
    const dateFilters = document.querySelector('#date-filters ul');
    const locationFilters = document.querySelector('#location-filters ul');
    const categoryFilters = document.querySelector('#category-filters ul');

    e.preventDefault(); // Prevent form submission if you're handling it via JavaScript
    const selectedCats = [...categoryFilters.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value);
    const selectedLocation = [...locationFilters.querySelectorAll('input[type="radio"]:checked')].map(cb => cb.value);
    const dateFilter = [...dateFilters.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value);

    filters = {
        'event_location': selectedLocation,
        //  'custom_location': location,
        'event_date': dateFilter,
        //  'event_start': customDateRange?.start,
        //  'event_end': customDateRange?.end,
        'event_category': !selectedCats?.includes(0) ? selectedCats : undefined,
    };

    // get active tab
    const activeTab = document.querySelector('.tabbar-nav .tab-link-active').getAttribute('data-id');

    if (activeTab === 'events') {
        store.dispatch('filterEvents', {
            page: 1,
            filters
        })

        currentEventsPage = 1
        isFetchingPosts = false

        const eventsTabContainer = document.querySelector('#filtered-events-tab');
        eventsTabContainer.innerHTML = '';
    }

    if (activeTab === 'venues') {
        store.dispatch('filterVenues', {
            page: 1,
            filters
        })

        currentVenuesPage = 1
        isFetchingPosts = false

        const venuesTabContainer = document.querySelector('#filtered-venues-tab');
        venuesTabContainer.innerHTML = '';
    }

    // close popup
    app.popup.close()
});

eventCategories.onUpdated((data) => {
    const categoryFilters = document.querySelector('#category-filters ul');

    data.forEach(category => {
        const listItem = document.createElement('li');

        listItem.innerHTML = `
            <label class="item-checkbox item-content">
                <input type="checkbox" name="${category.slug}" value="${category.id}" />
                <i class="icon icon-checkbox"></i>
                <div class="item-inner">
                    <div class="item-title">${category.name}</div>
                </div>
            </label>
        `;

        categoryFilters.appendChild(listItem);
    });


    var allCheckbox = categoryFilters.querySelector('input[name="all"]');

    // Event listeners for checkboxes
    categoryFilters.addEventListener('change', function (e) {
        const targetCheckbox = e.target;

        if (targetCheckbox.name !== "all") {
            // If any other checkbox is selected, uncheck "All"
            if (targetCheckbox.checked) {
                allCheckbox.checked = false;
            } else {
                // If all other checkboxes are unchecked, check "All"
                const allUnchecked = [...categoryFilters.querySelectorAll('input[type="checkbox"]')]
                    .filter(cb => cb.name !== "all")
                    .every(cb => !cb.checked);

                if (allUnchecked) {
                    allCheckbox.checked = true;
                }
            }
        } else {
            // If "All" is selected, uncheck all other checkboxes
            if (targetCheckbox.checked) {
                [...categoryFilters.querySelectorAll('input[type="checkbox"]')]
                .filter(cb => cb.name !== "all")
                    .forEach(cb => cb.checked = false);
            }
        }
    });
})

trendingVenuesStore.onUpdated((data) => {

    totalVenuesPages = data.total_pages

    populateVenueCard(data.data);
});

trendingEventsStore.onUpdated((data) => {
    totalEventPages = data.total_pages

    populateEventCard(data.data);
});

filteredEventsStore.onUpdated((data) => {
    const eventsTabContainer = document.querySelector('#filtered-events-tab');
    if (!data || data.data.length === 0) {
        eventsTabContainer.innerHTML = `
            <div class="no-events">
                <h3>No events found</h3>
            </div>
        `;
        return
    }

    totalEventPages = data.total_pages

    if ((totalEventPages == data.page) || (totalEventPages == 0) || (data.new_data.length < 10)) {
        $('.infinite-scroll-preloader.events-tab').hide()
    } else {
        $('.infinite-scroll-preloader.events-tab').show()
    }

    populateEventCard(data.new_data, false);
});

trendingUsersStore.onUpdated((data) => {
    const tabContainer = document.querySelector('#users-vehicles-tab');
    if (!data || data.data.length === 0) {
        tabContainer.innerHTML = `
            <div class="no-events">
                <h3>No trending users found for you</h3>
            </div>
        `;
        return
    }

    totalUsersPages = data.total_pages

    if ((totalUsersPages == data.page) || (totalUsersPages == 0) || (data.new_data.length < 10)) {
        $('.infinite-scroll-preloader.users-tab').hide()
    } else {
        $('.infinite-scroll-preloader.users-tab').show()
    }

    populateUsersCard(data.new_data);
});

filteredVenuesStore.onUpdated((data) => {
    const tabContainer = document.querySelector('#filtered-venues-tab');

    if (!data || data.data.length === 0) {
        tabContainer.innerHTML = `
            <div class="no-venues">
                <h3>No venues found</h3>
            </div>
        `;
        return
    }

    if ((totalVenuesPages == data.page) || (totalVenuesPages == 0) || (data.new_data.length < 10)) {
        $('.infinite-scroll-preloader.venues-tab').hide()
    } else {
        $('.infinite-scroll-preloader.venues-tab').show()
    }

    totalEventPages = data.total_pages
    populateVenueCard(data.new_data, false);
});

$(document).on('page:init', '.page[data-name="discover"]', function (e) {
    //Date Filters
    app.calendar.create({
        inputEl: '#date-from',
        openIn: 'customModal',
        header: true,
        footer: true,
    });

    app.calendar.create({
        inputEl: '#date-to',
        openIn: 'customModal',
        header: true,
        footer: true,
    });

    //Filter Date Popup
    app.popup.create({
        el: '.filter-bydate-popup',
        swipeToClose: 'to-bottom'
    });

    //Filter Category Popup
    app.popup.create({
        el: '.filter-bycategory-popup',
        swipeToClose: 'to-bottom'
    });

    //Filter Location Popup
    app.popup.create({
        el: '.filter-bylocation-popup',
        swipeToClose: 'to-bottom'
    });

    //SEARCH BAR
    $('.discover-search').on('mousedown', function (event) {
        event.preventDefault();
        app.views.discover.router.navigate('/search/');
    });

    const dateFilters = document.querySelector('#date-filters ul');
    const locationFilters = document.querySelector('#location-filters ul');

    // Event listener for checkbox selection
    dateFilters.addEventListener('change', function (e) {
        const targetCheckbox = e.target;

        // Uncheck all checkboxes except the one that was clicked
        if (targetCheckbox.type === "checkbox") {
            [...dateFilters.querySelectorAll('input[type="checkbox"]')].forEach(checkbox => {
                if (checkbox !== targetCheckbox) {
                    checkbox.checked = false;
                }
            });
        }
    });

    locationFilters.addEventListener('change', function (e) {
        const targetCheckbox = e.target;

        // Uncheck all checkboxes except the one that was clicked
        if (targetCheckbox.type === "checkbox") {
            [...locationFilters.querySelectorAll('input[type="checkbox"]')].forEach(checkbox => {
                if (checkbox !== targetCheckbox) {
                    checkbox.checked = false;
                }
            });
        }
    });

    initAutocomplete();
});

$(document).on('page:init', '.page[data-name="discover"]', function (e) {
    const infiniteScrollContent = document.querySelector('.discover-page.infinite-scroll-content')

    infiniteScrollContent.addEventListener('infinite', async function () {
        if (isFetchingPosts) return

        // get active tab
        const activeTabId = document.querySelector('.tabbar-nav .tab-link-active').getAttribute('data-id');

        if (!activeTabId) return

        isFetchingPosts = true

        if (activeTabId === 'events') {
            currentEventsPage++

            if (currentEventsPage <= totalEventPages) {
                await store.dispatch('filterEvents', {
                    page: currentEventsPage,
                    filters
                })
                isFetchingPosts = false
            }
        } else if (activeTabId === 'venues') {
            currentVenuesPage++

            if (currentVenuesPage <= totalVenuesPages) {
                await store.dispatch('filterVenues', {
                    page: currentVenuesPage,
                    filters
                })
                isFetchingPosts = false
            }
        }
    })
});