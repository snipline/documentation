---
title: First Snippet
search_terms: "First Snippet, Getting Started, How to use Snipline"
description: >
  Lets add our first snippet. If we press the green `+` icon next to the search bar we'll be greeted with the Snippet Form. Here we can fill-in the `name`, and `command`. 
---

Lets add our first snippet. If we press the green `+` icon next to the search bar we'll be greeted with the Snippet Form. Here we can fill-in the `name`, and `command`. 

In the "Advanced Options" section, you can also provide an `alias` and `documentation`.

![Adding a new Snippet](/images/snipline/Snippet-Form.png)

The `name` can be used as a short reminder of what the command does and can be helpful for searching. The `command` is the command which will be copied to our clipboards. The `alias` is an optional field which can be used as a shortcut for referencing a snippets in the command bar. `documentation` is an optional field where you can expand further on what the command does.

For our first snippet, use the name **Summary of subdirectory sizes**, the command `du -h --max-depth=1 ./`. Feel free to give the Snippet an `alias`, too. I've chosen `duh` as mine.

Press `Save` at the bottom of the page.

*Tip: This command summarizes the size of all the child subdirectories in the current directory.*

Back in the main interface we can see our new snippet has been added. The number 1 appears to the left of it. Depending on what we search this snippet will change but the number 1 will always appear first.

![Snippet in the Command List](/images/snipline/Screenshot-2019-01-10-at-15.45.17.png)

Enter the search bar (Press `/` on your keyboard or use your mouse), and begin typing `du`. When you have more snippets you'll notice that the Command List updates as you type. For now we have this first Snippet still showing.

As soon as we press `Enter` the command will be copied to our clipboard. This is because if there's only one result the copy process will begin straight away. 

If we had more than one command listed we would have to choose a command to copy. Or, alternatively cancel the search with the `Esc` key.

Copying a command can be done in a few ways:

* Pressing `Enter` in the search if there is only one result.
* Typing `<number>` in the Command Bar
* Typing `ya<alias>` in the Command Bar
* Hovering over the Snippet and clicking the `copy` icon.

![Snippet in the Command List](/images/snipline/search-copy.png)

Read on for how to turn this into a dynamic snippet!