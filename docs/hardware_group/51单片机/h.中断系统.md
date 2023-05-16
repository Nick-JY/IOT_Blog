# 中断系统及外部中断
### 1.中断系统的简单理解：

- 你正在追电视剧《神雕侠侣》,正看得入迷的时候，电话响了，你暂停电视剧，去接电话，在接电话的过程中，门铃又响了，你暂时放下电话，去把门打开。如果追电视剧是在**执行主程序**，那么电话就是**中断源**，电话铃响了就是**中断请求**，暂停电视就是**现场保护**，接电话就是**中断响应**，门铃响了是**更高一级的中断请求**，去把门打开，那就是**中断嵌套**。开完门回来接着聊电话，那是**中断返回(嵌套中断退回到上一层中断)**，接完电话把电视剧暂停打开就是**现场恢复**。

### 2.51单片机的中断系统：

- 单片机与外设之间的交互有两种方式：**轮询**和**中断**，轮询一般指的是在main函数中循环执行指令，使得单片机和外设之间进行交互；中断可以忽视main函数中的指令，直接让单片机执行中断响应。
- ![image-20230306211627607](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230306211627607.png)
- 上述是STC15F2K60S2的中断系统结构图，一共有14个中断源，我们拿INT0这个中断来讲解：
  - 从左到右观察上图：
  - 首先，TCON这个寄存器中的IT0 = 1的时候，是下降沿触发中断，IT0 = 0是上升沿或下降沿触发中断。
  - 接着，IE寄存器中的EX0 = 1，表示CPU允许INT0这个中断执行，反之不允许。
  - 接着，IE寄存器中的EA = 1，表示CPU允许所有中断，反之不允许。
  - 这样我们就接通了这个INT0中断。
  - ![image-20230306212941511](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230306212941511.png)
  - P32这个接口是直接控制INT0这个中断的，当单片机检测到P32这一位的信号为下降沿的时候，触发INT0这个中断。
  - ![image-20230306213127702](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230306213127702.png)
  - 我们可以直接通过S5这个**独立按键**来操作P32这一位，当按下S5的时候，信号产生下降沿，触发INT0。


### 3.中断寄存器：

- 基本的中断寄存器：
  - IE(Interrupt Enable)![image-20230306213450272](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230306213450272.png)
  - ![image-20230306213559258](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230306213559258.png)
  - IP(Interrupt Priority)![image-20230306213721218](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230306213721218.png)
  - ![image-20230306213736101](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230306213736101.png)
  - TCON(定时器/计数器控制寄存器)![image-20230306213938095](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230306213938095.png)
  - ![image-20230306214000474](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230306214000474.png)
  - SCON(串行口控制寄存器)![image-20230306214055612](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230306214055612.png)
  - ![image-20230306214120682](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230306214120682.png)

### 4.中断服务函数：

- 中断服务函数一般由两部分组成：**中断初始化函数**和**中断服务函数**。
- 中断初始化函数用来让CPU允许某个中断的执行，并且说明如何执行这个中断。
  - 一般来讲，INT0这个中断的初始化函数名称：``void Init_INT0(void)``
- 中断服务函数是中断的响应内容。
  - 中断服务函数的名称：``void INT0_Routine(void) interrupt 0``
  - **interrupt**关键字表明这是一个中断函数。中断函数不需要写在main中。
  - 0**(中断号)**是INT0这个中断源的**入口地址**，又叫**中断向量**，0这个符号代表0x0003H，C语言为了方便，直接用0来代替这个地址。
  - ![image-20230306215241429](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230306215241429.png)
  - 根据上图，中断号按顺序从0~20。

### 5.问题+代码：

- 在CT107D单片机综合训练平台上，首先将J5处的跳帽接到2~3引脚，即s5按键接到P32/INT0，S4按键接到P33/INT1。定义一个Working0函数，使L1指示灯不断闪烁。将P32引脚定义成外部中断功能，按键S5按键就会产生外部中断触发信号，在中断响应函数中，点亮L8指示灯，延时一段较长的时间后熄灭。

- ```c
  #include <STC15F2K60S2.H>
  #include <intrins.h>
  void Delay500ms()		//@11.0592MHz
  {
  	unsigned char i, j, k;
  
  	_nop_();
  	_nop_();
  	i = 22;
  	j = 3;
  	k = 227;
  	do
  	{
  		do
  		{
  			while (--k);
  		} while (--j);
  	} while (--i);
  }
  void Delay1500ms()		//@11.0592MHz
  {
  	unsigned char i, j, k;
  
  	_nop_();
  	_nop_();
  	i = 40;
  	j = 9;
  	k = 179;
  	do
  	{
  		do
  		{
  			while (--k);
  		} while (--j);
  	} while (--i);
  }
  
  void Close_Buzz(void)
  {
  	P2 = P2 & 0x1f | 0xa0;
  	P0 &= 0xbf;
  	P2 &= 0x1f;
  }
  void working(void)
  {
  	P2 = P2 & 0x1f | 0x80;
  	P0 = 0xfe;
  	P2 &= 0x1f;
  	Delay500ms();
  	
  	P2 = P2 & 0x1f | 0x80;
  	P0 = 0xff;
  	P2 &= 0x1f;
  	Delay500ms();
  }//这个函数能够使L1这个LED灯一直闪烁。
  void Init_INT0(void)//中断初始化函数，这个函数是INT0（外部中断0）这个中断的初始化。
  {
  	EA = 1;//EA位于IE（Interrupt Enable寄存器的第7位），1表示CPU开放所有中断，0表示CPU拒绝所有中断请求。
  	EX0 = 1;//EX0位于IE寄存器，是INT0中断的使能端，1表示CPU开放INT0中断，0表示CPU拒绝INT0中断请求。
  	IT0 = 1;//IT0位于TCON（定时器/计数器控制寄存器）,1表示INT0中断的触发方式是下降沿触发，0表示INT0中断的触发方式是上升沿或下降沿触发。
  }
  void INT0_Routine(void) interrupt 0//中断服务函数，这里执行中断的一系列操作，即中断响应。
  {
  	P2 = P2 & 0x1f | 0x80;
  	P0 &= 0x7f;
  	P2 &= 0x1f;
  	Delay1500ms();//这个中断响应是将L8这个LED灯打开，常亮1500ms.
  }
  void main(void)
  {
  	Close_Buzz();
  	Init_INT0();//我们把中断初始化函数放在main中的一开始执行，即在一开始就允许INT0中断的执行。
  	while (1)
  	{
  		working();
  	}
  }
  ```

  ### 7.中断的处理过程：

- ![image-20230306220259956](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230306220259956.png)