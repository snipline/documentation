---
title: Introduction
search_terms: "Getting Started, What is Snipline"
description: >
  Snipline is a tool for developers to store and use shell commands.
  Most developers memorize most of their commonly used commands, but there are often long, complex, commands that are either written down or frequently googled.
---

Snipline is a tool for developers to store and use shell commands.

Most developers memorize most of their commonly used commands, but there are often long, complex, commands that are either written down or frequently googled.

Snipline is built for this exact situation. Keep all of your commands in one app which is easy to search, copy and much more.

The app copies commands to your clipboard so it's easy to run commands while SSH'd into servers. Just paste the result into your terminal session.

<video  autoplay="" loop="" muted playsinline>
  <source src="/videos/what-is-snipline-01.mp4" type="video/mp4">
  <!-- <source src="myVideo.webm" type="video/webm"> -->
  <p>Your browser doesn't support HTML5 video. Here is
     a <a href="/videos/what-is-snipline-01.mp4">link to the video</a> instead.</p>
</video>

The real power of Snipline comes from dynamic commands. Snipline includes variables which you can use to find and replace parts of a command on the fly.

<video  autoplay="" loop="" muted playsinline>
  <source src="/videos/what-is-snipline-02.mp4" type="video/mp4">
  <!-- <source src="myVideo.webm" type="video/webm"> -->
  <p>Your browser doesn't support HTML5 video. Here is
     a <a href="/videos/what-is-snipline-02.mp4">link to the video</a> instead.</p>
</video>

You can optionally define a default value that you use the most to save time for each parameter, and each reference to the same variable is replaced and copied on the fly.

Not only this, you can also specify multi-choice variables. For example, in a CURL request you might want to be able to choose between a GET,POST,PUT, or DELETE request.

Try the command above in your own Snipline app with the following:

~~~snipline
# For bash shell users
mysqldump -u #{[User=user]} -p #{[Database=database]} > #{[Database]}-`date '+%Y-%m-%d'`.sql
# For Fish shell users
mysqldump -u #{[User=user]} -p #{[Database=database]} > #{[Database]}-(date "+%Y-%m-%d").sql
# For both
mysqldump -u #{[User=user]} -p #{[Database=database]} > #{[Database]}-#select{[Date Format=(date "+%Y-%m-%d"),`date '+%Y-%m-%d'`]}.sql
~~~

Read on for more on the core features of Snipline.