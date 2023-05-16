# DS18B20数字温度计
### 1.DS18B20的介绍：

- 温度测量范围：-55℃~+125℃。
- 数字转换分辨率：9~12位分辨率可调，**默认分辨率是12位**。
  - 对应的转换精度：0.5℃、0.25℃、0.125℃、**0.0625℃**。
  - **当转换精度为0.0625摄氏度的时候，一份温度就代表0.0625摄氏度。**

- DS18B20通过单总线与主机进行通信，显然二者之间只有一根数据线。
- 所有单总线协议的设备都带有**3-5v的上拉电阻**，因此总线的空闲状态为**高电平**。**注意该类设备由主机进行供电**。
- **1-wire协议**的器件必须具有**接地线**，允许回流电流流通。

![image-20230316092710988](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230316092710988.png)

- DQ表示DS18B20的**单总线端口**，通过P14引脚与主机进行通信。
- R11是一个大小为10K的上拉电阻，当总线处于空闲状态的时候，上拉电阻将总线拉至高电平。

### 2.DS18B20的内部存储结构：

- DS18B20内部有**64bit的ROM**和**9byte的高速暂存器**。
  - 其中，64bit的ROM含有一串64bit的标识码，该标识码**唯一标识**这个DS18B20数字温度计。
    - 通俗点来讲，ROM存的是序列码。
- ![image-20230316093659199](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230316093659199.png)
  - Byte0：**LSB**，温度数据的低八位。
  - Byte1：**MSB**，温度数据的高八位。
  - Byte2：TH字节为用户配置字节，存储报警温度的最高值。
  - Byte3：TL字节为用户配置字节，存储报警温度的最低值。
  - Byte4：配置寄存器，用来设置数字转换分辨率。
    - ![image-20230316101014487](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230316101014487.png)
    - 我们只能操作配置寄存器的**BIT6和BIT5**，当分辨率越高的时候，温度的转换时间越慢。如果我们要想减少温度的转换时间，就要降低分辨率，例如选择9。
  - Byte5：保留字节。
  - Byte6：保留字节。
  - Byte7：保留字节。
  - Byte8：存储CRC码，**8位循环冗余检验代码**。
- **在实际比赛中，我们用到的只有前两个字节的高速暂存器。**

### 3.DS18B20的温度数据格式与处理：

- ![image-20230316101226751](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230316101226751.png)

- 这两个字节构成一个**十六位的温度数据**。

  - ```c
    unsigned int Temp = 0x0000;//51单片机中的int占位是16位。
    Temp = MSB;//将MSB的数据赋值给Temp的低八位。
    Temp = Temp << 8;//将MSB的数据移动到Temp的高八位。
    Temp = Temp | LSB;//将LSB赋值给Temp的低八位。
    ```

  - Temp中的数据采用的是**二进制补码**表示：

    - 其中，高五位是**符号位**，如果是正数，高五位全为0；如果是负数，高五位全为1。
    - BIT10 ~ BIT4是**整数位**。
    - BIT3 ~ BIT0是**负数位**。

- ``十六位温度数据 * 数字转换精度 = 温度`` 

### 4.正确显示规则：

