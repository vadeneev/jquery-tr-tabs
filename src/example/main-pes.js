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
  let my = $tabs.tabsMain({
    childSelector: '> li'
  });

  let moveTabs = $tabs.tabsMainAnimate({
    tabsCore: my,        
  });

  let dots = $('.js-dots-container').tabsMainDots({
    triggerPoint: {x: 100, y: 0},
    tabsMoverCtrl: moveTabs,
    tabsCore: my,
  });

  my.subscribe({
    event: 'stop',
    callback: moveTabs.continueSliding
  });

  my.subscribe({
    event: 'update',
    callback: dots.trackTabs
  });

}

function firstTabs() {
  let $tabs = $('.js-first-case .tabs_1');
  let $childItems = $tabs.find('> li');
  let my = $tabs.tabsMain({
    childSelector: '> li'
  });

  // for left-right buttons
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

  my.subscribe({
    event: 'update',
    callback: btns.update
  });

  //end left-right btn

  // create 'animation of move'
  let moveTabs = $tabs.tabsMainAnimate({
    tabsCore: my,    
  });
  btn1.on('click', moveTabs.slideToLeft);
  btn2.on('click', moveTabs.slideToRight);

  //
  document.getElementById('itemsPerSlide').addEventListener('blur', handleChangeItemsSlide);

  function handleChangeItemsSlide(event) {
    my.setItemsPerSlide(Number.parseInt(event.target.value) || 1);
  }
}

function oversizedTabs() {
  let $tabs = $('.js-oversized-case .tabs_1');
  let $childItems = $tabs.find('> li');
  let my = $tabs.tabsMain({
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

  my.subscribe({
    event: 'update',
    callback: btns.update
  });

  //end left-right btn

  // create 'animation of move'
  let moveTabs = $tabs.tabsMainAnimate({
    tabsCore: my,    
  });
  btn1.on('click', moveTabs.slideToLeft);
  btn2.on('click', moveTabs.slideToRight);

  //

}

function dotsAdaptedCase() {
  let infoSlides = $('.js-slides-info');
  let $tabs = $('.js-dots-adapt-case .tabs_1');
  let $childItems = $tabs.find('> li');
  let my = $tabs.tabsMain({
    isIPSFitsScreen: true,    
    childSelector: '> li'    
  });
    
  let moveTabs = $tabs.tabsMainAnimate({
    tabsCore: my,
  });  
  window.tabs = moveTabs;

  let dots = $('.js-adapt-dots').tabsMainDots({
    triggerPoint: {x: '50%', y: 0},
    tabsMoverCtrl: moveTabs,
    tabsCore: my
  });

  my.subscribe({
    event: 'stop',
    callback: moveTabs.continueSliding
  });

  my.subscribe({
    event: 'update',
    callback: dots.trackTabs
  });

  my.subscribe({
    event: 'update',
    callback: dots.reManageDots
  });

  infoSlides.attr('items', my.getSettings().itemsPerSlide);
  $(window).on('resize', () => {
    infoSlides.attr('items', my.getSettings().itemsPerSlide);
  });
}