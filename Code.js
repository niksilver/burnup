// Note: Arrays from a spreadsheet always get translated as 2D arrays when
// they enter as function parameters here.

/**
 * Is the input a string? True or false.
 */
function isString(input) {
  return typeof(input) == "string";
}

/**
 * Is the input a number? True or false.
 * Note that due to ISNUMBER function in Spreadsheets, this
 * cannot be called from a spreadsheet; it's only useful in this script.
 */
function isNumber(input) {
  return typeof(input) == "number";
}

/**
 * Is the input a Boolean? True or false.
 */
function isBoolean(input) {
  return typeof(input) == "boolean";
}

/** Is the input an array? True or false
 */
function isArray(input) {
  return (input instanceof Array);
}

/**
 * Is the input a date? True or false.
 */
function isDate(input) {
  return (input instanceof Date);
}

/**
 * Is this input a basic type:
 * number, string, date. True or false
 */
function isBasicType(input) {
  return isNumber(input) || isString(input) || isBoolean(input) || isDate(input);
}

/**
 * Is the input a 2D array of a single column?
 */
function isColumn(input) {
  return isArray(input) &&
    input.every(function(val) { return val.length == 1});
}

/**
 * The typeof this object, as a string, intended to be called
 * from a spreadsheet formula.
 */
function typeofStr(input) {
  return typeof(input);
}

/**
 * Return the index of a named column in a given array,
 * or throw an error if column not found.
 * @param colname   Name of column
 * @param arraz     Array with a header row
 */
function indexOfColumn(colname, arraz) {
  if (!isString(colname)) {
    throw Error("First argument, column name, must be a string, but got '"+colname+"'");
  }
  if (!isArray(arraz)) {
    throw Error("Second argument must be an array");
  }
  var header = arraz[0];
  var idx = header.indexOf(colname);
  if (idx == -1) {
    throw Error("Column name '" + colname + "' not found");
  }
  return idx;
}

/**
 * Force the input to be an array of arrays.
 */
function make2DArray(input) {
  if (isBasicType(input)) {
    return [[input]];
  }
  if (isBasicType(input[0])) {
    return [input];
  }
  return input;
}

/**
 * Get the value from a 2D array.
 * @param arr  Array to look at; will be made into a 2D array if not already
 * @param row  Index of row to choose, starting at zero.
 * @param col  Index of column to choose, starting at zero.
 */
function indexBy0(arr, row, col) {
  var forced_array = make2DArray(arr);
  return forced_array[row][col];
}

/**
 * Extract the named columns from an array.
 * This is almost the same as Spreadsheet's built in INDEX()
 * function, but it ensures we're using proper Javascript
 * and bypassing any clever auto-conversion that might go
 * on with that built in function.
 * @param colnames  Name of columns to extract
 * @param arraz     Array with header row
 */
function extractColumns(colnames, arraz) {
  colnames = make2DArray(colnames);
  if (colnames.length > 1) {
    throw "Column names should be a string or a single row";
  }

  var indexes = [];
  colnames[0].forEach(function (colname) {
    var idx = indexOfColumn(colname, arraz);
    indexes.push(idx);
  });
  
  var out = [];
  for (var i = 1; i < arraz.length; i++) {
    var row = [];
    indexes.forEach(function (idx) {
      row.push(arraz[i][idx]);
    });
    out.push(row);
  }
  return out;
}

/**
 * Extract the named columns from an array and transform
 * them into rows.
 * @param colnames  Name of columns to extract
 * @param arraz     Array with header row
 */
function extractColumnsAndTransform(colnames, arraz) {
  colnames = make2DArray(colnames);
  if (colnames.length > 1) {
    throw "Column names should be a string or a single row";
  }

  var indexes = [];
  colnames[0].forEach(function (colname) {
    var idx = indexOfColumn(colname, arraz);
    indexes.push(idx);
  });
  
  var out = [];
  indexes.forEach(function (idx) {
    var row = [];
    for (var i = 1; i < arraz.length; i++) {
      row.push(arraz[i][idx]);
    }
    out.push(row);
  });
  return out;
}

