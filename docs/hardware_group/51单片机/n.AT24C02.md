# AT24C02-EEPROM
### 1.AT24C02介绍：

- AT24C02是大小为2Kbit的**EEPROM**(电可擦除和可编程只读存储器)，虽然叫只读存储器，但是EEPROM还是可以写入数据的。
- 通讯协议：IIC总线协议。
- ![image-20230321195833562](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230321195833562.png)
  - 其中``A2,A1,A0``寻址设备地址，设备地址本质上有7位，其中前四位固定为1010，后三位由用户定义，因此可以在IIC总线上挂载8个($2^3$个)AT24C02设备。
  - ![image-20230321200942413](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230321200942413.png)
    - 设备地址的最后一位表示主机对EEPROM的操作，让**WP = 0**的时候表示写EEPROM，当**WP = 1**的时候表示读EEPROM。
  - 对于AT24C02来讲，如果IIC总线上只有一个设备，那么``A2,A1,A0``默认是接地。
  - 其中``WP``是写保护端，高电平使能：
    - 当``WP = 0``的时候，允许对EEPROM正常读/写。
    - 当``WP = 1``的时候，不允许对EEPROM进行写操作。
  - ``SCL(serial clock)``是主机向从机发送时钟信号的通路。
  - ``SDA(serial data)``是主机和从机进行数据交换的通路。

### 2.IIC总线协议：

- IIC总线协议由philips公司提出，是一种同步、半双工、串行总线协议，用于近距离、**低速的芯片**之间的传输。
- ![image-20230321202629209](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230321202629209.png)
- 通过IIC总线进行通信的设备之间只需要连接两根数据线，一根是SCL，一根是SDA。这些设备的SCL端口和SDA端口全部挂载到这两根总线上。
- SCL的作用：**让两个设备之间同步时钟，避免数据发送过程中出错。**
- **这些设备，既可以做主机，也可以做从机。**
- **对于AT24C02来讲，其SDA引脚是开漏输出，开漏输出的特点是不能驱动高电平，因此在SDA和SCL总线上接上拉电阻。**
- IIC总线的通信过程：
  - 1.主机发送起始信号启用总线：
    - 起始信号：![image-20230321210952037](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230321210952037.png)
    - **SCL保持高电平，SDA从高电平变为低电平**：表示主机在总线上发送起始信号，总线上的其他设备都会收到这个信号。
      - **(发送完起始信号之后，SCL变为低电平)**
  - 2.通信过程：
    - ![image-20230321212503628](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230321212503628.png)
    - 主机首先向SDA总线上发送一字节数据，这一字节数据是主机要进行通信的从机的**设备地址**，设备地址是7bit，最后1bit是数据的传递方向，也就是**R/W**，如果最后**R/W = 0**，说明主机向从机传递数据，当**R/W = 1**，说明从机向主机传递数据。
    - **对于IIC总线协议，发送字节的数据的传输从最高位开始**
    - 起始信号发出后，主机向SDA总线上发送的数据可以在SCL为低电平的时候变化，但是当SCL为高电平的时候，SDA必须保持稳定。**在SCL为高电平的时候，SDA上的数据发送给从机。**
    - 当发送完一个字节数据之后，被寻址的从机执行**acknowledge**，也就是应答，如果从机收到应答，则向主机发送**1bit数据0。**
    - 之后，主机发送一字节数据，从机发送应答信号......
    - 通信完成后，主机发送停止信号，通信结束。
- 典型的IIC时序：
  - **主机向从机发送数据：**
    - ![image-20230321220844589](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230321220844589.png)
      - 首先，主机向SDA总线发送起始信号。
      - 接着，主机向SDA总线发送从机地址和R/W位，然后对应的从机向主机发送**应答信号A。**
      - 接着主机向从机发送数据。
      - 两种情况让发送终止：
        - 当从机不想再接收数据的时候(一般是接收数据达到限度)，当接收完最后一字节的数据之后，从机不再发送应答信号，即~A，主机接下来向SDA总线发送停止信号。
        - 当主机不想再向从机发送数据，在发送完最后一字节数据之后，从机正常应答，主机向SDA总线发送停止信号。
  - **从机向主机发送数据：**
    - ![image-20230321222732650](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230321222732650.png)
    - 首先，主机向SDA总线发送起始信号。
    - 接着，主机向SDA总线发送从机地址和R/W位，然后对应的从机向主机发送**应答信号A。**
    - 接着从机向主机发送数据(**依旧符合上面的IIC总线通信过程**)，然后**主机发送应答信号**。
    - 当主机不再接收数据的时候，在最后一字节数据发送完成之后，主机不应答，然后向SDA总线发送停止信号。
  - **主机先向从机发送数据，然后从机再向主机发送数据：**
    - ![image-20230321225013400](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230321225013400.png)
    - 首先，主机向SDA总线发送起始信号。
    - 接着，主机向SDA总线发送从机地址和R/W位，然后对应的从机向主机发送**应答信号A。**
    - 接着主机向从机发送数据，从机产生应答信号，**当主机向从机发送最后一个字节数据的时候，从机可以选择应答，也可以选择不应答**
    - 主机再次向从机发送起始信号。
    - 接着，主机向SDA总线发送从机地址和R/W位，然后对应的从机向主机发送**应答信号A。**
    - 接着从机向主机发送数据，主机发送应答信号，当主机不再接收数据的时候，在最后一字节数据发送完成之后，主机不应答，然后向SDA总线发送停止信号。

