# LED灯点亮及延时
### 1.如何进行LED灯点亮：

##### 在该开发板上点亮LED灯是一个比较复杂的事情：

- 涉及到IAP15F2K61S2单片机的一组控制LED灯的寄存器P0；
  - ![image-20230227104655792](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230227104655792.png)

- 涉及到74HC573锁存器芯片；
  - ![image-20230227104814652](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230227104814652.png)

- 涉及到74HC138三-八译码器芯片；
  - ![image-20230227104906408](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230227104906408.png)

- 涉及到74HC02二输入或非门；
  - ![image-20230227105031372](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230227105031372.png)

### 2.分析过程：

a.直接控制LED灯的是74HC573锁存器，很明显可以看出，点亮LED灯，需要将I/0端的P0寄存器的相应位掷低电平。

b.该开发板有两种编程模式，由J13这个跳线控制，当2-3短接的时候，是I/O编程；当2-1短接的时候，编程模式为MM编程(存储器映射)。

c.我们会发现，当74HC573芯片的LE接口与Y4C端口相连，并且输入高电平，74HC573才控制LED灯，因此74HC138要选择Y4进行输出。

d.通过74HC02可知，当4B和Y4(4A)端口都为0时，Y4C为1。这里我们需要分析一下跳线，CT107D开发板的用户手册中明确说明：J13负责控制编程模式：

- ![image-20230227125132278](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230227125132278.png)
- ![image-20230227125204289](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230227125204289.png)
- j13的跳线模式是2-3，因此2号口的输出信号是3号口的低电平。因此74HC02芯片的4B输入口是低电平。**我们不需要操控P4这个寄存器。**



e.点亮LED灯之后，我们需要把锁存器锁死，这里我们采用的是将74HC138芯片的输出Y0这个无效数据，此时锁存器就不能被访问，但LED灯依旧是点亮状态。

**以上就是点亮一个LED灯的具体步骤。**

### 3.问题分析：

##### 1).LED灯亮灭控制：

```c
#include <STC15F2K60S2.H>
#include <intrins.h>
void close_buzz(void)
{
	P2 = P2 & 0x1f | 0xa0;
	P0 = 0x00;
	P2 &= 0x1f;
}
void Delay1000ms()		//@11.0592MHz
{
	unsigned char i, j, k;

	_nop_();//由于有nop函数，因此要引入头文件intrins.h
	i = 8;
	j = 1;
	k = 243;
	do
	{
		do
		{
			while (--k);
		} while (--j);
	} while (--i);
}

void main(void)
{
	close_buzz();
	while (1)
	{	
		P2 = P2 & 0x1f | 0x80;//将P2寄存器设置为100x xxxx;Y4 = 0;
		//上述操作将74HC573设置为控制LED灯.
		P0 = 0xfe;//打开第一个LED灯.
		P2 &= 0x1f;//将锁存器锁死.
		Delay1000ms();//延时1s.
		
		P2 = P2 & 0x1f | 0x80;
		P0 = 0xff;//关闭所有的LED灯.
		P2 &= 0x1f;
		Delay1000ms();
	}
}
```



##### 2).LED灯位移控制：

```c
#include <STC15F2K60S2.H>
#include <intrins.h>
void close_buzz(void)
{
	P2 = P2 & 0x1f | 0xa0;
	P0 = 0x00;
	P2 &= 0x1f;
}
void Delay2000ms()		//@11.0592MHz
{
	unsigned char i, j, k;

	_nop_();
	i = 15;
	j = 2;
	k = 235;
	do
	{
		do
		{
			while (--k);
		} while (--j);
	} while (--i);
}


void main(void)
{
	unsigned char i;//注意，keil写C的时候，变量的定义要放在最开始。
	close_buzz();
	while (1)
	{	
		for (i = 0 ; i <= 8 ; i++)
		{
			P2 = P2 & 0x1f | 0x80;//将74HC573选通控制LED灯。
			P0 = 0xff << i;//按照从低位到高位的顺序，每次都多点亮一个灯。并且初始状态是全部灭掉。
			P2 &= 0x1f;
			Delay2000ms();
		}
	}
}
```



##### 3).LED流水灯:

```c
#include <STC15F2K60S2.H>
#include <intrins.h>
void close_buzz(void)
{
	P2 = P2 & 0x1f | 0xa0;
	P0 = 0x00;
	P2 &= 0x1f;
}
void Delay2000ms()		//@11.0592MHz
{
	unsigned char i, j, k;

	_nop_();
	i = 15;
	j = 2;
	k = 235;
	do
	{
		do
		{
			while (--k);
		} while (--j);
	} while (--i);
}


void main(void)
{
	unsigned char i;
	close_buzz();
	while (1)
	{	
		for (i = 0 ; i < 8 ; i++)
		{
			P2 = P2 & 0x1f | 0x80;
			P0 = ~(0x01 << i);//初始状态是第一个灯亮，想法是在P0寄存器中，0在0~7中循环，因此可以考虑把0000 0001依次左移再取反，这样就形成了0在0~7中u循环。
			P2 &= 0x1f;
			Delay2000ms();
		}
	}
}
```