- ```markdown
  举一个例子来给大家说明这个处理的具体过程：
  T_dat是unsigned int类型。
  假设DS18B20的温度采样结果是：LSB = 0x96，MSB = 0x01。
  温度数据变量T_dat为16位无符号int整型，初始值为0x0000。
  执行T_dat = MSB；语句后， T_dat 的值为：0x0001。
  执行T_dat <<= 8；语句后， T_dat 的值为：0x0100。
  执行T_dat = T_dat | LSB；语句后， T_dat 的值为：0x0196。
  通过高5位的符号扩展位判断，进行正温度的处理算法，正常来说，应该是：
  T_dat = 0x0196 × 0.0625 = 406 × 0.0625 = 25.375摄氏度。
  
  =========================================================================================================
  
  如果要求温度结果保留1位小数，为了简化在单片机中的运算，可以放大10倍进行整型处理：
  首先将温度结果的整数部分取出： T_dat >>= 4；即 T_dat = 0x0019 = 25(我们发现，正好是结果中的整数，因此我们会发现，数字转换精度只对小数部分起作用)
  然后将整数部分放大10倍： T_dat = T_dat × 10 ；即 T_dat = 250。
  然后将小数部分取出： LSB&0x0f，其结果为0x06。
  再将小数部分乘以0.0625的10倍，即0x06 × 0.625 = 3.75。(如果四舍五入的话，+0.5)
  最后将整数部分和小数部分相加： T_dat = 250 + 3.75 = 253。为什么？因为 T_dat 是整型。
  对于温度数据253，在数码管显示的时候，在十位出加上一个小数点，就变成了：25.3。
  这样可以让单片机避免很多浮点运算，而且数码管显示也会很简洁很方便。
  
  =========================================================================================================
  
  如果要求温度结果保留2位小数：
  首先将温度结果的整数部分取出： T_dat >>= 4；即 T_dat = 0x0019 = 25
  然后将整数部分放大100倍： T_dat = T_dat × 100 ；即 T_dat = 2500。
  然后将小数部分取出： LSB&0x0f，其结果为0x06。
  再将小数部分乘以0.0625的100倍，即0x06 × 6.25 = 37.5。(如果要四舍五入的话，+0.5)
  最后将整数部分和小数部分相加： T_dat = 2500 + 37.5 = 2537。
  
  如果要求温度结果显示整数，那么只需要执行：T_dat >>= 4；即 T_dat = 0x0019 = 25即可。
  ```

### 5.单总线访问协议：

- 所有的单总线设备都符合单总线协议的时序逻辑(**这一时序逻辑是固定的**)
  - 步骤一：复位初始化
  - 步骤二：ROM操作指令
  - 步骤三：功能操作指令
  - **必须严格按顺序遵循这三个步骤。**


- 对于单总线协议来讲，一个主机可以连接多个设备，因此ROM操作指令用来选择主机所要操作的设备，如果单总线上只有一个设备，那么我们不需要执行ROM阶段的操作，但是需要执行一条ROM操作指令，即跳过ROM，对于DS18B20来讲，这条指令是**CCH**。
- 功能操作指令有**写操作**和**读操作**，这两种操作有着严格的时序要求(所有单总线设备都遵循)：
  - 对于DS18B20来讲，写操作是向TH和TL和配置寄存器写入数据，主机向DS18B20写入三字节数据(分次写入)，第一个字节写入TH，第二个字节写入TL，第三个字节写入配置寄存器。操作指令是**4EH**。
  - 对于DS18B20来讲，读操作是读取九个高速暂存器中的值，我们分九次读取，第一次读取第0个字节，第二次读取第一个字节......但是通常，我们只需要前两个字节，读取完前两个字节，直接复位即可。

### 6.单总线的复位、写、读时序：

- 所有的单总线设备都遵循这一时序：

  - (在比赛中，这些代码会作为底层驱动代码提供，但我们还应能看懂代码)

- 复位时序：

  - ![image-20230316104737162](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230316104737162.png)

  - 图中三种线的类型：

    - 总线主控端拉低(主机拉低)
    - DS18B20拉低
    - 总线释放

  - 首先，主机复位脉冲传输，总线被拉低至少480us，480us之后，总线上的所有设备都会被复位(**注意，这时已经完成复位**)。

  - 然后总线释放(这个过程在15~60us)

  - 随后DS18B20将总线拉低60~240us，这一步的作用是DS18B20产生应答信号，主机可以通过这个60~240us的低电平应答信号来查看是否完成复位。

  - 总线释放，完成复位过程。

  - ```c
    //DS18B20的复位底层驱动代码参考--51版，这个代码可能是针对12T老51单片机的代码，对于比赛中的1T51单片机，我们把延时函数中的参数扩大10倍或12倍即可。
    bit Init_DS18B20(void)
    {
    	bit initflag = 0;    //应答信号
    	DQ = 0;
    	Delay_OneWire(50);   //拉低总线480us以上 		
    	DQ = 1;		         //释放总线							
    	Delay_OneWire(5); 	 //等待15～60us		
    	initflag = DQ;       //读取18B20的复位应答信号		
    	Delay_OneWire(10);	 //等待60～240us，这个等待时间t，60 < t < 240		
      	return initflag;	 //应答信号为低电平，表示复位成功			
    }
    ```