### 3.AT24C02的通讯时序及驱动代码：

- 起始信号：

  - ```c
    void IIC_Start(void)
    {
        SDA = 1;
        SCL = 1;
        IIC_Delay(DELAY_TIME);
        SDA = 0;
        IIC_Delay(DELAY_TIME);
        SCL = 0;
        //SCL保持高电平，SDA由高电平变为低电平。
        //把SCL拉低。
    }
    ```

- 终止信号：

  - ```c
    void IIC_Stop(void)
    {
        SDA = 0;
        SCL = 1;
        IIC_Delay(DELAY_TIME);
        SDA = 1;
        IIC_Delay(DELAY_TIME);
        //SCL保持高电平，SDA由低电平变为高电平。
    }
    ```

- 主机向EEPROM写入一字节数据：

  - ![image-20230321230554819](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230321230554819.png)

    - 首先，主机向SDA总线发送起始信号。
    - 其次，主机向SDA总线发送设备地址和R/W位，接着EEPROM应答。
    - 其次，主机向EEPROM发送待写入的数据地址，接着EEPROM应答。
    - 其次，主机向EEPROM发送待存入数据，接着EEPROM应答。
    - 最后，主机向SDA总线发送停止信号。

  - ```c
    //主机通过IIC总线发送数据
    void IIC_SendByte(unsigned char byt)
    {
        unsigned char i;
    
        for(i=0; i<8; i++)
        {
            SCL  = 0;
            IIC_Delay(DELAY_TIME);
            if(byt & 0x80) SDA  = 1;
            else SDA  = 0;
            IIC_Delay(DELAY_TIME);//当SCL是低电平的时候，把数据放入SDA总线，并且先发字节的高位。
            SCL = 1;//当SCL为高电平的时候，把数据发送到EEPROM。
            byt <<= 1;//接着发送字节的次高位。
            IIC_Delay(DELAY_TIME);
        }
        SCL  = 0;  //最后把SCL置位低电平。
    }
    ```

  - ```c
    //主机发送应答
    void IIC_SendAck(bit ackbit)
    {
        SCL = 0;
        SDA = ackbit;  					// 0：应答，1：非应答
        //首先，SCL保持低电平，此时SDA存入应答信号
        IIC_Delay(DELAY_TIME);
        SCL = 1;//SCL为高电平，此时SDA保持应答信号，被接收设备接收
        IIC_Delay(DELAY_TIME);
        SCL = 0; //SCL回到低电平
        SDA = 1;//SDA被释放
        IIC_Delay(DELAY_TIME);
    }
    ```

  - ```c
    //主机等待从机应答
    unsigned char IIC_Waitack(void)
    {
    	unsigned char ackbit;
    	
        SCL = 1;//SCL为高电平，此时已经将应答信号发送给SDA，我们接下来把这个信号读取出来。
        IIC_Delay(DELAY_TIME);
        ackbit = SDA;//将应答信号读取到变量中。
        SCL = 0;
        IIC_Delay(DELAY_TIME);
    	
    	return ackbit;//将应答信号返回，但一般不会用到这个值，因为EEPROM中从机发送的应答都为0。
    }
    ```

  - **注意，写入一个字节之后，我们需要延时。**

    - ![image-20230322003718775](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230322003718775.png)

    - 写入一个字节(已经发送停止信号)之后，EEPROM进入内部写时间周期，把数据写入非易失存储器中，因此我们需要等待延时时间。

    - ```c
      //比赛中这个函数不给出，要自己写。
      void InternallyTimedWrite_Delay(unsigned char t)
      {
      	unsigned char i;
      	
      	while(t--){
      		for(i=0; i<112; i++);
      	}
      }
      //传递参数为10
      ```

- 主机向EEPROM写入一页数据：

  - ![image-20230321233724736](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230321233724736.png)
  - **对于AT24C02来讲，ROM大小是2Kbit，也就是256byte，一共分为32页，每页8byte。**
  - 在上面这种通信方式中，DATA最多发送8byte，也就是一页。
  - 如果发送的DATA多于8byte，则回滚覆盖。

- 当前地址读取(**上次访问/操作过的最后一个地址+1之后的地址**)：

  - ![image-20230321235440355](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230321235440355.png)
  - 从机应答，主机不应答。

- 随机读取：

  - ![image-20230321235624787](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230321235624787.png)
  - 对应IIC第三种典型时序。

