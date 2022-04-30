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