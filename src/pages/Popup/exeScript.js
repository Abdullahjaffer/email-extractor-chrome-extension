const exeScript = async ({ str }) => {
  // HELPERS
  const PATHS = {
    COMPOSE_BUTTON_PATH: "//div[text()='Compose']",
    RECIPIENT_PATH: `[autocomplete="off"][autocapitalize="off"][autocorrect="off"][spellcheck="false"][size="0"]`,
    EMAIL_NOT_FOUND: 'nametoemail-notfound',
    SPINNER: 'nametoemail-spinner',
    INPUT_DIV_NAME_TO_EMAIL: `[data-n2e-area="search-result"]`,
  };
  const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  const getElementByXpath = (path) => {
    return document.evaluate(
      path,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
  };

  function setNativeValue(element, value) {
    const { set: valueSetter } =
      Object.getOwnPropertyDescriptor(element, 'value') || {};
    const prototype = Object.getPrototypeOf(element);
    const { set: prototypeValueSetter } =
      Object.getOwnPropertyDescriptor(prototype, 'value') || {};

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      throw new Error('The given element does not have a value setter');
    }
  }

  function removeAllElementsByClass(className) {
    const elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
  }

  // ACTUAL CODE
  if (!document.querySelector(PATHS.RECIPIENT_PATH)) {
    getElementByXpath(PATHS.COMPOSE_BUTTON_PATH).click();
    await sleep(2000);
  }
  const inputField = document.querySelector(PATHS.RECIPIENT_PATH);
  inputField.focus();
  await sleep(100);
  inputField.value = `${str}.`;
  inputField.focus();
  removeAllElementsByClass(PATHS.EMAIL_NOT_FOUND);

  await sleep(500);

  setNativeValue(inputField, str);
  inputField.dispatchEvent(new Event('input', { bubbles: true }));
  inputField.focus();

  let found,
    notFound = document.getElementsByClassName(PATHS.EMAIL_NOT_FOUND);

  while (!(found || notFound.length)) {
    await sleep(1000);
    let foundComponent = document.getElementsByClassName(
      'nametoemail-variant'
    )?.[0];
    foundComponent = foundComponent?.firstElementChild;
    foundComponent = foundComponent?.firstElementChild?.innerText;
    found = foundComponent;
  }

  const loading = document.getElementsByClassName(PATHS.SPINNER);

  while (loading.length) {
    await sleep(200);
  }

  if (!found) {
    found = 'NOT_FOUND';
  }

  return found;
};

export default exeScript;
