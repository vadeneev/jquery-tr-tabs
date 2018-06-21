/**
 * @description this function creates draggable behaviour
 * for applied element. By default it uses scrollable width/height - width/height as move anchors.
 * use setting to configure it for your needs. Feel free to extend.
 * Caution! It uses translate3d relative coordinates.
 axis: 'x' - axis constraint
 tapPrecision: 5, - precision px for triggering click in case if drag ammount was lower
 allowedOffsets: { xMin: 0, xMax: 0, yMin: 0, yMax: 0} - offsets of available move
 isHandleResize: true, - adds onresize recalculating for offsets
 start: [], - add your handler
 drag: [], - add your handler
 update: [], - add your handler to every update of transform
 stop: [], -add your handler
 */

$.fn.tabsMain = function (options) {
  'use strict';
  const $that = this;
  const COMPENSATION_ELEMENT = 'tabs--compensation-item';
  const zeroVector = {x: 0, y: 0};

  let $self;
  let vectorTransform = zeroVector;
  let moveAmount = zeroVector;
  let vectorPrev = zeroVector;
  let touchIdentifier = 0;
  let pathAbs = 0;
  let eventTarget;
  let children;
  let previousContainerSize;
  let $parentElement;
  let isEnabled = true;

  let subscribers = {
    start: [],
    drag: [],
    stop: [],
    update: [],
  };

  let settings = {
    childSelector: '> li',
    axis: 'x',
    tapPrecision: 5,
    allowedOffsets: {xMin: 0, xMax: 0, yMin: 0, yMax: 0}, //not necessary to set with resize
    isHandleResize: true,
    itemsPerSlide: 1, //IPS : 1.. 
    itemsInSlideFitsWrapper: false,
    slideCount: 1,
    useOverflowOffset: true, //todo : create variety
    isTruncatedContainer: false,
    slideOffset: 0,
  };

  if ($that.data('tabsMain')) {
    let obj = $that.data('tabsMain');

    if (options && options instanceof Object) {
      obj.updateSettings(options);
    }

    return obj;
  }

  init(options);

  function init(options = {}) {
    if (!$that.length) {
      return;
    }
    initValues(options);
    subscribeHandlers();
    calculateOffset();
    considerItemsPerSlide();
  }

  function initValues(options) {
    settings = {...settings, ...options};
    children = $that.find(`${settings.childSelector}`);
    settings.slideCount = children.length;
    $parentElement = $that.parent();
  }

  // end INIT

  /**
   * @description add handlers for mouse + touch
   * also add resize optimized handler
   */
  function subscribeHandlers() {
    $that.on('mousedown', handleDown);
    $that.on('touchstart', handleTouchStart);

    settings.isHandleResize && $(window).on('optimizedResize', handleResize);
  }

  function unSubscribeHandlers() {
    $that.off('touchstart', handleTouchStart);
    $that.off('mousedown', handleDown);

    $that.off('mouseup mouseleave touchend', handleStop);
    $that.off('mousemove touchmove', handleMove);
    $(window).off('optimizedResize', handleResize);
  }

  function handleResize() {
    considerItemsPerSlide();
    calculateOffset();
    setTransformBounds();
    invokeCallback(subscribers.update);
  }

  /**
   * @description calculates offsets for movement anchors
   * respective for settings
   */
  function calculateOffset() {
    if (!settings.useOverflowOffset) {
      return;
    }
    settings.allowedOffsets.xMin = $parentElement.width() - $that[0].scrollWidth;
    settings.allowedOffsets.yMin = $parentElement.height() - $that[0].scrollHeight;

    if (settings.allowedOffsets.xMin > 0) {
      settings.allowedOffsets.xMin = 0;
    }
    if (settings.allowedOffsets.yMin > 0) {
      settings.allowedOffsets.yMin = 0;
    }
  }

  function fitItemsToExternal() {
    let currentMeasure = getMeasure($parentElement.parent());
    let clearChildren = children.not(`.${COMPENSATION_ELEMENT}`);

    previousContainerSize = currentMeasure;

    let summ = getOuterMeasure(clearChildren[0]);
    let index = 1;

    for (index; index < clearChildren.length; index++) {
      const element = clearChildren[index];
      let nextSumm = summ + getOuterMeasure(element);

      if (nextSumm > currentMeasure) {
        break;
      }
      summ = nextSumm;
    }

    return index;
  }

  function truncateWidth(itemsCount = 1) {
    if (!settings.isTruncatedContainer) {
      return;
    }
    let measure = settings.axis === 'x' ? 'width' : 'height';
    let summ = Math.abs(calcTransformToElement(children[itemsCount - 1])[settings.axis]) + getOuterMeasure(children[itemsCount - 1]);

    $parentElement.css({
      [measure]: summ,
      [`max-${measure}`]: '100%'
    });
  }

  function wipeSliderFit() {
    let measure = settings.axis === 'x' ? 'width' : 'height';

    children.filter(`.${COMPENSATION_ELEMENT}`).remove();

    if (!settings.isTruncatedContainer) {
      $parentElement.css({
        [measure]: '',
        [`max-${measure}`]: ''
      });
    }
  }

  function considerItemsPerSlide({force} = {force: false}) {
    //TODO: split and ref
    if (!children.length) {
      return;
    }
    settings.slideCount = Math.ceil(children.length / settings.itemsPerSlide);

    if (!settings.itemsInSlideFitsWrapper) {
      wipeSliderFit();
      return;
    }
    if (getMeasure($parentElement.parent()) === previousContainerSize && !force) {
      return;
    }
    let nextIPSvalue = fitItemsToExternal();

    truncateWidth(nextIPSvalue);
    if (nextIPSvalue === settings.itemsPerSlide && !force) {
      return;
    }
    fillTabsWithExtraItems(nextIPSvalue);
    invokeCallback(subscribers.update, 'dotsUpdate');
  }

  function fillTabsWithExtraItems(nextIPSvalue) {
    children.filter(`.${COMPENSATION_ELEMENT}`).remove();
    children = children.not(`.${COMPENSATION_ELEMENT}`);

    settings.itemsPerSlide = nextIPSvalue;
    settings.slideCount = Math.ceil(children.length / nextIPSvalue);

    let divide = children.length / settings.itemsPerSlide;
    let width = children[children.length - 1].offsetWidth;
    let height = children[children.length - 1].offsetHeight;

    if (getDecimal(divide) > 0) {
      let extraItems = (Math.ceil(divide) * settings.itemsPerSlide) - children.length;

      for (let index = 0; index < extraItems; index++) {
        let $element = $(`<li class=${COMPENSATION_ELEMENT}>`);

        $element.css({
          'min-width': width,
          'min-height': height,
          'width': width,
          'height': height
        });

        $that.append($element);
        children = children.add($element);
      }
    }
  }

  //mouse event handlers
  function handleDown(event) {
    handleStart({x: event.pageX, y: event.pageY}, event.target);
    $that.on('mousemove', handleMove);
    $that.on('mouseup mouseleave', handleStop);
    return false;
  }

  function handleMove(event) {
    proceedMoveHandler({x: event.pageX, y: event.pageY});
  }

  //end mouse
  //touch event handlers
  function handleTouchStart(event) {
    var touches = event.originalEvent.touches;

    if (touches.length > 1) {
      return true;
    }
    touchIdentifier = touches[0].identifier;
    handleStart({x: touches[0].pageX, y: touches[0].pageY}, event.target);
    $that.on('touchend', handleStop);
    $that.on('touchmove', handleTouchMove);
  }

  function handleTouchMove(event) {
    var touches = event.originalEvent.changedTouches;

    if (touches.length > 1) {
      return true;
    }
    if (touches[0].identifier != touchIdentifier) {
      return true;
    }
    proceedMoveHandler({x: touches[0].pageX, y: touches[0].pageY});
    return true;
  }

  // end touch
  function invokeCallback(callbackArr, type = 'default') {
    let info = {
      vectorTransform,
      moveAmmount: moveAmount,
      pathAbs,
      children,
      type
    };

    let exportSettings = {...info, settings};

    callbackArr.forEach(callBack => {
      callBack(exportSettings);
    });
  }

  /**
   * @description calls start callback, sets start move values
   * @param {object} point
   * @param {DOM element} targetElement
   */
  function handleStart(point, targetElement) {
    eventTarget = $(targetElement);
    pathAbs = 0;

    calculateOffset();
    setVectorPrev(point);
    invokeCallback(subscribers.start);
  }

  /**
   * @description unsubscribes all in-action events
   * calls stop event callback
   * checks drag amount, triggers click for target in case of stationar tap
   * prevents clicking for mouse drag
   * @param {object} event
   */
  function handleStop(event) {
    $that.off('mousemove', handleMove);
    $that.off('touchmove', handleTouchMove);
    $that.off('touchend', handleStop);
    $that.off('mouseup mouseleave', handleStop);
    //subscribers.stop && subscribers.stop({ ...vectorTransform, settings });
    updateTabsWidth();
    invokeCallback(subscribers.stop);
    if (pathAbs > settings.tapPrecision) {
      event.type.match('mouseup') && $that.one('click', false);
      return false;
    }
    event.type.match('touch') && eventTarget[0].click();
  }

  /**
   * @description calls drag callback
   * calculates delta movement
   * applies changes to transform vector
   * @param {object} vectorCur
   */
  function proceedMoveHandler(vectorCur) {
    let newPoint;

    moveAmount = zeroVector;
    moveAmount[settings.axis] = vectorCur[settings.axis] - vectorPrev[settings.axis];
    newPoint = {[settings.axis]: vectorTransform[settings.axis] + moveAmount[settings.axis]};
    vectorTransform = {...vectorTransform, ...newPoint};
    pathAbs += Math.abs(moveAmount[settings.axis]);

    setVectorPrev(vectorCur);
    setTransformBounds();
    invokeCallback(subscribers.drag);
  }

  // end EVENTS

  /**
   * @description checks if transform vector is out of offsets
   */
  function setTransformBounds() {
    let isInScope = true;

    if (vectorTransform[settings.axis] < settings.allowedOffsets[`${settings.axis}Min`]) {
      vectorTransform[settings.axis] = settings.allowedOffsets[`${settings.axis}Min`];
      isInScope = false;
    }
    if (vectorTransform[settings.axis] > settings.allowedOffsets[`${settings.axis}Max`]) {
      vectorTransform[settings.axis] = settings.allowedOffsets[`${settings.axis}Max`];
      isInScope = false;
    }
    setXYtoMatrix();
    return isInScope;
  }

  function setVectorPrev(vectorCur) {
    vectorPrev = {...vectorCur};
  }

  function setXYtoMatrix() {
    $that.css({transform: `translate3d(${vectorTransform.x}px, ${vectorTransform.y}px, 0px)`});
    invokeCallback(subscribers.update);
  }

  /**
   * it is required for safari - it calculates container width in unexpected way.
   */
  function updateTabsWidth() {
    const measure = settings.axis === 'x' ? 'width' : 'height';
    const lastElement = children[children.length - 1];

    if (!lastElement) {
      return;
    }

    const fullMeasure = calcElementOffset(lastElement) + getOuterMeasure(lastElement);
    const currentMeasure = parseFloat($that.css(measure));

    if (currentMeasure >= fullMeasure) {
      return;
    }
    $that.css({
      [measure]: fullMeasure,
      [`min-${measure}`]: fullMeasure,
    });
  }

  // controls
  /**
   * @public
   * @method pesTabs
   */
  function enable() {
    if (isEnabled) {
      return;
    }
    isEnabled = true;
    subscribeHandlers();
    considerItemsPerSlide({force: true});
    handleResize();
  }

  /**
   * @public
   */
  function disable() {
    if (!isEnabled) {
      return;
    }
    isEnabled = false;
    const measure = settings.axis === 'x' ? 'width' : 'height';

    $parentElement.css({
      [measure]: '',
      [`max-${measure}`]: '',
    });

    $that.css({
      [measure]: '',
      [`min-${measure}`]: '',
    });

    setTransform(zeroVector);
    invokeCallback(subscribers.update);
    unSubscribeHandlers();
  }

  /**
   * @public
   * @param {object} newTransform { x: number,  y: number }
   */
  function setTransform(newTransform) {
    vectorTransform = {...newTransform};

    return setTransformBounds();
  }

  function subscribe({event = 'update', callback}) {
    if (!(event in subscribers)) {
      subscribers[event] = [];
    }

    subscribers[event].push(callback);
    invokeCallback(subscribers[event]);

  }

  function unSubscribe({event = 'update', callback}) {
    if (event in subscribers) {
      const index = subscribers[event].indexOf(callback);

      subscribers[event].splice(index, 1);
    }
  }

  //move to helpers
  function getDecimal(num) {
    return num % 1;
  }

  function convertDOMelement(element) {
    if (element instanceof jQuery) {
      return element[0];
    }
    return element;
  }

  function getOuterMeasure(element) {
    if (element instanceof jQuery) {
      element = element[0];
    }

    if (element instanceof Element) {
      if (settings.axis === 'x') {
        return element.offsetWidth;
      }
      return element.offsetHeight;
    }
  }

  function getMeasure(element) {
    if (element instanceof jQuery) {
      element = element[0];
    }

    if (element instanceof Element) {
      if (settings.axis === 'x') {
        return element.clientWidth;
      }
      return element.clientHeight;
    }
  }

  //move to helpers end

  function calcElementOffset(element) {
    let elem = convertDOMelement(element);

    if (settings.axis === 'x') {
      return elem.getBoundingClientRect().left - $that[0].getBoundingClientRect().left;
    }
    return elem.getBoundingClientRect().top - $that[0].getBoundingClientRect().top;
  }

  function calcBoundInWrapper(element) {
    let elem = convertDOMelement(element);

    if (settings.axis === 'x') {
      return vectorTransform.x + (calcElementOffset(elem));
    }
    return vectorTransform.y + (calcElementOffset(elem));
  }

  function calcTransformToElement(element) {
    const length = calcElementOffset(element);

    return {[settings.axis]: settings.allowedOffsets[`${settings.axis}Max`] - length};
  }

  /*  function getXYfromMatrix($element) {
    let result = [];

    result = $element.css('transform').match(/-?\d+/g).map((value) => parseInt(value));
    if (matrixStr.indexOf('matrix3D') !== -1) {
      return {x: result[10], y: result[11]};
    }
    return {x: result[5], y: result[6]};
  }*/

  function updateSettings(options) {
    if (!options || !(options instanceof Object)) {
      return;
    }
    settings = {...settings, ...options};

    forceUpdate();
  }

  function publish(event) {
    if (event in subscribers) {
      invokeCallback(subscribers[event]);
    }
  }

  function forceUpdate() {
    updateTabsWidth();
    calculateOffset();
    considerItemsPerSlide();
    setTransformBounds();
  }

  $self = {
    enable,
    disable,

    subscribe,
    unSubscribe,
    publish,

    calcBoundInWrapper,
    calcTransformToElement,

    get settings() {
      return settings;
    },
    set settings(value) {
      updateSettings(value);
    },

    get transform() {
      return vectorTransform;
    },
    set transform(value) {
      updateTabsWidth();
      setTransform(value);
    },

    getChildren: () => children,
    getElement: () => $that,
    getParent: () => $parentElement,
    clearTransform: () => setTransform({'x': 0, 'y': 0}),

    forceUpdate,
  };

  if (!$that.data('tabsMain')) {
    $that.data('tabsMain', $self);
  }

  return $self;
};