- 写时序：

  - ![image-20230316110003647](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230316110003647.png)

  - 写操作分为两种，一种是写入0，一种是写入1。

    - 当写入二进制1的时候，主机发送一个1~15us的低电平脉冲，随后释放总线。
    - 当写入二进制0的时候，主机发送一个60us的低电平脉冲，随后释放总线。
    - 不论是写入1还是写入0，**写入操作必须维持60us**，对于写入1来讲，释放总线的时间也记录在内。

  - ```c
    //DS18B20的写操作底层驱动代码参考--51版
    void Write_DS18B20(unsigned char dat)
    {
    	unsigned char i;
    	for(i=0;i<8;i++)//每一次循环写入1位，循环八次写入一个字节，从最低位开始写。             
    	{
    		DQ = 0;		         //先拉低总线电平1～15us						
    		DQ = dat&0x01;	     //向总线写入一个位数据(最低位)
            //这里需要我们着重分析，如果写入的是1，那么此时DQ就相当于被拉高，和释放总线一个道理，之后在维持45us高电平状态，完成写入，最后执行一步释放总线。
            //如果写入的是0，那么此时DQ依旧处于低电平，之后在维持45us低电平状态，完成写入，最后执行一步释放总线。
    		Delay_OneWire(5);    //维持状态20～45us
    		DQ = 1;	             //释放总线			
    		dat >>= 1;           //准备发送下一个数据位，移位发送下一位。			
    	}
    }
    ```

- 读时序：

  - ![image-20230316111308305](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230316111308305.png)

  - 接收数据有两种情况，接收数据1和接收数据0，所有接收数据必须至少持续60us：

    - 接收数据1：首先，主机发送1-15us的拉低脉冲，如果设备要向主机发送1，则不执行任何操作，总线释放。
    - 接收数据0：首先，主机发送1-15us的拉低脉冲，如果设备要向主机发送0，则DS18B20将总线拉低45us，最后释放总线。

  - ```c
    //DS18B20的读操作底层驱动代码参考--51版
    unsigned char Read_DS18B20(void)
    {
    	unsigned char i;
    	unsigned char dat;
    	for(i=0;i<8;i++)
    	{
    		DQ = 0;          //先将总线电平拉低1～15us
    		dat >>= 1;	     //我们每次读取的数据都放在dat的最高位，然后每次都右移一位，最后一开始的最高位就变成了最低位					
    		DQ = 1;		     //然后释放总线
            //这里我们要注意，如果设备要发送0，那么我们释放总线之后，设备还是会将总线拉低。
    		if(DQ)		     //读取总线上的电平状态，如果DQ = 1，说明设备想要向主机发送1，那么我们就把dat最高位置位1						
    		{
    		    dat |= 0x80;
    		}	    
    		Delay_OneWire(5);    //延时45us左右，再度下一个数据位
            //这里最好再加一个释放总线。
    	}
    	return dat;
    }
    ```

### 7.读取一次DS18B20温度的操作：

