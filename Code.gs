/* 
   2018-08-12
   This file has some functions you can schedule to do various things with your TODO items...
   Please see comments inline, below 
   
   NOTE: this is designed to be run using YOUR timezone... this will move all overdue
         entries to the current day as calendar enties and leave the original dates in the sheet 
         unchanged... You can run this as often as you want each day (e.g. to keep things up to date).
         
         It should be noted you can easily use this to quick-add calendar entries. I have an Automate script 
         on my phone that appends a row to the sheet or you can use IFTTT, etc. There are many, many 
         ways to append a row to a Google Sheet, find the one that works best for you.   
         
*/



/// CONFIG 

///// COLUMNS
var CONFIG_COLUMNS_DONE = 'Done?';
var CONFIG_COLUMNS_TASK = 'Task';
var CONFIG_COLUMNS_PROJECT = 'Project';
var CONFIG_COLUMNS_DUEDATE = 'Due Date';
var CONFIG_COLUMNS_GOOGLECALENDARID = 'GoogleCalendarId';
var CONFIG_COLUMNS_AUTOINCREMENT = 'ID';
var CONFIG_COLUMNS_LASTMODIFIED = 'Last Modified';
var CONFIG_COLUMNS_HIDEROWUNTILDATE = 'Hide Until';

///// OPTIONS
var CONFIG_TIMEZONE = 'GMT-0600';
var CONFIG_GCAL_OVERDUE_COLOUR = CalendarApp.EventColor.PALE_RED; // To not change color, set to NULL - See https://developers.google.com/apps-script/reference/calendar/event-color
//var CONFIG_GCAL_OVERDUE_COLOUR = null; // WILL NOT CHANGE COLOUR

// SHEET NAMES
var CONFIG_SHEETID = 'xXxXxXx' //copy from the URL of the sheet, required for time triggers - https://docs.google.com/spreadsheets/d/xXxXxXx/edit#gid=0
var CONFIG_SHEET_TODO = 'TODO'; // you can set this to some test sheet for debugging the set up and script options, etc.

// globals
var columnHeaders;
var sheet;


/* --- UTILITY FUNCTIONS START --- */

/* get column headers in an array */
function getColumnHeaders(){
    //sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG_SHEET_TODO);
    sheet = SpreadsheetApp.openById(CONFIG_SHEETID).getSheetByName(CONFIG_SHEET_TODO);
    
    var columns = sheet.getDataRange().getNumColumns();
    return sheet.getSheetValues(1, 1, 1, columns)[0];    
}

/* get calendar data as set of rows you can iterate over */
function getCalendarData(){
  //sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG_SHEET_TODO);
  sheet = SpreadsheetApp.openById(CONFIG_SHEETID).getSheetByName(CONFIG_SHEET_TODO);
  var data = sheet.getDataRange().getValues();
  return data;
}

/* --- UTILITY FUNCTIONS END   --- */




