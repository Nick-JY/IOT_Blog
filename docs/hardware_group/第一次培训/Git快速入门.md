# Git快速入门：

### 一、Git与Github互连：

##### 1.配置 Git 用户信息：

- ``git config --global user.name "用户名"``
- ``git config --global user.email "邮箱"``

##### 2.查看Git用户信息：

- ``git config user.name``获取当前用户名。
- ``git config user.email``获取当前邮箱。

##### 3.Git连接GitHub：

- ``sudo apt install ssh``，Ubuntu环境下安装ssh。

  - Windows环境下不需要安装。

- 查看主目录下有没有**.ssh**这个隐藏文件，没有的话生成SSH。

- 生成SSH KEY``ssh-keygen -t rsa -C "邮箱"``。

- 进入 **/root/.ssh**目录，查看**id_rsa**和**id_rsa.pub**文件，将**id_rsa.pub**的内容复制到Github。

  - Windows环境下在C盘的user目录。

- ```
  ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCPHZ6qCMUmdZCTfdJUkGXwmJVC3Nkm1HsT0i7boKBLJ5qG+eLk1HjkhuNKSNA3X46PD+eDg9bD/Cbyc+euZz9qy7HBLiGRB7VZhTRhLD98b//P1tTipaeoATr0+Sl2jTzZcty79htzyKQi1dEHiiJmyPdjNb+f6HFSEx360+wJ3kYwn+um8VwG2b8fWY1G2lZguBt+1N7rH+WlLmAShmSxJn4cXywWfnKQi6tU3XxJaGqyTheJNRtU9Y+fCIPmFHmwk1lWRCRZj3zSStoPHbWHFKcg2WuT8pc7HixPgmo2CZZl+U9eLio7QWej3cJDlwtehr0LXHDy6XXZImS2xm3pH6l7nyMyVqb4QfynTFBURhvJm+FnRopwSflaEhDTwmkB0nGNTzAVGXnRRwXcb0DBj+ukN9tXx03RHNekok3DEOMR9BxDdkekOVOCpJDuCVUqtR92LzFYNy4evFb54j5sabSbzHeZs0V4NLalcvyY64Vx9gb4EaVNQhX2di57aT8= 邮箱
  ```

### 二、Git的提交命令：

- git remote add origin git@github.com:用户名/仓库名.git
- git push origin 本地分支名:远程分支名

### 三、廖雪峰的Git笔记：

- 强推廖雪峰的Git笔记：
  - [Git教程 - 廖雪峰的官方网站 (liaoxuefeng.com)](https://www.liaoxuefeng.com/wiki/896043488029600)
