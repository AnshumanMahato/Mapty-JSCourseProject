//jshint esversion:6

'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Workout {
    constructor(coords, distance, duration) {
        this._coords = coords; // [latitude,longitude]
        this._distance = distance; // in km
        this._duration = duration; // in min
        this._date = new Date();
        this._id = (Date.now() + '').slice(-10);
    }
}

class Running extends Workout {
    constructor(coords, distance, duration, cadance) {
        super(coords, distance, duration);
        this._type = 'running';
        this._cadence = cadance;
        this.calcPace();
    }

    calcPace() {
        // min/km
        this._pace = this._duration / this._distance;
        return this._pace;
    }
}

class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this._type = 'cycling';
        this._elevationGain = elevationGain;
        this.calcSpeed();
    }

    calcSpeed() {
        this._speed = this._distance / (this._duration / 60);
        return this._speed;
    }
}

////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
    constructor() {
        this._workouts = [];
        this._map = L.map('map');
        this._mapMark = undefined;
        this._getPosition();

        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                function () {
                    alert('Could not fetch location!!!');
                }
            );
        }
    }

    _loadMap(pos) {
        const { latitude, longitude } = pos.coords;
        const coords = [latitude, longitude];
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
        this._map.setView(coords, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this._map);

        this._map.on('click', this._showForm.bind(this));
    }

    _showForm(mapEvent) {
        const { latlng } = mapEvent;
        this._mapMark = [latlng.lat, latlng.lng];
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationField() {
        inputCadence
            .closest('.form__row')
            .classList.toggle('form__row--hidden');
        inputElevation
            .closest('.form__row')
            .classList.toggle('form__row--hidden');
    }

    _renderMapMarker(workout) {
        L.marker(workout.coords)
            .addTo(this._map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                }).setContent(`Workout`)
            )
            .openPopup();
    }

    _newWorkout(e) {
        const isValid = (...inputs) =>
            inputs.every(input => Number.isFinite(input));
        const isPositive = (...inputs) => inputs.every(input => input > 0);
        e.preventDefault();

        //Get data from the form

        const type = inputType.value;
        const distance = inputDistance.value;
        const duration = inputDuration.value;
        let workout;

        if (type === 'running') {
            const cadence = inputCadence.value;
            //Validate Data
            if (
                !isValid(distance, duration, cadence) ||
                !isPositive(distance, duration, cadence)
            )
                return alert('Only postive inputs are supported');

            //Create Running Object
            
            workout = new Running(this._mapMark,distance,duration,cadence);

        }

        if (type === 'cycling') {
            const elevation = inputElevation.value;
            //Validate Data
            if (
                !isValid(distance, duration, elevation) ||
                !isPositive(distance, duration)
            )
                return alert('Only postive inputs are supported');

            //Create Cycling object

            workout = new Cycling(this._mapMark,distance,duration,elevation);
        }

        //Add object to the workout array
        this._workouts.push(workout);
        //Render workout on the map
        this._renderMapMarker(workout);

        //Render Workout on the list

        //hide the form

        inputCadence.value =
            inputDistance.value =
            inputDuration.value =
            inputElevation.value =
                '';
    }
}

const app = new App();
