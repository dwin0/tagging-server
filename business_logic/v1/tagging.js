const RAILWAY = { id: 1, name: "railway", description: null };
const STREET = { id: 2, name: "street", description: null };
const BUILDING_AREA = { id: 3, name: "building_area", description: null };
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

    var amountOfCars = 0;
    var amountOfRails = 0;

    for (var i = 0; i < results.length; i++){

        for (var j = 0; j < results[i].length; j++){

            var wayType = clazzToWayType([results[i][j].clazz]);
            if(wayType === STREET)
            {
                amountOfCars++;
            } else
            {
                amountOfRails++;
            }
        }
    }

    var bigger = amountOfCars > amountOfRails ? amountOfCars : amountOfRails;
    var smaller = amountOfCars < amountOfRails ? amountOfCars : amountOfRails;

    var tag = amountOfCars > amountOfRails ? STREET : RAILWAY;
    var probability = bigger / (bigger + smaller);

    return { id: tag.id, name: tag.name, description: tag.description, probability: probability };
}

module.exports = { "tag": tag };