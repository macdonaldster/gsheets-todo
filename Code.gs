function setCalendarAppts() {
  
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  var isCompleteColumnId = data[0].indexOf('Done?');
  var taskColumnId = data[0].indexOf('Task');
  var dateColumnId = data[0].indexOf('Due Date');
  var googleCalColumnId = data[0].indexOf('GoogleCalendarId'); // Add this
  
  // find events with dates
  for (var i = 1; i < data.length; i++) {
    
    // if date but not google calendar entry, add it
    if( !data[i][isCompleteColumnId] ){
      var event;
      if( data[i][dateColumnId] && !data[i][googleCalColumnId] )
      {
       var eventDate = data[i][dateColumnId];       
       Logger.log("eventDate: " +  eventDate);    
       var eventTimeHour = Utilities.formatDate(eventDate, 'GMT-0600', 'HH');
       var eventTimeMinute = Utilities.formatDate(eventDate, 'GMT-0600', 'mm');
       Logger.log("eventTime: " +  eventTimeHour + ":" + eventTimeMinute);    
       
       
       // always add "today" if less than today
       if( eventDate < new Date())
       {
         eventDate.setDate(new Date().getDate() + 1);
       }
       
        Logger.log("eventTime: " +  eventDate);       
        event = CalendarApp.getDefaultCalendar().createAllDayEvent(data[i][taskColumnId], eventDate);        
        
         if( eventTimeHour + ":" + eventTimeMinute != "00:00") 
      {
          eventDate.setHours(eventTimeHour);
          eventDate.setMinutes(eventTimeMinute);          
          event.setTime(eventDate, eventDate); // set correct time here
          Logger.log("After set time: " + eventDate);
      }
        
        //Logger.log('Event ID: ' + event.getId());
        //data[i][googleCalColumnId] = event.getId();
        SpreadsheetApp.getActiveSheet().getRange(i + 1 ,googleCalColumnId + 1 ).setValue(event.getId());
        
        
        Logger.log('Add Task: ' + data[i][taskColumnId]);
        //Logger.log('Date: ' + data[i][dateColumnId]);
        //Logger.log('GoogleCalendarId: ' + data[i][googleCalColumnId]);
        
        
      }
      else if( data[i][dateColumnId] && data[i][googleCalColumnId] )
      {
        
        event = CalendarApp.getDefaultCalendar().getEventById(data[i][googleCalColumnId]);
        
        if( event.getStartTime() < new Date())
       {
         event.setAllDayDate(new Date());
       }
       
       eventDate =  event.getStartTime();
          var eventTimeHour = Utilities.formatDate(eventDate, 'GMT-0600', 'HH');
          var eventTimeMinute = Utilities.formatDate(eventDate, 'GMT-0600', 'mm');
          
        if( eventTimeHour + ":" + eventTimeMinute != "00:00") 
      {
          
          eventDate.setHours(eventTimeHour);
          eventDate.setMinutes(eventTimeMinute);          
          event.setTime(eventDate, eventDate); // set correct time here
          Logger.log("After set time: " + eventDate);
      }
        
        Logger.log('Modify Task: ' + data[i][taskColumnId]);
        //Logger.log('Date: ' + data[i][dateColumnId]);
        //Logger.log('GoogleCalendarId: ' + data[i][googleCalColumnId]);
        
        
      }
      
     
        
     }
  
    
  }

}


