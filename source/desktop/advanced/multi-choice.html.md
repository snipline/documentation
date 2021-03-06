---
title: Multi-Choice Presets
search_terms: "multi-choice presets, multi-choice dynamic variables, select variables"
description: >
  Sometimes you might have a set of values that are often used interchangably. Multi-choice preset variables are the perfect use case for this.
---

Sometimes you might have a set of values that are often used interchangably. Multi-choice preset variables are the perfect use case for this.

In this example, `URL` is a regular variable with a default of `https://`. Instead of using regular variables for `Request Type` and `Content-Type`, they specify a list of options to choose from.

~~~snipline
curl '#{[URL=https://]}' -X '#select{[Request Type=GET,POST,DELETE,PUT]}' -H 'Content-Type: #select{[Content Type=application/json,text/html;charset=utf-8]}'
~~~

The Syntax for a multi-choice preset is

~~~snipline
#select{[Name=option 1,option 2,option 3]}
~~~

Notice the `select` keyword and each option is listed after the `=` and seperated by `,`.

When triggering the copy process for a command the first 5 options have keybinds (`1`,`2`,`3`, etc).

![Multi Choice Preset Variables](/images/snipline/multi-choice.png)


## Referencing Multi-Choice Presets

To reference a multi-choice variable more than once use the regular variable syntax.

For example, in the following snippet, there is an environment variable called `EMBER_ENV` which is set with a multi-choice variable and can be set as `production` or `development`. 

The value is then reused later, where it gets passed to the `--environment` argument with the regular variable syntax.

~~~snipline
EMBER_ENV=#select{[env=production,development]} ember serve --environment=#{[env]}
~~~
