import ClickEvent = JQuery.ClickEvent;

export class Carousel {
  platform: JQuery;
  width: number;

  constructor(element: JQuery) {
    this.platform = element.find(".fusion-go-round-platform");
    this.width = element.find('.fusion-go-round-car:first').outerWidth();
    element.find(".fusion-go-round-left")
        .on('click', this.handleLeft.bind(this));
    element.find(".fusion-go-round-right")
        .on('click', this.handleRight.bind(this));
  }

  private handleLeft(event: ClickEvent) {
    event.preventDefault();
    this.platform.finish().animate({
      scrollLeft: Math.max(this.platform.scrollLeft() - this.width, 0)
    }, 500);
  }

  private handleRight(event: ClickEvent) {
    event.preventDefault();
    this.platform.finish().animate({
      scrollLeft: this.platform.scrollLeft() + this.width
    }, 500);
  }
}

export default Carousel;

$(() => {
  $(".fusion-go-round").each((index: number, element: HTMLElement) => {
    new Carousel($(element));
  });
});
