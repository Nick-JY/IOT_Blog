# 矩阵键盘
### 1.51单片机双向I/O口：

- 我们在STC15F2K60S2这个单片机的操作手册中可以看到：
  - ![image-20230303195126672](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230303195126672.png)

- STC15系列单片机上电复位后，所有的I/O口都符合：准双向口/弱上拉。

  - 双向口：双向口指的是单片机的引脚既能做输出引脚，也能做输入引脚。

  - 弱上拉：

    - 首先，无论是强上拉还是弱上拉，引脚都会连接一个上拉电阻，当上拉电阻阻值较大的时候，称为弱上拉；反之称为强上拉。
    - ![image-20230303200303344](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230303200303344.png)

    - 当P0端**“输出”**高电平的时候，能够输出的电流很小，很容易被拉低，即拉成低电平。
    - 当P0端**“输出”**低电平的时候，如果连通别的引脚，可以很容易使别的引脚的上拉电阻失去效果，即成为低电平。

### 2.矩阵键盘的原理分析：

- ![image-20230303204119433](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230303204119433.png)

- 当把J5这个跳线配置成2-1的时候，矩阵键盘被接通。

- 我们单独分析其中的一个按键：

  - ![image-20230303210344801](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230303210344801.png)

  - 对于上面这个按键来讲，连通两个I/O接口。其中，每个I/O接口都是符合双向输出/弱上拉的，因此都有上拉电阻。
  - 上图如何判断按键被按下：
    - 方式一：P30输入高电平，当按键不按下的时候，P44端受到上拉电阻的影响，输出高电平；当P30输入高电平的时候，当按键按下的时候，P44端直接输出高电平，这样的话就无法检测按键是否按下。**这种方式行不通**
    - 方拾二：P30输入低电平，当按键不按下的时候，P44端受到上拉电阻的影响，输出高电平；当P30输入低电平的时候，当按键按下的时候，P44端直接输出低电平，由于P44端有不同的电平输出变化，因此可以检测按键是否按下。
  - 由于是矩阵键盘，分为行和列，我们的思路是对每一行的各个列进行扫描：
    - ![image-20230303204119433](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230303204119433.png)
    - 检测第一行，将P30设置为低电平，然后扫描P44,P42,P35,P34这四个引脚的电平，如果检测出低电平，说明对应位置的按键被按下。
    - 检测第一行的时候，P31,P32,P33设置为高电平。
    - 注意按键消抖处理。
  - 这里的扫描操作其实和动态点亮数码管的扫描操作异曲同工，都是利用程序执行速度快，人眼有延迟这一特性。

### 3.问题+代码：

- 在扫描按键的过程中，发现有按键触发信号后 ，待按键松开后，在前两个数码管上显示相应的数字:从左至右，从上倒下，依次显示0~15。

