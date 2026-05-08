---
title: Club information
tags: page
---

The Cape Ann Amateur Radio Association (CAARA) is an ARRL Special Service Club. The club was formed in 1977 and we are a 501 (C) 3 non-profit charitable organization.

## Contact

Our mailing address is:

6 Stanwood Street\
Gloucester, MA 01930

The clubhouse phone number is (978) 282-7645.

You can use the following email addresses to contact CAARA:

- For general information, <info@caara.net>
- To contact the Board of Directors, <board@caara.net>
- To report a problem with a CAARA-maintained repeater, <repeater@caara.net>

## General information

{% for page in collections.about %}
- [{{page.data.title}}]({{page.url}})
{% endfor %}

## Policies

{% for page in collections.policy %}
- [{{page.data.title}}]({{page.url}})
{% endfor %}

## Historical information

{% for page in collections.history %}
- [{{page.data.title}}]({{page.url}})
{% endfor %}
