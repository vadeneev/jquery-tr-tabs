let tabsEngine;
let tabsController;
let tabsBtnController;

const CONTAINER = '$tabsContainer';
const ITEMS = '$tabsItems';
const BTN_LEFT = '$btnLeft';
const BTN_RIGHT = '$btnRight';

/**
 * @description create horizontal tabs
 * @param options  { $tabsContainer, $tabsItems, $btnLeft, $btnRight }
 * @return object with controls or null
 * @public
 */
export const createTabs = (options) => {
  initElements(options);
  initSubscriptions(options);
  initHandlers(options);

  return {
    tabsEngine,
    tabsController,
    tabsBtnController,
    enable,
    disable
  };
};

function disable() {
  tabsEngine.disable();
  tabsBtnController.disable();
}

function enable() {
  tabsBtnController.enable();
  tabsEngine.enable();
}

function initElements(options) {
  tabsEngine = options.$tabsContainer.tabsMain();

  tabsController = options.$tabsContainer.tabsMainAnimate({
    tabsCore: tabsEngine,
  });

  tabsBtnController = options.$tabsContainer.tabsMainSlideBtns({
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

function initSubscriptions() {
  tabsEngine.subscribe({
    event: 'update',
    callback: tabsBtnController.update
  });
}

function initHandlers(options) {
  options.$btnLeft.on('click', tabsController.slideToMin);
  options.$btnRight.on('click', tabsController.slideToMax);
}