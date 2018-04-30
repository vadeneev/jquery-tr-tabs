window.curResolution = document.body.clientWidth >= 960 ? 'desktopResolution' : 'mobileResolution';

$(() => {
  $window = $(window);
  yDots();
  xDots();

  $window.on('resize', () => {
    if (document.body.clientWidth >= 960 && window.curResolution !== 'desktopResolution') {
      window.curResolution = 'desktopResolution';
      $window.trigger('desktopResolution');
    } 
    else if (document.body.clientWidth < 960 && window.curResolution !== 'mobileResolution') {
      window.curResolution = 'mobileResolution';
      $window.trigger('mobileResolution');
    }
  });
});


function yDots() {
  let $tabs = $('.y-dots .js-tabs');  
  let tabsObject = $tabs.tabsMain({
    axis: 'y',
    childSelector: '> li'
  });
  let btns;
  let dots;
  
  let moveTabs = $tabs.tabsMainAnimate({
    tabsCore: tabsObject,    
  });

  tabsObject.subscribe({
    event: 'stop',
    callback: moveTabs.continueSliding
  });

  if (window.curResolution === 'desktopResolution') {
    desktop();
  }
  else {
    mobile();
  }

  $(window).on('desktopResolution', desktop);
  $(window).on('mobileResolution', mobile);

  function desktop() {    
    tabsObject.changeAxis('y');

    initBtns();
  }

  function mobile() {
    tabsObject.changeAxis('x');

    initDots();
  }

  function initBtns() {
    let btn1 = $('.y-dots .btn-top');
    let btn2 = $('.y-dots .btn-bottom');
    btns = $tabs.tabsMainSlideBtns({
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

    btn1.on('click', moveTabs.slideToMin);
    btn2.on('click', moveTabs.slideToMax);

    initBtns = () => btns.enable;
  }

  function initDots() {    
    dots = $('.y-dots .js-adapt-dots').tabsMainDots({
      triggerPoint: {x: '50%', y: 0},
      tabsMoverCtrl: moveTabs,
      tabsCore: tabsObject
    });

    tabsObject.subscribe({
      event: 'update',
      callback: dots.trackTabs
    });

    tabsObject.subscribe({
      event: 'update',
      callback: dots.reManageDots
    });

    initDots = () => dots.enable;
  }
}

function xDots() {
  let $tabs = $('.x-responsive .js-tabs');  
  let tabsObject = $tabs.tabsMain({
    axis: 'x',
    childSelector: '> li'
  });
  let btns;
  let dots;
  
  let moveTabs = $tabs.tabsMainAnimate({
    tabsCore: tabsObject,    
  });

  tabsObject.subscribe({
    event: 'stop',
    callback: moveTabs.continueSliding
  });

  if (window.curResolution === 'desktopResolution') {
    desktop();
  }
  else {
    mobile();
  }

  $(window).on('desktopResolution', desktop);
  $(window).on('mobileResolution', mobile);

  function desktop() {    
    

    initBtns();
  }

  function mobile() {
    //TODO: continue development, add full update settings
    // isIPSFitsScreen: true,    
    // let tabsObject = $tabs.tabsMain({
    //   isIPSFitsScreen: true,    
    //   childSelector: '> li'    
    // });

    initDots();
  }

  function initBtns() {
    let btn1 = $('.x-responsive .btn-left');
    let btn2 = $('.x-responsive .btn-right');
    btns = $tabs.tabsMainSlideBtns({
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

    btn1.on('click', moveTabs.slideToMin);
    btn2.on('click', moveTabs.slideToMax);

    initBtns = () => btns.enable;
  }

  function initDots() {    
    dots = $('.x-responsive .js-adapt-dots').tabsMainDots({
      triggerPoint: {x: '50%', y: 0},
      tabsMoverCtrl: moveTabs,
      tabsCore: tabsObject
    });

    tabsObject.subscribe({
      event: 'update',
      callback: dots.trackTabs
    });

    tabsObject.subscribe({
      event: 'update',
      callback: dots.reManageDots
    });

    initDots = () => dots.enable;
  }
}
