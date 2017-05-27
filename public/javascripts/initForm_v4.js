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
            createSurroundingsForm();
            break;
    }
});


function createTaggingForm() {
    for(var i = 1; i <= numberOfPositions; i++) {

        var card = $('<div class="row"><div class="col s12 m6"><div class="card-panel indigo darken-4"></div></div></div>');

        var longitude = createInputElement('longitude' + i, 'Längengrad ' + i).addClass('small-input');
        var latitude = createInputElement('latitude' + i, 'Breitengrad ' + i).addClass('small-input');
        var horizontalAccuracy = createInputElement('horizontalAccuracy' + i, 'Horizontale Genauigkeit ' + i).addClass('small-input');
        var time = createInputElement('time' + i, 'Zeit ' + i).addClass('small-input');
        var phase = createSelectElement('phase' + i, 'Phase ' + i, 'Wähle eine Phase').addClass('small-input');

        card.find('.card-panel').append(longitude).append(latitude).append(horizontalAccuracy).append(time).append(phase);

        $('#input-form-elements').append(card);
    }

    initializeDefaultValues(taggingDefaultValues);

    //Enable material select style
    $('select').material_select();
}

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

function createSurroundingsForm() {

    for(var i = 1; i <= numberOfPositions; i++) {

        var card = $('<div class="row"><div class="col s12 m6"><div class="card-panel indigo darken-4"></div></div></div>');

        var longitude = createInputElement('longitude' + i, 'Längengrad ' + i).addClass('small-input');
        var latitude = createInputElement('latitude' + i, 'Breitengrad ' + i).addClass('small-input');
        var phase = createSelectElement('phase' + i, 'Phase ' + i, 'Wähle eine Phase').addClass('small-input');

        card.find('.card-panel').append(longitude).append(latitude).append(phase);

        $('#input-form-elements').append(card);
    }

    initializeDefaultValues(surroundingsDefaultValues);

    //Enable material select style
    $('select').material_select();
}


function createInputElement(forString, labelText) {
    return $('<div><label for="' + forString + '">' + labelText + ' : ' +
        '<input type="text" name="' + forString + '" id="' + forString + '"/>' +
        '</label></div>');
}

function createSelectElement(forString, labelText, disabledValue) {
    return $(
        '<div><label for="' + forString + '">' + labelText + ':</label>' +
        '<select name="' + forString + '" id="' + forString + '">' +
            '<option value="" disabled selected>' + disabledValue + '</option>' +
            '<option value="FCTStart">FCTStart</option>' +
            '<option value="FCTEnd">FCTEnd</option>' +
            '<option value="DownloadStart">DownloadStart</option>' +
            '<option value="DownloadEnd">DownloadEnd</option>' +
            '<option value="UploadStart">UploadStart</option>' +
            '<option value="UploadEnd">UploadEnd</option>' +
            '<option value="RTTStart">RTTStart</option>' +
            '<option value="RTTEnd">RTTEnd</option>' +
        '</select></div>')
}

const taggingDefaultValues = [
    [8.7095882, 47.3589998, 800, "2017-03-28 07:31:44.0", "FCTStart"],
    [8.7095882, 47.3589998, 800, "2017-03-28 07:31:44.0", "FCTEnd"],
    [8.7095882, 47.3589998, 800, "2017-03-28 07:31:44.0", "DownloadStart"],
    [8.7135701, 47.3530638, 98.4000015258789, "2017-03-28 07:31:54.0", "DownloadEnd"],
    [8.7135701, 47.3530638, 98.4000015258789, "2017-03-28 07:31:54.0", "UploadStart"],
    [8.7165203, 47.3516764, 82.5, "2017-03-28 07:32:06.0", "UploadEnd"],
    [8.7165203, 47.3516764, 82.5, "2017-03-28 07:32:06.0", "RTTStart"],
    [8.7165203, 47.3516764, 82.5, "2017-03-28 07:32:07.0", "RTTEnd"]
];

const speedDefaultValues = [
    [8.7135701, 47.3530638, "", "2017-03-28 07:31:54.0", ""],
    [8.7165203, 47.3516764, "", "2017-03-28 07:32:07.0", ""]
];

const surroundingsDefaultValues = [
    [8.7095882, 47.3589998, "", "", "FCTStart"],
    [8.7095882, 47.3589998, "", "", "FCTEnd"],
    [8.7095882, 47.3589998, "", "", "DownloadStart"],
    [8.7135701, 47.3530638, "", "", "DownloadEnd"],
    [8.7135701, 47.3530638, "", "", "UploadStart"],
    [8.7165203, 47.3516764, "", "", "UploadEnd"],
    [8.7165203, 47.3516764, "", "", "RTTStart"],
    [8.7165203, 47.3516764, "", "", "RTTEnd"]
];

function initializeDefaultValues(defaultValues) {

    for(var i = 1; i <= numberOfPositions; i++) {
        $('#longitude' + i).val(defaultValues[i-1][0]);
        $('#latitude' + i).val(defaultValues[i-1][1]);
        $('#horizontalAccuracy' + i).val(defaultValues[i-1][2]);
        $('#time' + i).val(defaultValues[i-1][3]);
        $('#phase' + i).val(defaultValues[i-1][4]);
    }
}