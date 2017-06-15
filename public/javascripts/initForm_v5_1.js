/**
 * This module is responsible to populate the HTML-form with form-elements and prepared values.
 * @module public/javascripts/initForm
 */


var numberOfPositions;


$(window).on('load', function () {

    var title = $(document).find("title").text();

    switch (title) {
        case 'Tagging-Server':
            numberOfPositions = 8;
            createTaggingForm();
            break;
        case 'Geschwindigkeitsberechnung':
            numberOfPositions = 2;
            createSpeedForm();
            break;
        case 'Umgebungsabfrage':
            numberOfPositions = 8;
            createTaggingForm();
            break;
    }
});


/**
 * Creates all form-elements for the tagging-page and populates these elements with default-values.
 */
function createTaggingForm() {

    var inputForm = $('#input-form-elements');

    createDropdown(inputForm);

    for(var i = 1; i <= numberOfPositions; i++) {

        var card = $('<div class="row"><div class="col s12 m6"><div class="card-panel indigo darken-4"></div></div></div>');

        var longitude = createInputElement('longitude' + i, 'Längengrad ' + i).addClass('small-input');
        var latitude = createInputElement('latitude' + i, 'Breitengrad ' + i).addClass('small-input');
        var horizontalAccuracy = createInputElement('horizontalAccuracy' + i, 'Horizontale Genauigkeit ' + i).addClass('small-input');
        var time = createInputElement('time' + i, 'Zeit ' + i).addClass('small-input');

        card.find('.card-panel').append(longitude).append(latitude).append(horizontalAccuracy).append(time);

        inputForm.append(card);
    }

    initializeDefaultValues(taggingRailwayDefaultValues);

    //Enable material select style
    $('select').material_select();
}

/**
 * Creates all form-elements for the speed-calculation-page and populates these elements with default-values.
 */
function createSpeedForm() {
    for(var i = 1; i <= numberOfPositions; i++) {

        var card = $('<div class="row"><div class="col s12 m6"><div class="card-panel indigo darken-4"></div></div></div>');

        var longitude = createInputElement('longitude' + i, 'Längengrad ' + i).addClass('small-input');
        var latitude = createInputElement('latitude' + i, 'Breitengrad ' + i).addClass('small-input');
        var time = createInputElement('time' + i, 'Zeit ' + i).addClass('small-input');

        card.find('.card-panel').append(longitude).append(latitude).append(time);

        $('#input-form-elements').append(card);
    }

    initializeDefaultValues(speedDefaultValues);

    //Enable material select style
    $('select').material_select();
}

/**
 * Creates an element of type input with a div-wrapper.
 * @param {string} forString - value of attributes 'for', 'name' and 'id'
 * @param {string} labelText - value of tag 'label'
 * @returns {object} div-element as jQuery-object
 */
function createInputElement(forString, labelText) {
    return $('<div>' +
                '<label for="' + forString + '">' + labelText + ' : ' +
                    '<input type="text" name="' + forString + '" id="' + forString + '"/>' +
                '</label>' +
            '</div>');
}

/**
 * Creates a dropdown-element in the required format.
 * @param {object} inputForm - jQuery-object on which the dropdown-element is appended
 */
function createDropdown(inputForm) {
    var card = $('<div class="row"><div class="col s12 m6"><div class="card-panel indigo darken-4"></div></div></div>');
    var pointSelect = createSelectElement('measurrement0', 'Beispielmessung', 'Wähle eine Beispielmessung').addClass('input');
    card.find('.card-panel').append(pointSelect);
    inputForm.append(card);
    pointSelect.change(onPointSelectChange);
}

/**
 * Creates an element of type select with a div-wrapper.
 * @param {string} forString - value of attributes 'for', 'name' and 'id'
 * @param {string} labelText - value of tag 'label'
 * @param {string} disabledValue - text if no option is selected
 * @returns {object} div-element as jQuery-object
 */
function createSelectElement(forString, labelText, disabledValue) {
    return $(
        '<div>' +
            '<label for="' + forString + '">' + labelText + ':</label>' +
            '<select name="' + forString + '" id="' + forString + '">' +
                '<option value="" disabled selected>' + disabledValue + '</option>' +
                '<option value="taggingRailwayDefaultValues">Schiene (Uster)</option>' +
                '<option value="taggingRailwayValues">Schine (roter Pfeil)</option>' +
                '<option value="taggingStreetValues">Strasse</option>' +
                '<option value="taggingBuildingValues">Gebäude</option>' +
            '</select>' +
        '</div>')
}

/**
 * Initializes the input-form with the chosen points-values of the select-element.
 */
