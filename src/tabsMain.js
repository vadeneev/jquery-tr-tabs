/**
 * @description this function creates draggable behaviour
 * for applied element. By default it uses scrollable width/height - width/height as move anchors.
 * use setting to configure it for your needs. Feel free to extend.
 * Caution! It uses translate3d relative coordinates.
 axisArr: ['x'], - axis constraint
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
  let $compensationItems;
  let vectorTransform = {x: 0, y: 0};
  let vectorPrev = {x: 0, y: 0};
  let touchIdentifier = 0;
  let pathAbs = 0;
  let moveAmmount = {x: 0, y: 0};
  let eventTarget;
  let childs;
  let settings = {
    childSelector: '> li',
    axisArr: ['x'],
    tapPrecision: 5,
    allowedOffsets: {xMin: 0, xMax: 0, yMin: 0, yMax: 0}, //not necessary to set with resize
    isHandleResize: true,
    itemsPerSlide: 1, //IPS : 1.. 
    isIPSFitsScreen: false,
    useOverflowOffset: true, //todo : create variety    
    start: [],
    drag: [],
    stop: [],
    update: [],
  };

  init(options);

  function init(options) {
    if (!$that.length) {
      return;
    }
    options && initValues(options);
    subscribeHandlers();
    calculateOffset();
  }

  function initValues(options) {
    settings = {...settings, ...options};
    childs = $that.find(`${settings.childSelector}`);
  }

  // end INIT

  /**
   * @description add handlers for mouse + touch
   * also add resize optimized handler
   */
  function subscribeHandlers() {
    $that.on('mousedown', handleDown);
    $that.on('touchstart', handleTouchStart);
    settings.isHandleResize && $(window).on('resize', handleResize);
  }

  function unSubscribeHandlers() {
    $that.off('touchstart', handleTouchStart);
    $that.off('mousedown', handleDown);

    $that.off('mouseup mouseleave touchend', handleStop);
    $that.off('mousemove touchmove', handleMove);
    $(window).off('resize', handleResize);
  }

  function handleResize() {
    calculateOffset();
    setTransformBounds();
    invokeCallback(settings.update);
  }

  /**
   * @description calculates offsets for movement anchors
   * respective for settings
   */
  function calculateOffset() {
    if (!settings.useOverflowOffset) {
      return;
    }
    considerItemsPerSlide();
    settings.allowedOffsets.xMin = -($that.parent()[0].scrollWidth - $that.parent().width());
    settings.allowedOffsets.yMin = $that.parent()[0].scrollHeight;
  }

  function fitItemsToScreen() {
    let currentWidth = $that.parent().width();
    let summ = childs[0].offsetWidth;

    for (let index = 1; index < childs.length; index++) {
      const element = childs[index];
      let nextSumm = summ + element.offsetWidth;

      if (nextSumm > currentWidth) {
        settings.itemsPerSlide = index;
        $that.parent().css({'width':summ});
        break;  
      }

      summ = nextSumm;
    }
  }

  function considerItemsPerSlide() {
    $compensationItems && $compensationItems.remove();

    if (!settings.isIPSFitsScreen) { return; }
    
    fitItemsToScreen();

    let divide = childs.length / settings.itemsPerSlide;
    let width = childs[childs.length - 1].offsetWidth;
    if ( getDecimal(divide) > 0) {
      let extraItems = childs.length - (Math.trunc(divide) + 1);
      
      for (let index = 0; index < extraItems; index++) {
        let $element = $(`<li class=${COMPENSATION_ELEMENT}>`);
        $element.css({
          'min-width': width,
          'height': '1px'
        });
        $that.append($element);
      }
    }
    invokeCallback(settings.update, 'dotsUpdate');
  }

  // start EVENTS
  function preventAll() {
    return false;
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
    return false;
  }

  // end touch
  function invokeCallback(callbackArr, type = 'default') {
    let info = {
      vectorTransform,
      moveAmmount,
      pathAbs,
      childs,
      type
    };

    callbackArr.forEach(callBack => {
      callBack({...info, settings});
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

    setVectorPrev(point);
    invokeCallback(settings.start);
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
    //settings.stop && settings.stop({ ...vectorTransform, settings });
    invokeCallback(settings.stop);
    if (pathAbs > settings.tapPrecision) {
      event.type.match('mouseup') && $that.one('click', preventAll);
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
    moveAmmount = {x: 0, y: 0};

    settings.axisArr.forEach(element => {
      moveAmmount[element] = vectorCur[element] - vectorPrev[element];
      vectorTransform[element] += moveAmmount[element];
      pathAbs += Math.abs(moveAmmount[element]);
    });

    setVectorPrev(vectorCur);
    setTransformBounds();
    invokeCallback(settings.drag);
  }

  // end EVENTS

  /**
   * @description checks if transform vector is out of offsets
   */
  function setTransformBounds() {
    let isInScope = true;
    settings.axisArr.forEach(element => {
      if (vectorTransform[element] < settings.allowedOffsets[`${element}Min`]) {
        vectorTransform[element] = settings.allowedOffsets[`${element}Min`];
        isInScope = false;
      }
      if (vectorTransform[element] > settings.allowedOffsets[`${element}Max`]) {
        vectorTransform[element] = settings.allowedOffsets[`${element}Max`];
        isInScope = false;
      }
    });
    setXYtoMatrix();
    return isInScope;
  }

  function setVectorPrev(vectorCur) {
    vectorPrev = {...vectorCur};
  }

  function setXYtoMatrix() {
    $that.css({transform: `translate3d(${vectorTransform.x}px, ${vectorTransform.y}px, 0px)`});
    invokeCallback(settings.update);
  }

  // controls
  /**
   * @public
   * @method pesTabs
   */
  function enable() {
    handleResize();
    subscribeHandlers();
  }

  /**
   * @public
   */
  function disable() {
    setTransform({x: 0, y: 0});
    invokeCallback(settings.update);
    unSubscribeHandlers();
  }

  function changeAxis(...axis) {

    axis = axis.filter((value) => {
      typeof value === 'string'
      && value.length === 1
      && value.match(/x|y/);
    });

    settings.axisArr = [...axis];
  }

  /**
   * @public
   * @param {object} newTransform { x: number,  y: number }
   */
  function setTransform(newTransform) {
    vectorTransform = {...newTransform};

    let result = setTransformBounds();

    return result;
  }

  /**
   * @public
   * @param {object} newOffsets { xMin: number, xMax: number, yMin: number, yMax: number }
   */
  function setOffsets(newOffsets) {
    settings.allowedOffsets = {...settings.allowedOffsets, ...newOffsets};
  }

  function setItemsPerSlide(newValue) {
    settings.itemsPerSlide = newValue;
  }

  function subscribe({event = 'update', callback}) {
    if (event in settings) {
      settings[event].push(callback);
      invokeCallback(settings[event]);
    }
  }

  function unSubscribe({event = 'update', callback}) {
    if (event in settings) {
      settings[event].remove(callback);
    }
  }

  function getDecimal(num) {
    var str = "" + num;
    var zeroPos = str.indexOf(".");
    if (zeroPos == -1) return 0;
    str = str.slice(zeroPos);
    return +str;
  }

  return {
    enable,
    disable,
    changeAxis,
    setTransform,
    setOffsets,
    subscribe,
    unSubscribe,
    setItemsPerSlide,
    getSettings: () => settings,
    getElement: () => $that,
    getTransform: () => vectorTransform,
    getOffsets: () => settings.allowedOffsets,
  };
};

// method to get x y from matrix
//
// function getXYfromMatrix($element) {
//   var result = [];

//   result = $element.css('transform').match(/-?\d+/g).map((value) => parseInt(value));
//   if (matrixStr.indexOf('matrix3D') !== -1) {
//     return { x: result[10], y: result[11] };
//   }
//   return { x: result[5], y: result[6] };
// }