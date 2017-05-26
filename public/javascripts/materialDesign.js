//Collapsing Elements
$(document).ready(function(){
    $('.collapsible').collapsible();


    $('.button-collapse').sideNav({
            menuWidth: 400,
            edge: 'left', // Choose the horizontal origin
            closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
            draggable: true // Choose whether you can drag to open on touch screens
        }
    );
});