- ```c
  #include <STC15F2K60S2.H>
  #include <intrins.h>
  
  sbit R1 = P3^0;
  sbit R2 = P3^1;
  sbit R3 = P3^2;
  sbit R4 = P3^3;//矩阵键盘的行引脚
  
  sbit C1 = P4^4;
  sbit C2 = P4^2;
  sbit C3 = P3^5;
  sbit C4 = P3^4;//矩阵键盘的列引脚
  
  code unsigned char SMG[] = {0xc0 , 0xf9 , 0xa4 , 0xb0 , 0x99 , 0x92 , 0x82 , 0xf8 , 0x80 , 0x90};
  unsigned char Key_value;//为每个按键都创建一个键值
  
  void Delay2ms()		//@11.0592MHz
  {
  	unsigned char i, j;
  
  	_nop_();
  	_nop_();
  	i = 22;
  	j = 128;
  	do
  	{
  		while (--j);
  	} while (--i);
  }//这个2ms的延迟函数是动态显示数码管的。
  
  void Close_Buzz(void)
  {
  	P2 = P2 & 0x1f | 0xa0;
  	P0 &= 0xbf;
  	P2 &= 0x1f;
  }
  void Close_LED(void)
  {
  	P2 = P2 & 0x1f | 0x80;
  	P0 = 0xff;
  	P2 &= 0x1f;
  }
  //**********
  void Static_Display(unsigned char num , unsigned char i)
  {
  	P2 = P2 & 0x1f | 0xc0;
  	P0 = 0x01 << (i-1);
  	P2 &= 0x1f;
  	
  	P2 = P2 & 0x1f | 0xe0;
  	P0 = num;
  	P2 &= 0x1f;
  }
  void Dynamic_Display(void)
  {
  	Static_Display(SMG[Key_value / 10] , 1);
  	Delay2ms();
  	Static_Display(SMG[Key_value % 10] , 2);
  	Delay2ms();
  }
  //这部分是动态显示数码管，前两个数码管显示对应的数字。
  //**********
  void Delay100ms()		//@11.0592MHz
  {
  	unsigned char t = 10;
  	while (t--)
  		Dynamic_Display();
  }
  //由于我们有动态显示数码管这一个要求，并且按键需要延迟函数去抖动，因此我们在去抖动函数里面需要加上动态显示函数，要不然不能恒定显示。
  void Key_Scan(void)//按键检测函数，扫描的原理本质上就是函数执行速度很快，连续不断的对这四行按键进行扫描。
  {
  	R1 = 0;
  	R2 = R3 = R4 = 1;
  	Dynamic_Display();//在这个函数中调用动态显示函数目的是当按键弹起的时候数码管依旧正常显示。	
      //写一个其实就行，但是我们为了整齐，写四个。
  	if (C1 == 0){Delay100ms(); if (C1 == 0){Key_value = 0;Dynamic_Display();}}
  	else if (C2 == 0){Delay100ms(); if (C2 == 0){Key_value = 1;Dynamic_Display();}}
  	else if (C3 == 0){Delay100ms(); if (C3 == 0){Key_value = 2;Dynamic_Display();}}
  	else if (C4 == 0){Delay100ms(); if (C4 == 0){Key_value = 3;Dynamic_Display();}}
  	
  	R2 = 0;
  	R1 = R3 = R4 = 1;
  	Dynamic_Display();
  	if (C1 == 0){Delay100ms(); if (C1 == 0){Key_value = 4;Dynamic_Display();}}
  	else if (C2 == 0){Delay100ms(); if (C2 == 0){Key_value = 5;Dynamic_Display();}}
  	else if (C3 == 0){Delay100ms(); if (C3 == 0){Key_value = 6;Dynamic_Display();}}
  	else if (C4 == 0){Delay100ms(); if (C4 == 0){Key_value = 7;Dynamic_Display();}}
  	
  	R3 = 0;
  	R1 = R2 = R4 = 1;
  	Dynamic_Display();
  	if (C1 == 0){Delay100ms(); if (C1 == 0){Key_value = 8;Dynamic_Display();}}
  	else if (C2 == 0){Delay100ms(); if (C2 == 0){Key_value = 9;Dynamic_Display();}}
  	else if (C3 == 0){Delay100ms(); if (C3 == 0){Key_value = 10;Dynamic_Display();}}
  	else if (C4 == 0){Delay100ms(); if (C4 == 0){Key_value = 11;Dynamic_Display();}}
  
  	R4 = 0;
  	R1 = R2 = R3 = 1;
  	Dynamic_Display();
  	if (C1 == 0){Delay100ms(); if (C1 == 0){Key_value = 12;Dynamic_Display();}}
  	else if (C2 == 0){Delay100ms(); if (C2 == 0){Key_value = 13;Dynamic_Display();}}
  	else if (C3 == 0){Delay100ms(); if (C3 == 0){Key_value = 14;Dynamic_Display();}}
  	else if (C4 == 0){Delay100ms(); if (C4 == 0){Key_value = 15;Dynamic_Display();}}
  	
  }
  void main(void)
  {
  	Close_Buzz();
  	Close_LED();
  	while (1)
  	{
  		Key_Scan();
  		//Dynamic_Display();
  	}
  }
  ```
  
- 