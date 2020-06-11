## Documentation Style Guidelines

Here are some guidelines to follow when writing documentation. 

- Do not manually wrap long lines. Use the soft wrap in your editor to view while editing. 
- Use `Id` instead of `ID` when describing a unique identifier
- Don't use complex breadcrumbs styling. Use `->` because Asciidoc converts this to a nice Unicode arrow. Breadcrumbs should look like this `[breadcrumb]#foo -> bar -> baz#`
- If you are referencing a URL as a setting and don't want it to be hyperlinked, preface it with a `\`. For example: `\https://fusionauth-example.zendesk.com`
- If you are referencing a field in a form, use the `[field]` class (rather than backticks): `[field]#Issuer#`

### Proper names
- macOS
- Elasticsearch
 

## Sizing Window for Screenshots

When adding screenshots to the documentation, articles or blogs, use a normalized browser window size. The following apple Script should be used to build a consistent browser window.

Note that you must have at least 1100 pixels of screen height. If you do not, your dimensions will be skewed. Go to "System Preferences > Display" then choose "More space".

```appleScript
set theApp to "Safari"

# Docs screens
#set appHeight to 1100
#set appWidth to 1080

# Wider UI screens
#set appHeight to 1100
#set appWidth to 1550

# Maintenance Mode Screens
#set appHeight to 1100
#set appWidth to 900

# Blog screens
#set appHeight to 1020
#set appWidth to 1220

tell application "Finder"
	set screenResolution to bounds of window of desktop
end tell

set screenWidth to item 3 of screenResolution
set screenHeight to item 4 of screenResolution

tell application theApp
	activate
	reopen
	set xAxis to 640
	set yAxis to 360
	set the bounds of the first window to {xAxis, yAxis, appWidth + xAxis, appHeight + yAxis}
end tell
```

## Screenshot Standards

- Use `CMD`+`shift`+`4`+`space` to get the drop-shadow style screenshots
- After sizing the window using the AppleScript, do not make the windows smaller in the Y axis.
   - If you only want a portion of the screen, crop it. See Application Core Concepts for an example.
- Crop top/bottom if necessary (don't crop sides). 
- Highlight sections using image preview editor
	- Highlights should be red rectangle with line weight 5
- To size and compress images without losing too much quality, follow these steps:
	1. Resize to width of 1600 in Preview.app
	2. Use https://tinypng.com/ to compress the image

Converting terminalizer gifs to videos
----

Gifs take up quite a lot of space: The brew gif was about 5mb, after some custom optimization it was only 2mb

To reduce the space requirements further, a video format is highly recommended and the dominant video format is
webm. Converting a gif to webm is cake: `ffmpeg -i terminalizer.gif terminalizer.webm`. ffmpeg will choose all
of the best default settings for you because the format is already specifically for browsers.

The problem is webm is not supported by safari (yet). You will also want to create an mp4 (which isn't always supported
by some of the lesser browsers because it uses codecs that require paid licenses inside). You also will have to
do some eyeballing on your video because safari is really picky about what it permits.

Example of my brew convert command:
```bash
ffmpeg -i render1555538879075.gif -vf scale=744x478 -vsync 2 -pix_fmt yuv420p brew.mp4
```

`-vf scale=` adjusts the scale of the output. The height and width must be divisible by 2!

`-vsync 2` makes the framerate variable and is great for terminalizer gifs because there are MANY duplicated frames
that this parameter will drop and significantly reduce your file size (by about half for my brew example)

`-pix_fmt yuv420p` changes the pixel format to yuv420p which is the magic sauce that safari wants (this is
also the part that needs a size that is divisible by 2)
