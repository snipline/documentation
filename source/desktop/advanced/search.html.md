---
title: Search
search_terms: "Advanced searching, filtering, sorting"
description: >
    How to enable and search complex queries or requirements.
---

By default Snipline searches the name, command, and alias for a match against your search term.

This basic search can work fairly well for most use-cases, however, if you want more control over how you search then you can enable the "Advanced Search" within the settings of Snipline.

Configuration menu image here

With Advanced Search enabled, you have the power of [Lunr.js](https://github.com/olivernn/lunr.js).

With that in mind you can use the following syntax to search

* `+` - word must appear in results. E.g. `+sql`.
* `-` - word must not appear in results. E.g. `-git`.
* `*` - Wildcard. E.g. `grep*`, `*sql`, `*sh*`.
* `~<number>` - Fuzzy matches. E.g. `gyt~1`

## Searching specific attributes

The following attributes can be searched

* `name` - The name of the snippet.
* `docs` - The snippet documentation.
* `alias` - The snippet alias.
* `command` - The command associated with the snippet.
* `tags` - The tags associated with the snippet.

For example, you can search for all of the snippets that are tagged `sql` like this.

~~~
tags:sql
~~~

Another example, you want to search documentation that contains the word Linux or unix, you could do the following

~~~
docs:*nix
~~~

## More example searches

Search for snippet that contains git but not log

~~~
git -log
~~~

Search for a curl command that must include auth

~~~
command:curl +auth*
~~~

Search for misspelled or uncertain text

~~~
magneto~1
# results matching magento
~~~

## Escaping search syntax

Sometimes you may wish to search dashes (`-`) or other characters that are used in the Lunr search syntax.

To do this, use a backslash (`\`) before the character you wish to keep

~~~
git \-\-log
~~~

## More information

For more information on using Lunr, [check out their searching documentation](https://lunrjs.com/guides/searching.html).
