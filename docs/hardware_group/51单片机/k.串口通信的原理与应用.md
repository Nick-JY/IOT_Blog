# UART通信
### 1.串口(serial)通信和并行(parallel)通信：

- 串口通信：
  - 串口通信又叫串行通信，假设要在A和B两个设备之间进行**1byte**数据的传递，A和B之间只有一根数据线，这**1byte**的**8bit**按顺序通过这一根数据线进行传送。
  - 我们假设每一个时钟周期传递1bit,那么传送这1byte的数据，需要8个时钟周期。
- 并行通信：
  - 假设在A和B之间有8根数据线，我们进行**1byte**数据的传递，每根数据线传送**1bit**，只需要一个时钟周期就可以传送完成。

### 2.单工、半双工、全双工：

- 单工通信：
  - 单工通信有两个特点：
    - 1.**发送端**和**接收端**是固定不变的。
    - 2.二者之间只有一根数据线。
    - ![image-20230313201847032](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230313201847032.png)
- 半双工通信：
  - 半双工通信有两个特点：
    - 1.进行通信的两个设备既可以做**发送端**也可以做**接收端**。
    - 2.两者之间只有一根数据线，也就意味着两者**不能同时双向通信**。
    - ![image-20230313202538788](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230313202538788.png)
- 全双工通信：
  - 全双工通信有两个特点：
    - 1.进行通信的两个设备既可以做**发送端**也可以做**接收端**。
    - 2.两者之间有两根数据线，也就意味着两者之间可以进行**同时双向通信**。
    - ![image-20230313202805164](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230313202805164.png)

### 3.同步通信、异步通信：

- 同步通信：
  - 我们假设要传输3byte的数据，现在采用同步通信的方式：
    - 1.发送端和接收端的时钟频率要相同。
    - 2.把这3byte的数据组成一个信息组，通常，我们把1byte的数据叫做一个**信息帧**，每个信息帧之间有一个同步字符。
    - 3.我们把这个信息组不暂停的一个接一个的传送到接收端，同时发送端向接收端传递**时钟信号**(用来同步接收端的时钟，接收端根据这个时钟就能正确的解析发送端的信息)
    - 在没有信息传送的时候，我们要发送空字符，因为同步通信不允许有间隔。
    - ![img](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/20190530162743889.png)
- 异步通信：
  - 我们假设要传输3byte的数据，现在采用异步通信的方式：
    - 1.异步通信的异步指的是：发送端向接收端发送每一个信息帧之间的间隔是没有要求的，意味着第一个信息帧和第二个信息帧之间可能间隔3us，第二个信息帧和第三个信息帧之间可能间隔6us。
    - 2.这就要求每个信息帧要都相同的格式，并且发送端和接收端都遵循这一种信息帧格式，这样才能正确的发送和接收。
    - 3.异步通信不要求发送端和接收端有相同频率的时钟，只要求接收端和发送端采用相同的**比特率**``每秒传输的bit数``(有时候也说波特率，说波特率的时候是把1bit作为一个符号)，当**比特率和帧格式**相同的时候，接收方就能正确接收发送端的信息。
    - ![img](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/20190530164127391.png)
- 相较于同步通信，异步通信由于信息帧之间的间隔，传输效率慢；但异步通信实现简单，对接收端和发送端的数要求较低。

### 4.UART串口通信协议：

- 比特率：
  - 比特率是每秒钟传输的数据的bit数(当1bit表示一个符号的时候，也可以用波特率来表示)，通常使用UART协议进行传输的时候，比特率(波特率)是9600bps。
- UART简介：
  - Universial asynchronous Receiver Transmitter，通用异步收发器。
  - 是一种串行、异步、全双工通用总线。
- UART的帧格式：
  - ![image-20230313223936954](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230313223936954.png)
    - 当没有数据的时候，表示**空闲位**，空闲位用高电平表示，空闲位的长短没有限制。
    - **开始位**是一位的低电平，表示从空闲状态进入数据传输状态。
    - 数据可以是5~8位，通常都是一个字节(8bit)。
    - 数据的发送是**低位在前，高位在后**。
    - **校验位**可有可无，校验方式有奇偶校验等。
    - **停止位**是1位或者1.5位或者2位的高电平。
- UART的硬件连接：
  - 设备A的发送端口接设备B的接收端口，设备B的发送端口接设备A的接收端口。
  - 如果某个处理器支持UART传输协议，那么说明在处理器内部集成有UART信息传输电路。

### 5.STC15F2K60S2的串口通信(重点*)：

- STC15F2K60S2单片机有2个高速全双工异步串行通信接口：**串行口1**和**串行口2**，采用UART协议。
- 每个串口由**两个数据缓冲器**、**一个移位寄存器**、**一个串行控制寄存器**、**一个波特率发生器**组成。
- 两个数据缓冲器：
  - 一个发送缓冲器，只能写入数据，不能读取数据。
  - 一个接收缓冲器，只能读取数据，不能写入数据。
  - 两个缓冲器共用一个地址，名称相同。
