---
description: Serve the static site locally on port 8080 and open it in a browser
---

# run-local

Serves the static HTML site with Python's built-in HTTP server and opens it in the default browser.

## Run

Kill any existing process on port 8080, start the server in the background, then open the browser:

```bash
lsof -ti:8080 | xargs kill 2>/dev/null; true
python3 -m http.server 8080 --directory /Users/roblaf/codeprojects/linearclock/thelinearclock &>/tmp/linearclock-server.log &
sleep 1
curl -sf http://localhost:8080/index.html -o /dev/null && echo "Server up" || echo "Server failed to start"
open http://localhost:8080/index.html
```

The site is served from the project root. No build step required — all files are static HTML/CSS/JS.

## Verify

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/index.html
# → 200
```

Logs are at `/tmp/linearclock-server.log`.

## Stop

```bash
lsof -ti:8080 | xargs kill
```
