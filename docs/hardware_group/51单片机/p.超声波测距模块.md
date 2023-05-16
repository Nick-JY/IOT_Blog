# 超声波测距模块
### 1.超声波模块介绍：

- J2跳线：![image-20230327194226435](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230327194226435.png)
  - 1-3短接，2-4短接。
  - 其中，P10作为整个超声波测距模块的输入信号，P10的值和NA1的值相同。
  - P11是整个超声波测距模块的接收端，P11的值和NB1的值相同。
- 超声波发送模块：![image-20230327194444233](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230327194444233.png)
  - NA1是该模块的信号输入端，接收40KHz(**周期T = 25us**)方波信号驱动超声波发送。
    - 这个信号我们通过软件生成(代码生成)。
  - JS2发送超声波。
- 超声波接收模块：![image-20230327195207764](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230327195207764.png)
  - 发送出去的超声波信号遇到障碍物之后会返回，JS1是接收返回超声波的装置。
  - 当接收到返回超声波后，图片上面的解码器(**CX20106a**)会执行解码，并且将NB1端拉低。
  - 当NB1端被拉低之后，说明超声波信号完成返回过程。

### 2.超声波测距过程：

- 首先，主机向P10端口发送8个周期的40KHz的信号(使用软件生成)，使JS2发送超声波。
- 当超声波遇到障碍物之后进行返回，返回的超声波被JS1接收。
- JS1将接收到的超声波送入解码器，解码器将NB1拉低，由于NB1和P11短接，因此P11被拉低。
- 通过检测P11的电平来确定超声波完成一个来回的运动。
- 通过计时器对整个过程的时间进行计算，**计时器的计算结果的单位是us。**
- 距离公式：**距离 = 声音传播速度344m/s x 时间 ÷ 2** 也就是：**s = t * 0.0172**，计算结果的单位是**cm/us**

### 3.代码：

- 使用超声波测距模块，将测距结果在数码管上显示出来，如果超出可以测量的最大距离(最大距离依赖于定时器一次所能够计算的最长时间，**(时间 * 速度 ÷ 2)**就是最大距离)，则数码管用F显示，在实验中，最多只需要使用三个数码管。

- ```c
  #include <STC15F2K60S2.H>
  #include <intrins.h>
  #define somenop {_nop_();_nop_();_nop_();_nop_();_nop_();_nop_();_nop_();_nop_();_nop_();_nop_();_nop_();_nop_();_nop_();_nop_();_nop_();}
  
  sbit TX = P1^0;//发送驱动信号的引脚。
  sbit RX = P1^1;//接收解码器低电平的引脚。
  
  code unsigned char SMG[] = {0xc0, 0xf9, 0xa4, 0xb0, 0x99, 0x92, 0x82, 0xf8, 0x80, 0x90};
  
  unsigned char dspbuf[3];//这里使用定时器中断进行数码管的动态显示。
  unsigned char display_count;//这个变量充当动态显示变量。
  unsigned int distance;//记录距离。
  unsigned int cal_count;//对于测距，让两次测距之间有时间间隔，这个变量用来计算时间间隔。
  
  bit cal_flag;
  
  void Init_STC(void)
  {
  	P2 = P2 & 0x1f | 0x80;
  	P0 = 0xff;
  	P2 &= 0x1f;
  	
  	P2 = P2 & 0x1f | 0xa0;
  	P0 &= 0xbf;
  	P2 &= 0x1f;
  }//初始化开发板
  void Init_Timer1(void)//定时器1用来对测距时间进行记录。
  {
  	TMOD = 0x10;//定时器1的模式是16位非自动重装载模式。
  	AUXR &= 0xbf;//对定时器1采用12分频，因此时间是以1us自增加。
  	TH1 = 0;//将计时器初始为0
  	TL1 = 0;//将计时器初始为0
  	TR1 = 0;//关闭TR1的计时功能。
  	ET1 = 0;//我们不需要使用Timer1的中断函数，因此ET1 = 0，不允许中断。
  }//对定时器1进行初始化
  
  void Init_Timer0(void)//用定时器0来控制动态显示。
  {
  	AUXR &= 0x7f;//采用12分频，自增加是1us。
  	TH0 = (65535 - 2000) / 256;
  	TL0 = (65535 - 2000) % 256;
  	TR0 = 1;
      EA = 1;
  	ET0 = 1;
  }
  void Static_Display(unsigned char num , unsigned char pos)
  {
  	P2 = P2 & 0x1f | 0xc0;
  	P0 = 0x01 << pos;
  	P2 &= 0x1f;
  	
  	P2 = P2 & 0x1f | 0xe0;
  	P0 = num;
  	P2 &= 0x1f;
  }//数码管静态显示。
  void Timer0_Routine(void) interrupt 1
  {
  	if (display_count == 3)
  		display_count = 0;
  	Static_Display(dspbuf[display_count] , display_count + 5);//动态显示。
      display_count++;
  	
      if (++cal_count == 200)
  	{
  		cal_count = 0;
  		cal_flag = 1;
  	}//每隔400ms，执行一次测距。
  }
  void SendWave(void)
  {
      unsigned char i = 8;
  
      do
      {
          TX = 1;
  				somenop;somenop;somenop;somenop;
  				somenop;somenop;somenop;somenop;
  				somenop;somenop;somenop;somenop;
  				somenop;somenop;somenop;somenop;
          //这个时间是重点，一个somenop代表15个_nop_()函数，16个somenop表示12.5us。
          //这个时间必须精准。
          TX = 0;
  				somenop;somenop;somenop;somenop;
  				somenop;somenop;somenop;somenop;
  				somenop;somenop;somenop;somenop;
  				somenop;somenop;somenop;somenop;
      }
      while(i--);
  }
  void Cal_Distance(void)//计算距离
  {
  	unsigned int t = 0x0000;
  	if (cal_flag)//每隔400ms计算一次距离。
  	{
  		cal_flag = 0;
  		SendWave();//首先发送驱动信号。
  		TR1 = 1;//随后开始计时，这时候超声波开始发送了。
  		while (RX == 1 && TF1 == 0);//如果RX = 1，也就是没收到返回信号，TF1 = 0说明计时器1没有溢出。
  		TR1 = 0;//跳出while之后，停止计时。
          //随后查看是什么原因跳出while循环。
  		if (TF1 == 1)//如果是因为计时器1溢出，那么说明距离超出范围，把数码管显示为：F
  		{
  			TF1 = 0;
  			dspbuf[0] = 0x8e;
  			dspbuf[1] = 0x8e;
  			dspbuf[2] = 0x8e;
  		}
  		else
  		{
  			t = TH1;
  			t = t << 8;
  			t |= TL1;
  			distance = (unsigned int)(t * 0.0172);
  			dspbuf[0] = SMG[distance / 100];
  			dspbuf[1] = SMG[distance / 10 % 10];
  			dspbuf[2] = SMG[distance % 10];
  		}//反之，我们计算出距离，并显示出来。
  		TH1 = 0;
  		TL1 = 0;//手动对这两个寄存器进行重置。
  	}
  }
  void main(void)
  {
  	Init_STC();
  	Init_Timer0();
  	Init_Timer1();
  	while (1)
  	{
  		Cal_Distance();
  	}
  }
  ```