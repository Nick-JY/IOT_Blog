# 中断系统及定时器
### 1.定时器与计数器的基本原理：

- 51单片机的定时器与计数器本质上是一个16位的寄存器(这个16位寄存器是由两个8位的寄存器组成的)
- STC15F4K60S4系列单片机内部含有5个16位定时器/计数器：T0,T1,T2,T3,T4。这五个十六位寄存器都含有计数器和定时器两种功能。
- 定时器和计数器的核心部件是一个**加法计数器**，其本质是对**脉冲进行计数**,二者的区别就是脉冲的来源不同。
  - 如果计数脉冲来自**系统时钟**，则执行定时功能，检测到一个计数脉冲，寄存器+1。(因为脉冲的周期不变，脉冲周期 x 计数器计数次数 = 定时时间)。
    - 对于STC15F4K60S4系列单片机，计数脉冲可以是**系统时钟不分频**,也可以是**系统时钟十二分频**。
    - 这里我们需要明确：周期 = 1/频率。
    - **1/1MHz = 1us**(对于十二分频的时钟信号，每计数一次，经过时间是1us)
  - 如果计数脉冲来自**单片机外部引脚((TO为P3.4，T1为P3.5，T2为P3.1，T3为PO.7，T4为PO.5)**，则执行计数功能，检测到一个计数脉冲，寄存器+1。(因为外部脉冲信号一般来讲周期不定，因此只执行计数功能)。
- 当定时器/计数器的计数达到寄存器的最大值(**16位最大值是65535**)之后，会向CPU请求中断。
- 对于该系列的单片机，定时器/计数器0有四种工作模式：
  - 模式0：16位自动重装载模式。
    - 对于16位寄存器来讲，取值范围是0~65535，假设寄存器的初始值是20000，当寄存器计数达到65535之后，再一次计数，寄存器的值会溢出，此时寄存器会自动装载20000这个值。
  - 模式1：16位不可自动重装载模式。
    - 假设寄存器初始值是20000，当寄存器达到65535之后，再一次计数，寄存器会溢出，此时寄存器的值被清零。
  - 模式2：8位自动重装载模式。
  - 模式3：不可屏蔽中断的16位自动重装载模式。
- 定时器/计数器1有三种工作模式：
  - 与定时器/计数器0的前三种模式相同，没有第四种模式。
- 定时器/计数器2,3,4只有一种工作模式:
  - 16位自动重装载模式。

### 2.定时器与计数器相关的寄存器：

- ![image-20230307232447796](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230307232447796.png)
  - 对于上面这个寄存器，如果我们使用的是T0或者T1，需要设置TR0和TR1。
  - 我们需要了解一下TF0和TF1，这里我们只说TF0，当寄存器溢出的时候(计数达到最大值之后，又加1)，硬件会自动将这一位置位1，然后向CPU发送中断请求，当中断响应时，这一位被硬件置位0。
- ![image-20230307233722104](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230307233722104.png)![image-20230307233755400](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230307233755400.png)
  - 重点是：这个寄存器不能位寻址，因此不能使用sbit关键字。
- ![image-20230307234503664](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230307234503664.png)![image-20230307234552559](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230307234552559.png)
- ![image-20230307234729653](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230307234729653.png)
- **这里只给出了T0和T1的所有相关寄存器，T2,3,4没有完全给出。**

### 3.TH0和TL0寄存器：

- 我们上面说过，定时器/计数器寄存器是一个16位寄存器，这个十六位寄存器本质上是由两个8位寄存器组成了，TH0(T0寄存器的高8位)和TL0(T0寄存器的低8位)。

### 4.问题+代码：

- 在CT107D单片机综合训练平台上，利用51单片机的定时/计数器T0的模式1实现间隔定时，每隔1秒LED1闪烁一下，也就是点亮0.5秒，熄灭0.5秒，每隔2秒LED2闪烁一下，即点亮1秒，熄灭1秒。 (0.5s = 50 0000us)

  - ```c
    #include <STC15F2K60S2.H>
    #include <intrins.h>
    
    sbit L1 = P0^0;
    sbit L2 = P0^1;
    unsigned char count = 0;
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
    void Init_Timer0(void) //(1MHz, t = 1us , 50000us(50ms ) one time)
    {
    	TH0 = (65535 - 50000) / 256;//取出15535的二进制数的高八位。
    	TL0 = (65535 - 50000) % 256;//取出15535的二进制数的低八位。
        //这里我们要注意，问题要求是0.5s闪烁L1，1S闪烁L2,0.5s是500ms，1s是1000ms，由于寄存器最大容量是65535us，也就是       65.5ms，这里我们选择50ms，因此我们让寄存器每计时50ms中断一次(也就是让寄存器计数50000次)。因此寄存器应该从           15535开始计数。
    	TR0 = 1;//允许T0开始计数。
    	TMOD = 0x01;//由于TMOD不可位寻址，低四位分别是0001，GATE = 0(基本都用0)，C/T = 0(表示用作定时器),M1M0 = 01
        			//选择模式1。
    	AUXR &= 0x7f;//对于AUXR寄存器，我们也不进行位寻址，将T0十二分频。
    	EA = 1;//CPU接收所有中断。
    	ET0 = 1;//允许T0溢出中断,也就是当T0溢出时，发送中断请求。
    }//初始化T0。
    void Timer0_Routine(void) interrupt 1
    {
    	TH0 = (65535 - 50000) / 256;
    	TL0 = (65535 - 50000) % 256;
        //由于我们选择的是模式1，也就是16位非自动重装载，所以，每次执行中断响应的时候，此时寄存器已经清零，所以我们要重新装载。
    	count++;//每次中断响应的时候，count++。
    	if (!(count % 10))//当count能被10整除的时候，说明经过500ms。
    	{
    		P2 = P2 & 0x1f | 0x80;
    		L1 = ~L1;
    		P2 &= 0x1f;
    	}
    	if (!(count % 20))//当count能被20整除的时候，说明经过1000ms。
    	{
    		P2 = P2 & 0x1f | 0x80; 
    		L2 = ~L2;
    		P2 &= 0x1f;
    	}
    }
    void main(void)
    {
    	Close_Buzz();
    	Close_LED();
    	Init_Timer0();
    	while (1)
    	{
    		
    	}
    }
    ```

- 在CT107D单片机综合训练平台上，利用定时器1、数码管显示模块和2个独立按键，设计一个秒表，具有清零、暂停、启动功能。显示格式为:分-秒-0.05秒，08-26-18表示:8分26秒900毫秒，独立按键S4为:暂停/启动，独立按键S5为:清零按键均为按下有效。

  - ```c
    #include <STC15F2K60S2.H>
    #include <intrins.h>
    unsigned char count_0_0_5s = 0;//0 ~ 20,imply 0.05s = 50ms = 50000us
    unsigned char count_s = 0;//0 ~ 60
    unsigned char count_min = 0;//0 ~ 60
    
    sbit S5 = P3^2;
    sbit S4 = P3^3;
    
    code unsigned char SMG[] = {0xc0, 0xf9, 0xa4, 0xb0, 0x99, 0x92, 0x82, 0xf8, 0x80, 0x90};
    code unsigned char h_line = 0xbf;
    void Delay1ms()		//@11.0592MHz
    {
    	unsigned char i, j;
    
    	_nop_();
    	_nop_();
    	_nop_();
    	i = 11;
    	j = 190;
    	do
    	{
    		while (--j);
    	} while (--i);
    }//1ms延迟函数是数码管动态显示的消除鬼影的延迟函数。
    void Close_Buzz(void)
    {
    	P2 = P2 &0x1f | 0xa0;
    	P0 &= 0xbf;
    	P2 &= 0x1f;
    }
    void Close_LED(void)
    {
    	P2 = P2 & 0x1f | 0x80;
    	P0 = 0xff;
    	P2 &= 0x1f;
    }
    void Static_Display(unsigned char num , unsigned char i)
    {
    	P2 = P2 & 0x1f | 0xc0;
    	P0 = 0x01 << (i - 1);
    	P2 &= 0x1f;
    	
    	P2 = P2 & 0x1f | 0xe0;
    	P0 = num;
    	P2 &= 0x1f;
    }//每个数码管的静态显示。
    void Init_Timer1(void)
    {
        TH1 = (65535 - 50000) / 256;
    	TH0 = (65535 - 50000) % 256;//这一定要注意，我们想要计时50000次，因此就要用65535-50000。
    	TR1 = 1;
    	TMOD = 0x00;
    	AUXR &= 0xbf;
    	EA = 1;
    	ET1 = 1;
    }
    void Timer1_Routine(void) interrupt 3
    {
    	count_0_0_5s++;
    	if (count_0_0_5s == 20)
    	{
    		count_0_0_5s = 0;
    		count_s++;
    	}
    	if (count_s == 60)
    	{
    		count_s = 0;
    		count_min++;
    	}
    	if (count_min == 60)
    	{
    		count_0_0_5s = 0;
    		count_s = 0;
    		count_min = 0;
    	}
    }
    void Dynamic_Display(void)
    {
    	Static_Display(SMG[count_min / 10] , 1);
    	Delay1ms();
    	Static_Display(SMG[count_min % 10] , 2);
    	Delay1ms();
    	Static_Display(h_line , 3);
    	Delay1ms();
    	Static_Display(SMG[count_s / 10] , 4);
    	Delay1ms();
    	Static_Display(SMG[count_s %10] , 5);
    	Delay1ms();
    	Static_Display(h_line , 6);
    	Delay1ms();
    	Static_Display(SMG[count_0_0_5s / 10] , 7);
    	Delay1ms();
    	Static_Display(SMG[count_0_0_5s % 10] , 8);
    	Delay1ms();
    }
    //八个数码管的动态显示。
    
    void Delay_e_jitter(unsigned int t)
    {
    	while (t--){}
    }
    void Key_Scan(void)
    {
    	Dynamic_Display();//这里要写一个动态显示，然后再执行if。
    	if (S5 == 0)
    	{
    		Delay_e_jitter(100);//按键消抖以后就固定这么写，参数传递是100.
    		if (S5 == 0)
    		{
    			count_0_0_5s = 0;
    			count_s = 0;
    			count_min = 0;
    			while (S5 == 0)
    			{
    				Dynamic_Display();
    			}//这个while很重要，有时候，我们按键时间可能过长(相对于程序的快速执行来讲)，因此我们要避免由于按键时间过                长再次执行这个if操作，写一个while循环，如果S5 == 0，也就是按键过长了，我们直接执行动态显示，松手后再                继续执行。
                //以后写按键消抖的时候，一定要配合这个while一起使用。
    		}
    	}
    	Dynamic_Display();//这里在写一个动态显示，然后再执行if。这个其实也可以不写，写了只是增加容错率。
    	if (S4 == 0)
    	{
    		Delay_e_jitter(100);
    		if (S4 == 0)
    		{
    			TR1 = ~TR1;//TR1是控制定时器的计数器是否计数的，当TR1 = 1的时候，寄存器计数，反之不计数，当定时器不计数的时候，用来显示的三个变量不变，因此产生暂停的效果。
    			while (S4 == 0)
    			{
    				Dynamic_Display();
    			}
    		}
    	}
    }
    //这个函数是最重要的，独立按键操作数码管并且要执行消抖操作，而且要避免独立按键的一些延迟等错误。
    void main(void)
    {
    	Close_Buzz();
    	Close_LED();
    	Init_Timer1();
    	while (1)
    	{
    		Key_Scan();
    	}
    }
    ```
