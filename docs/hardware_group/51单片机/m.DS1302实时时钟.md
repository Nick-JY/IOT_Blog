# DS1302实时时钟
### 1.DS1302介绍：

- DS1302是一款充电计时器，实时计算当前时间：
  - **秒、分、时；年、月、日；星期**
  - 有闰年补偿，有效期至2100年。
- RTC，``real time clock``，实时时钟的英文缩写。
- 8个日历时钟相关的寄存器，31 x 8的RAM空间。

### 2.DS1302的命令格式和相关寄存器

- DS1302的数据传输受时钟信号的控制。
- **DS1302的控制命令格式：**
  - ![image-20230318233331680](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230318233331680.png)
  - bit7必须为1，若为0，则不能把数据写进DS1302。
  - bit6 = 1，则存取RAM数据；bit6 = 0，则存取日历时钟寄存器的数据。
  - A4~A0表示操作单元的地址。
  - bit0 = 1，表示从DS1302中读取数据；bit0 = 0，表示向DS1302中写数据。
- 通常来讲，我们不会去操作RAM，大多数情况都是操作日历时钟寄存器，下面给出操作相应寄存器的控制命令：
  - ![image-20230319000316291](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230319000316291.png)
  - 例如：81H这个命令对应的是从DS1302中读取秒寄存器的值。
  - **对于小时寄存器：**
    - 当表示12小时制的时候，BIT5表示上午或者下午；当表示24小时制的时候，BIT5和BIT6一起来表示时间的十位。
  - **对于秒寄存器：**
    - **当CH = 1的时候，时钟停止震荡，当CH = 0的时候，时钟开始震荡。**


### 3.DS1302的操作流程：

- **向时钟发送数据：**![image-20230319001844525](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230319001844525.png)

  - 首先，CE端为高电平的时候才能发送和读取数据，在时钟上升沿之前，待发送数据准备好被发送，时钟上升沿到来的时候，相应的bit被发送。

  - 发送数据之前，我们应该发送8bit的操作命令，之后再发送8bit的数据。

  - 底层驱动代码：

    - ```c
      void Write_Ds1302_Byte(unsigned  char temp) 
      {
      	unsigned char i;
      	for (i=0;i<8;i++)     	
      	{ 
      		SCK=0;//SCK为上位机发送给DS1302的时钟信号，一开始时钟信号是低电平。
      		SDA=temp&0x01;
      		temp>>=1; //在低电平的时候，SDA这一个数据端将待发送数据准备好。
      		SCK=1;//SCK变为1，也就是产生上升沿，此时数据被发送到DS1302。
      	}
      }   
      
      void Write_Ds1302( unsigned char address,unsigned char dat )     
      {
       	RST=0;//注意，RST就是CE端口。
      	_nop_();
       	SCK=0;
      	_nop_();
       	RST=1;	
         	_nop_();  
       	Write_Ds1302_Byte(address);//首先写入操作命令
       	Write_Ds1302_Byte(dat);//写入操作命令之后，不需要任何其他操作，紧接着写入待写入数据。
       	RST=0; //操作完成之后将RST置0，此时不能发送和读取DS1302中的数据。
      }
      ```

- **从时钟读取数据：**![image-20230319002439711](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230319002439711.png)

  - 首先CE为高电平的时候才能够读取和写入数据，对于读取来讲，时钟下降沿的时候从DS1302中读取数据(**先产生下降沿，再读取数据**)。

  - 首先向DS1302发送8bit的控制命令，然后，**在发送完第8位的那一位时钟下降沿开始读取数据**。

  - 底层驱动代码：

    - ```c
      unsigned char Read_Ds1302 ( unsigned char address )
      {
       	unsigned char i,temp=0x00;//读取到的数据将保存在temp中，先读取最低位。
       	RST=0;
      	_nop_();
       	SCK=0;
      	_nop_();
       	RST=1;//RST(CE) = 1
      	_nop_();
       	Write_Ds1302_Byte(address);//首先向DS1302发送控制命令，注意发送完这个控制命令之后，SCK = 1
       	for (i=0;i<8;i++) 	
       	{		
      		SCK=0;//第一次进入的时候，SCK = 0，此时产生了一个下降沿。
      		temp>>=1;	
       		if(SDA)
       		temp|=0x80;//上面这两句用来读出bit	
       		SCK=1;//将SCK升高，再次循环又产生下降沿。
      	} 
       	RST=0;//下面的这些延时我们不需要考虑
      	_nop_();
       	RST=0;
      	SCK=0;
      	_nop_();
      	SCK=1;
      	_nop_();
      	SDA=0;
      	_nop_();
      	SDA=1;
      	_nop_();
      	return (temp);			
      }
      ```

- 重点：

  - 对于第八个寄存器：
    - ![image-20230319003644243](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230319003644243.png)
    - 当WP = 0时，可以对任何RAM和日历时钟寄存器进行写操作。
    - 当WP = 1时，禁止对任何RAM和日历时钟寄存器进行写操作。
    - **因此，当我们开始执行和执行完写操作的时候，都要操作这个寄存器。**

