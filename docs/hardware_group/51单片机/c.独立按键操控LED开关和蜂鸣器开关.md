# 独立按键
### 1.独立按键介绍：

- ![image-20230227172728065](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230227172728065.png)

![image-20230227172849842](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230227172849842.png)

- J5这个跳线的2号口跳接3号口的时候，此时选择工作的是独立键盘，也就是S7,S6,S5,S4。此时J5的2号接口输入到这四个独立键盘中的是低电平。
- 按键分析：每个按键都有四个接口，其中两两短接，相当于只有两个接口，当按键的弹簧片按下的时候，电路连通。
- **上拉电阻**：对于开发板上面的按键来讲，都受到上拉电阻的控制，我们拿S7这个按键举例：
  - ![image-20230228232103795](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230228232103795.png)
  - 当S7断开的时候，VCC与上拉电阻相连，此时输入引脚P30接收到的信号是高电平，即高电平写入到P30所对应的寄存器中。
  - 当S7连通的时候，P30这个输入引脚相当于直接接地，因此低电平写入到P30所对应的寄存器中。

- 因此，我们可以根据输入引脚所对应的寄存器来检测是独立键盘是否启动。

### 2.sbit和sfr：

- 简要理解sfr：
  - sfr指的是特殊功能寄存器(单片机中有功能的I/O口就是特殊功能寄存器)，在单片机中，特殊功能寄存器是直接用地址表示的，为了方便操作，我们定义一个变量来表示特殊功能寄存器，sfr就是执行这一操作的。
  - sfr P0   =   0x80;将0x80这个地址的特殊功能寄存器用P0这个变量表示。
- 简要理解sbit：
  - 使用sbit可以取出特殊功能寄存器中的某一位，相当于是一个位变量声明。
  - sbit P0_0   =   P0^0;表示的意义是：P0是一个特殊功能寄存器，用P0_0这个变量来表示P0这个寄存器的第 0位。因此P0_0这个变量的大小就是1bit。
  - 当然，我们也可以这样写，sbit P0_0 = 0x80 ^ 0，0x80本身就表示特殊功能寄存器的地址，因此这样做和上面等价。
  - 使用sbit也可以重复声明，sbit led_1 = P0^0，更改led_1的值，P0_0的值也随着一起更改。

### 3.具体实验：

- 按s7打开led灯，s6关闭led灯，s5打开蜂鸣器，s4关闭蜂鸣器。

```c
#include <STC15F2K60S2.H>
sbit S7 = P3^0;
sbit S6 = P3^1;
sbit S5 = P3^2;
sbit S4 = P3^3;
void close_buzz(void)
{
	P2 = P2 & 0x1f | 0xa0;
	P0 &= 0xbf;//让P0寄存器的第6位位0，其余位保持不变，完成关闭蜂鸣器。
	P2 &= 0x1f;
}
void open_LED(void)
{
	P2 = P2 & 0x1f | 0x80;
	P0 = 0x00;
	P2 &= 0x1f;
}
void close_LED(void)
{
	P2 = P2 & 0x1f | 0x80;
	P0 = 0xff;
	P2 &= 0x1f;
}
void open_buzz(void)
{
	P2 = P2 & 0x1f | 0xa0;
	P0 |= 0x40;//让P0寄存器的第6位位1，其余位保持不变，完成开启蜂鸣器。
	P2 &= 0x1f;
}
void main(void)
{
		close_buzz();
		while (1)
		{
			if (S7 == 0)
				open_LED();
			if (S6 == 0)
				close_LED();
			if (S5 == 0)
				open_buzz();
			if (S4 == 0)
				close_buzz();
		}
}
```

##### 在这个实验中，我们来好好分析一下蜂鸣器的操作：

- ![image-20230227202822715](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230227202822715.png)
- 在74HC573中我们可以发现，当Y5C以高电平连通LE端时，P06端口控制ULN2003中N_BUZZ端口，P06端口为0时，N_BUZZ也为0，蜂鸣器关闭，反之蜂鸣器启动。

![image-20230227202958903](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230227202958903.png)

- P27,P26,P25为101的时候，选通Y5端口，且为0。

![image-20230227203035861](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230227203035861.png)

- 当Y5为0的时候，且J13跳线2-3短接，此时Y5C为1。
