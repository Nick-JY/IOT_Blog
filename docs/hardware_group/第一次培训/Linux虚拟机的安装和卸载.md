# Linux虚拟机的安装和卸载

### 1.Linux虚拟机

虚拟机即VM，是一个由特定的软件模拟出来的一个具有完整的硬件系统功能的、运行在一个与实体机完全隔离的环境中的计算机。

使用虚拟机的优点：

1）虚拟机中发生的程序崩溃不会对实体机产生影响（虚拟机和实体机之间互不干扰），可以方便的卸载虚拟机和重装虚拟机。

2）虚拟机胜过双系统，可以很方便的进行虚拟机——实体机之间的文件传输。

### 2.如何卸载VMware中的Linux虚拟机：

![LIx0cF.png](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/LIx0cF.png)

![LIxhcD.png](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/LIxhcD.png)

点击“是”即可完成卸载。

### 3.如何卸载VMware：

正常卸载Linux虚拟机不需要重装VMware，但是如果想要更换VMware的版本的话，需要卸载VMware，推荐使用Your uninstaller!7进行卸载，不用手动进行注册表清理，卸载完VM需要重启系统。

附Your installer!7注册码：

> Name：Giveawayoftheday
>
> Registration code：
>
> 000017-2PNBK2-J59U6F-317E09-R5TGJQ-6B1WNA-AZCYNJ-GVP86A-7VP2MX-JFY2Q1

### 4.如何安装VMware：

在网络上下载VMware—16 pro版本，不建议将VM安装在系统盘，注册码如下（三个均可以使用）：

> ZF3R0-FHED2-M80TY-8QYGC-NPKYF
> YF390-0HF8P-M81RQ-2DXQE-M2UT6
> ZF71R-DMX85-08DQY-8YMNC-PPHV8

### 5.如何安装Linux虚拟机：

1）直接在ubuntu官网中选择ubuntu桌面系统进行下载，推荐在国内源上下载18.04版本：ubuntu-18.04.6-desktop-amd64.iso

2）在BIOS中让Intel Virtualization Enable使能，确认虚拟化功能已经开启，在windows下的任务管理器的性能的CPU界面，看到虚拟化已启动。

3）下载完成后，打开VM创建虚拟机，安装程序光盘映像文件。

4）将最大磁盘大小设置为80G，将虚拟磁盘存储为单个文件。

5）在自定义硬件中打开处理器中的虚拟化Intel VT -x/EPT或AMD-V/RVI(V)

6）网络适配器中的网络模式改为NAT模式

7）等待完成安装即可。

### 6.配置Linux虚拟机：

###### 1）如果弹出版本更新提示，选择不更新版本。

###### 2）在终端中更新软件源，这里需要先将软件源更新为国内的软件源，推荐华为软件源。

由于刚刚创建好虚拟机，需要给root账户设置密码：

```shell
sudo passwd root
```

进入root账户：

```shell
su root
```

（在修改配置文件之前，要备份一份原配置文件，以免出现错误）

```shell
cp -a /etc/apt/sources.list /etc/apt/sources.list.bak
```

更换为华为源：

```shell
sed -i "s@http://.*archive.ubuntu.com@http://repo.huaweicloud.com@g" /etc/apt/sources.list
```

```shell
sed -i "s@http://.*security.ubuntu.com@http://repo.huaweicloud.com@g" /etc/apt/sources.list
```

更新软件源：

```shell
apt-get update
```

###### 3）同步Linux系统中的时区：

1.查看当前时区：

```shell
date -R
```

如果是-0700，表示西七区，我们要调整为+0800，也就是东八区。

2.在root账户下：

```shell
tzselect
```

按照提示选择China-Beijing

3.完成后执行该命令：

```shell
cp /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime
```

4.再次查看时间：

```shell
date -R
```

### 7.安装vim：

在普通用户中即可完成：

```shell
sudo apt-get install vim
```

完成vim的括号补全等功能：

```shell
vim ~/.vimrc
```

插入下列内容：

```shell
set number                                                                  
"show line number
au WinLeave * set nocursorline
au WinEnter * set cursorline
set cursorline
"Hightlight current line
inoremap [ []<Esc>i
inoremap ( ()<Esc>i
inoremap " ""<Esc>i
inoremap < <><Esc>i
inoremap { {<CR>}<Esc>o
"auto-complete
```

''后面的是行注释。

### 7.在虚拟机中配置samba与实体机中的Windows系统进行文件传输：

在普通用户中完成即可：

###### 1）安装samba：

```shell
sudo apt-get install samba
```

###### 2）修改samba的配置文件：

```shell
sudo vim /etc/samba/smb.conf
```

###### 3）在配置文件的最后添加共享文件夹：

```shell
[share]
comment = share directories
path = /home/nickal-jy
public = yes
writable = yes
read only = no
browseable = yes
create mask = 0644
directory mask = 0755
workgroup = WORKGROUP  
```

注意，第二行中的目录填写自己的用户目录。

###### 4）添加一个samba用户：

```shell
sudo smbpasswd -a nickal-jy
```

这里填写自己的用户名。

###### 5）修改共享文件权限：

```shell
sudo chmod -R go+rwx /home/nickal-jy
```

这里填写自己的用户名。

###### 6）重启samba服务:

```shell
sudo /etc/init.d/smbd restart
```

###### 7）安装网络工具：

```shell
sudo apt-get install net-tools
```

查看虚拟机的ip地址：

```shell
ifconfig
```

> inet 192.168.146.128

第二行中inet后面的数字就是虚拟机ip地址。
###### 8）进行网络互联：

在Windows中win+R，输入：\\\ip\share，ip指的是刚刚内串数字。

完成。

