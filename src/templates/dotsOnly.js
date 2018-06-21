import {throttle} from '../../throttle-pes';
import {simpleLazyLoad} from '../helpers/lazy-load-img';

/**
 * @description create only mobile dots tabs
 * @param options  { $tabsContainer, childSelector,  dotsSelector}
 * @public
 * @constructor
 */
export class DotsTabs {
  constructor(options) {
    this.tabsEngine = null;
    this.tabsController = null;
    this.dots = null;
    this.allLazy = null;
    this.throttleLazy = null;

    this._initElements(options);
    this._initSubscriptions(options);
    this._initHandlers(options);
  }

  _initElements(options) {

    this.tabsEngine = options.$tabsContainer.tabsMain({
      childSelector: options.childSelector,
      itemsInSlideFitsWrapper: true,
      isTruncatedContainer: true,

    });

    this.tabsController = options.$tabsContainer.tabsMainAnimate({
      tabsCore: this.tabsEngine,
    });

    this.dots = options.$dotsContainer.tabsMainDots({
      triggerPoint: {x: '50%', y: 0},
      tabsMoverCtrl: this.tabsController,
      tabsCore: this.tabsEngine,
    });

    if (!options.isLazyImgLoad) { return; }

    this.allLazy = options.$tabsContainer.find('.lazy');
    requestAnimationFrame (() => {simpleLazyLoad(this.allLazy)});

    this.throttleLazy = throttle(simpleLazyLoad.bind(this, this.allLazy), 700);
  }

  _initSubscriptions(options) {

    this.tabsEngine.subscribe({
      event: 'stop',
      callback: this.tabsController.continueSliding
    });

    this.tabsEngine.subscribe({
      event: 'update',
      callback: this.dots.trackTabs
    });

    this.tabsEngine.subscribe({
      event: 'update',
      callback: this.dots.reManageDots
    });

    if (!options.isLazyImgLoad) { return; }

    this.tabsEngine.subscribe({
      event: 'update',
      callback: this.throttleLazy
    });

    this.tabsEngine.subscribe({
      event: 'transitionend',
      callback: () => {simpleLazyLoad(this.allLazy)}
    });
  }

  _initHandlers(options) {

  }

  disable() {
    this.tabsEngine.clearTransform();
    this.dots.disable();
    this.tabsEngine.disable();
  }

  enable() {
    this.tabsEngine.clearTransform();
    this.dots.enable();
    this.tabsEngine.enable();
  }

}
