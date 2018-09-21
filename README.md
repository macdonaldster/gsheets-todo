# sheets-todo
Use a Google Sheet as a TODO app w. Google Calendar integration (auto-advance of dated TODOs, etc)

To use this in your own Sheets you can either use Google Apps Script GitHub Assistant (https://chrome.google.com/webstore/detail/google-apps-script-github/lfjcgcmkmjjlieihflfhjopckgpelofo) and clone this repo or just copy and paste it into the Google Apps Script editor once you add a script to your spreadsheet (Tools > Script Editor).

You'll need some columns in your sheet for this to work. Check the code and ask me any questions via an issue on this repo but basically you need a Task column, a Done column (I use the new Checkbox) set to True/False, and a Due Date column. Set up the names correctly in the Config variables at the top of the sheet. You'll also need a Google Calendar ID column to store the calendar event ID of created events. Configure your timezone, too. If you add a Last Modified column it will keep that up to date whenever you add or change a row. These column names and the name of the sheet it works on is all configurable in the code.

Once you get it set up and working in the scripts editor you can create a time-based trigger to run once a day sometime after midnight and it should update all your TODO entries as either all day or timed events in your calendar and roll them forward (in the calendar) every night. There are other functions that will update your sheet onEdit to make sure the ID and Last Modified columns are filled in and up to date and an example script that runs each night to schedule one "habit" task for me each day at 2:30pm.

Some tips:

- you can hide the Google Calendar ID column and it should work correctly
- you can use dates with time of day in your due date column to events added at a specific time (instead of "all day")
- it auto-advances overdue tasks to the next day and highights by changing the background color so they stand out (configurable)
- other than for my own use I haven't tested this extensively so if you find problems please report them... I normally have a feature/bug branch on the go if you like living on the edge
- if you are doing some dev on this, you can delete the Google calendar ID from your sheet to make it re-add the event instead of updating it. I also tend to delete the event itself in the calendar so you don't have a bunch of duplicates lying around but you don't have to
- once the event is created you can do whatever you want to it in Google Calendar... the event ID will make sure it gets auto-advanced but won't break any other entries (just date and time of day) - so add notes, locations, change the title, etc...

Possible improvements:
- recurring events are easy, just don't mark them as done but this won't help you re: "every week" type stuff - might add something like an auto-advance syntax like Emacs Org Mode Repeating Tasks (https://orgmode.org/manual/Repeated-tasks.html).
- see issues list for the rest, please add your own?

# NOTES
1. Here is how to set up the current project triggers ("setHabitEntry" is optional!):
---
![image](https://user-images.githubusercontent.com/8730468/45856443-c27f0c80-bd11-11e8-836d-887b9c2e0d6f.png)
---

2. Here is the worksheet name and column names I use (configured in the Code.gs file if you don't like my names). You don't need all these columns, just the ones you feel like using. Due date entries are any date format, just add a date and it will make a calendar entry (you need to set up the triggers).
---
![image](https://user-images.githubusercontent.com/8730468/45857015-1c80d180-bd14-11e8-92d2-8d44989b9a77.png)

---