### 4.工程创建+问题：

- ![image-20230319112015132](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230319112015132.png)
  - 仔细检查是否有没有补全的函数，以及头文件中的函数声明。

- 用数码管的方式显示实时时间，初始时间设定为：2023—3—19—12—59—00，周日(7)，**显示格式：时—分—秒**，正好八位。

  - ```c
    #include <STC15F2K60S2.H>
    #include <intrins.h>
    #include <ds1302.h>
    #define Hon_Line 0xbf
    code unsigned char SMG[] = {0xc0 , 0xf9 , 0xa4 , 0xb0 , 0x99 , 0x92 , 0x82 , 0xf8 , 0x80 , 0x90};
    //这个数组是断码值。
    code unsigned char read_command[7] = {0x81 , 0x83 , 0x85 , 0x87 , 0x89 , 0x8b , 0x8d};
    //这个数组是读寄存器命令，按顺序从秒寄存器开始。
    code unsigned char write_command[7] = {0x80 , 0x82 , 0x84 , 0x86 , 0x88 , 0x8a , 0x8c};
    //这个数组是写寄存器命令，按顺序从秒寄存器开始。
    code unsigned char Init_Time[7] = {0x00 , 0x22 , 0x17 , 0x19 , 0x03 , 0x07 , 0x23};
    //这个数组是对DS1302的日历时间寄存器进行初始化。
    unsigned char Now_Time[3];
    //这个数组用来接收实时时间(时-分-秒)
    unsigned char dipbuf[8];
    //这个数组用作输出缓冲数组，如果用定时器来辅助数码管的动态显示，这个数组必不可少。
    unsigned char pos;
    void Init_STC(void)
    {
    	P2 = P2 & 0X1f | 0x80;
    	P0 = 0xff;
    	P2 &= 0x1f;
    	
    	P2 = P2 & 0x1f | 0xa0;
    	P0 &= 0xbf;
    	P2 &= 0x1f;
    }
    void Init_DS1302(void)//对DS1302进行初始设置。
    {
    	unsigned char i;
    	Write_Ds1302_Byte(0x8e , 0x00);//首先，把第八个寄存器的WP置位0，这样就能够对所有的寄存器进行写入操作。
    	for (i = 0 ; i < 7 ; i++)
    	{
    		Write_Ds1302_Byte(write_command[i] , Init_Time[i]);//对日历时间七个寄存器进行写入初始时间。
    	}
    	Write_Ds1302_Byte(0x8e , 0x80);//最后，把写保护打开。
    }
    void Static_Display(unsigned char num , unsigned char pos)
    {
    	P2 = P2 & 0x1f | 0xc0;
    	P0 = 0x01 << pos;
    	P2 &= 0x1f;
    	
    	P2 = P2 & 0x1f | 0xe0;
    	P0 = num;
    	P2 &= 0x1f;
    }//数码管的静态现实。
    void Dynamic_Display(unsigned char pos)
    {
    	if (pos == 2 || pos == 5)
    		Static_Display(dipbuf[pos] , pos);//这个if-else用来把段码值和-区分开。
    	else
    		Static_Display(SMG[dipbuf[pos]] , pos);
    }//数码管的动态显示，注意这个动态显示依靠定时器0。
    void Init_Timer0(void)
    {
    	TH0 = (65535 - 1000) / 256;
    	TL0 = (65535 - 1000) & 256;//100us中断一次，也就是1ms中断一次，动态显示的间隔就是1~2ms。
    	
    	TR0 = 1;
    	TMOD = 0x00;
    	AUXR = 0x00;
    	ET0 = 1;
    	EA = 1;
    }
    void Timer0_Routine(void) interrupt 1
    {
    	if (pos == 8)
    	{
    		pos = 0;
    	}//使用一个pos变量，用来一次对数码管进行快速扫描，实现动态显示。
    	Dynamic_Display(pos++);
    }
    void Read_Time(void)
    {
    	unsigned char i;
    	for (i = 0 ; i < 3 ; i++)
    	{
    		Now_Time[i] = Read_Ds1302_Byte(read_command[i]);
    	}
    	dipbuf[0] = Now_Time[2] >> 4 & 0x03;//读出小时的十位。
    	dipbuf[1] = Now_Time[2] & 0x0f;//读出小时的个位。
    	dipbuf[2] = Hon_Line;//横线。
    	dipbuf[3] = Now_Time[1] >> 4;//读出分钟的十位。
    	dipbuf[4] = Now_Time[1] & 0x0f;//读出分钟的个位。
    	dipbuf[5] = Hon_Line;//横线
    	dipbuf[6] = Now_Time[0] >> 4;//读出秒的十位。
    	dipbuf[7] = Now_Time[0] & 0x0f;//读出秒的个位。
    }
    void main(void)
    {
    	Init_STC();
    	Init_Timer0();
    	Init_DS1302();
    	while (1)
    	{
    		Read_Time();//一直对时间进行读取，就会一直对dipbuf这个数组进行更新，时间就会一直更新。
    	}
    }
    ```

