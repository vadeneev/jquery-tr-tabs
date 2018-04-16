//$.fn.reverse = [].reverse;

$(
  function () {
    oversizedTabs();
    firstTabs();
    secondTabs();

  }
);

function secondTabs() {
  let $tabs = $('.js-second-case .tabs_1');
  let $childItems = $tabs.find('> li');
  let my = $tabs.tabsMain();

  let moveTabs = $tabs.tabsMainAnimate({
    tabs: my,
    childItems: $childItems
  });

  let dots = $('.js-dots-container').tabsMainDots({
    triggerPoint: {x: 100, y: 0},
    tabsMoverCtrl: moveTabs,
    $tabsItems: $childItems,
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
  let my = $tabs.tabsMain();

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
    tabs: my,
    childItems: $childItems
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
  let my = $tabs.tabsMain();

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
    tabs: my,
    childItems: $childItems
  });
  btn1.on('click', moveTabs.slideToLeft);
  btn2.on('click', moveTabs.slideToRight);

  //

}