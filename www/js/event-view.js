import {
    fetchEvent,
    maybeFavoriteEvent
} from "./api/discover.js";
import app from "./app.js";

var $ = Dom7;

//DISCOVER - VIEW EVENT
$(document).on('page:afterin', '.page[data-name="discover-view-event"]', async function (e) {
    var eventId = e.detail.route.params.id

    const eventData = await fetchEvent(eventId)
    console.log(eventData);

    const mainContainer = $('.discover-view-event.view-event');

    if (!eventData) {
        mainContainer.html('<div class="text-align-center">No event found</div>');
        return;
    }

    // Populating the Event Title
    mainContainer.find('.event-detail-title').text(eventData.title);

    // Populating the Event Date
    const dateText = `Sun, Aug 25th 2024`; // You can format this dynamically if needed
    mainContainer.find('.event-time-address:nth-child(1) span').text(dateText);

    // Populating the Event Time
    const timeText = `${eventData.dates[0].start_time} - ${eventData.dates[0].end_time}`;
    mainContainer.find('.event-time-address:nth-child(2) span').text(timeText);

    // Populating the Event Location
    mainContainer.find('.event-time-address:nth-child(3) span').text(eventData.location);

    // Populating the Event Description in "About" Tab
    mainContainer.find('#tab-about .event-des-wrap').html(`<p>${eventData.description}</p>`);
    mainContainer.find('#tab-entry-details .event-des-wrap').html(`<p>${eventData.entry_details}</p>`);

    if (eventData.has_tickets) {
        // Populating the Ticket Button URL
        mainContainer.find('.event-list-btn .btn.bg-dark').on('click', function () {
            window.location.href = eventData.ticket_url;
        });
    } else {
        // Hiding the Ticket Button
        mainContainer.find('.event-list-btn').hide();
    }

    // Populating the Swiper Images
    const swiperWrapper = mainContainer.find('.swiper-wrapper');
    swiperWrapper.empty(); // Clear existing placeholders

    const gallery = eventData.gallery || [];
    gallery.push({
        url: eventData.cover_photo.url
    });

    gallery.forEach(image => {
        const slide = `
        <div class="swiper-slide">
            <div class="swiper-image" style="background-image: url('${image.url}');"></div>
        </div>
    `;
        swiperWrapper.append(slide);
    });

    mainContainer.find('.event-des-wrap a').on('click', function (e) {
        console.log('clicked');
        e.preventDefault();
        window.open($(this).attr('href'), '_blank');
    });

    $('#copy-event-link').attr('data-event-id', eventId)

    // set the event id to the favourite button
    const faveBtn = $('#favourite_event')
    faveBtn.attr('data-event-id', eventId)

    if (eventData.is_liked) {
        faveBtn.addClass('favourite')
        faveBtn.innerHTML = `<i class="f7-icons">heart_fill</i> Favourite`
    } else {
        faveBtn.removeClass('favourite')
        faveBtn.innerHTML = `<i class="f7-icons">heart</i> Favourite`
    }
});

$(document).on('click', '#favourite_event', async function () {
    // get the event id from the button
    const eventId = $(this).attr('data-event-id');
    const isFavourite = $(this).hasClass('favourite');

    // optmisitically update the UI
    if (isFavourite) {
        $(this).removeClass('favourite')
        $(this).innerHTML = `<i class="f7-icons">heart</i> Favourite`
    } else {
        $(this).addClass('favourite')
        $(this).innerHTML = `<i class="f7-icons">heart_fill</i> Favourite`
    }

    // call the API to favourite the event
    await maybeFavoriteEvent(eventId);
})

$(document).on('click', '#copy-event-link', function () {
    const eventId = $(this).attr('data-event-id');
    const eventLink = `${window.location.origin}/discover-view-event/${eventId}`;

    navigator.clipboard.writeText(eventLink);


    app.toast.create({
        text: 'Link copied to clipboard',
        closeTimeout: 2000
    }).open()
});