const exeScript = async ({ str }) => {
  try {
    // HELPERS
    const PATHS = {
      COMPOSE_BUTTON_PATH: "//div[text()='Compose']",
      RECIPIENT_PATH: `[autocomplete="off"][autocapitalize="off"][autocorrect="off"][spellcheck="false"][size="0"]`,
      EMAIL_NOT_FOUND: 'nametoemail-notfound',
      SPINNER: 'nametoemail-spinner',
      INPUT_DIV_NAME_TO_EMAIL: `[data-n2e-area="search-result"]`,
      THRESHOLD_LIMIT: 200,
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

    // document.querySelector(`[data-tooltip="From user's Google profile"]`)

    // ACTUAL CODE
    if (!document.querySelector(PATHS.RECIPIENT_PATH)) {
      getElementByXpath(PATHS.COMPOSE_BUTTON_PATH).click();
      await sleep(2000);
    }
    const inputField = document.querySelector(PATHS.RECIPIENT_PATH);
    inputField.focus();
    await sleep(300);
    inputField.value = `${str}.`;
    inputField.focus();
    removeAllElementsByClass(PATHS.EMAIL_NOT_FOUND);


    await sleep(500);

    console.log(str)

    setNativeValue(inputField, str);
    inputField.dispatchEvent(new Event('input', { bubbles: true }));
    inputField.focus();

    console.log('after')

    let found,
      notFound = document.getElementsByClassName(PATHS.EMAIL_NOT_FOUND);

    let threshold = 0;
    while (!(found || notFound.length)) {
      console.log(threshold)
      threshold = threshold + 1
      await sleep(1000);
      let foundComponent = document.getElementsByClassName(
        'nametoemail-variant'
      )?.[0];
      foundComponent = foundComponent?.firstElementChild;
      foundComponent = foundComponent?.firstElementChild?.innerText;
      found = foundComponent;
      if (threshold > PATHS.THRESHOLD_LIMIT && !found) {
        found = 'REQUEST_TIMEOUT'
      }
    }

    const loading = document.getElementsByClassName(PATHS.SPINNER);

    while (loading.length) {
      await sleep(200);
    }

    if (!found) {
      found = 'NOT_FOUND';
    }

    return found;
  }
  catch (e) {
    console.log(e)
    return 'ERROR_OCC'
  }
};

export default exeScript;
