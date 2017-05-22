//Stationär < 3 km/h
const STATIONARY = { id: 1, name: "stationary", description: '0 km/h to 3 km/h' };

//Gehend, rennend: Fussgänger: 3 km/h … < 10 km/h
const PEDESTRIAN = { id: 2, name: "pedestrian", description: '3 km/h to 10 km/h' };

//Fahrend: Fahrzeuge: 10 km/h … < 120 km/h
const VEHICULAR = { id: 3, name: "vehicular", description: '10 km/h to 120 km/h' };

//Sehr schnell fahrend: Hochgeschwindigkeitsfahrzeuge: 120 km/h … < 350km/h
const HIGH_SPEED_VEHICULAR = { id: 4, name: "high-speed_vehicular", description: '120 km/h to 350km/h' };

const UNKNOWN = { id: -1, name: "unknown", description: "No tagging possible." };



function getType(speed) {

    switch(true) {
        case (speed >= 0 && speed < 3):
            return STATIONARY;
        case (speed >= 3 && speed < 10):
            return PEDESTRIAN;
        case (speed >= 10 && speed < 120):
            return VEHICULAR;
        case (speed >= 120 && speed < 350):
            return HIGH_SPEED_VEHICULAR;
        default:
            return UNKNOWN;
    }
}


module.exports = { "getType": getType };