/// setCalendarAppts()
///  - for each entry in your sheet that is not "done"
///  - if it has a due date, add it to the calendar
///  - add the calendar event ID to the sheet (can be in hidden column)
///  - if event has an ID, and due date is before "today", auto-advance
///
///  - WIP - allow use of time of day in the entries
function setCalendarAppts() {

  var data = getCalendarData();
  var columnHeaders = getColumnHeaders();

  // column headers 
  var isCompleteColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_DONE);
  var taskColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_TASK);
  var dateColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_DUEDATE);
  var googleCalColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_GOOGLECALENDARID); 

  // find events with dates
  for (var i = 1; i < data.length; i++) {


    // if date but not google calendar entry, add it
    if (!data[i][isCompleteColumnId]) {
      var event;
      if (data[i][dateColumnId] && !data[i][googleCalColumnId]) {

        Logger.log('Add Task: ' + data[i][taskColumnId]);
        
        var eventDate = data[i][dateColumnId];
        var eventTimeHour = Utilities.formatDate(eventDate, CONFIG_TIMEZONE, 'HH');
        var eventTimeMinute = Utilities.formatDate(eventDate, CONFIG_TIMEZONE, 'mm');

        // always add "today" if less than today
        var isOverdue = false;
        if (eventDate.getDate() < new Date().getDate()) {
          eventDate.setDate(new Date().getDate());
          isOverdue = true;
        }

        // create event
        event = CalendarApp.getDefaultCalendar().createAllDayEvent("TASK: " + data[i][taskColumnId], eventDate);
        
        // if event is overdue
        if (isOverdue && CONFIG_GCAL_OVERDUE_COLOUR != null) {
          event.setColor(CONFIG_GCAL_OVERDUE_COLOUR);
        }
        
        // WIP - set time if time exists in entry
        if (eventTimeHour + ":" + eventTimeMinute != "00:00") {
          eventDate.setHours(eventTimeHour);
          eventDate.setMinutes(eventTimeMinute);
          event.setTime(eventDate, eventDate); // set correct time here
        }
        
        // add the event ID to the spreadsheet
        SpreadsheetApp.openById(CONFIG_SHEETID).getSheetByName(CONFIG_SHEET_TODO).getRange(i + 1, googleCalColumnId + 1).setValue(event.getId());

      }
      else if (data[i][dateColumnId] && data[i][googleCalColumnId]) {

        Logger.log('Modify Task: ' + data[i][taskColumnId]);
        
        // fetch the event using the ID
        event = CalendarApp.getDefaultCalendar().getEventById(data[i][googleCalColumnId]);

        //  update time if time is set in due date      
        var eventSheetDate = data[i][dateColumnId];
        var eventTimeHour = Utilities.formatDate(eventSheetDate, CONFIG_TIMEZONE, 'HH');
        var eventTimeMinute = Utilities.formatDate(eventSheetDate, CONFIG_TIMEZONE, 'mm');
        
        // auto-advance to today in CALENDAR (not sheet)
        if (eventSheetDate < new Date()) {
          event.setAllDayDate(new Date());
          
          // change color if event is overdue
          if (CONFIG_GCAL_OVERDUE_COLOUR != null) {
            event.setColor(CONFIG_GCAL_OVERDUE_COLOUR);
          }

        }
        else
        {
          // update calendar date to revised sheet date
          event.setAllDayDate(eventSheetDate);
        }

        // update title
          event.setTitle(data[i][taskColumnId]);
        eventDate = event.getStartTime();
        if (eventTimeHour + ":" + eventTimeMinute != "00:00") {
          eventDate.setHours(eventTimeHour);
          eventDate.setMinutes(eventTimeMinute);
          event.setTime(eventDate, eventDate); // set correct time here
        }



      }

    }

  }

}

/* HIDE a single row if it has a Hide Until column entry with a date after current date */
function setHideUntilRowVisibility( rowID, hideUntilVal){
      sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG_SHEET_TODO);
  
      // check if date is > now
      var dtmHideUntil = new Date(hideUntilVal);
      var dtmNow = new Date();   
      
      Logger.log("rowID: " + rowID );
      
      if( dtmNow <= dtmHideUntil ){
        // hide the row
        sheet.hideRows(rowID);        
      }
      else{
        // show the row
        sheet.showRows(rowID);
      }
  
      
}



