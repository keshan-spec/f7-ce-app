import app from "./app.js";

var $ = Dom7;

//DISCOVER - VIEW EVENT
$(document).on('page:afterin', '.page[data-name="discover-view-venue"]', async function (e) {
    var venueId = e.detail.route.params.id
    console.log(venueId);

    $('#copy-venue-link').attr('data-venue-id', venueId);
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