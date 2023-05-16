# PWM脉宽调制信号
### 1.占空比与PWM脉宽调制信号：

- PWM——**pulse width modulation(脉冲宽度调制)**，实际上是模拟电路范畴的一种信号，但是我们可以通过单片机来实现PWM。
- 数字信号的周期：
  - 周期T的国际单位是s，频率f的国际单位是Hz，周期与频率的关系：**f = 1/T**
  -   ![image-20230312202652975](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230312202652975.png)
  - 从第一次信号的上升沿到第二次信号的上升沿所经历的时间，是一个周期。

- 占空比：
  - 在一个信号周期中，高电平所占的比例就是占空比。
  - ![image-20230312202957183](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230312202957183.png)
  - 通过面积等效原理可以得到：占空比越大，信号所对应的电压越大，如果该信号控制LED灯，那么LED灯就越亮，通过改变信号的占空比，可以实现呼吸灯。
  - 使用PWM信号还可以驱动电机产生不同的转速。


### 2.单片机实现PWM脉宽调制信号：

- 我们使用**计时器**来实现PWM脉宽调制信号。
- 基本思路：
  - 已知信号的周期，假设占空比是30%，那么周期的前30%时间内，让单片机对应的信号输出引脚输出高电平，之后输出低电平，这样就产生了PWM脉宽调制信号。

### 3.状态机的写法：

- 状态机：
  - 假设我们有多个状态，状态机就是可以使这些状态自动循环执行的一个程序。
  - 我们可以通过一个全局变量和switch语句(或者if语句)来实现状态机。

### 4.问题+解答：

- ![image-20230312205043192](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230312205043192.png)

- ```c
  #include <STC15F2K60S2.H>
  #include <intrins.h>
  //f = 100Hz, T = 0.01s = 10ms = 10000us  100us * 100times
  sbit S7 = P3^0;
  sbit L1 = P0^0;
  unsigned int count = 0;
  unsigned char Duty_Ratio;
  unsigned char Status;
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
  
  void Init_Timer0(void)
  {
  	TH0 = (65535 - 100) / 256;
  	TL0 = (65535 - 100) % 256;
  	
  	TR0 = 1;
  	TMOD = 0x00;
  	AUXR &= 0x7f;
  	EA = 1;
  	ET0 = 1;
  }//这里为什么定时100us呢，我们要记住，在用定时器产生PWM时，我们需要用周期除以100(分成100份)，得到的时间就是定时器的时间(一份)，然后在中断函数中设置全局变量count，用count的值来表示占空比。
  void Timer0_Routine(void) interrupt 1
  {
  	count++;
  	if (count > 100)
  		count = 0;//这个要放在一开始，当count = 101的时候，把count当成100，继续执行下面的if，这样就实现了连续的脉冲信号。
  	if (count <= Duty_Ratio)//这个if表示高电平的比例。
  	{
  		P2 = P2 & 0x1f | 0x80;
  		L1 = 1;
  		P2 &= 0x1f;
  	}
  	else if (count <= 100)//注意一定要是else if，表示低电平的比例。
  	{
  		P2 = P2 & 0x1f | 0x80;
  		L1 = 0;
  		P2 &= 0x1f;
  	}
  }
  void Eliminate_jitter(unsigned int t)
  {
  	while (t--){}
  }
  void Key_Proc(void)
  {
  	switch(Status)
  	{
  		case 0:
  			Duty_Ratio = 100;
  			Status = 1;//状态1表示亮度的20%
  			break;
  		case 1:
  			Duty_Ratio = 90;
  			Status = 2;//状态2表示亮度的50%
  			break;
  		case 2:
  			Duty_Ratio = 50;
  			Status = 3;//状态3表示亮度的90%
  			break;
  		case 3:
  			Duty_Ratio = 10;
  			Status = 0;//状态0表示熄灭。
  			break;
  	}
      //
  }
  void Key_Scan(void)
  {
  	if (S7 == 0)
  	{
  		Eliminate_jitter(100);
  		if (S7 == 0)
  		{
  			Key_Proc();
  			while (S7 == 0){}
  		}
  	}
  }
  void main(void)
  {
  	Close_Buzz();
  	Close_LED();
  	Init_Timer0();
  	while (1)
  	{
  		Key_Scan();
  	}
  }
  ```

- 完成一个呼吸灯效果的程序，按S7打开LED灯并且进入呼吸灯模式，再次按S7关闭LED灯。PWM脉宽信号频率为50Hz。

