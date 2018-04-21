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
    triggerPoint: {x: 0, y: 0},
    accuracy: 25,
    tabsMoverCtrl: null,
    tabsCore: null,
  };

  let $tabsItems = [];
  let isListen = true;
  let axis = 'x';
  let dotsArray = [];
  let curSelectedIndex = 0;
  let subscribers = [];

  init();

  function init() {
    config = {...config, ...options};

    $tabsItems = config.tabsCore.getChilds();
    
    if ($tabsItems.length < 2) {
      return;
    }

    $tabsItems.each((index, item) => {
      getGeneratedDot($(item), $that, index);
    });

    $that.on('click', handleDotCLick);
    dotsArray = $that.find(`.${CORE_CLASS}`);
    updateDots();
  }

  function getGeneratedDot($toElement, $appendTo, index) {
    let $dot = $(`<div class="${CORE_CLASS}" data-index=${index}/>`);
    !index && $dot.addClass(CORE_CLASS_SELECTED);

    $dot.appendTo($appendTo);
    return $dot;
  }

  function updateDots() {
    if (dotsArray.length < 4) {
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
    $element = $($tabsItems[curSelectedIndex]);
    config.tabsMoverCtrl
    && config.tabsMoverCtrl.centerToElementX($element)
      .always(() => {
        isListen = true;
      });
    updateDots();
  }

  function trackTabs($event) {
    //todo: check more effective algorhytm
    if (!isListen) {
      return;
    }
    let summWidth = 0;

    $tabsItems.each((index, element) => {
      let curWidth = element.offsetWidth;

      if (Math.abs(summWidth + curWidth / 2 - Math.abs($event.vectorTransform[axis]) - config.triggerPoint[axis]) < config.accuracy) {
        curSelectedIndex = index;
        updateDots();
        invokeCallback();
        return false;
      }
      summWidth += curWidth;
    });
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
  };
};
