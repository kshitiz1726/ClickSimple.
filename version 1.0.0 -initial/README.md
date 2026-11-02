# ClickSimple

**Complex interfaces. Simple instructions.**

ClickSimple is a Chrome extension prototype that helps people navigate complicated websites through short, guided tasks and visual highlighting.

## The problem

People with limited digital literacy, unfamiliarity with a website, or difficulty navigating crowded interfaces can struggle to identify the next useful control.

## Our solution

ClickSimple adds a small assistant to the current webpage. Users choose a task and receive one-step-at-a-time guidance. The extension detects visible links, buttons and form fields, then highlights a suggested element.

## Features in this prototype

- Guided tasks: fill out a form, find something, navigate a website, or describe a custom task.
- Detects visible links, buttons and form fields.
- Highlights a suggested element and scrolls it into view.
- Shows step progress.
- Does not automatically click, submit forms, or make purchases.
- Works locally without an API key.

## Install locally in Google Chrome

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Select **Load unpacked**.
5. Choose the `ClickSimple` project folder (the folder containing `manifest.json`).
6. Open an ordinary website, click the ClickSimple extension icon, then choose **Open assistant**.

If you change the code, return to `chrome://extensions` and press the reload icon on the ClickSimple card.

## GitHub

1. Sign in to GitHub and create a new public repository named `ClickSimple`.
2. Upload the files in this folder (not the ZIP file itself).
3. Add a short description and use the README as the project overview.
4. Commit the files.

## Deploy a project page with GitHub Pages

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the `main` branch and `/docs` folder if you add a docs folder, or use the included `demo` folder by moving/copying its `index.html` to `docs/index.html`.
4. Save and wait for GitHub Pages to publish the site.

Note: GitHub Pages hosts the project website/demo. It does not install a Chrome extension into visitors' browsers. The extension is loaded through Chrome's extension manager or distributed through the Chrome Web Store.

## Current limitations

This is a hackathon MVP, not a universal AI agent. It uses browser DOM heuristics and visible text to suggest likely elements. Some websites use complex custom controls, shadow DOM, canvas interfaces, or dynamically loaded content that may not be detected. The custom-task feature currently uses keyword matching, not natural-language reasoning. Users remain in control of clicks and submissions.

## Accessibility and privacy

- Uses readable text, clear buttons, and visible focus/highlight cues.
- No external service, analytics, or API calls.
- Page content is inspected locally in the current tab to find visible controls.
- The prototype does not send page content to a server.
