$(() => {
  yDots();
});


function yDots() {
  let $tabs = $('.y-dots .js-tabs');  
  let tabsObject = $tabs.tabsMain({
    axis: 'y',
    childSelector: '> li'
  });

  let btn1 = $('.y-dots .btn-top');
  let btn2 = $('.y-dots .btn-bottom');

  let btns = $tabs.tabsMainSlideBtns({
    btns: [
      {
        $element: btn1,
        axis: 'y',
        targetOffset: 'yMax'
      },
      {
        $element: btn2,
        axis: 'y',
        targetOffset: 'yMin'
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
  
  tabsObject.subscribe({
    event: 'stop',
    callback: moveTabs.continueSliding
  });

  btn1.on('click', moveTabs.slideToMin);
  btn2.on('click', moveTabs.slideToMax);

  // let dots = $('.js-adapt-dots').tabsMainDots({
  //   triggerPoint: {x: '50%', y: 0},
  //   tabsMoverCtrl: moveTabs,
  //   tabsCore: tabsObject
  // });

  // tabsObject.subscribe({
  //   event: 'update',
  //   callback: dots.trackTabs
  // });

  // tabsObject.subscribe({
  //   event: 'update',
  //   callback: dots.reManageDots
  // });

  $(window).on('resize', () => {
    //check screen resolution
  });
}