let docWidth;
let docHeight;

/**
 * @description compares element's coordinate + dimension value with dimension of document
 * @param element
 * @return {boolean} element is in screen bounds or not
 */
export const isOnScreen = (element) => {
  docWidth = document.body.offsetWidth;
  docHeight = document.body.offsetHeight;

  if (element instanceof Element) {
    return handleElement(element);
  }

  if (element instanceof Array) {
    return handleArrayElements(element);
  }

  if (element instanceof jQuery) {
    return handlejQueryElements(element);
  }

  return false;
};

const handlejQueryElements = ($elements) => {
  if ($elements.length === 0) {
    return false;
  }

  if ($elements.length === 1) {
    return handleElement($elements[0]);
  }

  return handleArrayElements($elements.toArray());
};

const handleArrayElements = (elements) => {
  let responseArray = new Array(elements.length);

  for (let i = 0; i < responseArray.length; i++){
    responseArray[i] = handleElement(elements[i]);
  }

  return responseArray;
};

const handleElement = (element) => {
  const {x, y, width, height} = element.getBoundingClientRect();

  return isInBounds(x, width, docWidth) && isInBounds(y, height, docHeight);
};

const isInBounds = (coordinate, dimension, pageDimension) => {
  return (coordinate < pageDimension && coordinate + dimension > 0);
};
