/**
 * This module is responsible to activate all material-design-items.
 * @module public/javascripts/materialDesign
 */

$(document).ready(function(){

    //Highlight current page in nav-bar
    var title = $(document).find("title").text();
    $('.' + title.toLowerCase()).addClass('active');


    $('.collapsible').collapsible();


    $('.button-collapse').sideNav({
            menuWidth: 400,
            edge: 'left', // Choose the horizontal origin
            closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
            draggable: true // Choose whether you can drag to open on touch screens
        }
    );
});