/**
 * Is the given date between the two limit dates (inclusive)? True or false.
 * @param tdate  Date under test
 * @param lower  Lower date limit
 * @param upper  Upper date limit
 */
function isBetween(tdate, lower, upper) {
  if (!isDate(tdate)) {
    throw "Date to test (" + tdate + ") is not a date, it's a " + (typeof(tdate));
  }
  if (!isDate(lower)) {
    throw "Lower date bound (" + lower + ") is not a date";
  }
  if (!isDate(upper)) {
    throw "Upper date bound (" + upper + ") is not a date";
  }
  var tdateTime = tdate.getTime();
  var lowerTime = lower.getTime();
  var upperTime = upper.getTime();
  return lowerTime <= tdateTime && tdateTime <= upperTime;
}

/**
 * Generate an array of suitable "Valid to" dates for items with
 * IDs. If an item's "Valid from" date is the latest "Valid from"
 * date for that item then this will be some date far in the
 * future (31 Dec 2099). Otherwise it will be the day before
 * the next "Valid from" date for the item.
 * @param idCol          The name of the column with the ID.
 * @param validFromCol   The name of the column with the "Valid from" date.
 * @param arraz          The dimension table. It requires a header row
 *                       and it must have a columns header "Valid from".
 * @returns    An array of suitable "Valid to" dates.
 */
function validTo(idCol, validFromCol, arraz) {
  var dataArray = extractColumns([idCol, validFromCol], arraz);
  var maxValidToDate = new Date(2099, 11, 31);
  
  // First get all the validFromDates for all the ids
  
  var idValidFromDates = {};
  dataArray.forEach(function(row) {
    var id = row[0];
    var validFromDate = row[1];
    if (!idValidFromDates[id]) {
      idValidFromDates[id] = [];
    }
    idValidFromDates[id].push(validFromDate);
  });
  
  // Get the correct validToDate for each row
  
  var validToDates = [];
  dataArray.forEach(function(row) {
    var id = row[0];
    var validFromDate = row[1];
    var validFromDates = idValidFromDates[id];

    if (id == "" && isDate(validFromDate)) {
      throw "Date '" + validFromDate + "' has no ID";
    }
    if (id != "" && !isDate(validFromDate)) {
      throw "ID '" + id + "' does not have a valid date";
    }
    if (validFromDate != "" && !isDate(validFromDate)) {
      throw "Bad date in '" + validFromCol + "' column: '" + validFromDate + "'";
    }
    
    // Assuming the validFrom date is a date...
    // Get the least validFromDate after this.
    // And then calculate the validToDate.
    // Along the way we should make sure this id doesn't have
    // the same date twice.
    
    if (isDate(validFromDate)) {
      var bestValidFromDate = maxValidToDate;
      var occurrences = 0;
      validFromDates.forEach(function(vfd) {
        if (validFromDate < vfd && vfd < bestValidFromDate) {
          bestValidFromDate = vfd;
        } else if (vfd.getTime() == validFromDate.getTime()) {
          occurrences = occurrences + 1;
        }
      });
      if (occurrences > 1) {
        throw "ID '" + id + "' occurs more than once with the same date (" + validFromDate + ")";
      }
      var validToDate = bestValidFromDate;
      if (validToDate != maxValidToDate) {
        var validToDate = new Date(validToDate);
        validToDate.setDate(validToDate.getDate() - 1);
      }
    } else if (validFromDate == "") {
      validToDate = "";
    }
    
    validToDates.push(validToDate);
  });

  return validToDates;
}

/**
 * Check that a value or array is all dates, or throw an error.
 * @param dates  The value or array to check
 * @returns  True, or it will throw an error
 */
function assertAllDates(dates) {
  dates2 = make2DArray(dates);
  for (var i = 0; i < dates2.length; i++) {
    for (var j = 0 ; j < dates2[i].length; j++) {
      data = dates2[i][j]
      if (!isDate(data)) {
          throw "Expecting all dates but got '" + data + "' instead";
      }
    }
  }
  return true;
}

