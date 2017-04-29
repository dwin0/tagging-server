//Version 1 only supports railways and streets
const RAILWAY = {
    id: 1,
    name: "railway",
    description: "Includes OpenStreetMap-Key:railway, Values: rail, light_rail, narrow_gauge, tram and subway."
};

const STREET = {
    id: 2,
    name: "street",
    description: "Includes OpenStreetMap-Key:highway, Values: motorway, motorway_link, trunk, trunk_link, primary, " +
    "primary_link, secondary, secondary_link, tertiary, tertiary_link, residential, road, unclassified, service, " +
    "living_street and track."
};

const BUILDING = { id: 3, name: "building", description: "Includes positions in or on top of a building." };
const OTHER = { id: 100, name: "other", description: "OSM-tag is defined, but not supported." };
const UNKNOWN = { id: -1, name: "unknown", description: "No tagging possible." };


function clazzToWayType(clazz) {

    if(clazz > 0 && clazz < 17)
    {
        return STREET;
    }
    else
    {
        return RAILWAY;
    }
}

function tag(results) {

    var amountOfStreets = 0;
    var amountOfRailways = 0;

    for (var i = 0; i < results.length; i++){

        for (var j = 0; j < results[i].length; j++){

            var wayType = clazzToWayType([results[i][j].clazz]);
            if(wayType === STREET)
            {
                amountOfStreets++;
            } else
            {
                amountOfRailways++;
            }
        }
    }

    var bigger = amountOfStreets > amountOfRailways ? amountOfStreets : amountOfRailways;
    var smaller = amountOfStreets < amountOfRailways ? amountOfStreets : amountOfRailways;

    var tag = amountOfStreets > amountOfRailways ? STREET : RAILWAY;
    var probability = bigger / (bigger + smaller);

    return { id: tag.id, name: tag.name, description: tag.description, probability: probability };
}

module.exports = { "tag": tag };