---
title: "Site design notes"
---

## Most content is plain text

Most content is plain text and utilizes [markdown] markup. That means that
text like `**bold**` is rendered as **bold**, and text like
`[CAARA](http://caara.net)` produces a link like [CAARA](http://caara.net).
This makes content creation and editing simpler than working with HTML
because the content isn't littered with html tags. For example, see the
[source for this document][markdown-src].

[markdown]: https://en.wikipedia.org/wiki/Markdown
[markdown-src]: https://raw.githubusercontent.com/caara-races/caara-net-website/refs/heads/main/content/design/index.md

The use of markdown isn't required. It is entirely possible to use plain HTML;
see for example [this example document] and [the corresponding
source][html-src].

[this example document]: sample
[html-src]: https://raw.githubusercontent.com/caara-races/caara-net-website/refs/heads/main/content/design/sample.html

## Portable hosting

Because the content is plain text, which gets rendered into a set of static
HTML files, we are able to host the site pretty much anywhere. There is free
hosting available from sites like...

- [Github](https://github.com)
- [Firebase](https://firebase.google.com)
- [Netlify](https://netlify.com)
- and many others.

All of these sites also support free SSL certificates and custom domains.

## Responsive design

The site displays well on both large and small screens. Below a certain
threshold, the navigation menu collapses to a "hamburger" menu (three
horizontal lines), and the announcements sidebar on the main page relocates
to beneath the main content. The font size is appropriate to the screen
size.

The site is designed to be printable: elements like navigation menus and
clickable links are excluded when printing. That means that in almost all
cases, there is no need to provide a separate link for a "printable"
version of a page.

## Navigation menu

I had two goals for the navigation menu:

1. Reduce it to a single line, rather than the five-line monstrosity on the
   current site.
2. Emphasize participation.

We start with an announcements page, which serves both to show what an
active and interesting club we are and provide information about upcoming
events and activities.

Next is the event calendar, which is all about when and where.

These are followed by a public service page, information about our radio
nets, and information about our repeaters -- all of these are broadly ways
in which people can engage with us.

These are followed by the newsletter, which documents things that have
already happened. Again, look at all the interesting things we do!

Finally, we have the administrative section: how to join the club, after
having seen all the exciting bits earlier in the menu, and lastly club
information, which includes administrative documents, silent key tributes,
historical documents, and so forth.

![Explanation of menu layout](menu.png)

## Interactive elements

It is possible to annotate callsigns so that hovering the mouse over one
displays a popup with information retrieved from the FCC license database.

![Popup showing callsign details](popup.png)

## Data driven content

Many pages are effectively "lists of items":

- The news posts on [/announcements](/announcements/)
- The silent key tributes at [/about/silent-key](/about/silent-key/)
- The list of links in the navigation menu
- The list of newsletters at [/newsletter](/newsletter/)

These pages are all generated automatically by iterating over the relevant
items. This same feature also lets us easily generate a news feed from the
list of announcements (see [/feed.xml](/feed.xml)) and even handle the
pagination of announcements (they are displayed five per page, with
older/newer links to navigate the complete list).
