# Molly's Home Guide 🐱

A one-page guide for guests staying at our apartment: Wi-Fi, Molly the cat (feeding times and a daily checklist), plants, cleaning supplies, house cleaning, garbage days and contacts.

## Editing

Everything is in `index.html`, in the `HOME` object near the top of the `<script>`. Anything that starts with `TODO` shows up highlighted in yellow on the page, so it's easy to see what still needs filling in.

The page is bilingual (English / French). Guest-facing text is written as `{ en: "…", fr: "…" }`; a plain string is shown the same in both languages. Interface text (buttons, headings, the "Today" messages) lives in the `UI` object just below. Guests switch with the EN / FR toggle in the top bar; it opens in French automatically when their phone is set to French, and remembers their choice.

Days of the week are numbers: `0` = Sunday, `1` = Monday … `6` = Saturday.

## Publishing (GitHub Pages)

Repo **Settings → Pages → Deploy from a branch**, choose the branch and `/ (root)`. The site shows up at `https://<user>.github.io/<repo>/`.