- ```c
  //50 Hz = 0.02s  20ms = 20 000us  100*200us
  #include <STC15F2K60S2.H>
  #include <intrins.h>
  sbit S5 = P3^2;
  unsigned int count = 0;
  unsigned char Duty_Ratio;
  unsigned char status;
  void Delay500ms()		//@11.0592MHz
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
  }//不同占空比的PWM脉冲信号之间的延迟时间，有延迟就能产生呼吸的效果。
  
  void Close_LED(void)
  {
  	P2 = P2 & 0x1f | 0x80;
  	P0 = 0xff;
  	P2 &= 0x1f;
  }
  void Open_LED(void)
  {
  	P2 = P2 & 0x1f | 0x80;
  	P0 = 0x00;
  	P2 &= 0x1f;
  }
  void Init_STC(void)
  {
  	P2 = P2 & 0x1f | 0x80;
  	P0 = 0xff;
  	P2 &= 0x1f;
  	
  	P2 = P2 & 0x1f | 0xa0;
  	P0 &= 0xbf;
  	P2 &= 0x1f;
  }
  void Init_Timer0(void)
  {
  	TH0 = (65535 - 200) / 256;
  	TL0 = (65535 - 200) % 256;
  	
  	TR0 = 1;
  	TMOD = 0x00;
  	AUXR &= 0x7f;
  	EA = 1;
  	ET0 = 1;
  }
  void Timer0_Routine(void) interrupt 1
  {
  	count++;
  	if (count == 101)
  		count = 0;
  	if (count <= Duty_Ratio)
  	{
  		Close_LED();
  	}
  	else 
  	{
  		Open_LED();
  	}
  }//采用定时器，通过对count计数的方式产生特定占空比的信号。
  void Init_INT0(void)
  {
  	PX0 = 1;//这个要注意，这表示外部中断0的优先级是最高的。
  	IT0 = 1;
  	EA = 1;
  	EX0 = 1;
  }//对外部中断0进行初始化，我们要通过按键S4来控制LED灯的开关。
  void Eliminate_jitter(unsigned int t)
  {
  	while (t--){}
  }
  void INT0_Routine(void) interrupt 0
  {
  	Eliminate_jitter(100);//在中断函数里面执行消抖操作很重要哦。当按键被按下的时候，由于产生下降沿信号，因此进入中断，这里我们还需要消抖，因为会产生干扰信号。
  	if (S5 == 0)
  		status = !status;//由于这个中断是下降沿触发的，不是低电平触发，因此我们不需要再写一个while循环。
      //通过status这个全局变量来控制两种不同的状态。
  }
  
  void Key_Proc(unsigned char status)
  {
  	if (status)//状态1，产生呼吸灯效果，由于呼吸灯要一直产生，以你这个Key_Proc函数要放在主函数里直接运行，即让这个函数反复被执行。
  	{
  		  TR0 = 1;
  			Duty_Ratio = 100;
  			Delay500ms();
  			Duty_Ratio = 90;
  			Delay500ms();
  			Duty_Ratio = 80;
  			Delay500ms();
  			Duty_Ratio = 70;
  			Delay500ms();
  			Duty_Ratio = 60;
  			Delay500ms();
  			Duty_Ratio = 50;
  			Delay500ms();
  			Duty_Ratio = 40;
  			Delay500ms();
  			Duty_Ratio = 30;
  			Delay500ms();
  			Duty_Ratio = 20;
  			Delay500ms();
  			Duty_Ratio = 10;
  			Delay500ms();
  			Duty_Ratio = 0;
  			Delay500ms();
  			Duty_Ratio = 10;
  			Delay500ms();
  			Duty_Ratio = 20;
  			Delay500ms();
  			Duty_Ratio = 30;
  			Delay500ms();
  			Duty_Ratio = 40;
  			Delay500ms();
  			Duty_Ratio = 50;
  			Delay500ms();
  			Duty_Ratio = 60;
  			Delay500ms();
  			Duty_Ratio = 70;
  			Delay500ms();
  			Duty_Ratio = 80;
  			Delay500ms();
  			Duty_Ratio = 90;
  			Delay500ms();
  	}
  	else//状态2，让计时器停止计时，此时就不会产生中断，那么status的值保持不变，我们再把LED灯全部关掉，这样就达到关闭LED效果。
  	{
  		TR0 = 0;
  		Close_LED();
  	}
  }
  
  void main(void)
  {
  	Init_STC();
  	Init_Timer0();
  	Init_INT0();
  	while (1)
  	{
  		Key_Proc(status);
  	}
  }
  ```
  
  