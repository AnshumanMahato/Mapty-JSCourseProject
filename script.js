'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapmark;

navigator.geolocation.getCurrentPosition(
    function (pos) {
        const { latitude, longitude } = pos.coords;
        const coords = [latitude, longitude];
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
        map = L.map('map').setView(coords, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        map.on('click', function (mapEvent) {
            const { latlng } = mapEvent;
            mapmark = [latlng.lat, latlng.lng];
            form.classList.remove('hidden');
            inputDistance.focus();
        });
    },

    function () {
        alert('Could not fetch location!!!');
    }
);

form.addEventListener('submit', function (e) {
    e.preventDefault();

    inputCadence.value =
        inputDistance.value =
        inputDuration.value =
        inputElevation.value =
            '';

    L.marker(mapmark)
        .addTo(map)
        .bindPopup(
            L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: 'running-popup',
            }).setContent(`Workout`)
        )
        .openPopup();
});

inputType.addEventListener('change', function() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
});
