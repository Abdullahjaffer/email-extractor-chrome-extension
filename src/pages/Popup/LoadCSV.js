import Papa from 'papaparse';
import React from 'react';

const LoadCSV = ({ revalidate }) => {
  const handleFileChange = (e) => {
    const allowedExtensions = ['csv'];

    // Check if user has entered the file
    if (e.target.files.length) {
      const inputFile = e.target.files[0];

      // Check the file extensions, if it not
      // included in the allowed extensions
      // we show the error
      const fileExtension = inputFile?.type.split('/')[1];
      if (!allowedExtensions.includes(fileExtension)) {
        return;
      }

      // Initialize a reader which allows user
      // to read any file or blob.
      const reader = new FileReader();

      // Event listener on reader when the file
      // loads, we parse it and set the data.
      reader.onload = async ({ target }) => {
        const csv = Papa.parse(target.result, { header: true });
        const parsedData = csv?.data;
        await chrome.storage.local.set({
          parsedRecords: JSON.stringify(parsedData),
        });
        revalidate();
      };
      reader.readAsText(inputFile);
    }
  };

  return (
    <div className="App">
      <input
        onChange={handleFileChange}
        id="csvInput"
        name="file"
        type="File"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />
    </div>
  );
};

export default LoadCSV;
