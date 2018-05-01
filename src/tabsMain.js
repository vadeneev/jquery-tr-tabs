const COMPENSATION_ELEMENT = 'tabs--compensation-item';
const zeroVector = {x: 0, y: 0};
const defaultSettings = {
  rootElement: null,
  childSelector: '> li',
  axis: 'x',
  tapPrecision: 5,
  allowedOffsets: {xMin: 0, xMax: 0, yMin: 0, yMax: 0}, //not necessary to set with resize
  isHandleResize: true,
  itemsPerSlide: 1, //IPS : 1.. 
  itemsInSlideFitsWrapper: false,
  slideCount: 1,
  useOverflowOffset: true, //todo : create variety 
};

export default class TabsMain {
  constructor(options) {
    init(options);
  }  

  init(options) {
    options && initValues(options);
    subscribeHandlers();
    calculateOffset();
  }

  initValues(options) {
    this.settings = {...defaultSettings, ...options};    
    this.childs = this.settings.rootElement.querySelectorAll(`${this.settings.childSelector}`);
    this.settings.slideCount = this.childs.length;
    this.this.parentElement = this.settings.rootElement.parentElement;

    // init values (privates)
    this.compensationItems = [];
    this.vectorTransform = zeroVector;
    this.vectorPrev = zeroVector;
    this.touchIdentifier = 0;
    this.pathAbs = 0;
    this.moveAmmount = zeroVector;
    this.eventTarget;
    this.childs;
    this.previousContainerSize;
    this.this.parentElement;
    this.start = [];
    this.drag = [];
    this.stop = [];
    this.update = [];
    // binders
    this.handleDownBinded = event => this.handleDown(event);
    this.handleTouchStart = event => this.handleTouchStart(event);
    this.handleResize = event => this.handleResize(event);
    this.handleMoveBinded = event => this.handleMove(event);
    this.handleStopBinded = event => this.handleStop(event);    
    this.handleTouchMoveBinded = event => this.handleTouchMove(event);
    this.preventAllBinded = event => this.preventAll(event);
  }
  
  subscribeHandlers() {
    this.settings.rootElement.addEventListener('mousedown', this.handleDownBinded);
    this.settings.rootElement.addEventListener('touchstart', this.handleTouchStartBinded);
    this.settings.isHandleResize && window.addEventListener('resize', this.handleResizeBinded);    
  }

  unSubscribeHandlers() {
    this.settings.rootElement.removeEventListener('touchstart', this.handleTouchStartBinded);
    this.settings.rootElement.removeEventListener('mousedown', this.handleDownBinded);

    this.settings.rootElement.removeEventListener('mouseup mouseleave touchend', this.handleStopBinded);
    this.settings.rootElement.removeEventListener('mousemove touchmove', this.handleMoveBinded);
    window.removeEventListener('resize', handleResizeBinded);
  }

  handleResize() {
    this.considerItemsPerSlide();
    this.calculateOffset();
    this.setTransformBounds();
    this.invokeCallback(this.update);
  }

  calculateOffset() {
    if (!this.settings.useOverflowOffset) {
      return;
    }
    this.considerItemsPerSlide();    
    this.settings.allowedOffsets.xMin = this.parentElement.clientWidth - this.parentElement.scrollWidth;
    this.settings.allowedOffsets.yMin = this.parentElement.clientHeight - this.parentElement.scrollHeight;
  }

  fitItemsToExternal() {
    let currentWidth = this.parentElement.parentElement.clientWidth;
    let clearChilds = this.childs.filter(item => !item.classList.contains(`.${COMPENSATION_ELEMENT}`));    
    this.previousContainerSize = currentWidth;

    let summ = clearChilds[0].offsetWidth;

    for (let index = 1; index < clearChilds.length; index++) {
      const element = clearChilds[index];
      let nextSumm = summ + element.offsetWidth;

      if (nextSumm > currentWidth) {        
        
        this.parentElement.style.width = summ;
        this.parentElement.style['max-width'] = '100%';        
        
        return index;
      }

      summ = nextSumm;
    }
  }