- 用串口通信的方式显示当前时间，初始时间设定为：2023—3—19—12—59—00，周日(7)，**显示格式：Time：2023-3-19  12:59:00 weekday - 7**

  - ```c
    #include <STC15F2K60S2.H>
    #include <intrins.h>
    #include <ds1302.h>
    #include <stdio.h>
    #define BAUD 9600//波特率
    #define SYSTEMCLK 11059200//系统时钟
    code unsigned char read_command[7] = {0x81 , 0x83 , 0x85 , 0x87 , 0x89 , 0x8b , 0x8d};
    code unsigned char write_command[7] = {0x80 , 0x82 , 0x84 , 0x86 , 0x88 , 0x8a , 0x8c};
    code unsigned char Init_Time[7] = {0x00 , 0x22 , 0x17 , 0x19 , 0x03 , 0x07 , 0x23};
    unsigned char Now_Time[7];
    unsigned char Date_str[50];//用于存储sprintf函数转换的字符串。
    unsigned char command = 0x00;
    unsigned char flag;
    unsigned char busy;
    void Init_STC(void)
    {
    	P2 = P2 & 0x1f | 0x80;
    	P0 = 0xff;
    	P2 &= 0x1f;
    	
    	P2 = P2 & 0x1f | 0xa0;
    	P0 &= 0xbf;
    	P2 &= 0x1f;
    }
    void Init_DS1302(void)//初始化DS1302，把初始时间写入。
    {
    	unsigned char i;
    	Write_Ds1302_Byte(0x8e , 0x00);
    	for (i = 0 ; i < 7 ; i++)
    	{
    		Write_Ds1302_Byte(write_command[i] , Init_Time[i]);
    	}
    	Write_Ds1302_Byte(0x8e , 0x80);
    }
    void Init_Timer1(void)//定时器1作为波特率发生器。
    {
    	TL1 = (65536 - (SYSTEMCLK/4/BAUD));
    	TH1 = (65536 - (SYSTEMCLK/4/BAUD)) >> 8;
    	
    	TR1 = 1;
    	TMOD = 0x00;
    }
    void Init_UART(void)//初始化UART串口。
    {
    	Init_Timer1();
    	SCON = 0x50;
    	PCON = 0x00;
    	AUXR = 0x40;
    	PS = 1;
    	ES = 1;
    	EA = 1;
    }
    void UART_Routine(void) interrupt 4
    {
    	if (RI == 1)
    	{
    		RI = 0;
    		command = SBUF;
    		flag = 1;
    	}
    	if (TI == 1)
    	{
    		TI = 0;
    		busy = 0;
    	}
    }
    void SendByte(unsigned char value)//向串口发送一个字节的数据。
    {
    	while (busy == 1);
    	busy = 1;
    	SBUF = value;
    }
    void SendString(unsigned char* str)//向串口发送一个字符串。
    {
    	while (*str != '\0')
    		SendByte(*str++);
    }
    
    void Read_Time(void)
    {
    	unsigned char i;
    	for (i = 0 ; i < 7 ; i++)
    	{
    		Now_Time[i] = Read_Ds1302_Byte(read_command[i]);//Now_Time数组中存储的是实时的时钟寄存器的值。
    	}
    	
    	sprintf(Date_str , "Time: 20%Bu%Bu-%Bu%Bu-%Bu%Bu %Bu%Bu:%Bu%Bu:%Bu%Bu weekenday-%Bu\r\n",
    					Now_Time[6] >> 4,Now_Time[6] & 0x0f,Now_Time[4] >> 4,Now_Time[4] & 0x0f,Now_Time[3] >> 4,Now_Time[3] & 0x0f,Now_Time[2] >> 4,Now_Time[2] & 0x0f,Now_Time[1] >> 4,Now_Time[1] & 0x0f,Now_Time[0] >> 4,Now_Time[0] & 0x0f,Now_Time[5]);
        //Date_str是全局数组，用来存储sprintf转换后的值。
        //在keil中，如果要打印char类型的整数，那么要使用%Bd或%Bu；
        //如果要打印long类型，那么使用%Ld或%Lu;
    }
    void Decoding(void)
    {
    	Read_Time();
    	if (flag)
    	{
    		flag = 0;
    		if (command == 0xa0)//指令a0来打印当前时间。
    		{
    			command = 0x00;
    			SendString(Date_str);
    		}
    	}
    }
    void main(void)
    {
    	Init_STC();
    	Init_UART();
    	Init_DS1302();
    	SendString("This is a clock!\r\n");
    	while (1)
    	{
    		Decoding();
    	}
    }
    ```

