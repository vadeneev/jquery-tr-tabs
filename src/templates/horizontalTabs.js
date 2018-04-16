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
  if (!validate(options)) {
    return null;
  }

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

function validate(options) {
  return true;
  //todo: add validation
  //if (!options[CONTAINER] || !options[CONTAINER])
}

function initElements(options) {
  tabsEngine = options.$tabsContainer.tabsMain();

  tabsController = options.$tabsContainer.tabsMainAnimate({
    tabs: tabsEngine,
    childItems: options.$tabsItems
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

function initSubscriptions(options) {
  tabsEngine.subscribe({
    event: 'update',
    callback: tabsBtnController.update
  });
}

function initHandlers(options) {
  options.$btnLeft.on('click', tabsController.slideToLeft);
  options.$btnRight.on('click', tabsController.slideToRight);
}