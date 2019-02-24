---
title: Installing Snipline
---

# Installing Snipline

## <a name="macos" href="#macos"><clr-icon shape="link"></clr-icon></a> Mac OS

## <a name="windows" href="#windows"><clr-icon shape="link"></clr-icon></a> Windows

## <a name="linux" href="#linux"><clr-icon shape="link"></clr-icon></a> Linux

### Debian / Ubuntu

Snipline Desktop supports Debian based Linux systems. This includes Ubuntu, Mint, and Elementary OS.

Download the latest .deb package from the downloads page.

#### By GUI

Install gdebi

~~~bash
sudo apt-get install gdebi
~~~

Right click the `.deb` file and click Open in GDebi Package Installer

Go to `/usr/share/applications` and right click `Snipline` > `Properties`.

Change the Command property to

`/usr/lib/snipline/Snipline --disable-gpu`

![Ubuntu Properties](/images/snipline/ubuntu-properties.png)

In the permissions tab make sure "Allow executing file as program" is checked.

You should then be able to run Snipline

### Commandline

Install the .deb with dpkg (Use sudo if needed) from https://desktop.downloads.snipline.io

~~~bash
sudo dpkg -i snipline_0.1.2_amd64.deb
~~~

Install the package

~~~bash
sudo apt-get install -f
~~~

Run the application

~~~bash
cd /usr/lib/snipline
./Snipline
~~~

#### Adding a Desktop shortcut

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

#### Limitations

Currently only .deb files are available. Because of this updates have to be done manually.

#### Known Issues

If you're greeted with a blank screen on Debian try running this command instead

~~~bash
 /usr/lib/snipline/Snipline --disable-gpu
~~~