/**
 * Sum data that's valid for a given date or array of dates.
 * @param idates    A date, or array of dates. For each date
 *                  the valid cells of arraz are extracted and
 *                  summed together.
 * @param arraz     The dimension table. It requires a header row
 *                  and it must have a column labelled "Valid from"
 * @param idCol     The name of column in arraz that is the ID of the
 *                  changing state.
 * @param validFromCol  Name of the column in arraz that says when the
 *                      data is valid from.
 * @param dataCol   The column name of the data to sum.
 * @returns  An array of values,
 *           one for each of the dates in idate.
 *           Each value is the sum of all cells in the dataCol that
 *           are valid for that date.
 * @customfunction
 */
function sumValid(idates, arraz, idCol, validFromCol, dataCol) {

  assertAllDates(idates);
  var validToArray = validTo(idCol, validFromCol, arraz);  
  var arraz2 = extractColumnsAndTransform([validFromCol , dataCol], arraz);
  
  return sumValidUsingArrays_(idates, arraz2[0], validToArray, arraz2[1]);
}

/**
 * Sum data in a Javascript array for many dates.
 * @param idates   An array of dates. For each date
 *                 the valid columns of arraz are extracted and
 *                 the cells are summed together.
 * @param validFroms  A Javascript array of "Valid from" dates.
 * @param validTos    A Javascript array of corresponding "Valid to" dates.
 * @param arraz    A Javascript array of numbers, each element of which
 *                 is valid from and to the corresponding dates.
 * @returns  An array containing the sum of all the numbers in arraz
 *           valid for each of the idates.
 */
function sumValidUsingArrays_(idates, validFroms, validTos, arraz) {

  if (!isBasicType(idates) && !isColumn(idates)) {
    throw "First parameter (dates) must be a single value or vertical column";
  }
  idates = make2DArray(idates);
  
  var results = [];
  idates.forEach(function(idate) {
    var result = sumValidOneDate_(new Date(idate), validFroms, validTos, arraz);
    results.push(result);
  });
  
  return results;
}

/**
 * Sum data in a Javascript array for just a single date.
 * @param idate  The date for which the valid numbers are extracted and summed.
 * @param validFroms  A Javascript array of "Valid from" dates.
 * @param validTos    A Javascript array of corresponding "Valid to" dates.
 * @param arraz    A Javascript array of numbers, each element of which
 *                 is valid from and to the corresponding dates.
 * @returns  The sum of all the numbers in arraz valid for idate.
 */
function sumValidOneDate_(idate, validFroms, validTos, arraz) {
  var sum = 0;
  for (var i = 0; i < validFroms.length; i++) {
    var validFrom = validFroms[i];
    var validTo = validTos[i];
    if (validFrom != "" && isBetween(idate, validFrom, validTo)) {
      var data = arraz[i];
      if (isNumber(data)) {
        sum += data;
      }
    }
  }

  return sum;
}

/**
 * Get all values of a field that are valid for a given date.
 * @param idates    The date we're interested in.
 * @param arraz     The dimension table. It requires a header row.
 * @param idCol     The name of column in arraz that is the ID of the
 *                  changing state.
 * @param validFromCol  Name of the column in arraz that says when the
 *                      data is valid from.
 * @param dataCol   The column name of the data to show.
 * @returns  An array of the given field, as it was on the specified date.
 * @customfunction
 */
function getValid(idates, arraz, idCol, validFromCol, dataCol) {
  if (arguments.length < 5) {
    throw "Too few arguments; should have five";
  }  if (!isArray(arraz)) {
    throw "Second argument should be an array";
  }

  var validToArray = validTo(idCol, validFromCol, arraz);  
  var arraz2 = extractColumnsAndTransform([validFromCol , dataCol], arraz);
  
  return getValidOneDate_(idates, arraz2[0], validToArray, arraz2[1]);
}