- 主机对DS18B20进行复位初始化。
- 主机向DS18B20写0xCC命令，跳过ROM。
- 主机向DS18B20写0x44命令，开始进行温度转换。
-  等待温度转换完成。
-  主机对DS18B20进行复位初始化。
- 主机向DS18B20写0xCC命令，跳过ROM。
- 主机向DS18B20写0xBE命令，依次读取DS18B20发出的从第0一第8，共九个字节的数据。如果只想读取温度数据，那在读完第0和第1个数据后就不再理会后面DS18B20发出的数据即可，或者通过DS18B20复位，停止数据的输出。

### 8.工程创建：

- 通过**数码管显示**和通过**串口通信**(串口通信的时候，T_dat是浮点数即可，最后传送的时候使用sprintf传递字符串)

- 工程创建之后引入相关文件(单总线文件)：

  - ![image-20230316125947773](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230316125947773.png)
  - **注意，要把这两个文件同时拷贝到工程文件夹里面。**
  - 补全``onewire.h``
    - 一开始![image-20230316130036292](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230316130036292.png)
    - 补全之后![image-20230316130157973](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230316130157973.png)

  - 补全onewire.c文件

  - ```c
    #include "reg52.h"
    #include <intrins.h>
    sbit DQ = P1^4;  
    
    
    void Delay_OneWire(unsigned int t)  //STC89C52RC
    {
    	unsigned int i;
    	while(t--)
    		for (i = 0 ; i < 12 ; i++);//一定要注意这个函数，在初始文件中，没有12次for循环，因此我们要加上这个for循环，否则不能正确读出温度。
    }
    
    
    void Write_DS18B20(unsigned char dat)
    {
    	unsigned char i;
    	for(i=0;i<8;i++)
    	{
    		DQ = 0;
    		DQ = dat&0x01;
    		Delay_OneWire(5);
    		DQ = 1;
    		dat >>= 1;
    	}
    	Delay_OneWire(5);
    }
    
    
    unsigned char Read_DS18B20(void)
    {
    	unsigned char i;
    	unsigned char dat;
      
    	for(i=0;i<8;i++)
    	{
    		DQ = 0;
    		dat >>= 1;
    		DQ = 1;
    		if(DQ)
    		{
    			dat |= 0x80;
    		}	    
    		Delay_OneWire(5);
    	}
    	return dat;
    }
    
    
    bit init_ds18b20(void)
    {
      	bit initflag = 0;
      	
      	DQ = 1;
      	Delay_OneWire(12);
      	DQ = 0;
      	Delay_OneWire(80);
      	DQ = 1;
      	Delay_OneWire(10); 
        initflag = DQ;     
      	Delay_OneWire(5);
      
      	return initflag;
    }
    unsigned int rd_temperature(void)//重点是补全这个函数。
    {
    	unsigned char LSB;
    	unsigned char MSB;
    	unsigned int temp = 0x0000;
    	
    	init_ds18b20();//初始化DS18B20
    	Write_DS18B20(0xcc);//跳过ROM
    	Write_DS18B20(0x44);//让DS18B20开始温度转换。
    	Delay_OneWire(200);//延时750ms，一定要注意，这个函数的这个参数是200。
    	
    	init_ds18b20();//初始化DS18B20
    	Write_DS18B20(0xcc);//跳过ROM
    	Write_DS18B20(0xbe);//读取DS18B20的九字节暂存器
    	LSB = Read_DS18B20();//读出byte0中的数据
    	MSB = Read_DS18B20();//读出byte1中的数据
    	init_ds18b20();//不继续读下去了，初始化DS18B20
    	temp = MSB;
    	temp = temp << 8;
    	temp |= LSB;
    	if ((temp & 0xf800) == 0x0000)//如果temp的高五位是00000，那么说明temp是一个正数。
    	{
    		temp = temp >> 4;//取出整数部分
    		temp = temp * 10;//整数部分 * 10
    		temp = temp + (LSB & 0x0f) * 0.625;//得到一个三位数。
    	}
    	
    	return temp;
    }
    ```
  
