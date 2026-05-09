---
title: Newsletter
tags: "page"
weight: 80
---

<!-- markdownlint-disable MD032 MD052 -->

Every month we publish our CAARA Newsletter containing information and news
pertaining to the life of the Associaion, important reminders, and messages
from our President and other members. We distribute the newsletter via e-mail
in addition to posting it here on our website. The newsletter is also available
by US Mail for those who request it.

Use the links below to view our current newsletter or to review recent
editions. Our newsletters are a good way to find out more about CAARA and its
members and activities.

## Recent Newsletters

{%- for newsletter in newsletters.recentNewsletters %}
- [{{ newsletter.label }}]({{ newsletter.url }})
{%- endfor %}

See the [archives](archives/) to see older editions of the newsletter.
