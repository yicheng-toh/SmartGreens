const{ DEBUG } = require("./env.js");

function convertTime12HourTo24Hour(timeStr) {
  // Extract hour and minute from the time string
  timeStr = timeStr.trim();
  let hour = parseInt(timeStr.substring(0, 2));
  let minute = timeStr.substring(3, 5);
  if (DEBUG) console.log("timeStr", timeStr);
  if (DEBUG) console.log("hour", hour, "minute", minute);

  // Adjust hour for PM time
  if (timeStr.toLowerCase().endsWith("pm") && hour < 12) {
    hour += 12;
  } else if (timeStr.toLowerCase().endsWith("am") && hour === 12) {
    hour = 0; // Adjust hour to 0 for 12:00am
  }

  // Format hour and minute in 24-hour format
  const formattedHour = hour.toString().padStart(2, "0");

  // Return the converted time in "HH:mm" format
  return `${formattedHour}:${minute}`;
}

function formatDateTimeOutput(content) {
  if (DEBUG) console.log("format date time output content", content);
  const dateTime = new Date(content);

  // Get individual date components
  const day = dateTime.getDate();
  const month = dateTime.toLocaleString("default", { month: "short" }); // Get month abbreviation
  const year = dateTime.getFullYear();

  // Get individual time components
  let hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // Handle midnight (0 hours)
  // ampm = content.slice(-2);

  // Format date and time
  const formattedDate = `${day} ${month} ${year}`;
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${ampm}`;

  return `${formattedDate} ${formattedTime}`;
}

function groupSensorDataByPlantType(data) {
  let res = {};
  for (let entry of data) {
    if (DEBUG) console.log("entry is", entry);
    if (!(entry.PlantName in res)) {
      res[entry.PlantName] = {};
    }

    for (let key in entry) {
      // if (DEBUG) console.log("entry key is", key);
      if (!(key in res[entry.PlantName])) {
        res[entry.PlantName][key] = [];
      }
      res[entry.PlantName][key].push(entry[key]);
    }
  }
  return res;
}

function groupSensorDataByPlantBatchId(data) {
  let res = {};
  for (let entry of data) {
    if (DEBUG) console.log("entry is", entry);
    if (!(entry.PlantBatchId in res)) {
      res[entry.PlantBatchId] = {};
    }

    for (let key in entry) {
      // if (DEBUG) console.log("entry key is", key);
      if (!(key in res[entry.PlantBatchId])) {
        res[entry.PlantBatchId][key] = [];
      }
      res[entry.PlantBatchId][key].push(entry[key]);
    }
  }
  return res;
}

function groupPlantSensorInfoByPlantId(data) {
  let res = {};
  for (let entry of data) {
    if (DEBUG) console.log("entry is", entry);
    if (!(entry.PlantId in res)) {
      res[entry.PlantId] = {};
    }

    for (let key in entry) {
      // if (DEBUG) console.log("entry key is", key);
      if (!(key in res[entry.PlantId])) {
        res[entry.PlantId][key] = [];
      }
      res[entry.PlantId][key].push(entry[key]);
    }
  }
  return res;
}

function appendStatusToLatestSensorReadings(dataList) {
  //if there is no violation, then the status is healthy.
  //if there is 1 violation, then it is attention
  // if there are greater than 1 violation then it is critical.
  //will be coded with hard coded values.
  if (DEBUG) console.log("datalsit is ", dataList);
  for (let [key, data] of Object.entries(dataList)) {
    if (DEBUG) console.log("data is", data);
    const parameters = [
      "Temperature",
      "Humidity",
      "Brightness",
      "pH",
      "CO2",
      "TDS",
    ];
    let counter = 0;
    try {
      parameters.forEach((parameter) => {
        try {
          const value = data[parameter][0];
          const min = data[`${parameter}_min`][0];
          const max = data[`${parameter}_max`][0];

          if (min !== null && value < min && value !== null) {
            counter++;
          } else if (max !== null && value > max && value !== null) {
            counter++;
          }
        } catch (error) {
          console.error(`Error comparing ${parameter}:`, error.message);
        }
      });
    } catch (error) {
      console.error("Error occurred:", error.message);
    }

    let status;
    if (counter <= 0) {
      status = "healthy";
    } else if (counter === 1) {
      status = "attention";
    } else if (counter >= 1) {
      status = "critical";
    }
    data.status = status;
  }
  return dataList;
  // return { status, counter };
}

function appendStatusToPlantBatchInfoAndYield(
  plantBatchInfoObject,
  plantBatchSensorReadingsWithStatusObject
) {
  // let result = {};
  //loop through the plant batch info.
  for (let plantBatchInfo of plantBatchInfoObject) {
    //retrieve the data.
    if (
      plantBatchSensorReadingsWithStatusObject === null ||
      plantBatchSensorReadingsWithStatusObject[plantBatchInfo.PlantBatchId] ===
        undefined ||
      plantBatchSensorReadingsWithStatusObject[plantBatchInfo.PlantBatchId][
        "status"
      ] === undefined
    ) {
      plantBatchInfo.status = "Unknown";
    } else {
      plantBatchInfo.status =
        plantBatchSensorReadingsWithStatusObject[plantBatchInfo.PlantBatchId][
          "status"
        ];
    }
  }
  return plantBatchInfoObject;
}

function groupMonthlyYieldByPlantName(data) {
  // [
  //   {
  //     plantId: 1,
  //     plantName: 'Tomato4',
  //     year: 2024,
  //     month: 'March',
  //     total_weight_harvested: '6'
  //   }
  // ]
  let blankArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let monthToIntMap = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };
  let result = {};
  for (const dataEntry of data) {
    //check if plantName is already the key
    if (!dataEntry.PlantName) {
      dataEntry.PlantName = dataEntry.plantName;
    }
    if (dataEntry.PlantName in result) {
      //update the plant weight

      result[dataEntry.PlantName]["WeightHarvested"][
        monthToIntMap[dataEntry.month]-1
      ] = dataEntry.total_weight_harvested;
    } else {
      result[dataEntry.PlantName] = {};
      result[dataEntry.PlantName]["WeightHarvested"] = [...blankArray];
      result[dataEntry.PlantName]["Year"] = dataEntry.year
        ? dataEntry.year
        : dataEntry.Year;
      result[dataEntry.PlantName]["PlantId"] = dataEntry.PlantId
        ? dataEntry.PlantId
        : dataEntry.plantId;
      result[dataEntry.PlantName]["WeightHarvested"][
        monthToIntMap[dataEntry.month]-1
      ] = parseFloat(dataEntry.total_weight_harvested);
      result[dataEntry.PlantName]["Month"] = [...months];
    }
  }
  return result;
}

function groupWeeklyYieldByPlantName(data) {
  // [
  //   {
  //     plantId: 1,
  //     plantName: 'Tomato4',
  //     year: 2024,
  //     month: 'March',
  //     total_weight_harvested: '6'
  //   }
  // ]
  let blankArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  // let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let weeks = [1,2,3,4,5,6,7,8,9,10,11,12];
  // let monthToIntMap = {
  //   January: 1,
  //   February: 2,
  //   March: 3,
  //   April: 4,
  //   May: 5,
  //   June: 6,
  //   July: 7,
  //   August: 8,
  //   September: 9,
  //   October: 10,
  //   November: 11,
  //   December: 12,
  // };
  let result = {};
  for (const dataEntry of data) {
    //check if plantName is already the key
    if (!dataEntry.PlantName) {
      dataEntry.PlantName = dataEntry.plantName;
    }
    if (dataEntry.PlantName in result) {
      //update the plant weight

      result[dataEntry.PlantName]["WeightHarvested"][
        dataEntry.weekNumber-1
      ] = dataEntry.total_weight_harvested;
    } else {
      result[dataEntry.PlantName] = {};
      result[dataEntry.PlantName]["WeightHarvested"] = [...blankArray];
      result[dataEntry.PlantName]["Year"] = dataEntry.year
        ? dataEntry.year
        : dataEntry.Year;
      result[dataEntry.PlantName]["PlantId"] = dataEntry.PlantId
        ? dataEntry.PlantId
        : dataEntry.plantId;
      result[dataEntry.PlantName]["WeightHarvested"][
        dataEntry.weekNumber-1
      ] = parseFloat(dataEntry.total_weight_harvested);
      result[dataEntry.PlantName]["Week"] = [...weeks];
    }
  }
  return result;
}

module.exports = {
  appendStatusToPlantBatchInfoAndYield,
  convertTime12HourTo24Hour,
  formatDateTimeOutput,
  groupMonthlyYieldByPlantName,
  groupWeeklyYieldByPlantName,
  groupSensorDataByPlantType,
  groupSensorDataByPlantBatchId,
  appendStatusToLatestSensorReadings,
  groupPlantSensorInfoByPlantId,
};