- **串行口1**寄存器分析：
  - 大多数情况，我们只使用串口1，并且串口1的模式是模式1：**8位UART，波特率可变**，每一个信息帧有10bit，其中8bit的数据位，1bit的开始位，1bit的停止位。我们需要设置**SCON的SM0和SM1选择模式1**。
  - 对于所使用的的单片机来讲，通常情况下，使用**计时器2作为波特率发生器**，因此我们需要对计时器2进行配置。
  - 设置寄存器**AUXR中的T2x12**，确定定时器的速度。
  - 打开串口的中断控制位**ES**，以及总控制位**EA**。
  - 使用单片机来发送数据，我们使用问询的方式，直接将待发送数据放入**SBUS**(数据缓冲器)即可。
  - 使用单片机来接收数据，我们使用中断的方式，读出SBUS中的数据。
- ![image-20230314123813071](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230314123813071.png)
  - 设置SM0,SM1 = 01，选择工作模式1:8位UART，波特率可变。
  - REN = 1，表示允许单片机的串行接收状态，REN = 0，表示禁止单片机的串行接收状态，即不能接收上位机回传的信息。
  - 将整个寄存器初始化位:**0101 0000，即0x50**。
  - **该寄存器只需要设置这两位，但是还有两位非常重要，我们需要读取值。**
  - 当发送完一个信息帧的时候(注意是一个信息帧)，T1自动被置位1，当TI = 1的时候，串口1会向CPU发送中断，在中断中，我们必须将TI清零。
  - 当接收完一个信息帧的时候，RI自动被置位1，当RI = 1的时候，串口1会向CPU发送中断，在中断中，我们必须将RI清零。
  - 通过上面的分析，我们知道，进入中断的时候有两种情况，我们必须正确知道到底是由TI还是RI引发的中断。
    - ![image-20230314125609975](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230314125609975.png)
- ![image-20230314125702380](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230314125702380.png)
  - SMOD = 0，各工作方式的波特率都加倍。
  - SMOD0 = 0，SM0和SM1来指定串口通信方式。
  - 注意，该寄存器不能够位寻址。
  - 直接将该寄存器初始化位：0x00。
- ![image-20230307233722104](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230307233722104.png)![image-20230307233755400](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230307233755400.png)
- ![image-20230314125957279](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230314125957279.png)
  - T1x12 = 1，定时器1控制串口1为**1T**，这个1T很重要。
  - S1ST2 = 0，选择定时器1作为波特率发生器。
  - **直接将AXUR赋值为0x40**
- ![image-20230314130645998](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230314130645998.png)
  - ES = 1，允许所有的串行口中断。
  - EA = 1，允许CPU接收中断。
- ![image-20230314130951052](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230314130951052.png)
  - PS = 1，串口1的中断优先级最高。
- 常用波特率与定时器1各参数关系：
  - ![image-20230314123228264](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230314123228264.png)
  - 我们一定要注意，定时器1采用的模式是16位自动重装。
  - 对于TL1和TH1，其初始值是通过一个公式计算的。


### 6.问题+分析：

- ![image-20230313235341503](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230313235341503.png)
  - 这里所说的上位机就是我们的电脑。

- ```c
  #include <STC15F2K60S2.H>
  #include <intrins.h>
  #define BAUD  9600//我们定义波特率宏BAUD = 9600
  #define SYSTEMCLOCK  11059200L//我们定义系统时钟SYSTEMCLOCK = 11059200(11.0592MHz)
  unsigned  char busy;//创建一个busy量，用来避免串口中数据发送冲突。
  unsigned char dat;//这里注意，我们接收信息的时候，要一个字节一个字节的接收，因此使用char类型。
  
  
  void Init_STC(void)
  {
  	P2 = P2 & 0x1f | 0x80;
  	P0 = 0xff;
  	P2 &= 0x1f;
  	
  	P2 = P2 & 0x1f | 0xa0;
  	P0 &= 0xbf;
  	P2 &= 0x1f;
  }
  void Init_Timer1(void)//我们选择定时器1作为波特率发生器。
  {
  	TL1 = 65536 - (SYSTEMCLOCK/4/BAUD);//公式TL1 = (65536 - (SYSTEMCLOCK/4/BAUD));
      TH1 = (65536 - (SYSTEMCLOCK/4/BAUD)) >> 8;//公式TH1 = (65536 - (SYSTEMCLOCK/4/BAUD)) >> 8;
  	TMOD = 0x00;//定时器1采用的是16位主动装配，并且用作定时器。
  	TR1 = 1;//打开定时器1。
  	AUXR = 0x40;//选择定时器1作为波特率发生器，并且定时器1控制串口1为1T。
  }
  void Init_UART(void)
  {
  
  	SCON = 0x50;//选择UART8位，波特率可变模式，并且开启接收模式。
  	PCON = 0x00;//默认。
  	ES = 1;//开启串口中断。
  	EA = 1;//CPU接收中断。
  	Init_Timer1();
  }
  void SendData(unsigned char a)//这里注意，我们发送信息的时候，要一个字节一个字节的发送，因此使用char类型。
  {
  	while (busy == 1);//当busy  = 1的时候，说明串口中正在发送数据，我们要等busy = 0的时候在发送。
  	busy = 1;//把busy置位1
  	SBUF = a;//将a通过串口发送，此时busy = 1，说明串口中有数据发送。
  }
  void UART_Routine(void) interrupt 4
  {
  	if (TI == 1)//当一字节发送完成，把busy置位0，同时手动清除TI = 0。
  	{
  		busy = 0;
  		TI = 0;
  	}
  	if (RI == 1)//当RI = 1，说明数据接收完成，我们把SBUF中的数据读出来。
  	{
  		dat = SBUF;
  		SendData(dat + 1);
  		RI = 0;//手动将RI置位0.
  	}
  }
  
  void main(void)
  {
  	Init_STC();
  	Init_UART();
  	SendData(0x5a);
  	SendData(0xa5);
  	while (1){}
  }
  ```

