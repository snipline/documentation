---
title: Variables
---

Most the things you need to know about are covered in the basics but here are some useful tips.

## Using the same variable twice

If, for example, you need to reference a database name more than once in a Snippet it's very easy to do so. Just add in the variable name without the default parameter where needed.

In the example below, `DB` is set with a default of `snipline` so the first time it pops up in the copy modal you'll see `snipline` pre-filled. 

After you fill in the value all references are changed to the same text.

~~~bash
CREATE DATABASE #{[DB=snipline]};create user #{[User]}; grant all on #{[DB]}.* to '#{[User]}'@'localhost' identified by '#{[Password]}';
~~~

Using DB=snipline, User=mitch, Password=badpassword will result in the following:

~~~
CREATE DATABASE snipline;create user mitch; grant all on snipline.* to 'mitch'@'localhost' identified by 'badpassword';
~~~

Notice how that both instances of `DB` and `User` have been updated.

## Variable Validation

There are somethings you *can't* do with variables. These include:

* Using the same variable twice with more than one default value.
* Specifying the default value after the first instance of the variable.

With that in mind, the following are invalid:

~~~bash
# Invalid because default is set after first instance
echo '#{[Variable]} #{[Variable=default]}'

# Invalid because two different defaults are set for the same variable
echo '#{[Variable=first]} #{[Variable=second]}'
~~~

Read the next chapter to find out how to use multi-choice preset variables.