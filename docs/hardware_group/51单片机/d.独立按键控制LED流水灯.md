# 独立按键消抖
### 1.按键消抖(eliminate jitter)：

- 为什么要执行按键消抖：
  - 我们以独立按键进行分析：按键的输入引脚有低电平产生不一定意味着对应按键被按下，也可能是干扰信号使得产生按键被按下的效果。
  - 实际操作中，假设S7从低位到高位点亮LED流水灯，S6从高到低位点亮LED流水灯。我们按S7，正常执行，执行完毕之后按S6，此时如果没有消抖函数，S7的操作可能会继续执行，因为可能产生使S7工作的干扰信号(在写代码的时候，S7在S6上面，因此干扰信号会优先于S6按键信号，也就是S7的功能被执行)。
  - 因此在实际过程中，我们要使用消抖函数。如果使用消抖函数之后，依旧会产生上面的情况，说明消抖的延迟时间比较低(测试过程中，10ms、20ms的消抖延迟也会产生错误，使用100ms可大大降低错误产生率)。
  - ![image-20230301125839014](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230301125839014.png)

### 2.按键扫描函数和按键操作函数：

- 对于按键的一系列操作，使用模块化编程的思想，我们通常写一个按键扫描函数(用于判断哪个按键被按下，这里面需要进行按键消抖，防止干扰信号对执行效果的干扰)
- 按键操作函数里面写对应按键执行的操作，一般使用switch语句，注意每一条语句之后要写break，default可以不写。

### 3.代码分析：

- ```c
  #include <STC15F2K60S2.H>
  #include <intrins.h>
  sbit S7 = P3^0;
  sbit S6 = P3^1;
  sbit S5 = P3^2;
  sbit S4 = P3^3;
  void close_buzz(void)
  {
  	P2 = P2 & 0x1f | 0xa0;
  	P0 &= 0xbf;
  	P2 &= 0x1f;
  }
  void Delay100ms()		//@11.0592MHz
  {
  	unsigned char i, j, k;
  
  	_nop_();
  	_nop_();
  	i = 5;
  	j = 52;
  	k = 195;
  	do
  	{
  		do
  		{
  			while (--k);
  		} while (--j);
  	} while (--i);
  }
  //这个100ms的延迟函数是按键消抖用的。
  
  void Delay1000ms()		//@11.0592MHz
  {
  	unsigned char i, j, k;
  
  	_nop_();
  	_nop_();
  	i = 43;
  	j = 6;
  	k = 203;
  	do
  	{
  		do
  		{
  			while (--k);
  		} while (--j);
  	} while (--i);
  }
  //1000ms的延迟函数是用来控制LED灯闪烁的函数。
  void key_proc(unsigned char key_value)
  {
  	unsigned int i;
  	while (P3 != 0xff)
  	{//这个while循环要特别注意：这个while循环的目的是防止一次按键按下反复执行该按键对应的功能，其他按键失效。
       //当按键按下，弹起之后，P3寄存器的值为0xff,只有再次按下按键的时候，才会执行操作。
       //并且，为了强调执行的顺序：先扫描，在执行功能，我们把该函数作为按键扫描函数的一部分。
  		switch(key_value)
  		{
  			case 1: 
  				for (i = 0 ; i < 8 ; i++)
  				{
  					P2 = P2 & 0x1f | 0x80;
  					P0 = ~(0x01 << i);
  					P2 &= 0x1f;
  					Delay1000ms();
  				}
  				break;
  			case 2:
  				for (i = 0 ; i < 8 ; i++)
  				{
  					P2 = P2 & 0x1f | 0x80;
  					P0 = ~(0x80 >> i);
  					P2 &= 0x1f;
  					Delay1000ms();
  				}
  				break;
  			case 3:
  				for (i = 0 ; i < 8 ; i++)
  				{
  					P2 = P2 & 0x1f | 0x80;
  					P0 = 0xfe << i;
  					P2 &= 0x1f;
  					Delay1000ms();
  				}
  				break;
  			case 4:
  				for (i = 0 ; i < 8 ; i++)
  				{
  					P2 = P2 & 0x1f | 0x80;
  					P0 = 0x7f >> i;
  					P2 &= 0x1f;
  					Delay1000ms();
  				}
  				break;
  		}
  	}
  }
  void read_key(void)
  {
  	if (S7 == 0)
  	{
  		Delay100ms();//执行消抖，
  		if (S7 == 0)//继续判断按键是否被按下，如果是干扰信号的话，这一条正常不会被执行。
  			key_proc(1);
  	}
  	if (S6 == 0)
  	{
  		Delay100ms();
  		if (S6 == 0)
  			key_proc(2);
  	}
  	if (S5 == 0)
  	{
  			Delay100ms();
  		if (S5 == 0)
  			key_proc(3);
  	}
  	if (S4 == 0)
  	{
  		Delay100ms();
  		if (S4 == 0)
  			key_proc(4);
  	}
  }
  
  
  
  void main(void)
  {
  	close_buzz();
  	while (1)
  	{
  		read_key();//read_key函数一直被反复执行，也就是处于待接收按键状态。
  	}
  }
  ```

  
