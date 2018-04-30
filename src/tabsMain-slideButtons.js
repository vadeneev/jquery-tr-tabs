/**
 * settings: {
 * btn: 
 * {
 *  $element: jQuery element
 *  axis: 'x' or 'y'
 *  targetOffset: xMin xMax yMin yMax - point for hide
 * }
 * }
 */

$.fn.tabsMainSlideBtns = function (config) {
  const $that = this;
  let $self;
  let settings = {
    accuracy: 5,
    btns: [],
    isEnabled: true,
    toggleClass: 'invisible'
  };
  init(config);

  function init(config) {
    if (!config) {
      return false;
    }
    settings = {...settings, ...config};
  }

  /**
   * @description toggle buttons depending on their settings
   * @param {object} tabsDragEvent object gained from transformabbleTabs drag event
   */
  function update(tabsDragEvent) {
    if (!settings.isEnabled || !tabsDragEvent) {
      return false;
    }
    let offsetObj = tabsDragEvent.settings.allowedOffsets;
    let curTransformObj = tabsDragEvent.vectorTransform;

    settings.btns.forEach(elementObj => {
      let delta = Math.abs(offsetObj[elementObj.targetOffset] - curTransformObj[elementObj.axis]);
      let $element = elementObj.$element;

      if (delta < settings.accuracy) {
        !$element.hasClass(settings.toggleClass)
        && $element.addClass(settings.toggleClass);
      }
      else {
        $element.hasClass(settings.toggleClass)
        && $element.removeClass(settings.toggleClass);
      }
    });
  }

  /**
   * @description hides All buttons
   * @public
   */
  function hideAllBtns() {
    settings.btns.forEach(elementObj => {
      elementObj.$element.addClass(settings.toggleClass);
    });
  }

  $self = {
    update,
    hideAllBtns,
    enable: () => {
      settings.isEnabled = true;
      update();
    },
    disable: () => {
      settings.isEnabled = false;
      hideAllBtns();
    },
  }

  if (!$that.data('tabsMainSlideBtns')) {
    $that.data('tabsMainSlideBtns', $self);
  }

  return $self;

};
