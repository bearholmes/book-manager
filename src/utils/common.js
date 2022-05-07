export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

export const getRandomId = () => {
  return (Number(String(Math.random()).slice(2)) + Date.now() + Math.round(performance.now())).toString(36);
};

export const currency = (value, nullTxt = '-') => {
  if (!value && value !== 0) {
    return nullTxt;
  }
  return value.toString().replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,');
};

export const getRandomIntInclusive = (min, max) => {
  return min + Math.floor(Math.random() * (max - min + 1));
};

export const getRandomHtmlColor = (min = 0, max = 255) => {
  const r = getRandomIntInclusive(min, max).toString(16);
  const g = getRandomIntInclusive(min, max).toString(16);
  const b = getRandomIntInclusive(min, max).toString(16);
  return `#${r}${g}${b}`;
};

export const convHtmlColorToInt = (txt) => {
  const r = parseInt(txt.substring(1, 3), 16);
  const g = parseInt(txt.substring(3, 5), 16);
  const b = parseInt(txt.substring(5, 7), 16);
  return { r, g, b };
};

const DEFAULT_COLOR = [
  '#FFEB99',
  '#B3CDFF',
  '#8AA8E5',
  '#CFE4E6',
  '#A3CCB8',
  '#AF99BF',
  '#E6B8A1',
  '#FFFAE5',
  '#E5EEFF',
  '#CCDDFF',
  '#E4EFF0',
  '#CFE5DA',
  '#D0C3D9',
  '#FFEEE6',
];

export class ColorQueue {
  _arr;

  constructor() {
    this._arr = DEFAULT_COLOR.slice();
  }
  enqueue(item) {
    this._arr.push(item);
  }
  dequeue() {
    return this._arr.shift();
  }
}
