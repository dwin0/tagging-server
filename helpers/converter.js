
function clazzToWayType(clazz) {

    if(clazz > 0 && clazz < 17)
    {
        return 'car';
    } else
    {
        return 'rail';
    }
}

function tag(results) {

    var amountOfCars = 0;
    var amountOfRails = 0;

    for (var i = 0; i < results.length; i++){

        for (var j = 0; j < results[i].length; j++){

            var wayType = clazzToWayType([results[i][j].clazz]);
            if(wayType === 'car')
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

    var tag = amountOfCars > amountOfRails ? 'cars' : 'rails';
    var probability = bigger / (bigger + smaller);

    return {tagName: tag, probability: probability};
}

module.exports.tag = tag;