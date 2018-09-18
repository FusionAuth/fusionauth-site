

When adding screenshots to the documentation, use a normalized browser window size. The following apple Script may be used to build a consistent browser window.

```appleScript
set theApp to "Safari"

# UI screens
set appHeight to 1100
set appWidth to 1080

# Wider UI screens
#set appHeight to 1100
#set appWidth to 1550

# Maintenance Mode Screens
#set appHeight to 1100
#set appWidth to 900

tell application "Finder"
	set screenResolution to bounds of window of desktop
end tell

set screenWidth to item 3 of screenResolution
set screenHeight to item 4 of screenResolution

tell application theApp
	activate
	reopen
	set xAxis to 200
	set yAxis to 200
	set the bounds of the first window to {xAxis, yAxis, appWidth + xAxis, appHeight + yAxis}
end tell
```