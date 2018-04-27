//$.fn.reverse = [].reverse;
$(
  function () {
    oversizedTabs();
    firstTabs();
    secondTabs();
    dotsAdaptedCase();
  }
);

function secondTabs() {
  let $tabs = $('.js-second-case .tabs_1');
  let $childItems = $tabs.find('> li');
  let tabsObject = $tabs.tabsMain({
    childSelector: '> li'
  });

  let moveTabs = $tabs.tabsMainAnimate({
    tabsCore: tabsObject,        
  });

  let dots = $('.js-dots-container').tabsMainDots({
    triggerPoint: {x: 100, y: 0},
    tabsMoverCtrl: moveTabs,
    tabsCore: tabsObject,
  });

  tabsObject.subscribe({
    event: 'stop',
    callback: moveTabs.continueSliding
  });

  tabsObject.subscribe({
    event: 'update',
    callback: dots.trackTabs
  });

}

function firstTabs() {
  let $tabs = $('.js-first-case .tabs_1');  
  let tabsObject = $tabs.tabsMain({
    childSelector: '> li'
  });

  let btn1 = $('.js-first-case .btn-left');
  let btn2 = $('.js-first-case .btn-right');

  let btns = $tabs.tabsMainSlideBtns({
    btns: [
      {
        $element: btn1,
        axis: 'x',
        targetOffset: 'xMax'
      },
      {
        $element: btn2,
        axis: 'x',
        targetOffset: 'xMin'
      }
    ]
  });

  tabsObject.subscribe({
    event: 'update',
    callback: btns.update
  });

  //end left-right btn

  // create 'animation of move'
  let moveTabs = $tabs.tabsMainAnimate({
    tabsCore: tabsObject,    
  });  

  btn1.on('click', moveTabs.slideToMin);
  btn2.on('click', moveTabs.slideToMax);

  //
  document.getElementById('itemsPerSlide').addEventListener('blur', handleChangeItemsSlide);

  function handleChangeItemsSlide(event) {
    tabsObject.setItemsPerSlide(Number.parseInt(event.target.value) || 1);
  }
}

function oversizedTabs() {
  let $tabs = $('.js-oversized-case .tabs_1');
  let $childItems = $tabs.find('> li');
  let tabsObject = $tabs.tabsMain({
    childSelector: '> li'
  });

  // for left-right buttons
  let btn1 = $('.js-oversized-case .btn-left');
  let btn2 = $('.js-oversized-case .btn-right');

  let btns = $tabs.tabsMainSlideBtns({
    btns: [
      {
        $element: btn1,
        axis: 'x',
        targetOffset: 'xMax'
      },
      {
        $element: btn2,
        axis: 'x',
        targetOffset: 'xMin'
      }
    ]
  });

  tabsObject.subscribe({
    event: 'update',
    callback: btns.update
  });

  //end left-right btn

  // create 'animation of move'
  let moveTabs = $tabs.tabsMainAnimate({
    tabsCore: tabsObject,    
  });
  btn1.on('click', moveTabs.slideToMin);
  btn2.on('click', moveTabs.slideToMax);

  //

}

function dotsAdaptedCase() {
  let infoSlides = $('.js-slides-info');
  let $tabs = $('.js-dots-adapt-case .tabs_1');
  let $childItems = $tabs.find('> li');
  let tabsObject = $tabs.tabsMain({
    isIPSFitsScreen: true,    
    childSelector: '> li'    
  });
    
  let moveTabs = $tabs.tabsMainAnimate({
    tabsCore: tabsObject,
  });

  let dots = $('.js-adapt-dots').tabsMainDots({
    triggerPoint: {x: '50%', y: 0},
    tabsMoverCtrl: moveTabs,
    tabsCore: tabsObject
  });

  tabsObject.subscribe({
    event: 'stop',
    callback: moveTabs.continueSliding
  });

  tabsObject.subscribe({
    event: 'update',
    callback: dots.trackTabs
  });

  tabsObject.subscribe({
    event: 'update',
    callback: dots.reManageDots
  });

  infoSlides.attr('items', tabsObject.getSettings().itemsPerSlide);
  $(window).on('resize', () => {
    infoSlides.attr('items', tabsObject.getSettings().itemsPerSlide);
  });
}