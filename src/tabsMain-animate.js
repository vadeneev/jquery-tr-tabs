$.fn.tabsMainAnimate = function (config) {
  let settings = {
    tabsCore: null,    
    tolerance: 40
  };

  let $tabsItems = [];
  let axis = 'x';
  let accuracy = 1;
  let speed = 35;
  let prevTransform = {x: 0, y: 0};
  let animationId = null;
  let deferred;
  let basis = 0;
  let itemsPerSlide = 1;
  let boundaryBox;
  let basisMax;

  init();

  function update() {
    boundaryBox = settings.tabsCore.getOffsets();
    itemsPerSlide = settings.tabsCore.getSettings().itemsPerSlide;    
  }

  function getMeasure(element) {
    if (element instanceof jQuery) {
      if (axis === 'x') {
        return element.outerWidth();
      }
      return element.outerHeight();
    }

    if (element instanceof Element) {
      if (axis === 'x') {
        return element.offsetWidth;
      }
      return element.offsetHeight;
    }
  }

  function init() {
    settings = {...settings, ...config};
    axis = settings.tabsCore.getSettings().axis;    
    $tabsItems = settings.tabsCore.getChilds();
  }

  /**
   * @description slides to left to next elements start
   * @public
   */
  function slideToMin() {
    let lastIndex = 0;
    let slideCount = settings.tabsCore.getSettings().slideCount;
    itemsPerSlide = settings.tabsCore.getSettings().itemsPerSlide;

    for (let index = 0; index < slideCount; index++) {
      let startItem = itemsPerSlide * index;      
      let elem = $($tabsItems[startItem]);      
      let visiblePosition = settings.tabsCore.getTransform()[axis] + ( elem.offset().left - elem.parent().offset().left ); //todo: use abstract
      //TODO: continue rf
      //let visiblePosition = settings.tabsCore.getBoundInWrapper(elem);

      if ( visiblePosition >= 0) { break; }
      lastIndex = index;      
    }

    moveToSlide(lastIndex);
  }
  
  /**
   * @description slides to right to next elements end
   * @public
   */
  function slideToMax() {
    let lastIndex = 0;
    let slideCount = settings.tabsCore.getSettings().slideCount;
    itemsPerSlide = settings.tabsCore.getSettings().itemsPerSlide;
    let width = settings.tabsCore.getElement().parent().width();

    for (let index = 0; index < slideCount; index++) {
      let startItem = itemsPerSlide * index;
      let elem = $($tabsItems[startItem]);      
      let visiblePosition = settings.tabsCore.getTransform()[axis] + ( elem.offset().left - elem.parent().offset().left ); //todo: use abstract
      //let visiblePosition = settings.tabsCore.getBoundInWrapper(elem);
//FIXME: error slide right
      if ( visiblePosition > width) { break; }
      lastIndex = index;      
    }

    moveToSlide(lastIndex);
  }

  /**
   * @description centers to exact element
   * @param {jquery object}
   * @public
   */
  function centerToElementX($element, callBack) {
    let curTransfrom = settings.tabsCore.getTransform();
    let wrapperWidth = settings.tabsCore.getElement().parent().outerWidth();
    let leftOffset = getLeftBound($element);
    let width = $element.outerWidth();
    let sign = 1;
    let pointX = wrapperWidth / 2 - leftOffset - width / 2;

    if (curTransfrom.x > pointX) {
      sign = -1;
    }
    return startSlideToPoint({x: pointX, y: 0}, sign);
  }

  function moveToSlide(slideNumber) {
    update();
    
    if (itemsPerSlide === 1) {
      return moveToElement($($tabsItems[slideNumber]));      
    }
    
    let firstIndex = itemsPerSlide * slideNumber;     
    let elem = $($tabsItems[firstIndex]);    
    let newPoint = { [axis]: boundaryBox[`${axis}Max`] - getLeftBound(elem) };         

    return startSlideToPoint(newPoint);
  }

  function moveToElement(element) {
    let newPoint = { [axis]: boundaryBox[`${axis}Max`] - getLeftBound(element) };
    
    return startSlideToPoint(newPoint);
  }
  
  /**
   * @description calculates left bound of element respective to its parent
   * @param {jquery object}
   * @returns {number}
   * @private
   */
  function getLeftBound($element) {    
    return $element.offset().left - $element.parent().offset().left;
  }

  function rejectAll() {
    if (deferred && ($.isFunction(deferred.promise))) {
      deferred.reject();
    }
  }

  function startSlideToPoint(point) {
    rejectAll();
    deferred = $.Deferred();
    prevTransform = {...settings.tabsCore.getTransform()};
    point = {...prevTransform, ...point};
    slideToPoint(point, deferred);
    return deferred;
  }

  function slideToPoint(point, promisDelegate) {
    let curTransform = settings.tabsCore.getTransform();    
    let $that = settings.tabsCore.getElement();

    $that.css({ 'transition': 'transform 0.2s ease-in-out' });
    $that.on('transitionend', () => {
      promisDelegate.resolve();
      $that.css({ 'transition': '' });
      $that.off('transitionend');
    });
    settings.tabsCore.setTransform({...curTransform, ...point});
  }

  function continueSliding(event) {
    update();
    if (event.pathAbs < event.settings.tapPrecision) {
      return;
    }

    if (event.moveAmmount[axis] > 0) {
      slideToMin();
      return;
    }
    slideToMax();
  }

  return {
    slideToLeft: slideToMin,
    slideToRight: slideToMax,
    slideToPoint,
    centerToElementX,
    continueSliding,
    moveToSlide,
    moveToElement,
  };

};