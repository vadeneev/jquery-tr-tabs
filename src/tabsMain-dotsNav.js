/**
 * @description adds dots insta like style
 */
$.fn.tabsMainDots = function (options) {
  const $that = this;

  const CORE_CLASS = 'dot-nav';
  const CORE_CLASS_SELECTED = 'dot-nav--selected';
  const CORE_CLASS_SMALL = 'dot-nav--small';
  const CORE_CLASS_SMALLEST = 'dot-nav--smallest';

  let settings = {
    triggerPoint: {x: '50%', y: '50%'},    
    tabsMoverCtrl: null,
    tabsCore: null,
    modernStyle: true,
  };
 
  let triggerPoint = {x: '50%', y: '50%'};
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
    settings = {...settings, ...options};
    $that.on('click', handleDotCLick);
    axis = settings.tabsCore.getSettings().axis;    
    reManageDots();
    updateDots();
    init = $.noop;
  }

  function updateTriggerPoint() {    
    if (settings.triggerPoint[axis].toString().indexOf('%') === -1) { 
      triggerPoint[axis] = settings.triggerPoint[axis];
      return; 
    }

    let parentWidthPercent = settings.tabsCore.getElement().parent().outerWidth() / 100;
    let percent = parseInt(settings.triggerPoint[axis]);

    triggerPoint[axis] = percent * parentWidthPercent;
  }

  function reManageDots() {
    $tabsItems = settings.tabsCore.getChilds();
    itemsPerSlide = settings.tabsCore.getSettings().itemsPerSlide;
    let nextSlideCount = settings.tabsCore.getSettings().slideCount;
    
    updateTriggerPoint();

    if (nextSlideCount === 1) {
      slideCount = nextSlideCount;
      $that.empty();      
      return; 
    }

    if (slideCount === nextSlideCount) { return; }

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
    if (!dotsArray || !dotsArray.length) {
      return;
    }

    dotsArray.removeClass(CORE_CLASS_SELECTED);
    dotsArray[curSelectedIndex].classList.add(CORE_CLASS_SELECTED);    

    if (dotsArray.length < 4) { return; }
    dotsArray.removeClass(CORE_CLASS_SMALL);
    dotsArray.removeClass(CORE_CLASS_SMALLEST);
    dotsArray.removeClass('hidden');    
    
    if (!settings.modernStyle) { return; }

    if (curSelectedIndex > 2) {
      handleMax();
      handleMin();
    }
    else {
      dotsArray[3].classList.add(CORE_CLASS_SMALL);
      hideRange(4, dotsArray.length);
    }
  }

  function handleMin() {
    dotsArray[curSelectedIndex + 1] && dotsArray[curSelectedIndex + 1].classList.add(CORE_CLASS_SMALL);
    dotsArray[curSelectedIndex + 2] && dotsArray[curSelectedIndex + 2].classList.add(CORE_CLASS_SMALLEST);
    hideRange(curSelectedIndex + 3, dotsArray.length);
  }

  function handleMax() {
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
    settings.tabsMoverCtrl
    && settings.tabsMoverCtrl.moveToSlide(curSelectedIndex)
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
      let elem = $tabsItems[startItem];
      let visiblePosition = settings.tabsCore.getBoundInWrapper(elem);

      if ( visiblePosition < triggerPoint[axis]) {
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
