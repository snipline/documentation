---
title: Linux
search_terms: "Linux, Debian, Ubuntu, .deb, Install, Installation, Fedora, .rpm"
description: >
  Snipline Desktop supports Debian based Linux systems. This includes Ubuntu, Mint, Elementary OS and more.
---

### Debian / Ubuntu

Snipline Desktop supports Debian based Linux systems. This includes Ubuntu, Mint, Elementary OS and more.

[Download the latest .deb package](https://desktop.downloads.snipline.io/download/latest/linux_64)

#### By GUI

Install gdebi

~~~bash
sudo apt-get install gdebi
~~~

Right click the `.deb` file and click Open in GDebi Package Installer


#### By Command-line

Install the .deb with dpkg (Use sudo if needed) from [the downloads page](https://desktop.downloads.snipline.io)

~~~bash
sudo dpkg -i snipline_0.6.6_amd64.deb
~~~

Install the package

~~~bash
sudo apt-get install -f
~~~

The app should now appear in your start menu or when searched.

You can also run the application from the command-line

~~~bash
cd /usr/lib/snipline
./Snipline
~~~

#### Limitations

Currently only .deb files are available. Because of this updates have to be done manually.

#### Known Issues

##### Adding a Desktop shortcut

If it doesn't already exist, create `/usr/share/applications/snipline.desktop` with the following content

~~~
[Desktop Entry]
Name=Snipline
Comment=Snipline
GenericName=snipline
Exec=/usr/lib/snipline/Snipline --disable-gpu
Icon=snipline
Type=Application
StartupNotify=true
Categories=Utility;
~~~

Make sure to `chmod +x /usr/share/applications/snipline.desktop`

##### Blank screen

If you're greeted with a blank screen on Debian try running this command instead

~~~bash
 /usr/lib/snipline/Snipline --disable-gpu
~~~

If you're using the GUI installation do the following:

Go to `/usr/share/applications` and right click `Snipline` > `Properties`.

Change the Command property to

`/usr/lib/snipline/Snipline --disable-gpu`

![Ubuntu Properties](/images/snipline/ubuntu-properties.png)

In the permissions tab make sure "Allow executing file as program" is checked.

You should then be able to run Snipline

### Fedora / Redhat (Beta)

The Fedora version of Snipline uses [Nativefier](https://github.com/jiahaog/Nativefier) to load the latest version of Snipline.

The following has worked on Fedora 29.

~~~bash
# install Nativefier/Electron dependency
pkcon install libXScrnSaver 

# Download Snipline to your home directory
cd ~/ && wget https://docs.snipline.io/media/snipline-fedora-linux-x64.tar.gz

# Extract
tar -xvzf snipline-fedora-linux-x64.tar.gz

# Create desktop file
touch ~/.local/share/applications/snipline.desktop
~~~

Add the following to your .desktop file, updating the execution path as preferred

~~~
[Desktop Entry]
Name=Snipline
Comment=Snipline
GenericName=snipline
Exec=/home/user/snipline-fedora-linx-x64/snipline
Icon=snipline
Type=Application
StartupNotify=true
Categories=Utility;
~~~

Now you should be able to run Snipline!