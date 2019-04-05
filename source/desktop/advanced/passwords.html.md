---
title: Passwords
search_terms: "Passwords, Generating Passwords, Random"
description: >
    How to generate passwords randomly for shell commands
---

In some situations it's beneficial to be able to generate random text or passwords. With Snipline you can create unique strings for each command with the password syntax.

~~~snipline
#password{[Name,16]}
// outputs => W[Oi*XRONSgQi\)q
~~~

The first parameter (`Name`) is the reference name to the password, and the second parameter is the length.

The reference name is useful if you wish to use the same password more than once in a snippet. The second reference does not include a length.

~~~snipline
firstcommand "#password{[Name,16]}" > secondcommand "#password{[Name]}"
// outputs => firstcommand "aq}PIjhqi;HOilAy" > secondcommand "aq}PIjhqi;HOilAy"
~~~

With this in mind, you can have multiple passwords in a snippet by giving them different reference names.

~~~snipline
firstcommand "#password{[Name,8]}" && secondcommand "#password{[Name]}" && thirdcommand "#password{[Third,6]}"
// outputs => firstcommand "CVq(%Ajn" && secondcommand "CVq(%Ajn" && thirdcommand "wRg^a:"
~~~

## Settings

By default if you do not pass a length the string will fallback to a length of 16.

Further configuration, such as adding symbols, numbers, and mixed-case letters can be updated in the Settings page (Under the Quick Menu > Settings or by pressing the `c` shortcut).