function onPointSelectChange() {
    var selectedElement = $("select option:selected")[0].value;

    switch(selectedElement) {
        case "taggingRailwayDefaultValues":
            initializeDefaultValues(taggingRailwayDefaultValues);
            break;
        case "taggingRailwayValues":
            initializeDefaultValues(taggingRailwayValues);
            break;
        case "taggingStreetValues":
            initializeDefaultValues(taggingStreetValues);
            break;
        case "taggingBuildingValues":
            initializeDefaultValues(taggingBuildingValues);
            break;
    }
}

const taggingRailwayDefaultValues = [
    [8.7095882, 47.3589998, 800, "2017-03-28 07:31:44.0"],
    [8.7095882, 47.3589998, 800, "2017-03-28 07:31:44.0"],
    [8.7095882, 47.3589998, 800, "2017-03-28 07:31:44.0"],
    [8.7135701, 47.3530638, 98.4000015258789, "2017-03-28 07:31:54.0"],
    [8.7135701, 47.3530638, 98.4000015258789, "2017-03-28 07:31:54.0"],
    [8.7165203, 47.3516764, 82.5, "2017-03-28 07:32:06.0"],
    [8.7165203, 47.3516764, 82.5, "2017-03-28 07:32:06.0"],
    [8.7165203, 47.3516764, 82.5, "2017-03-28 07:32:07.0"]
];

const taggingStreetValues = [
    [8.5045858, 47.47959843, 10, "2016-06-10 19:14:24"],
    [8.5045858, 47.47959843, 10, "2016-06-10 19:14:24"],
    [8.5045858, 47.47959843, 10, "2016-06-10 19:14:24"],
    [8.50437743, 47.48130385, 11, "2016-06-10 19:14:38"],
    [8.50437743, 47.48130385, 11, "2016-06-10 19:14:38"],
    [8.5042697, 47.48375963, 10, "2016-06-10 19:14:58"],
    [8.5042697, 47.48375963, 10, "2016-06-10 19:14:58"],
    [8.5043439, 47.48402661, 9, "2016-06-10 19:15:00"]
];

const taggingBuildingValues = [
    [7.0899045, 46.3651844, 20.899999618530273, "2017-02-15 07:32:32"],
    [7.0899045, 46.3651844, 20.899999618530273, "2017-02-15 07:32:32"],
    [7.0899045, 46.3651844, 20.899999618530273, "2017-02-15 07:32:32"],
    [7.0899045, 46.3651844, 20.899999618530273, "2017-02-15 07:32:41"],
    [7.0899045, 46.3651844, 20.899999618530273, "2017-02-15 07:32:41"],
    [7.0899045, 46.3651844, 20.899999618530273, "2017-02-15 07:32:51"],
    [7.0899045, 46.3651844, 20.899999618530273, "2017-02-15 07:32:51"],
    [7.0899045, 46.3651844, 20.899999618530273, "2017-02-15 07:32:53"]
];

const taggingRailwayValues = [
    [8.36705676, 47.10052663, 10, "2017-03-31 14:29:27"],
    [8.36705676, 47.10052663, 10, "2017-03-31 14:29:28"],
    [8.36705676, 47.10052663, 10, "2017-03-31 14:29:28"],
    [8.36543228, 47.09944646, 9, "2017-03-31 14:29:37"],
    [8.36543228, 47.09944646, 9, "2017-03-31 14:29:37"],
    [8.36354386, 47.09818859, 11, "2017-03-31 14:29:48"],
    [8.36354386, 47.09818859, 11, "2017-03-31 14:29:48"],
    [8.36336168, 47.09808104, 11, "2017-03-31 14:29:49"]
];

const speedDefaultValues = [
    [8.7135701, 47.3530638, "", "2017-03-28 07:31:54.0"],
    [8.7165203, 47.3516764, "", "2017-03-28 07:32:07.0"]
];

/**
 * Initializes the input-form with the given argument.
 * @param {Array} defaultValues - values to initialize the input-form
 */
function initializeDefaultValues(defaultValues) {

    for(var i = 1; i <= numberOfPositions; i++) {
        var longitude = '#longitude' + i;
        var latitude = '#latitude' + i;
        var horizontalAccuracy = '#horizontalAccuracy' + i;
        var time = '#time' + i;

        $(longitude).val(defaultValues[i-1][0]);
        $(longitude).trigger('change');
        $(latitude).val(defaultValues[i-1][1]);
        $(latitude).trigger('change');
        $(horizontalAccuracy).val(defaultValues[i-1][2]);
        $(horizontalAccuracy).trigger('change');
        $(time).val(defaultValues[i-1][3]);
        $(time).trigger('change');
    }
}