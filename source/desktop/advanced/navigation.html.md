---
title: Navigation
search_terms: "Navigating Snipline, Vim keybinds, User Interface, UI"
description: >
  All the features of Snipline can be used with a mouse, and 90% of them can also be done with just the keyboard.
---

All the features of Snipline can be used with a mouse, and 90% of them can also be done with just the keyboard.

## Creating a new snippet

<div style="width:100%;text-align:center;margin:auto;"><iframe src="https://player.vimeo.com/video/316532186?autoplay=true&loop=true&color=94AB0D&byline=false&transparent=true" width="400" height="500" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>

While on the main section of Snipline (and not focused in the Search Bar or Command Bar) press `n` to bring up the new snippet form.

From here you can use `Tab` and `Shift+Tab` to cycle through the text fields.

You can either write dynamic variables by typing them manually (`#{[Variable Name=Default Value]}` and `#select{[Choice Name=value 1,value 2]}`) or use `Tab` to cycle to the variable name button and press `Enter` to append them to your command.

When focused on the "advanced options" button, pressing `Enter` will bring up the advanced options which you can then use tab to cycle through as well.

To save the snippet, use `Tab` to cycle to the `Save` button and press `Enter`.

To go back without saving, first press `Esc` to unfocus any form elements and then press `Backspace`.

<div style="width:400px;text-align:center;margin:auto;"><iframe src="https://player.vimeo.com/video/316534234?autoplay=true&loop=true&color=94AB0D&byline=false&transparent=true" width="400" height="500" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>

## Editing an existing snippet

<div style="width:400px;text-align:center;margin:auto;"><iframe src="https://player.vimeo.com/video/316534973?autoplay=true&loop=true&color=94AB0D&byline=false&transparent=true" width="400" height="500" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>

Editing an existing snippet works the same as creating a new snippet.

To select a snippet to edit, press `e` while in the Snippet List, type the snippet row number and press `Enter`.

You can delete a snippet by using `Tab` to focus the Delete button and pressing `Enter`.

## Filtering and selecting snippets

Press `/` on your keyboard to select the search bar and type either part of the command name, or part of the command itself.

When you press `Enter` you will come out of the search bar focus.

If there is only one result the copy process will automatically start.

If there is more than one result you can then type `:<number>` to choose a command to copy. Or `:e<number>` to choose a command to edit.

Alternatively, if you have set an `alias` for a command you can copy this command with `:ya<alias>` edit it with `:ea<alias>`, or pin with `:pa<alias>`.

<div style="width:400px;text-align:center;margin:auto;text-align:center;"><iframe src="https://player.vimeo.com/video/316535550?autoplay=true&loop=true&color=94AB0D&byline=false&transparent=true" width="400" height="500" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>

If you want to browse your snippets, you can use the `down`/`up` keys on your keyboard (or `j` / `k` for Vim users). For faster scrolling use `Ctrl+d` and `Ctrl+u`.

Pressing `Tab` will cycle through focusable elements. Each snippet can be focused and pressing `Enter` will start the copy process.

<div style="width:400px;text-align:center;margin:auto;"><iframe src="https://player.vimeo.com/video/316540926?autoplay=true&loop=true&color=94AB0D&byline=false&transparent=true" width="400" height="500" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>

Finally, to jump back to the top of your list press `g+g` (`g` twice in quick succession). and to jump to the bottom use `shift+g`.

<div style="width:400px;text-align:center;margin:auto;"><iframe src="https://player.vimeo.com/video/316541230?autoplay=true&loop=true&color=94AB0D&byline=false&transparent=true" width="400" height="500" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>

