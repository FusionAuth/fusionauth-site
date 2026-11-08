/**
 * @file
 * Global utilities.
 *
 */
(function (Drupal) {

  'use strict';

  Drupal.behaviors.bootstrap_barrio_subtheme = {
    attach: function (context, settings) {
      function addClass() {
        // Get the element you want to add a class to
        var element = document.getElementById("CollapsingNavbar");

        // Check if the element already has the class
        if (!element.classList.contains("justify-content-end")) {
          // Add the class to the element
          element.classList.add("justify-content-end");
        }
      }
      // Call your JavaScript function here
      addClass();
    }
  };

})(Drupal);
