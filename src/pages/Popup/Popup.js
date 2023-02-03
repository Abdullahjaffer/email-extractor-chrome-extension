import React, { useEffect, useState } from 'react';
import LoadCSV from './LoadCSV';
import './Popup.css';
import StateScreen from './StateScreen';

const getTabs = async () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      resolve(tabs);
    });
  });
};

// step 0 is loading
// step 1 is load csv
// step 2 is scripting
// step 3 is download

const Popup = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {


    getState()
  }, [])

  const getState = () => {
    setStep(0)
    chrome.storage.local.get(["parsedRecords"]).then((result) => {
      if (!result.parsedRecords) {
        setStep(1)
      }
      else {
        setStep(2)
      }
    });
  }

  return (
    <div className="App">
      {step === 0 ? (
        <div class="lds-ripple">
          <div></div>
          <div></div>
        </div>
      ) : step === 1 ? (
        <LoadCSV revalidate={getState} />
      ) : step === 2 ? (
        <StateScreen revalidate={getState} />
      ) : undefined}
    </div>
  );
};

export default Popup;
