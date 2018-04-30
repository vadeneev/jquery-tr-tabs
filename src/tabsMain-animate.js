$.fn.tabsMainAnimate = function (config) {
  let settings = {
    tabsCore: null,    
  };

  let $self;
  let $tabsItems = [];
  let axis = 'x';  
  let prevTransform = {x: 0, y: 0};
  let animationId = null;
  let deferred;  
  let itemsPerSlide = 1;
  let boundaryBox;  
  let slideCount;

  init();

  function update() {
    let coreSettings = settings.tabsCore.getSettings();

    axis = coreSettings.axis;
    boundaryBox = settings.tabsCore.getOffsets();
    itemsPerSlide = coreSettings.itemsPerSlide;
    slideCount = coreSettings.slideCount;
    $tabsItems = settings.tabsCore.getChilds();
  }

  function getOuterMeasure(element) {
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

  function getMeasure(element) {
    if (element instanceof jQuery) {
      element = element.get(0);
    }

    if (element instanceof Element) {
      if (axis === 'x') {
        return element.clientWidth;
      }
      return element.clientHeight;
    }
  }

  function init() {
    settings = {...settings, ...config};
    axis = settings.tabsCore.getSettings().axis;    
    update();
  }

  /**
   * @description slides to left to next elements start
   * @public
   */
  function slideToMin() {
    let foundIndex = 0;
    update();

    for (let index = 0; index < slideCount; index++) {
      const startItem = itemsPerSlide * index;      
      const elem = $tabsItems[startItem];            
      const visiblePosition = settings.tabsCore.getBoundInWrapper(elem);

      if ( visiblePosition >= 0) { break; }
      foundIndex = startItem; 
    }

    let point = { [axis]:  settings.tabsCore.getTransformToElement($tabsItems[foundIndex])[axis] };

    startSlideToPoint(point);
  }
  
  /**
   * @description slides to right to next elements end
   * @public
   */
  function slideToMax() {
    update();
    const measure = getMeasure(settings.tabsCore.getElement().parent());
    

    for (let index = 0; index < slideCount; index++) {
      const startItem = itemsPerSlide * index;
      const endItem = startItem + itemsPerSlide - 1;
      const elem = $tabsItems[endItem];
      const rightBorder = settings.tabsCore.getBoundInWrapper(elem) + getOuterMeasure(elem);

      if ( rightBorder > measure) {
        const point = { [axis]: settings.tabsCore.getTransform()[axis] - rightBorder + measure};
        startSlideToPoint(point);
        break;
      }
    }        
  }

  function moveToSlide(slideNumber) {
    update();
    
    if (itemsPerSlide === 1) {      
      return moveToElement($tabsItems[slideNumber]);
    }
    
    let firstIndex = itemsPerSlide * slideNumber;        
    return moveToElement($tabsItems[firstIndex]);    
  }

  function moveToElement(element) {
    let newPoint = { [axis]: settings.tabsCore.getTransformToElement(element)[axis] };
    
    return startSlideToPoint(newPoint);
  }

  function slideToElement($element) {
    let minBound = settings.tabsCore.getBoundInWrapper($element);

    if (minBound < 0) {
      return moveToElement($element);
    }
    
    const width = settings.tabsCore.getElement().parent().width();
    if (minBound >= width) {
      const rightBorder = settings.tabsCore.getBoundInWrapper($element) + $element.outerWidth();
      const point = { [axis]: settings.tabsCore.getTransform()[axis] - rightBorder + width};
      return startSlideToPoint(point);
    }
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
    if (event.pathAbs < event.settings.tapPrecision) {
      return;
    }

    if (event.moveAmmount[axis] > 0) {
      slideToMin();
      return;
    }
    slideToMax();
  }

  $self = {
    slideToMin,
    slideToMax,
    slideToPoint,
    slideToElement,    
    continueSliding,
    moveToSlide,
    moveToElement,
  };

  if (!this.data('tabsMainAnimate')) {
    this.data('tabsMainAnimate', $self);
  }

  return $self;

};