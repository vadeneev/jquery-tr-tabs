import {HorizontalTabs} from './horizontalTabs.js';

/**
 * @description create horizontal tabs at desktop and dots with visible elements as slide at mobile
 * @param options  { $tabsContainer, $btnLeft, $btnRight, childrenSelector }
 * @public
 * @constructor
 */
export class HorizontalAndMobileDots extends HorizontalTabs {
  constructor(options) {
    super(options);
    this.dotsCtrl = null;
    this._initDots(options);

    if (window.breakpoints.current === 'desktop') {
      this.desktop();
    }
    else {
      this.mobile();
    }
  }

  _initHandlers(options) {
    super._initHandlers(options);

    $(window).on('mobileToDesktop', () => requestAnimationFrame(this.desktop.bind(this)));
    $(window).on('desktopToMobile', () => requestAnimationFrame(this.mobile.bind(this)));
  }

  _initSubscriptions(options) {
    super._initSubscriptions();
  }

  desktop() {
    this.tabsBtnController.enable();
    this.dotsCtrl.disable();
    this.tabsEngine.settings = {
      itemsInSlideFitsWrapper: false,
      itemsPerSlide: 1,
      isTruncatedContainer: false,
    };
    this.tabsEngine.unSubscribe({
      event: 'stop',
      callback: this.tabsController.continueSliding
    });
    this.tabsEngine.clearTransform();
  }

  mobile() {
    this.tabsBtnController.disable();
    this.dotsCtrl.enable();
    this.tabsEngine.settings = {
      itemsInSlideFitsWrapper: true,
      isTruncatedContainer: true,
    };
    this.tabsEngine.subscribe({
      event: 'stop',
      callback: this.tabsController.continueSliding
    });
    this.tabsEngine.clearTransform();
  }

  _initDots(options) {
    let $dotsBlock = $('<div class="js-slider-dots slider-dots pes-desktop-hide"/>');

    $dotsBlock.insertAfter(options.$tabsContainer);
    this.dotsCtrl = $dotsBlock.tabsMainDots({
      triggerPoint: {x: '50%', y: 0},
      tabsMoverCtrl: this.tabsController,
      tabsCore: this.tabsEngine
    });

    this.tabsEngine.subscribe({
      event: 'update',
      callback: this.dotsCtrl.trackTabs
    });

    this.tabsEngine.subscribe({
      event: 'update',
      callback: this.dotsCtrl.reManageDots
    });
  }
}