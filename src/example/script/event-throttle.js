/**
 * @description uses requestAnimationFrame for preventing DOM overcall by expensive events
 */

(function () {
  var throttle = function (type, name, obj) {
    let $obj = $(obj || window);
    let running = false;
    let func = function () {
      if (running) {
        return;
      }
      running = true;

      requestAnimationFrame(function () {
        $obj.trigger(name);
        running = false;
      });
    };

    $obj.on(type, func);
  };

  /* init - you can init any event */
  throttle('resize', 'optimizedResize');
  throttle('scroll', 'optimizedScroll');
})();
