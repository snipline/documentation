---
title: Dynamic Snippets
search_terms: "First Snippet, Dynamic Snippets, Getting Started, Variables"
description: >
  Now that we can create and copy commands, let's edit a command to make it dynamic.
---

*If you haven't already, make sure you've created your [first snippet](/desktop/basics/02-first-snippet) before continuing this tutorial.*

Now that we can create and copy commands, let's edit a command to make it *dynamic*.

We can edit a snippet by hovering over it with our mouse and clicking the cogwheel icon. This will take us to the edit snippet page.

<div class="text-center">
<img alt="Edit Snippet" src="/images/snipline/Screenshot-2019-09-13-10.19.56.png">
</div>

We'll change the snippet to this similar but slightly different command:

~~~snipline
du -hd#{[Depth=1]} #{[Directory=./]}
~~~

Variables in Snipline start with `#{[` and end with `]}`. Inbetween here we can give the variable a description name that will help us remember what it means later on. We can also add a default value by adding an `=` after the name. In this example we've given `Depth` a default of `1` and `Directory` a default of `.` (Current directory).

Let's test the command. Click `Save` at the bottom of the form to go back to the main UI.

Type `:1` into the command bar (or hover over the  snippet and press the clipboard icon). We'll now be prompted to fill in the Depth and the Directory. 


<div class="text-center">
<img alt="Copy Process" src="/images/snipline/Screenshot-2019-09-13-10.21.37.png">
</div>

Keep the depth as `1` and press `Enter` . Next, change the directory to `~/` (Your user home directory). Now let's try pasting this command into the terminal. We can see the command that has been copied looks like this

~~~snipline
du -hd=1 ~/
~~~

![Terminal Preview](/images/snipline/Screenshot-2019-09-13-10.28.10.png)

And that's the basics of Snipline! Read on for some common examples to get started.
