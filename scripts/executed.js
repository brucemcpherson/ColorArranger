'use strict';
/**
 * get the data for the target column as well as the headings
 * @param {number} target target column number (starting at 0) -1 means get the current column
 * @return {object[]} {defaultIndex:n , data: [[]] , labels:[]}
 */
function getSheetData (target) {
  
  var sh = SpreadsheetApp.getActiveSheet();   
  var currentColumn  = (target >= 0 ? target +1  : sh.getActiveCell().getColumn());

  var result = {
    defaultIndex: currentColumn -1,
    error:"",
    colors:[],
    labels:[],
    headingColor:'#ffffff',
    id:sh.getSheetId(),                           // used for validating we're on the same sheet
    dataRange:sh.getDataRange().getA1Notation()   // used to make sure we have the same amount of data
  };
  
  try {
    // get the headings
    result.labels = sh.getRange (1,1, 1, sh.getLastColumn()).getValues()[0]; 
    
    // get the data
    var data = sh.getRange( 1 , currentColumn, sh.getLastRow(),1 ).getBackgrounds();
    
    // get rid of heading and store for special treatment
    if (data.length) {
      result.headingColor = data.shift()[0];
      
      // and reduce the colors to one item per unique color to avoid returning the entire column
      result.colors = squashColors (data);
    }
  }
  catch (err) {
    result.error = err;
  }
  
  return result;

}
/**
 * apply the changed colors
 * @param {object} changedColors from the addon with info on sorting
 */
function applyColors (changedColors) {

  var result = {error:""};
  
  try {
  
    // find the sheet(might not be the current)
    var sh = SpreadsheetApp.getActiveSheet();
    var dataRange = sh.getDataRange();
   
    // create a ranking values for each data row
    var hr = changedColors.headings ? 1 : 0;
    
    // this is the columnRange we'll be dealing with
    var columnRange = sh.getRange(1 + hr , changedColors.index +1 ,dataRange.getNumRows() - hr , 1);
    
    // get the current values
    var currentColors = columnRange.getBackgrounds();
    
    // and text colors
    var currentFontColors = columnRange.getFontColors();
    
    // make a convenient lookup by original color
    var lookup = changedColors.colors.reduce (function (p,c) {
      p[c.original.color] = c.latest;
      return p;
    },{});
    
    // make the new ranks
    var ranks = currentColors.map(function(d) {
      if (lookup[d[0]]) {
        return [lookup[d[0]].index];
      }
      else {
        // colors that were added since sample was taken - sort to top
        result.error = "color " + d[0] + " was not sorted";
        return [-1];
      }
    });
    
    // apply the background colors
    currentColors.forEach (function(d,i) {
      if(lookup[d[0]]) {
        currentFontColors[i][0] = lookup[d[0]].textColor;
        d[0] = lookup[d[0]].color;
      }
    });
    
    // set the background colors
    columnRange.setBackgroundColors (currentColors);
    
    // if asked, change the font to  contrasting one
    if (changedColors.contrast) {
      columnRange.setFontColors (currentFontColors);
    }
   
    
    // write out the ranks in a new column and sort
    var extraRange = columnRange.offset(0, dataRange.getNumColumns() - columnRange.getColumn() +1);
    extraRange.setValues(ranks);
    
    
    // sort on it ascending
    var sortRange = sh.getRange(extraRange.getRow(), 1, extraRange.getNumRows(), dataRange.getNumColumns() + 1 );
    
    sortRange.sort({column: extraRange.getColumn(), ascending: true});
      
    // get rid of it
    sh.deleteColumn(extraRange.getColumn());
  }
  catch(e) {
    result.error = e;
  }
  return result;
  
}
/**
 * execute the sort
 * @param {boolean} headings whether there are headings
 * @param {number} column the column  number to sort on ( base 1)
 * @return {string[]} an array of currently known colors, sorted by popularity
 */
 function getCurrentColors (headings, column ) {
  var sh = SpreadsheetApp.getActiveSheet();
  var colors = sh.getRange(headings ? 2 : 1, column ,sh.getLastRow() - (headings ? 1 : 0), 1).getBackgrounds();
  
  return squashColors (colors);
  
} 
function squashColors (colors) {

  // count how many times each color appears
  var summary = colors.reduce (function (p,c) {
    if (!p.hasOwnProperty(c[0])) {
      p[c[0]] = 0;
    }
    p[c[0]]++;
    return p;
  }, {});
  
  // turn into an array
  return Object.keys(summary)
    .map(function(d) {
      return {color:d, count:summary[d]};
    });

}