import {
    fetchVenue
} from "./api/discover.js";
import app from "./app.js";

var $ = Dom7;

//DISCOVER - VIEW EVENT
$(document).on('page:afterin', '.page[data-name="discover-view-venue"]', async function (e) {
    var venueId = e.detail.route.params.id
    console.log(venueId);

    const venueData = await fetchVenue(venueId);
    console.log(venueData);

    $('#copy-venue-link').attr('data-venue-id', venueId);

    const mainContainer = $('.discover-view-event');

    if (!venueData) {
        mainContainer.html('<div class="text-align-center">No event found</div>');
        return;
    }

    // Populating the Event Title
    mainContainer.find('.event-detail-title').text(venueData.title);

    // Populating the Event Location
    mainContainer.find('.event-time-address span').text(venueData.location);

    // Populating the Cover Image
    mainContainer.find('.event-detail-img-box .swiper-slide .swiper-image')
        .css('background-image', `url('${venueData.cover_photo.url}')`)
        .attr('alt', venueData.cover_photo.alt);

    // Populating the "About" Tab Content
    mainContainer.find('#tab-about .event-des-wrap').html(`<p>${venueData.description}</p>`);

    // Populating the "Follow" button state
    const followButton = mainContainer.find('.event-list-btn .btn.bg-dark');
    if (venueData.is_following) {
        followButton.text('Following');
    } else {
        followButton.text('Follow');
    }

    // Populating the "Upcoming Events" Tab (if there are any events)
    const eventsContainer = mainContainer.find('#tab-events .grid.event-listing');
    eventsContainer.empty(); // Clear any placeholder content

    if (venueData.events.length > 0) {
        venueData.events.forEach(event => {
            const eventItem = `
            <a href="#" class="card event-item">
                <div class="event-image position-relative">
                    <div class="image-rectangle" style="background-image: url('${event.image_url}');"></div>
                    <div class="event-dates">
                        <div class="event-date-item">
                            <p>${event.start_date_month}</p>
                            <h5>${event.start_date_day}</h5>
                        </div>
                        <div class="event-date-item">
                            <p>${event.end_date_month}</p>
                            <h5>${event.end_date_day}</h5>
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-info">Starts ${event.start_date}</p>
                    <div class="event-info">${event.location}</div>
                </div>
            </a>
        `;
            eventsContainer.append(eventItem);
        });
    } else {
        eventsContainer.html('<div class="text-align-center">No upcoming events</div>');
    }
})

$(document).on('click', '#copy-venue-link', function () {
    const venueId = $(this).attr('data-venue-id');
    const eventLink = `${window.location.origin}/discover-view-venue/${venueId}`;

    navigator.clipboard.writeText(eventLink);

    app.toast.create({
        text: 'Link copied to clipboard',
        closeTimeout: 2000
    }).open()
});