- **数码管显示：**

  - ```c
    #include <STC15F2K60S2.H>
    #include <intrins.h>
    #include <onewire.h>
    
    code unsigned char SMG[] = {0xc0 , 0xf9 , 0xa4 , 0xb0 , 0x99 , 0x92 , 0x82 , 0xf8 , 0x80 , 0x90};
    //上面是0~9的字段码
    code unsigned char SMG_[] = {0x40 , 0x79 , 0x24 , 0x30 , 0x19 , 0x12 , 0x02 , 0x78 , 0x00 , 0x10};
    //上面是0.~9.的字段码
    unsigned int T_dat = 0x0000;
    void Delay1500us()		//@11.0592MHz
    {
    	unsigned char i, j;
    
    	_nop_();
    	i = 17;
    	j = 31;
    	do
    	{
    		while (--j);
    	} while (--i);
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
    
    void Static_Display(unsigned char num , unsigned char pos)
    {
    	P2 = P2 & 0x1f | 0xc0;
    	P0 = 0x01 << (pos - 1);
    	P2 &= 0x1f;
    	
    	P2 = P2 & 0x1f | 0xe0;
    	P0 = num;
    	P2 &= 0x1f;
    }
    void Close_AllSMG(void)
    {
    	P2 = P2 & 0x1f | 0xc0;
    	P0 = 0x00;
    	P2 &= 0x1f;
    }
    void Dynamic_Display(void)
    {
    	Static_Display(SMG[T_dat / 100] , 6);
    	Delay1500us();
    	Static_Display(SMG_[T_dat / 10 % 10] , 7);
    	Delay1500us();
    	Static_Display(SMG[T_dat % 10] , 8);
    	Delay1500us();
        Close_AllSMG();//如果我们发现，最后的数码管要明显比前面的数码管亮(说明最后一个数码管亮的时间长)，那么我们需要在程序执行完毕之后将所有数码管关闭。
    }
    void main(void)
    {
    	Init_STC();
    	while (1)
    	{
    		T_dat = rd_temperature();
    		Dynamic_Display();
    	}
    }
    ```

- **串口通信显示：**

  - ```c
    #include <STC15F2K60S2.H>
    #include <intrins.h>
    #include "onewire.h"
    #include <stdio.h>
    #define BAUD 9600
    #define SYSTEMCLK 11059200L
    code unsigned char SMG[] = {0xc0 , 0xf9 , 0xa4 , 0xb0 , 0x99 , 0x92 , 0x82 , 0xf8 , 0x80 , 0x90};
    code unsigned char SMG_[] = {0x40 , 0x79 , 0x24 , 0x30 , 0x19 , 0x12 , 0x02 , 0x78 , 0x00 , 0x10};
    unsigned char busy;
    unsigned char command;
    unsigned char flag;
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
    	TMOD = 0X00;
    	AUXR = 0X40;
    	
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
    		flag = 1;
    	}
    	if (TI == 1)
    	{
    		TI = 0;
    		busy = 0;
    	}
    }
    void SendData(unsigned char dat)
    {
    	while (busy == 1);
    	busy = 1;
    	SBUF = dat;
    }
    void SendString(unsigned char* str)
    {
    	while (*str != '\0')
    	{
    		SendData(*str++);
    	}
    }
    void Decoding()
    {
    	char str[30];
    	double d_tem;
    	if (flag == 1)
    	{
    		flag = 0;
    		if (command == 0xa0)
    		{
    			d_tem = rd_temperature();
    			if ((85.00 - d_tem) < 0.1)
    			{
    				SendString("I'm tring to get information!\r\nPlease send command again!\r\n");
    			}
    			else
    			{
    				sprintf(str,"The Temperature is %.2f.\r\n",d_tem);
    				SendString(str);
    			}
    		}
    	}
    }
    void main(void)
    {
    	Init_UART();
    	Init_STC();
    	SendString("Hello! \r\nWelcome to use Temperature help!\r\n");
    	while (1)
    	{
    		Decoding();
    	}
    }
    ```