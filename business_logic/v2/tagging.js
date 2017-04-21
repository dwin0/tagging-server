const TRAIN = { id: 1, name: "train", description: null };
const CAR = { id: 2, name: "car", description: null };
const FOOT_INSIDE = { id: 3, name: "foot_inside", description: null };
const FOOT_OUTSIDE = { id: 4, name: "foot_outside", description: null };
const OTHER = { id: 100, name: "other", description: "OSM-tag is defined, but not supported." };
const UNKNOWN = { id: -1, name: "unknown", description: "No tagging possible." };


function clazzToWayType(clazz) {

    if(clazz > 0 && clazz < 17)
    {
        return CAR;
    }
    else
    {
        return TRAIN;
    }
}

function tag(results) {

    var amountOfCars = 0;
    var amountOfRails = 0;

    for (var i = 0; i < results.length; i++){

        for (var j = 0; j < results[i].length; j++){

            var wayType = clazzToWayType([results[i][j].clazz]);
            if(wayType === CAR)
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

    var tag = amountOfCars > amountOfRails ? CAR : TRAIN;
    var probability = bigger / (bigger + smaller);

    return { id: tag.id, name: tag.name, description: tag.description, probability: probability };
}

module.exports = { "tag": tag };