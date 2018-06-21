/**
 * @description adds dots insta like style
 */
$.fn.tabsMainDots = function (options) {
  'use strict';
  const $that = this;
  let $self;

  let settings = {
    triggerPoint: {x: '50%', y: '50%'},
    tabsMoverCtrl: null,
    tabsCore: null,
    modernStyle: true,
    CORE_CLASS: 'dot-nav-pes',
    CORE_CLASS_SELECTED: 'dot-nav-pes--selected',
    CORE_CLASS_SMALL: 'dot-nav-pes--small',
    CORE_CLASS_SMALLEST: 'dot-nav-pes--smallest',
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
    axis = settings.tabsCore.settings.axis;
    reManageDots();
    updateDots();
    init = $.noop;
  }

  function updateTriggerPoint() {
    if (settings.triggerPoint[axis].toString().indexOf('%') === -1) {
      triggerPoint[axis] = settings.triggerPoint[axis];
      return;
    }

    let parentWidthPercent = settings.tabsCore.getParent().outerWidth() / 100;
    let percent = parseInt(settings.triggerPoint[axis]);

    triggerPoint[axis] = percent * parentWidthPercent;
  }

  function reManageDots() {
    $tabsItems = settings.tabsCore.getChildren();
    itemsPerSlide = settings.tabsCore.settings.itemsPerSlide;
    let nextSlideCount = settings.tabsCore.settings.slideCount;

    updateTriggerPoint();

    if (nextSlideCount === 1) {
      slideCount = nextSlideCount;
      $that.empty();
      return;
    }

    if (slideCount === nextSlideCount) {
      return;
    }

    $that.empty();
    slideCount = nextSlideCount;

    for (let index = 0; index < slideCount; index++) {
      getGeneratedDot($that, index);
    }

    dotsArray = $that.find(`.${settings.CORE_CLASS}`);
  }

  function getGeneratedDot($appendTo, index) {
    let $dot = $(`<div class="${settings.CORE_CLASS}" data-index=${index}/>`);

    !index && $dot.addClass(settings.CORE_CLASS_SELECTED);

    $dot.appendTo($appendTo);
    return $dot;
  }

  function updateDots() {
    if (!dotsArray || !dotsArray.length || curSelectedIndex > dotsArray.length - 1) {
      return;
    }

    dotsArray.removeClass(settings.CORE_CLASS_SELECTED);
    dotsArray[curSelectedIndex].classList.add(settings.CORE_CLASS_SELECTED);

    if (dotsArray.length < 4) {
      return;
    }
    dotsArray.removeClass(settings.CORE_CLASS_SMALL);
    dotsArray.removeClass(settings.CORE_CLASS_SMALLEST);
    dotsArray.removeClass('hidden');

    if (!settings.modernStyle) {
      return;
    }

    if (curSelectedIndex > 2) {
      handleMax();
      handleMin();
    }
    else {
      dotsArray[3].classList.add(settings.CORE_CLASS_SMALL);
      hideRange(4, dotsArray.length);
    }
  }

  function handleMin() {
    dotsArray[curSelectedIndex + 1] && dotsArray[curSelectedIndex + 1].classList.add(settings.CORE_CLASS_SMALL);
    dotsArray[curSelectedIndex + 2] && dotsArray[curSelectedIndex + 2].classList.add(settings.CORE_CLASS_SMALLEST);
    hideRange(curSelectedIndex + 3, dotsArray.length);
  }

  function handleMax() {
    let hideEnd = curSelectedIndex - 5;

    if (dotsArray.length - curSelectedIndex < 3) {
      hideEnd = curSelectedIndex - 4;
    }
    dotsArray[curSelectedIndex - 3] && dotsArray[curSelectedIndex - 3].classList.add(settings.CORE_CLASS_SMALL);
    dotsArray[curSelectedIndex - 4] && dotsArray[curSelectedIndex - 4].classList.add(settings.CORE_CLASS_SMALLEST);
    hideRange(0, hideEnd);
  }

  function hideRange(startIndex, endIndex) {
    for (let index = startIndex; index <= endIndex; index++) {
      dotsArray[index] && dotsArray[index].classList.add('hidden');
    }
  }

  function handleDotCLick($event) {
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

  function trackTabs() {
    const prevSelected = curSelectedIndex;

    if (!isListen) {
      return;
    }

    for (let index = 0; index < slideCount; index++) {
      let startItem = itemsPerSlide * index;
      let elem = $tabsItems[startItem];
      let visiblePosition = settings.tabsCore.calcBoundInWrapper(elem);

      if (visiblePosition < triggerPoint[axis]) {
        curSelectedIndex = index;
      }
    }

    updateDots();
    prevSelected !== curSelectedIndex && invokeCallback();
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

  $self = {
    trackTabs,
    updateDots,
    disable,
    enable,
    subscribe,
    unSubscribe,
    reManageDots,
  };

  if (!this.data('tabsMainDots')) {
    this.data('tabsMainDots', $self);
  }

  return $self;
};
