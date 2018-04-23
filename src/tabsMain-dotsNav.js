/**
 * @description adds dots insta like style
 */
$.fn.tabsMainDots = function (options) {
  const $that = this;

  const CORE_CLASS = 'dot-nav';
  const CORE_CLASS_SELECTED = 'dot-nav--selected';
  const CORE_CLASS_SMALL = 'dot-nav--small';
  const CORE_CLASS_SMALLEST = 'dot-nav--smallest';

  let config = {
    triggerPoint: {x: '50%', y: '50%'},
    accuracy: 25,
    tabsMoverCtrl: null,
    tabsCore: null,
  };
  //todo: add trigger point percentage calculator
  let triggerPoint =  {x: 0, y: 0};
  let axis = 'x';
  let $tabsItems = [];
  let isListen = true;  
  let dotsArray = [];
  let curSelectedIndex = 0;
  let subscribers = [];
  let itemsPerSlide = 1;
  let slideCount;

  init();

  function init() {
    config = {...config, ...options};
    $that.on('click', handleDotCLick);
    reManageDots();
    updateDots();
    init = $.noop;
  }

  function updateTriggerPoint() {
    if (triggerPoint[axis].indexOf('%') === -1) { return; }

  }

  function reManageDots() {
    $tabsItems = config.tabsCore.getChilds();
    itemsPerSlide = config.tabsCore.getSettings().itemsPerSlide;
    let nextSlideCount = Math.ceil($tabsItems.length / itemsPerSlide); // or create allChildrenList = real + compensation    
    updateTriggerPoint();

    if (slideCount === 1) { 
      $that.empty();      
      return; 
    }

    if (nextSlideCount === slideCount) { return; }

    $that.empty();
    slideCount = nextSlideCount;

    for (let index = 0; index < slideCount; index++) {      
      getGeneratedDot($that, index);
    }

    dotsArray = $that.find(`.${CORE_CLASS}`);
  }

  function getGeneratedDot($appendTo, index) {
    let $dot = $(`<div class="${CORE_CLASS}" data-index=${index}/>`);
    !index && $dot.addClass(CORE_CLASS_SELECTED);

    $dot.appendTo($appendTo);
    return $dot;
  }

  function updateDots() {
    if (dotsArray.length < 4) {
      dotsArray.removeClass(CORE_CLASS_SELECTED);
      dotsArray[curSelectedIndex].classList.add(CORE_CLASS_SELECTED);
      return;
    }

    dotsArray.removeClass(CORE_CLASS_SELECTED);
    dotsArray.removeClass(CORE_CLASS_SMALL);
    dotsArray.removeClass(CORE_CLASS_SMALLEST);
    dotsArray.removeClass('hidden');
    dotsArray[curSelectedIndex].classList.add(CORE_CLASS_SELECTED);

    if (curSelectedIndex > 2) {
      handleLeft();
      handleRight();
    }
    else {
      dotsArray[3].classList.add(CORE_CLASS_SMALL);
      hideRange(4, dotsArray.length);
    }
  }

  function handleRight() {
    dotsArray[curSelectedIndex + 1] && dotsArray[curSelectedIndex + 1].classList.add(CORE_CLASS_SMALL);
    dotsArray[curSelectedIndex + 2] && dotsArray[curSelectedIndex + 2].classList.add(CORE_CLASS_SMALLEST);
    hideRange(curSelectedIndex + 3, dotsArray.length);
  }

  function handleLeft() {
    let hideEnd = curSelectedIndex - 5;
    if (dotsArray.length - curSelectedIndex < 3) {
      hideEnd = curSelectedIndex - 4;
    }
    dotsArray[curSelectedIndex - 3] && dotsArray[curSelectedIndex - 3].classList.add(CORE_CLASS_SMALL);
    dotsArray[curSelectedIndex - 4] && dotsArray[curSelectedIndex - 4].classList.add(CORE_CLASS_SMALLEST);
    hideRange(0, hideEnd);
  }

  function hideRange(startIndex, endIndex) {
    for (let index = startIndex; index <= endIndex; index++) {
      dotsArray[index] && dotsArray[index].classList.add('hidden');
    }
  }

  function handleDotCLick($event) {
    let $element;
    let $target = $($event.target);

    isListen = false;
    curSelectedIndex = Number.parseInt($target.data('index')) || 0;
    config.tabsMoverCtrl
    && config.tabsMoverCtrl.moveToSlide(curSelectedIndex + 1)
      .always(() => {
        isListen = true;
      });
    updateDots();
  }

  function trackTabs($event) {
    if (!isListen) {
      return;
    }
    let summWidth = 0;

    for (let index = 0; index < slideCount; index++) {      
      let startItem = itemsPerSlide * index;
      
      let elem = $($tabsItems[startItem]);
      
      let visiblePosition = $event.vectorTransform[axis] + ( elem.offset().left - elem.parent().offset().left ); //todo: use abstract

      if ( visiblePosition < config.triggerPoint[axis]) {
        curSelectedIndex = index;
      }
    }
    
    updateDots();
    invokeCallback();
  }

  function enable() {
    $that.removeClass('hidden');
    $that.on('click', handleDotCLick);
    updateDots();
  }

  function disable() {
    $that.off('click', handleDotCLick);
    $that.addClass('hidden');
  }

  function invokeCallback() {
    subscribers.forEach(callBack => {
      callBack({curSelectedIndex});
    });
  }

  function subscribe(callback) {
    subscribers.push(callback);
  }

  function unSubscribe(callback) {
    subscribers.remove(callback);
  }

  return {    
    trackTabs,
    updateDots,
    disable,
    enable,
    subscribe,
    unSubscribe,
    reManageDots,
  };
};
