import {isOnScreen} from './screen-visible';

const LAZY_LOADED = 'lazy--loaded';
let visibilityArray = [];

/**
 * @description checks if element already lazy--loaded and checks if element is on the screen
 * @description copies value of data-original attribute to src or srcset for provided item
 * @param $elements jQuery object
 */
export const simpleLazyLoad = ($elements) => {
  if (!$elements.length) {
    return false;
  }
  ;
  visibilityArray = isOnScreen($elements);
  $elements.each((index, item) => {
    if (visibilityArray[index]) {
      handleElement(item);
    }
  });

};

const handleElement = (element) => {
  if (element.classList.contains(LAZY_LOADED)) {
    return false;
  }

  if (element.tagName.toLowerCase() === 'img') {
    const src = element.dataset['original'];

    if (!src) {
      return false;
    }
    element.setAttribute('src', src);
  }
  else if (element.tagName.toLowerCase() === 'source') {
    const src = element.dataset['original'];

    if (!src) {
      return false;
    }
    element.setAttribute('srcset', src);
  }

  element.classList.add(LAZY_LOADED);
};
