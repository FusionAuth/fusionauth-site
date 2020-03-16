"use strict";

var Carousel = /** @class */ (function () {
    function Carousel(element) {
        this.platform = element.find(".fusion-go-round-platform");
        this.width = element.find('.fusion-go-round-car:first').outerWidth();
        element.find(".fusion-go-round-left")
            .on('click', this.handleLeft.bind(this));
        element.find(".fusion-go-round-right")
            .on('click', this.handleRight.bind(this));
    }
    Carousel.prototype.handleLeft = function (event) {
        event.preventDefault();
        this.platform.finish().animate({
            scrollLeft: Math.max(this.platform.scrollLeft() - this.width, 0)
        }, 500);
    };
    Carousel.prototype.handleRight = function (event) {
        event.preventDefault();
        this.platform.finish().animate({
            scrollLeft: this.platform.scrollLeft() + this.width
        }, 500);
    };
    return Carousel;
}());

$(function () {
    $(".fusion-go-round").each(function (index, element) {
        new Carousel($(element));
    });
});

$(function () {
    new ClipboardJS("[data-clipboard-target]");
});
