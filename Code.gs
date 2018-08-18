/* 
   2018-08-12
   This file has some functions you can schedule to do various things with your TODO items...
   Please see comments inline, below 
   
   NOTE: this is designed to be run AFTER MIDNIGHT in YOUR timezone... this will move all overdue
         entries to the current day as calendar enties and leave the original dates in the sheet 
         unchanged...
   
*/

/// CONFIG 
var CONFIG_COLUMNS_DONE = 'Done?';
var CONFIG_COLUMNS_TASK = 'Task';
var CONFIG_COLUMNS_DUEDATE = 'Due Date';
var CONFIG_COLUMNS_GOOGLECALENDARID = 'GoogleCalendarId';
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

  var isCompleteColumnId = data[0].indexOf(CONFIG_COLUMNS_DONE);
  var taskColumnId = data[0].indexOf(CONFIG_COLUMNS_TASK);
  var dateColumnId = data[0].indexOf(CONFIG_COLUMNS_DUEDATE);
  var googleCalColumnId = data[0].indexOf(CONFIG_COLUMNS_GOOGLECALENDARID); 

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
        event = CalendarApp.getDefaultCalendar().createAllDayEvent(data[i][taskColumnId], eventDate);
        
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


