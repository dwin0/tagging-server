$(window).on('load', function () {
//TODO: load or ready?

    for(var i = 1; i <= 8; i++) {

        var card = $('<div class="row"><div class="col s12 m6"><div class="card-panel indigo darken-4"></div></div></div>');

        var longitude = createInputElement('longitude' + i, 'Längengrad ' + i).addClass('small-input');
        var latitude = createInputElement('latitude' + i, 'Breitengrad ' + i).addClass('small-input');
        var time = createInputElement('time' + i, 'Zeit ' + i).addClass('small-input');
        var phase = createSelectElement('phase' + i, 'Phase ' + i, 'Wähle eine Phase').addClass('small-input');

        card.find('.card-panel').append(longitude).append(latitude).append(time).append(phase);

        $('#tagging-form-elements').append(card);
    }

    initializeDefaultValues();
    //Enable material select style
    $('select').material_select();
});


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

const defaultValues = [
    [8.7095882, 47.3589998, "2017-03-28 07:31:44.0"],
    [8.7095882, 47.3589998, "2017-03-28 07:31:44.0"],
    [8.7095882, 47.3589998, "2017-03-28 07:31:44.0"],
    [8.7135701, 47.3530638, "2017-03-28 07:31:54.0"],
    [8.7135701, 47.3530638, "2017-03-28 07:31:54.0"],
    [8.7165203, 47.3516764, "2017-03-28 07:32:06.0"],
    [8.7165203, 47.3516764, "2017-03-28 07:32:06.0"],
    [8.7165203, 47.3516764, "2017-03-28 07:32:07.0"]
];

function initializeDefaultValues() {

    for(var i = 1; i <= 8; i++) {
        $('#longitude' + i).val(defaultValues[i-1][0]);
        $('#latitude' + i).val(defaultValues[i-1][1]);
        $('#time' + i).val(defaultValues[i-1][2]);
    }
}