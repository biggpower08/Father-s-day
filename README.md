# Happy Birthday Dad Turtle Animation

A tiny GitHub Pages-ready birthday card from Caleb. It opens to a teal screen with a centered Play button, then animates a turtle-graphics-style canvas drawing with two visible turtles: one red and one blue.

The drawing is implemented with plain HTML, CSS, and JavaScript. GitHub Pages is static, so the browser version recreates turtle-style drawing on an HTML canvas instead of running Python turtle in the page.

## Open Locally

Open `index.html` in a browser.

No npm install, build step, backend, or external library is required.

## Publish With GitHub Pages

1. Push this repo to GitHub.
2. Go to Settings -> Pages.
3. Choose the `main` branch and root folder.
4. Open the GitHub Pages URL.

## How The Drawing Works

`script.js` contains a small browser turtle engine with helper methods for movement, lines, circles, arcs, bubble text, and animated turtle cursors.

The red turtle draws:

- `HAPPY BIRTHDAY DAD`
- hearts
- small accent marks

The blue turtle draws:

- the rocky overlook
- dad and son line art
- mountain ridges
- clouds
- forest texture

The turtle cursors are custom canvas drawings shaped to resemble the classic Python `import turtle` turtle cursor.

## Optional Python Drawing

`generate_turtle_drawing.py` is kept as a local Python turtle drawing helper. It uses Python's built-in `turtle` module, and its turtles use `shape("turtle")`.

Run it with:

```bash
python generate_turtle_drawing.py
```

That script writes image assets under `public/assets`, but the GitHub Pages site itself does not depend on Python or on the generated image.
