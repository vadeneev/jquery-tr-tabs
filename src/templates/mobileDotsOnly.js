import {DotsTabs} from './dotsOnly';

export class MobileDotsOnly extends DotsTabs {

  _initHandlers(options) {
    super._initHandlers(options);

    $(window).on('mobileToDesktop', this.desktop.bind(this));
    $(window).on('desktopToMobile', this.mobile.bind(this));
  }

  desktop() {
    this.disable();
  }

  mobile() {
    this.enable();
  }
}