### 7.进阶：

- 单片机向上位机**发送字符串**，并且**decoding**上位机的命令。

- ![442ac7a15924b4f28a23a1002ed6a05](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/442ac7a15924b4f28a23a1002ed6a05.png)

- ```c
  #include <STC15F2K60S2.H>
  #include <intrins.h>
  #define BAUD 9600
  #define SYSTEMCLK 11059200L
  
  unsigned char busy;
  unsigned char flag;
  unsigned char command;//变量command用来接收上位机发来的命令。
  void SendString(unsigned char* str);
  void Decoding();
  void Init_STC(void)
  {
  	P2 = P2 & 0x1f | 0x80;
  	P0 = 0xff;
  	P2 &= 0x1f;
  	
  	P2 = P2 & 0x1f | 0xa0;
  	P0 &= 0xbf;
  	P2 &= 0x1f;
  }
  void Init_Timer1(void)
  {
  	TL1 = (65536 - (SYSTEMCLK / 4 / BAUD));
  	TH1 = (65536 - (SYSTEMCLK / 4 / BAUD)) >> 8;
  	
  	TR1 = 1;
  	TMOD = 0x00;
  	AUXR = 0x40;
  }
  void Init_UART(void)
  {
  	Init_Timer1();
  	SCON = 0x50;
  	PCON = 0x00;
  	ES = 1;
  	EA = 1;
  	PS = 1;
  }
  void UART_Routine(void) interrupt 4
  {
  	if (RI == 1)
  	{
  		RI = 0;
  		command = SBUF;
  		flag = 1;//flag = 1表示接收完成上位机发来的信息。
  	}
  	if (TI == 1)
  	{
  		busy = 0;
  		TI = 0;
  	}
  }
  void SendData(unsigned char byte)
  {
  	while (busy == 1);
  	busy = 1;
  	SBUF = byte;
  }
  void SendString(unsigned char* str)
  {
  	while (*str != '\0')//字符串发送本质上是字节的发送，因为一个字符就是一个字节，因此需要循环调用字节发送函数。
  		SendData(*str++);
  }
  void Decoding()
  {
  	if (flag)//flag = 1，开始解码。
  	{
  		flag = 0;//将flag清0，避免重复解码。
  		switch(command & 0xf0)//选择command的前四位，后四位为0。
  		{
  			case 0xa0:
  				P2 = P2 & 0x1f | 0x80;
  				P0 = (P0 | 0xff) & (~command | 0xf0);
                  //这里我们要注意，问题是对应位为1，点亮，但是实际电路是对应位为0点亮，所以要执行一个取反操作。
  				P2 &= 0x1f;
  				break;
  			case 0xb0:
  				P2 = P2 & 0x1f | 0x80;
  				P0 = (P0 | 0xff) & (~(command << 4) | 0x0f);
  				P2 &= 0x1f;
  				break;
  			case 0xc0:
  				SendString("The System is Running...\r\n");
  				break;
  		}
  	}
  }
  void main(void)
  {
  	Init_STC();
  	Init_UART();
  	SendString("I Love The World.\r\n");//在串口通信中，要想实现平时的换行，就要使用\r\n
  	SendString("I Wish The World Love Me Too.\r\n");
  	while (1)
  	{
  		Decoding();//串口通信的解码函数不能放在中断里面，必须放在主函数的循环里面。
  	}
  }
  ```

- **目前的疑惑：为什么串口通信的解码函数不能放在中断函数里面，只能放在主函数的循环里面。**

