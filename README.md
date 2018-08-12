# sheets-todo
Use a Google Sheet as a TODO app w. Google Calendar integration (auto-advance of dated TODOs, etc)

To use this in your own Sheets you can either use Google Apps Script GitHub Assistant (https://chrome.google.com/webstore/detail/google-apps-script-github/lfjcgcmkmjjlieihflfhjopckgpelofo) and clone this repo or just copy and paste it into the Google Apps Script editor once you add a script to your spreadsheet (Tools > Script Editor).

You'll need some columns in your sheet for this to work. Check the code and ask my any questions via an issue on this repo but basically you need a Task column, a Done column (I use the new Checkbox) set to True/False, and a Due Date column. Set up the names correctly in the Config variables at the top of the sheet. You'll also need a Google Calendar ID column to store the calendar event ID of created events. Configure your timezone, too.

It will update your "default calendar". Feel free to create a pull request or fork to allow configuration of the calendar used or any other feature you think makes sense. 

Once you get it set up and working in the scripts editor you can create a time-based trigger to run once a day sometime after midnight and it should update all your TODO entries as either all day or timed events in your calendar and roll them forward (in the calendar) every night. 

Some tips:

- you can hide the Google Calendar ID column and it should work correctly
- you can try dates with time of day to get timed entries (bit of a Beta feature)
- I haven't tested this extensively so if you find problems please report them
- if you are doing some dev on this, you can delete the Google calendar ID from your sheet to make it re-add the event. I also tend to delete the event itself so you don't have a bunch of duplicates lying around but you don't have to
- once the event is created you can do whatever you want to it in Google Calendar... the event ID will make sure it gets auto-advanced but won't break any other entries (just date and time of day) - so add notes, locations, change the title, etc...