/**
 * Collect data in a Javascript array for just a single date.
 * @param idate  The date for which the valid values are extracted.
 * @param validFroms  A Javascript array of "Valid from" dates.
 * @param validTos    A Javascript array of corresponding "Valid to" dates.
 * @param arraz    A Javascript array of values, each element of which
 *                 is valid from and to the corresponding dates.
 * @returns  An array in arraz valid for idate.
 */
function getValidOneDate_(idate, validFroms, validTos, arraz) {
  var out = [];
  for (var i = 0; i < validFroms.length; i++) {
    var validFrom = validFroms[i];
    var validTo = validTos[i];
    if (validFrom != "" && isBetween(idate, validFrom, validTo)) {
      var data = arraz[i];
      out.push(data);
    }
  }

  return out;
}

/**
 * Get all values of a field that are valid for a given date
 * and which match a given criterion..
 * @param idates    The date we're interested in.
 * @param arraz     The dimension table. It requires a header row.
 * @param idCol     The name of column in arraz that is the ID of the
 *                  changing state.
 * @param validFromCol  Name of the column in arraz that says when the
 *                      data is valid from.
 * @param dataCol   The column name of the data to show.
 * @param condCol   The name of the conditional column. This is the
 *                  column to look in to see if the data should be
 *                  included in the returned array.
 * @param condVal   The value that should be in the conditional column
 *                  if we're to return the given data.
 * @returns  An array of the given field, filtered to only those
 *           items for which the condition matched on the given date.
 * @customfunction
 */
function filterValid(idates, arraz, idCol, validFromCol, dataCol, condCol, condVal) {
  if (arguments.length < 7) {
    throw "Too few arguments; should have seven";
  }
  if (!isArray(arraz)) {
    throw "Second argument should be an array";
  }
  if (!isBasicType(condVal)) {
    throw "Seventh argument should be basic value";
  }

  var validToArray = validTo(idCol, validFromCol, arraz);  
  var arraz2 = extractColumnsAndTransform([validFromCol , dataCol, condCol], arraz);
  
  return filterValidOneDate_(idates, arraz2[0], validToArray, arraz2[1], arraz2[2], condVal);
}

/**
 * Collect data in a Javascript array for just a single date.
 * @param idate  The date for which the valid values are extracted.
 * @param validFroms   A Javascript array of "Valid from" dates.
 * @param validTos     A Javascript array of corresponding "Valid to" dates.
 * @param dataArray    A Javascript array of values to output, each element of which
 *                     is valid from and to the corresponding dates.
 * @param condArray    A Javascript array of values to test, each element of which
 *                     is valid from and to the corresponding dates.
 * @param condVal      The value required in the condArray if we're to output the
 *                     corresponding dataArray element.
 * @returns  An array in arraz valid for idate.
 */
function filterValidOneDate_(idate, validFroms, validTos, dataArray, condArray, condVal) {
  var out = [];
  for (var i = 0; i < validFroms.length; i++) {
    var validFrom = validFroms[i];
    var validTo = validTos[i];
    if (validFrom != ""
        && isBetween(idate, validFrom, validTo)
        && condArray[i] == condVal) {
      var data = dataArray[i];
      out.push(data);
    }
  }

  return out;
}

/**
 * Macro code...
 */

function newDimRow() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert('My title', 'My message goes here', ui.ButtonSet.YES_NO);
}

/**
 * Copy a 2x2 array, but replace any dates with blanks (empty strings).
 * @param arraz  The 2x2 array.
 * @returns  A copy of the original array, but with empty string instead of any dates.
 */
function copyWithoutDates(arraz) {
  var arr2d = make2DArray(arraz);
  var out = [];

  for (var i = 0; i < arr2d.length; i++) {
    var row = [];
    for (var j = 0; j < arr2d[i].length; j++) {
      var val = isDate(arr2d[i][j]) ? '' : arr2d[i][j];
      row.push(val);
    }
    out.push(row);
  }

  return out;
}
