import app from "./app.js";
import store from "./store.js";
var $ = Dom7;

var trendingEventsStore = store.getters.getTrendingEvents;
var trendingVenuesStore = store.getters.getTrendingVenues;
var eventCategories = store.getters.getEventCategories;
var filteredEventsStore = store.getters.getFilteredEvents;

var isFetchingPosts = false
var currentEventsPage = 1
var currentVenuesPage = 1

var totalEventPages = 1
var totalVenuesPages = 1

function populateEventCard(data = [], isSwiper = true) {
    const swiperContainer = document.querySelector('#trending-events');
    const eventsTabContainer = document.querySelector('#filtered-events-tab');

    data.forEach(event => {
        const startDate = new Date(event.dates[0].start_date);
        const endDate = new Date(event.dates[0].end_date);

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
                <div class="card-content">
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-info">Starts ${startDate.toLocaleString('default', { weekday: 'short' })}, ${startDate.getDate()} ${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getFullYear()}</p>
                    <div class="event-info">
                        ${event.location}
                    </div>
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

// DISCOVER SECTION
$(document).on('page:init', '.page[data-name="discover"]', function (e) {
    const infiniteScrollContent = document.querySelector('.discover-page.infinite-scroll-content')

    infiniteScrollContent.addEventListener('infinite', async function () {
        // if (isFetchingPosts) return

        const activeTab = document.querySelector('.tabbar-nav .tab-link-active')
        const activeTabId = activeTab.id

        console.log(activeTabId);


        if (!activeTabId) return

        isFetchingPosts = true

        if (activeTabId === 'events') {
            currentEventsPage++

            if (currentEventsPage <= totalEventPages) {
                await store.dispatch('filterEvents', currentEventsPage)
                isFetchingPosts = false
            }
        } else {
            currentVenuesPage++

            if (currentVenuesPage <= totalVenuesPages) {
                await store.dispatch('filterVenues', currentVenuesPage)
                isFetchingPosts = false
            }
        }
    })

    //SEARCH BAR
    $('.discover-search').on('mousedown', function (event) {
        event.preventDefault();
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

    // Event listener for the submit button
    $(document).on('click', '.apply-filters', function (e) {
        const categoryFilters = document.querySelector('#category-filters ul');

        e.preventDefault(); // Prevent form submission if you're handling it via JavaScript
        const selectedCats = [...categoryFilters.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value);

        const selectedLocation = [...locationFilters.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value);

        // date filter
        const dateFilter = [...dateFilters.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value);

        const filters = {
            'event_location': selectedLocation,
            //  'custom_location': location,
            'event_date': dateFilter,
            //  'event_start': customDateRange?.start,
            //  'event_end': customDateRange?.end,
            'event_category': !selectedCats?.includes(0) ? selectedCats : undefined,
        };

        store.dispatch('filterEvents', {
            page: 1,
            filters
        })

        currentEventsPage = 1
        currentVenuesPage = 1
        isFetchingPosts = false

        const eventsTabContainer = document.querySelector('#filtered-events-tab');
        eventsTabContainer.innerHTML = '';

        // close popup
        app.popup.close()
    });
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
    const swiperContainer = document.querySelector('#trending-venues');

    data.forEach(event => {
        const swiperSlide = document.createElement('swiper-slide');

        swiperSlide.innerHTML = `
            <div class="card event-item">
                <div class="event-image position-relative">
                    <div class="image-rectangle" style="background-image: url('${event.cover_image}');"></div>
                </div>
                <div class="card-content">
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-info">
                        ${event.venue_location}
                    </div>
                    <div class="event-info">
                        Apprx. ${event.distance} miles away
                    </div>
                </div>
            </div>
        `;

        swiperContainer.appendChild(swiperSlide);
    });

});

trendingEventsStore.onUpdated((data) => {
    populateEventCard(data);
});

filteredEventsStore.onUpdated((data) => {
    const eventsTabContainer = document.querySelector('#filtered-events-tab');
    eventsTabContainer.innerHTML = '';

    if (!data || data.length === 0) {
        eventsTabContainer.innerHTML = `
            <div class="no-events">
                <h3>No events found</h3>
            </div>
        `;
        return
    }

    totalEventPages = data.total_pages
    populateEventCard(data.data, false);
});

//DISCOVER SECTION - FILTERING
$(document).on('page:init', '.page[data-name="discover"]', function (e) {
    //Date Filters
    calendarModal = app.calendar.create({
        inputEl: '#date-from',
        openIn: 'customModal',
        header: true,
        footer: true,
    });

    calendarModal = app.calendar.create({
        inputEl: '#date-to',
        openIn: 'customModal',
        header: true,
        footer: true,
    });

    //Filter Date Popup
    var FilterDatePopup = app.popup.create({
        el: '.filter-bydate-popup',
        swipeToClose: 'to-bottom'
    });

    //Filter Category Popup
    var FilterCategoryPopup = app.popup.create({
        el: '.filter-bycategory-popup',
        swipeToClose: 'to-bottom'
    });

    //Filter Location Popup
    var FilterLocationPopup = app.popup.create({
        el: '.filter-bylocation-popup',
        swipeToClose: 'to-bottom'
    });



});