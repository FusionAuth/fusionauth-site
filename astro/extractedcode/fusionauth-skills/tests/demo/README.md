# Plugin Demo Recording

OpenAI's MCP review needs a demo video. These files record one with [VHS](https://github.com/charmbracelet/vhs). The published video lives at `astro/public/img/docs/fusionauth-plugin-demo.webm`.

You need VHS, ffmpeg, Docker, and a logged-in Claude Code. Port 9011 must be free. Pull the images first, so the video doesn't wait on downloads:

```console
curl -s https://fusionauth.io/docs/docker-compose.yml | grep -o 'image: .*' | cut -d' ' -f2 | xargs -n1 docker pull
```

Record from this folder:

```console
vhs demo.tape
```

The session runs in `~/fusionauth-demo` and removes the folder, containers, and volumes at the end. To find the idle stretches to cut, run:

```console
ffmpeg -i demo-raw.webm -vf "freezedetect=n=0.001:d=3" -map 0:v -f null - 2>&1 | grep freeze_
```

Then cut those stretches with ffmpeg's `trim` and `concat` filters, encode the result with `-c:v libvpx-vp9 -crf 40 -an`, and replace the published video.
