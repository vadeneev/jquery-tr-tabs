$.fn.tabsMainAnimate = function (config) {
  let settings = {
    tabs: null,
    childItems: [],
    tolerance: 40
  };

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

  function updateBasis() {
    boundaryBox = settings.tabs.getOffsets();
    itemsPerSlide = settings.tabs.getSettings().itemsPerSlide;
    basis = boundaryBox[`${axis}Min`];
    basisMax = convertToBasis(boundaryBox[`${axis}Max`]);
  }

  function convertToBasis(value) {
    return value - basis;
  }

  function convertFromBasis(value) {
    return value + basis;
  }


  function getMeasure($element) {
    if (axis === 'x') {
      return $element.outerWidth();
    }
    return $element.outerHeight();
  }

  function init() {
    settings = {...settings, ...config};
    axis = settings.tabs.getSettings().axisArr[0];
  }

  /**
   * @description slides to left to next elements start
   * @public
   */
  function slideToMin() {
    updateBasis();
    let curTransfrom = convertToBasis(settings.tabs.getTransform()[axis]);
    let summMeasure = curTransfrom;
    let prevMeasure = 0;

    if (curTransfrom >= convertToBasis(boundaryBox[`${axis}Max`]) || !settings.childItems.length) {
      return false;
    }

    settings.childItems.each((index, element) => {
      let $element = $(element);
      let localMeasure = getMeasure($element);

      let nextSumm = summMeasure + localMeasure;
      if (nextSumm >= basisMax) {
        let delta = basisMax - summMeasure;

        if (delta < settings.tolerance) {
          summMeasure -= prevMeasure;
        }

        summMeasure = curTransfrom - summMeasure;
        summMeasure += considerItemsInSlide(index, 'min', localMeasure);

        let newPoint = {[axis]: summMeasure};

        startSlideToPoint(newPoint, 1);
        return false;
      }
      summMeasure = nextSumm;
      prevMeasure = localMeasure;
    });
  }

  /**
   * @description slides to right to next elements end
   * @public
   */
  function slideToMax() {
    updateBasis();
    let curTransfrom = convertToBasis(settings.tabs.getTransform()[axis]);
    let summMeasure = curTransfrom;
    let rightBorder = getMeasure(settings.tabs.getElement().parent()) + basisMax;

    settings.childItems.each((index, element) => {
      let $element = $(element);
      let localMeasure = getMeasure($element);

      summMeasure += localMeasure;
      if (summMeasure > rightBorder) {
        let delta = summMeasure - rightBorder;

        if (Math.abs(delta) < settings.tolerance) {
          return true;
        }

        delta += considerItemsInSlide(index, 'max', localMeasure);

        let newPoint = {[axis]: convertFromBasis(curTransfrom - delta)};

        startSlideToPoint(newPoint, -1);
        return false;
      }
    });
  }

  function considerItemsInSlide(newItemIndex, directionStr, localMeasure) {
    let addDelta = 0;
    let lookupArr = [];
    let startIndex;
    let endIndex;

    if (directionStr.toLowerCase() === 'max') {
      startIndex = newItemIndex;
      endIndex = newItemIndex + itemsPerSlide;
      addDelta -= localMeasure;
    }
    else if (directionStr.toLowerCase() === 'min') {
      startIndex = newItemIndex - itemsPerSlide;
      endIndex = newItemIndex;

      if (startIndex < 0) {
        startIndex = 0;
      }
      else {
        addDelta -= localMeasure;
      }
    }

    lookupArr = settings.childItems.slice(startIndex, endIndex);

    lookupArr.each((index, item) => {
      addDelta += getMeasure($(item));
    });

    return addDelta;
  }

  /**
   * @description centers to exact element
   * @param {jquery object}
   * @public
   */
  function centerToElementX($element, callBack) {
    let curTransfrom = settings.tabs.getTransform();
    let wrapperWidth = settings.tabs.getElement().parent().outerWidth();
    let leftOffset = getLeftBound($element);
    let width = $element.outerWidth();
    let sign = 1;
    let pointX = wrapperWidth / 2 - leftOffset - width / 2;

    if (curTransfrom.x > pointX) {
      sign = -1;
    }
    return startSlideToPoint({x: pointX, y: 0}, sign);
  }

  /**
   * @description calculates left bound of element respective to its parent
   * @param {jquery object}
   * @returns {number}
   * @private
   */
  function getLeftBound($element) {
    let leftOffset = 0;

    settings.childItems.each((index, element) => {
      if (element.isSameNode($element.get(0))) {
        return false;
      }
      leftOffset += $element.outerWidth();
    });
    return leftOffset;
  }

  function rejectAll() {
    if (deferred && ($.isFunction(deferred.promise))) {
      deferred.reject();
    }
  }

  function startSlideToPoint(point, directionSign) {
    let fullLength = 0;
    rejectAll();
    deferred = $.Deferred();
    prevTransform = {...settings.tabs.getTransform()};
    point = {...prevTransform, ...point};
    fullLength = Math.abs(prevTransform[axis] - point[axis]);
    animationId && cancelAnimationFrame(animationId);
    slideToPoint(point, fullLength, directionSign, deferred);
    return deferred;
  }

  function slideToPoint(point, fullLength, directionSign, promisDelegate, madeLength = 0,) {
    let curTransform = settings.tabs.getTransform();
    let moveAbs = Math.abs(curTransform[axis] - point[axis]);

    curTransform[axis] += directionSign * speed;
    madeLength += speed;

    if (madeLength > fullLength || moveAbs < accuracy) {
      settings.tabs.setTransform({...curTransform, ...point});
      promisDelegate.resolve();
      return false;
    }

    settings.tabs.setTransform({...curTransform});
    curTransform = settings.tabs.getTransform();

    if (prevTransform[axis] === curTransform[axis]) {
      animationId = null;
      promisDelegate.resolve();
      return false;
    }

    prevTransform = {...curTransform};
    animationId = requestAnimationFrame(() => slideToPoint(point, fullLength, directionSign, promisDelegate, madeLength));
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

  return {
    slideToLeft: slideToMin,
    slideToRight: slideToMax,
    slideToPoint,
    centerToElementX,
    continueSliding,
  };

};