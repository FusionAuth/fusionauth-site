Output demo-raw.webm
Set Shell bash
Set FontSize 14
Set Width 1280
Set Height 1000
Set TypingSpeed 40ms

# accept the folder trust dialog off camera
Hide
Type "clear && ./launch.sh"
Enter
Sleep 6s
Down
Enter
Sleep 6s
Show
Sleep 2s

# fixed sleeps, because a missed Wait aborts the whole take; a second Enter on an empty prompt does nothing
Type "Install FusionAuth on my machine with Docker."
Sleep 2s
Enter
Sleep 1s
Enter
Sleep 120s

Type "Using the FusionAuth docs, how do I add Login with Google to a FusionAuth application?"
Sleep 2s
Enter
Sleep 1s
Enter
Sleep 100s

# exit and remove the demo containers and volumes
Hide
Type "/exit"
Enter
Sleep 2s
Type "(cd ~/fusionauth-demo && docker compose down -v) && rm -rf ~/fusionauth-demo"
Enter
Sleep 15s
