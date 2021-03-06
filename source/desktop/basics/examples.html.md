---
title: Examples
search_terms: "Examples, PHP Snippets, Server Snippets, Common Snippets, Magento Snippets, SQL Snippets, MySQL"
description: >
  These commands will hopefully be a source of inspiration and reference for your own snippets. If you think you have a good one, why not tweet us about it? 😀
---

Every developer's workflow is different. These commands will hopefully be a source of inspiration and reference for your own snippets. 

If you think you have a useful command, why not [tweet](https://twitter.com/sniplineapp) us about it? 😀

## General commands

### Copying SSH key to clipboard (MacOS)

This command copies your public key from the `.ssh` directory. Set your most commonly used key to the default.

~~~snipline
cat ~/.ssh/#{[Key=id_rsa.pub]} | pbcopy
~~~
<br>

### Grep - Search a directory for search term

Use Grep to display files that contain a search term - optionally only output the file name (useful with cached/minified files) and filter by file type

~~~snipline
grep -rnw#{[Only Display Filenames?=l]} '#{[Directory=./]}' -e '#{[Searchterm]}' #{[Include=--include \*.js]}
~~~
<br>

### Curl requests

Quickly create a curl request for a specific URL and choose any request type. Optionally set headers such as Authorization Tokens, Content-Type, etc.

~~~snipline
curl '#{[URL=https://]}' -X '#select{[Type=GET,POST,DELETE,PUT]}' -H 'Authorization: Bearer #{[Auth=]}'
~~~
<br>

### Curl request with JSON responses

Use `jq` to parse `JSON` responses and store the response in a file with the date appended.

~~~snipline
curl '#{[URL=https://]}' -X '#select{[Type=GET,POST,DELETE,PUT]}' -H 'Authorization: Bearer #{[Auth=]}' | jq > #{[File=file]}-`date '+%Y-%m-%d'`.json
~~~
<br>

### Symlink directory to another directory in the same directory

If you want to create a symlink of a directory that's in the same directory e.g. public_html -> web then cd into the directory and run

~~~snipline
ln -s #{[Existing=web]} #{[Shortcut=public_html]}
~~~
<br>

### Find files that start with a string

~~~snipline
find . -type f -name #{[String]}\*
~~~
<br>

### Remove files that start with a string

Make sure to do a dry run with the above command first!

~~~snipline
find . -type f -name #{[String]}\* -exec rm {} \;
~~~
<br>

## PHP commands

### Local server

Start a local php server with default port of 8000 and  /, web/, and public_html for default public directory choices.

~~~snipline
php -S localhost:#{[Port=8000]} -t #select{[Public Directory=/,web/,public_html/]}
~~~
<br>

### Create a new admin in Magento 2

~~~snipline
php bin/magento admin:user:create --admin-user="#{[Username=myname]}" --admin-password="#{[Password]}" --admin-email="#{[Email=your@email]}" --admin-firstname="#{[Firstname=Name]}" --admin-lastname="#{[Lastname=Name]}"
~~~
<br>

## MySQL commands

### Dump a database

~~~snipline
mysqldump -u #{[User]} -p #{[Database]} > #{[Database]}-`date '+%Y-%m-%d'`.sql
~~~
<br>

## SQL commands

### Create a new database

~~~snipline
CREATE DATABASE #{[DB]};create user #{[User]}; grant all on #{[DB]}.* to '#{[User]}'@'localhost' identified by '#{[Password]}';
~~~
<br>