- 顺序读取：

  - ![image-20230321235807316](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230321235807316.png)
  - 从当前地址开始读取，当存储器地址达到限制的时候，地址将会翻转从而继续实现读取。

- ```c
  //主机从I2C总线上接收数据
  unsigned char IIC_RecByte(void)
  {
      unsigned char i, da;
      for(i=0; i<8; i++)
      {   
      	SCL = 1;//首先将SCL拉高，拉高之后读取SDA上面的数据。
  	IIC_Delay(DELAY_TIME);
  	da <<= 1;//注意，读取的时候最先读出的是字节的最高位。
  	if(SDA) da |= 1;
  	SCL = 0;//读取完毕将SCL拉低。
  	IIC_Delay(DELAY_TIME);
      }
      return da;    
  }
  ```

### 4.实验：

- **利用EEPROM存储开机次数，每次开机，数码管显示数字加1：**

  - 我们只用到EEPROM的单字节读/写：

  - ```c
    //蓝桥杯单片机比赛：IIC延时函数修改
    void IIC_Delay(unsigned char i)
    {
        do
        {
        	_nop_();_nop_();_nop_();_nop_();_nop_();
        	_nop_();_nop_();_nop_();_nop_();_nop_();
        	_nop_();_nop_();_nop_();_nop_();_nop_();
        }while(i--);
    }
    //在do while循环中写15个_nop_()函数。
    //传递的参数恒定为5，使用宏定义DELAY_TIME。
    ```

  - ```c
    #include <STC15F2K60S2.H>
    #include <intrins.h>
    #include <iic.h>
    //由于我们只有一个EEPROM设备，因此设备地址是1010000，后三位接地，然后第八位是R/W
    #define DEVICE_ADDR_W 0xa0 //R/W = 0,写入数据
    #define DEVICE_ADDR_R 0xa1 //R/W = 1，读取数据
    
    code unsigned char SMG[] = {0xc0, 0xf9, 0xa4, 0xb0, 0x99, 0x92, 0x82, 0xf8, 0x80, 0x90};
    unsigned char count = 0;//这个count用来取出EEPROM中的数据。
    
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
    }//数码管动态显示延时函数。
    
    void Init_STC(void)
    {
    	P2 = P2 & 0x1f | 0xa0;
    	P0 &= 0xbf;
    	P2 &= 0x1f;
    	
    	P2 = P2 & 0x1f | 0x80;
    	P0 = 0xff;
    	P2 &= 0x1f;
    }//初始化STC开发板。
    void Static_Display(unsigned char num , unsigned char pos)
    {
    	P2 = P2 & 0x1f | 0xc0;
    	P0 = 0x01 << (pos - 1);
    	P2 &= 0x1f;
    	
    	P2 = P2 & 0x1f | 0xe0;
    	P0 = num;
    	P2 &= 0x1f;
    }//静态显示函数。
    void Dynamic_Display(void)
    {
    	Static_Display(SMG[count / 100] , 6);
    	Delay1ms();
    	Static_Display(SMG[count / 10 % 10] , 7);
    	Delay1ms();
    	Static_Display(SMG[count % 10] , 8);
    	Delay1ms();
    }//动态显示函数，由于count的范围是[0,255]，因此我们显示三位数字。
    void InterallyTimedWrite_Delay(unsigned char t)
    {
    	unsigned char i;
    	while (t--)
    		for (i = 0 ; i < 112 ; i++);
    }//这个函数是向EEPROM中写一个字节数据之后，EEPROM进行内部写周期的延时。
    void Write_EEPROM(unsigned char word_addr , unsigned char dat)
    {
    	IIC_Start();
    	IIC_SendByte(DEVICE_ADDR_W);
    	IIC_WaitAck();
    	IIC_SendByte(word_addr);
    	IIC_WaitAck();
    	IIC_SendByte(dat);
    	IIC_WaitAck();
    	IIC_Stop();
    	InterallyTimedWrite_Delay(10);
    }//向EEPROM中写入一字节数据。
    unsigned char Read_EEPROM(unsigned char word_addr) //random read
    {
    	unsigned char dat;
    	IIC_Start();
    	IIC_SendByte(DEVICE_ADDR_W);
    	IIC_WaitAck();
    	IIC_SendByte(word_addr);
    	IIC_WaitAck();
    	
    	IIC_Start();
    	IIC_SendByte(DEVICE_ADDR_R);
    	IIC_WaitAck();
    	dat = IIC_RecByte();
    	IIC_SendAck(1);
    	IIC_Stop();
    	
    	return dat;
    }//从EEPROM中读取一字节数据。
    void main(void)
    {
    	Init_STC();
    	count = Read_EEPROM(0x00);//每次开机，都从EEPROM中的0x00地址上读数据。
    	Delay1ms();
    	Write_EEPROM(0x00,count + 1);//将读出来的数据+1后写进0x00这个地址。
    	while (1)
    	{
    		Dynamic_Display();
    	}
    }
    ```