  considerItemsPerSlide() {
    this.settings.slideCount = Math.ceil(this.childs.length / this.settings.itemsPerSlide);

    if (!settings.itemsInSlideFitsWrapper) {
      this.parentElement.style.width = '';
      this.parentElement.style['max-width'] = '';      
      
      return; 
    }
    if (this.parentElement.parentElement.clientWidth === this.previousContainerSize) { return; }    
//FIXME: ref
    // let nextIPSvalue = this.fitItemsToExternal();
    // if (nextIPSvalue === this.settings.itemsPerSlide) { return; }

    // this.childs.filter(`.${COMPENSATION_ELEMENT}`).remove();
    // this.childs = childs.not(`.${COMPENSATION_ELEMENT}`);

    // this.settings.itemsPerSlide = nextIPSvalue;
    // this.settings.slideCount = Math.ceil(this.childs.length / nextIPSvalue);

    // let divide = this.childs.length / this.settings.itemsPerSlide;
    // let width = this.childs[this.childs.length - 1].offsetWidth;
    // let height = this.childs[this.childs.length - 1].offsetHeight;

    // if ( getDecimal(divide) > 0) {      
    //   let extraItems = (Math.ceil(divide) * this.settings.itemsPerSlide) - this.childs.length;
      
    //   for (let index = 0; index < extraItems; index++) {
    //     let $element = $(`<li class=${COMPENSATION_ELEMENT}>`);

    //     $element.css({
    //       'min-width': width,
    //       'width': width,
    //       'height': height
    //     });

    //     $that.append($element);
    //     childs = childs.add($element);
    //   }
    // }
    // invokeCallback(settings.update, 'dotsUpdate');
  }

  // start EVENTS
  preventAll() {
    return false;
  }

  //mouse event handlers
  handleDown(event) {
    this.handleStart({x: event.pageX, y: event.pageY}, event.target);
    
    this.settings.rootElement.addEventListener('mousemove', this.handleMoveBinded);
    this.settings.rootElement.addEventListener('mouseup mouseleave', this.handleStopBinded);
    
    return false;
  }

  handleMove(event) {
    this.proceedMoveHandler({x: event.pageX, y: event.pageY});
  }

  //end mouse
  //touch event handlers
  handleTouchStart(event) {
    var touches = event.originalEvent.touches;

    if (touches.length > 1) {
      return true;
    }
    this.touchIdentifier = touches[0].identifier;
    this.handleStart({x: touches[0].pageX, y: touches[0].pageY}, event.target);
    this.settings.rootElement.addEventListener('touchend', this.handleStopBinded);
    this.settings.rootElement.addEventListener('touchmove', this.handleTouchMoveBinded);
  }

  handleTouchMove(event) {
    var touches = event.originalEvent.changedTouches;

    if (touches.length > 1) {
      return true;
    }
    if (touches[0].identifier != touchIdentifier) {
      return true;
    }
    this.proceedMoveHandler({x: touches[0].pageX, y: touches[0].pageY});
    return false;
  }

  // end touch
  invokeCallback(callbackArr, type = 'default') {
    let info = {
      vectorTransform: this.vectorTransform,
      moveAmmount: this.moveAmmount,
      pathAbs: this.pathAbs,
      childs: this.childs,
      type
    };
    const set = this.settings;
    const setsCached = {...info, set};

    callbackArr.forEach(callBack => {
      callBack(setsCached);
    });
  }

  /**
   * @description calls start callback, sets start move values
   * @param {object} point
   * @param {DOM element} targetElement
   */
  handleStart(point, target) {    
    this.eventTarget = target;
    this.pathAbs = 0;

    this.setVectorPrev(point);
    this.invokeCallback(this.start);
  }

  /**
   * @description unsubscribes all in-action events
   * calls stop event callback
   * checks drag amount, triggers click for target in case of stationar tap
   * prevents clicking for mouse drag
   * @param {object} event
   */
  handleStop(event) {
    this.settings.rootElement.removeEventListener('mousemove', this.handleMoveBinded);
    this.settings.rootElement.removeEventListener('touchmove', this.handleTouchMoveBinded);
    this.settings.rootElement.removeEventListener('touchend', this.handleStopBinded);
    this.settings.rootElement.removeEventListener('mouseup mouseleave', this.handleStopBinded);
    
    this.invokeCallback(this.stop);
    if (this.pathAbs > this.settings.tapPrecision) {
      event.type.match('mouseup') && this.settings.rootElement.addEventListener('click', this.preventAllBinded);
      return false;
    }
    event.type.match('touch') && eventTarget.click();
  }

