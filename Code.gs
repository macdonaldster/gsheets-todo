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

///// OPTIONS
var CONFIG_TIMEZONE = 'GMT-0600';
var CONFIG_GCAL_OVERDUE_COLOUR = CalendarApp.EventColor.PALE_RED; // To not change color, set to NULL - See https://developers.google.com/apps-script/reference/calendar/event-color
//var CONFIG_GCAL_OVERDUE_COLOUR = null; // WILL NOT CHANGE COLOUR

// SHEET NAMES
var CONFIG_SHEET_TODO = 'TODO'; // you can set this to some test sheet for debugging the set up and script options, etc.


/// setCalendarAppts()
///  - for each entry in your sheet that is not "done"
///  - if it has a due date, add it to the calendar
///  - add the calendar event ID to the sheet (can be in hidden column)
///  - if event has an ID, and due date is before "today", auto-advance
///
///  - WIP - allow use of time of day in the entries
function setCalendarAppts() {

  var sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG_SHEET_TODO);
  var data = sheet.getDataRange().getValues();

  var columnHeaders = getColumnHeaders();
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
        event = CalendarApp.getDefaultCalendar().createAllDayEvent(data[i][taskColumnId] + " #mute", eventDate);
        
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
        SpreadsheetApp.getActiveSheet().getRange(i + 1, googleCalColumnId + 1).setValue(event.getId());

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

/* get column headers in an array */
function getColumnHeaders(){
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var worksheet   = spreadsheet.getSheetByName(CONFIG_SHEET_TODO);    
    var columns = worksheet.getDataRange().getNumColumns();
    return worksheet.getSheetValues(1, 1, 1, columns)[0];    
}



/* on Edit:
   - ensure there's an ID on the row if ID column is defined   
   - update last modified date if column is defined
*/
function onEdit(e){

   Logger.log("onEdit");

    //Access the range with your parameter e.
    var range = e.range;
    var row = range.getRow();
    var columnHeaders = getColumnHeaders();
    var autoIncColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_AUTOINCREMENT);
    var lastModifiedColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_LASTMODIFIED);

    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var worksheet   = spreadsheet.getSheetByName(CONFIG_SHEET_TODO);

    // auto-increment ID
    Logger.log("val: " + row );
    if(row > 1 && autoIncColumnId > -1 && worksheet.getRange(row, autoIncColumnId+1).getValue() == '' ){
     worksheet.getRange(row, autoIncColumnId+1).setValue(Utilities.getUuid()); 
    }

    // last modified
    if( row > 1 && lastModifiedColumnId > -1 ){
      worksheet.getRange(row, lastModifiedColumnId+1).setValue(Utilities.formatDate(new Date(), CONFIG_TIMEZONE, 'YYYY-MM-dd HH:mm')); 
    }
    
}


/* onEdit(e) isn't firing on IFTTT adds, etc. so you need to scan and periodically fill in missing values - USE A TIME TRIGGER "Edit -> Current Project's Triggers" */
function fillInMissingIDs(){

   Logger.log("fillInMissingIDs");

    var sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG_SHEET_TODO);
    var data = sheet.getDataRange().getValues();
    var columnHeaders = getColumnHeaders();
    var autoIncColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_AUTOINCREMENT);
    var lastModifiedColumnId = columnHeaders.indexOf(CONFIG_COLUMNS_LASTMODIFIED);
  
    Logger.log("data.length: " + data.length );
    for (var i = 1; i < data.length; i++) {

      Logger.log("i: " + i );
      Logger.log("data[i][autoIncColumnId]: " + data[i][autoIncColumnId] );
      Logger.log("data[i][lastModifiedColumnId]: " + data[i][lastModifiedColumnId] );
      // if date but not google calendar entry, add it
      if (data[i][autoIncColumnId] == '') {
        sheet.getRange(i + 1, autoIncColumnId+1).setValue(Utilities.getUuid()); 
      }
      
      if (data[i][lastModifiedColumnId] == '') {
        sheet.getRange(i + 1, lastModifiedColumnId+1).setValue(Utilities.formatDate(new Date(), CONFIG_TIMEZONE, 'YYYY-MM-dd HH:mm')); 
      }

    }
   
}





/* WIP */
/* Set a time trigger for this one to get a random task from a project (add a "Project" column) called "Habit" 
   It will add it at 2:30pm on the current day so run it after midnight or whatever you like */
function setHabitEntry(){
  var sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG_SHEET_TODO);
  var data = sheet.getDataRange().getValues();

  var columnHeaders = getColumnHeaders();
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
  
  var rndIndex = Math.floor((Math.random() * habitTasks.length));
  
  Logger.log('Habit: ' + habitTasks[rndIndex]);
  
  
  // make new event
       
  // create event
  var dtm = new Date();
  Logger.log('Habit dtm: ' + new Date(dtm.getFullYear(), Utilities.formatDate(dtm, CONFIG_TIMEZONE, 'MM') - 1, Utilities.formatDate(dtm, CONFIG_TIMEZONE, 'dd'), 14, 30));
  var event = CalendarApp.getDefaultCalendar().createEvent('HABIT: ' + habitTasks[rndIndex]
                  , new Date(dtm.getFullYear(), Utilities.formatDate(dtm, CONFIG_TIMEZONE, 'MM') - 1 , Utilities.formatDate(dtm, CONFIG_TIMEZONE, 'dd'), 14, 30)
                  , new Date(dtm.getFullYear(), Utilities.formatDate(dtm, CONFIG_TIMEZONE, 'MM') - 1, Utilities.formatDate(dtm, CONFIG_TIMEZONE, 'dd'), 15, 00));

  Logger.log('Event: ' + event.getId());

}