/* on Edit:
   - ensure there's an ID on the row if ID column is defined   
   - update last modified date if column is defined
*/
function onUserEdit(e){

   Logger.log("onEdit");

    //Access the range with your parameter e.
    var range = e.range;
    var row = range.getRow();
    var columnHeaders = getColumnHeaders();
    var autoIncColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_AUTOINCREMENT);
    var lastModifiedColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_LASTMODIFIED);
    var hideUntilColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_HIDEROWUNTILDATE);
    var taskColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_TASK);

    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var worksheet   = spreadsheet.getSheetByName(CONFIG_SHEET_TODO);

    // auto-increment ID
    Logger.log("val: " + row );
    if(row > 1 && autoIncColumnId > -1 && worksheet.getRange(row, autoIncColumnId+1).getValue() == '' ){
     worksheet.getRange(row, autoIncColumnId+1).setValue(Utilities.getUuid()); 
    }

    // last modified
    if( row > 1 && lastModifiedColumnId > -1 ){
      Logger.log('Task: ' + worksheet.getRange(row, taskColumnId+1).getValue());
      if( worksheet.getRange(row, taskColumnId+1).getValue() == '' ){
        
        worksheet.getRange(row, lastModifiedColumnId+1).setValue(''); 
      }
      else{
        worksheet.getRange(row, lastModifiedColumnId+1).setValue(Utilities.formatDate(new Date(), CONFIG_TIMEZONE, 'YYYY-MM-dd HH:mm')); 
      }
    }
    
    // hide until
    if( row > 1 && hideUntilColumnId > -1 && worksheet.getRange(row, hideUntilColumnId+1).getValue() != '' ){
      setHideUntilRowVisibility(row, worksheet.getRange(row, hideUntilColumnId+1).getValue() ); 
    }
  
}




/* onEdit(e) isn't firing on IFTTT adds, etc. so you need to scan and periodically fill in missing values */
function fillInMissingIDs(){

    columnHeaders = getColumnHeaders();
    var data = getCalendarData();
    
    // columns
    var autoIncColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_AUTOINCREMENT);
    var lastModifiedColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_LASTMODIFIED);
    var hideUntilColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_HIDEROWUNTILDATE);
    var taskColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_TASK);
    var emptyRowCount = 0;
    var rowsToDelete = [];
  
    for (var i = 1; i < data.length; i++) {

      if( data[i][taskColumnId] == '') {
        emptyRowCount++;
        if( emptyRowCount > 3 )
        {
          // delete empty rows
          rowsToDelete.unshift(i+1);
        }
      }
  
      // if date but not google calendar entry, add it
      if (data[i][autoIncColumnId] == '') {
        sheet.getRange(i + 1, autoIncColumnId+1).setValue(Utilities.getUuid()); 
      }
      
      if (data[i][lastModifiedColumnId] == '') {
        sheet.getRange(i + 1, lastModifiedColumnId+1).setValue(Utilities.formatDate(new Date(), CONFIG_TIMEZONE, 'YYYY-MM-dd HH:mm')); 
      }
      
      // hide until
      if (data[i][hideUntilColumnId] != '') { 
        setHideUntilRowVisibility(i+1, data[i][hideUntilColumnId] ); 
      }

    }  
  
    // delete the empty rows now that we are done, start with highest row number
    for(var j = 0; j < rowsToDelete.length; j++)
    {
       sheet.deleteRow(rowsToDelete[j]);
    }
}





/* WIP */
function setHabitEntry(){
  
  var data = getCalendarData();

  // columns
  var taskColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_TASK);
  var projectColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_PROJECT);

  // find events with dates
  var habitTasks = [];
  for (var i = 1; i < data.length; i++) {
    if( data[i][projectColumnId] == "Habit" )
    {
      habitTasks.push(data[i][taskColumnId]);      
    }
  }
  
  // select random event index
  var rndIndex = Math.floor((Math.random() * habitTasks.length));
  
  // create event
  var dtm = new Date();
  var event = CalendarApp.getDefaultCalendar().createEvent('HABIT: ' + habitTasks[rndIndex]
                  , new Date(dtm.getFullYear(), Utilities.formatDate(dtm, CONFIG_TIMEZONE, 'MM') - 1 , Utilities.formatDate(dtm, CONFIG_TIMEZONE, 'dd'), 14, 30)
                  , new Date(dtm.getFullYear(), Utilities.formatDate(dtm, CONFIG_TIMEZONE, 'MM') - 1, Utilities.formatDate(dtm, CONFIG_TIMEZONE, 'dd'), 15, 00));

}