  /**
   * @description calls drag callback
   * calculates delta movement
   * applies changes to transform vector
   * @param {object} vectorCur
   */
  proceedMoveHandler(vectorCur) {
    this.moveAmmount = zeroVector;
    
    this.moveAmmount[this.settings.axis] = vectorCur[this.settings.axis] - this.vectorPrev[this.settings.axis];
    this.vectorTransform[this.settings.axis] += this.moveAmmount[this.settings.axis];
    this.pathAbs += Math.abs(this.moveAmmount[this.settings.axis]);    

    this.setVectorPrev(vectorCur);
    this.etTransformBounds();
    this.invokeCallback(this.drag);
  }

  // end EVENTS

  /**
   * @description checks if transform vector is out of offsets
   */
  setTransformBounds() {
    let isInScope = true;
    
      if (this.vectorTransform[this.settings.axis] < this.settings.allowedOffsets[`${this.settings.axis}Min`]) {
        this.vectorTransform[this.settings.axis] = this.settings.allowedOffsets[`${this.settings.axis}Min`];
        isInScope = false;
      }
      if (this.vectorTransform[this.settings.axis] > this.settings.allowedOffsets[`${this.settings.axis}Max`]) {
        this.vectorTransform[this.settings.axis] = this.settings.allowedOffsets[`${this.settings.axis}Max`];
        isInScope = false;
      }
    
    this.setXYtoMatrix();
    return isInScope;
  }

  setVectorPrev(vectorCur) {
    this.vectorPrev = {...vectorCur};
  }

  // setXYtoMatrix() {
  //   $that.css({transform: `translate3d(${vectorTransform.x}px, ${vectorTransform.y}px, 0px)`});
  //   invokeCallback(settings.update);
  // }

  // controls
  /**
   * @public
   * @method pesTabs
   */
  enable() {
    this.handleResize();
    this.subscribeHandlers();
  }

  /**
   * @public
   */
  disable() {
    this.setTransform(zeroVector);
    this.invokeCallback(this.update);
    this.unSubscribeHandlers();
  }

  /**
   * @public
   * @param {object} newTransform { x: number,  y: number }
   */
  setTransform(newTransform) {
    this.vectorTransform = {...newTransform};

    return this.setTransformBounds();
  }

  subscribe({event = 'update', callback}) {
    if (event in this.settings) {
      this.settings[event].push(callback);
      this.invokeCallback(settings[event]);
    }
  }

  unSubscribe({event = 'update', callback}) {
    if (event in this.settings) {
      this.settings[event].remove(callback);
    }
  }

  calcBoundInWrapper(element) {
    let elem = convertDOMelement(element);

    if (this.settings.axis === 'x') {      
      return this.vectorTransform.x + ( elem.getBoundingClientRect().left - this.rootElement.getBoundingClientRect().left );      
    }
    return this.vectorTransform.y + ( elem.getBoundingClientRect().top - this.rootElement.getBoundingClientRect().top );
  }

  calcTransformToElement(element) {    
    let length;
    let elem = convertDOMelement(element);

    if (this.settings.axis === 'x') {
      length = elem.getBoundingClientRect().left - childs[0].getBoundingClientRect().left;
    } 
    else {
      length = elem.getBoundingClientRect().top - childs[0].getBoundingClientRect().top;
    }
    
    return {[this.settings.axis]: this.settings.allowedOffsets[`${this.settings.axis}Max`] - length};
  }

  updateSettings(options) {
    if (!options || !options instanceof Object) { return; }
    this.settings = {...this.settings, ...options};

    this.calculateOffset();
    this.setTransformBounds();    
  }
}


function getDecimal(num) {
  // may be replaced with combination of trunc, but with core-js for ie11+ support
  var str = "" + num;
  var zeroPos = str.indexOf(".");
  if (zeroPos == -1) return 0;
  str = str.slice(zeroPos);
  return +str;
}

function getXYfromMatrix($element) {
  let result = [];

  result = $element.css('transform').match(/-?\d+/g).map((value) => parseInt(value));
  if (matrixStr.indexOf('matrix3D') !== -1) {
    return { x: result[10], y: result[11] };
  }
  return { x: result[5], y: result[6] };
}

function convertDOMelement(element) {
  if (element instanceof jQuery) { 
    return element.get(0); 
  }
  return element;
}