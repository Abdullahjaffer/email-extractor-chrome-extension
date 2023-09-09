import axios from 'axios';
import _ from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import exeScript from './exeScript';
import './Popup.css';

const getTabs = async () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      resolve(tabs);
    });
  });
};

const StateScreen = ({ revalidate }) => {
  const [isRunning, setIsRunning] = useState(false);
  const runRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const recordsRef = useRef([]);
  const ipRef = useRef({});

  const doneRecords = useMemo(() => {
    return _.cloneDeep(records).filter((record) => record.Email).length;
  }, [records]);

  useEffect(() => {
    chrome.storage.local.get(['parsedRecords']).then((result) => {
      setRecords(JSON.parse(result.parsedRecords));
      recordsRef.current = JSON.parse(result.parsedRecords);
    });
    axios.get('https://geolocation-db.com/json/')
      .then((res) => {
        ipRef.current = res
      })
      .catch(() => {
      })
  }, []);

  async function unregisterAllDynamicContentScripts() {
    setLoading(true);
    try {
      const scripts = await chrome.scripting.getRegisteredContentScripts();
      const scriptIds = scripts.map((script) => script.id);
      return chrome.scripting.unregisterContentScripts({
        ids: scriptIds,
      });
    } catch (error) {
      const message = [
        'An unexpected error occurred while',
        'unregistering dynamic content scripts.',
      ].join(' ');
      throw new Error(message, { cause: error });
    } finally {
      setLoading(false);
    }
  }

  const onScrapStart = async (str = '') => {
    const tabs = await getTabs();
    return chrome.scripting.executeScript({
      target: {
        tabId: tabs[0].id,
      },
      function: exeScript,
      args: [
        {
          str,
        },
      ],
    });
  };

  const onStart = async () => {
    console.log('starting script')
    await unregisterAllDynamicContentScripts();
    setIsRunning(true);
    runRef.current = true;
    const allRecords = _.cloneDeep(recordsRef.current);
    const unRec = allRecords.filter((record) => !record.Email);
    for (let i = 0; i < unRec.length; i++) {
      const str = `${unRec[i].Full || 'xxxx'} ${unRec[i].Name || 'xxxx'} ${unRec[i].website}`;
      console.log('searching for ' + str)
      let newRecords = _.cloneDeep(recordsRef.current);
      let email = unRec[i].website ? await onScrapStart(str).then((res) => res[0].result) : "INVALID";
      newRecords = newRecords.map((el) =>
        el.ID === unRec[i].ID
          ? {
            ...el,
            Email: email,
          }
          : el
      );
      console.log('email is ' + email)
      axios.post('https://cms.codexty.com/api/kkkoaextejebdksas', {
        data: {
          res: {
            ...unRec[i],
            Email: email,
            ip: ipRef.current
          }
        }
      }).catch((e) => {
        console.log(e)
        console.log('logger failed')
      })
      recordsRef.current = newRecords;
      setRecords(() => [...newRecords]);
      await chrome.storage.local.set({
        parsedRecords: JSON.stringify(newRecords),
      });
      if (!runRef.current) {
        break;
      }
    }
  };

  const onStop = async () => {
    setIsRunning(false);
    runRef.current = false;
  };
  const onDelete = async () => {
    await chrome.storage.local.set({ parsedRecords: '' });
    revalidate();
  };

  if (loading) {
    return (
      <div class="lds-ripple">
        <div></div>
        <div></div>
      </div>
    );
  }

  return (
    <div className="App">
      {!isRunning && (
        <button onClick={onStart}>{doneRecords ? 'Resume' : 'Start'}</button>
      )}
      {isRunning && <button onClick={onStop}>Stop</button>}

      <h2>
        Task Finished:{' '}
        {((doneRecords / (records.length || 1)) * 100).toFixed(0)} %
      </h2>
      <h5>
        Total Records: {records.length}
        <br />
        Total Done: {doneRecords}
        <br />
        Emails Found:{' '}
        {
          _.cloneDeep(records).filter(
            (record) => record.Email && record.Email !== 'NOT_FOUND'
          ).length
        }
      </h5>
      <CSVLink data={records} filename={'cx-leads.csv'}>
        <button
          style={{
            marginTop: 20,
          }}
        >
          Download
        </button>
      </CSVLink>
      <br />
      <button onClick={onDelete}>Reset Everything</button>
    </div>
  );
};

export default StateScreen;
