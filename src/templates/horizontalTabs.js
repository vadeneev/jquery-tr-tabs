/**
 * @description create horizontal tabs
 * @param options  { $tabsContainer, $btnLeft, $btnRight, childSelector, isBtnOffset }
 * @public
 * @constructor
 */
export class HorizontalTabs {
  constructor(options) {
    this.tabsEngine = null;
    this.tabsController = null;
    this.tabsBtnController = null;

    this._initElements(options);
    this._initSubscriptions(options);
    this._initHandlers(options);
  }

  _initElements(options) {
    const slideOffset = options.isBtnOffset ? options.$btnLeft.outerWidth() : 0;

    this.tabsEngine = options.$tabsContainer.tabsMain({
      childSelector: options.childSelector || '> li',
      slideOffset
    });

    this.tabsController = options.$tabsContainer.tabsMainAnimate({
      tabsCore: this.tabsEngine,
    });

    this.tabsBtnController = options.$tabsContainer.tabsMainSlideBtns({
      toggleClass: 'hidden',
      btns: [
        {
          $element: options.$btnLeft,
          axis: 'x',
          targetOffset: 'xMax'
        },
        {
          $element: options.$btnRight,
          axis: 'x',
          targetOffset: 'xMin'
        }
      ]
    });
  }

  _initSubscriptions(options) {
    this.tabsEngine.subscribe({
      event: 'update',
      callback: this.tabsBtnController.update
    });
  }

  _initHandlers(options) {
    options.$btnLeft.on('click', this.tabsController.slideToMin);
    options.$btnRight.on('click', this.tabsController.slideToMax);
  }

  disable() {
    this.tabsEngine.disable();
    this.tabsBtnController.disable();
  }

  enable() {
    this.tabsBtnController.enable();
    this.tabsEngine.enable();
  }

}
