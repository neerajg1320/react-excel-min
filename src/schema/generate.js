export function getPropObj(prop) {
  return {
    "keyName": prop
  };
}

export function insertProp(propObj, list, before) {
  if (before) {
    const index = list.findIndex(item => item.keyName === before);
    // console.log(`Insert at ${index}`);
    list.splice(index, 0, propObj);

  } else {
    list.push(propObj);
  }
}

export function getColumns(data, sampleSize=0) {
  if (!data) {
    return [];
  }

  let finalData = data;
  if (sampleSize > 0) {
    finalData.slice(0, sampleSize);
  }

  const columns = [];

  // List of objects: [{missingKey, beforeKey}]
  let missingPropsAll = [];

  // List of keys: [missingKey]
  let missingPropsConsecutive = [];
  finalData.forEach((row, index) => {
    for (const property in row) {
      if (index < 1) {
        missingPropsConsecutive.push(property);
      } else {
        if (!columns.map(col => col.keyName).includes(property)) {
          missingPropsConsecutive.push(property);
        } else {
          missingPropsConsecutive.forEach(mProp => {
            missingPropsAll.push({key: mProp, before: property})
          });

          missingPropsConsecutive = [];
        }
      }
    }

    // These consecutive missing props were at tail
    if (missingPropsConsecutive.length) {
      missingPropsConsecutive.forEach(mProp => {
        missingPropsAll.push({key: mProp, before: null})
      });

      missingPropsConsecutive = [];
    }

    if (missingPropsAll.length) {
      missingPropsAll.forEach(({key, before}) => {
        // console.log(`key=${key} before=${before}`);
        insertProp(getPropObj(key), columns, before);
      });

      missingPropsAll = [];
    }
  });

  // console.log(`columns=`, JSON.stringify(columns, null, 2));
  return columns;
}