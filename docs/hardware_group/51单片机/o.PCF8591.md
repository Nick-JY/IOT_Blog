# PCF8591-ADC/DAC
### 1.PCF8591介绍：

- PCF8591是**八位的A/D和D/A转换器**，具有四个模拟输入(四个模拟信号输入端)，一个模拟输出(一个模拟信号输出)。
- 传输协议：IIC总线协议。
- 转换速率由IIC总线的最大传输速率决定的。
- 引脚介绍：
  - ![image-20230323100329486](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323100329486.png)
    - 其中，**AIN0,AIN1,AIN2,AIN3**是四个模拟信号输入端，如果我们要执行A/D转换，那么就要使用这些端口。
    - **A0,A1,A2**是设备地址，本质上，设备地址有七位，对于PCF8591来讲，前四位是固定值：1001，最后一位是R/W位。
      - ![image-20230323100821574](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323100821574.png)
      - 也就是说，IIC总线上最多可以挂载8个($2^3$)PCF8591芯片。
    - **VSS**，负电源电压引脚。
    - **VDD**，正电源电压引脚。
    - **AOUT**，模拟输出引脚，如果我们执行D/A转换，那么就要使用这个引脚。
    - **VERF**，基准电压，进行D/A和A/D转换的电压基准。
    - **OSC**，振荡器输入输出引脚。
    - **EXT**，选择内部、外部振荡器输入。
    - **AGND**，模拟地线，用于模拟电路部分。
    - **SCL**，IIC总线的时钟信号通路。
    - **SDA**，IIC总线的数据信号通路。

### 2.控制字节：

- ![image-20230323110241622](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323110241622.png)
- **Byte7：**保持0。
- **Byte6：**模拟信号输出使能端，如果我们要进行D/A转换，那么要讲这一位置位1(使能)。
- **Byte5、Byte4：**模拟信号输入模式，通常，再执行A/D转换的时候有两种模式
  - **单端输入(single-ended input)**：
    - ![image-20230323112213820](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323112213820.png)
    - 单端输入，输入信号均以共同的地线为基准，只有一个输入引脚VIN，使用公共地GND作为电路的返回端，ADC的采样值计算公式：
      - ![image-20230323112635851](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323112635851.png)
      - 先计算出每一份的电压值VLSB；
      - ![image-20230323112757507](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323112757507.png)
      - 计算所得即为ADC采样值。
    - 这种输入方式优点就是简单，缺点是如果VIN受到干扰，由于GND电位始终是0V，所以最终ADC的采样值也会随着干扰而变化。
  - **差分输入(differential input)**：
    - ![image-20230323114416331](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323114416331.png)
    - VIN和-VIN是一组反向的信号，ADC采样值的计算公式：
      - ![image-20230323114656048](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323114656048.png)
      - 先计算出每一份的电压值VLSB；
      - ![image-20230323114849160](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323114849160.png)
      - 计算所得即为ADC采样值。
    - 通常这两根差分线会布在一起，所以他们受到的干扰是差不多的，输入共模干扰，在输入ADC时会被减掉，从而降低了干扰，缺点就是接线复杂一些。
- **Byte3：**保持0。
- **Byte2：**通道自动递增标志。
  - 该标志用于A/D转换过程，如果该标志被使能，则通道号在每次A/D转换后自动递增。
  - 如果初始通道号设置为0，那么A/D转换一次之后，通道号变为1，继而变为2,3,0......
- **Byte1、Byte0：**初始通道号选择。

### 3.D/A转换过程：

- 首先，主机向总线上发送IIC传输的起始信号。

- 其次，主机向总线传输设备地址和R/W位：

  - R/W位置0，我们要向转换器的DAC数据寄存器中写入8位数据。

  - 如果开发板上只有一个PCF8591，那么A2,A1,A0三位全部接地，因此传输信号：**0x90**。

- PCF8591向主机发送应答信号。

- 然后，主机向PCF8591发送控制字节。

- PCF8591向主机发送应答信号。

- 接着，主机向PCF8591输入一字节的数据，存入其DAC数据寄存器中。

- PCF8591向主机发送应答信号。

- 接着，主机向PCF8591输入一字节的数据，存入其DAC数据寄存器中.......

- PCF8591向主机发送应答信号......

- 主机向总线发送停止信号。

  - ![image-20230323104300361](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323104300361.png)

### 3.D/A转换器：

- D/A转换器将DAC数据寄存器中的八位数据转换为响应的模拟电压。
- D/A转换器的构造：
  - ![image-20230323104718334](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323104718334.png)
  - 通过256个阻值相同的电阻串联，将**AGND ~ VREF**的电压分成256份。(因为8位的数字信号最多能转换256中不同的模拟电压信号，这个8位本质上来讲是转换精度)
  - **TAP DECODER**是一个选择解码器，通过DAC数据寄存器中的值进行选择，然后将选择的线路连通**DAC OUT**。
  - D/A转换器中，输出电压的计算公式：
    - ![image-20230323105441690](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323105441690.png)
  - 这里我们要注意，**AOUT端口的输出电压延时一个字节**，当我们输入第一个数据字节的时候，此时AOUT输出模拟电压是0V；当我们输入第二个数据字节的时候，此时AOUT输出电压是第一个数据字节的模拟电压。
    - ![image-20230323105956603](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323105956603.png)

### 3.A/D转换过程：

- 首先，主机向总线上发送IIC传输的起始信号。

- 其次，主机向总线传输设备地址和R/W位：
  - R/W位置0，我们首先要向PCF8591中写入控制字节。
  - 如果开发板上只有一个PCF8591，那么A2,A1,A0三位全部接地，因此传输信号：**0x90**。
  
- PCF8591向主机发送应答信号。

- 然后，主机向PCF8591发送控制字节。**(这个控制字节只发送一次)**

- PCF8591向主机发送应答信号。

- 接着，主机向总线发送IIC传输的终止信号。

  

- **接着，主机再一次向总线上发送起始信号。**

- 主机向总线传输设备地址和R/W位：

  - R/W位置1，我们要从PCF8591中读取数据。
  - 如果开发板上只有一个PCF8591，那么A2,A1,A0三位全部接地，因此传输信号：**0x91**。

- 接着，PCF8591向主机输入一字节的数据。

- 主机发送应答信号。

- 接着，PCF8591向主机输入一字节的数据......

- 主机发送应答信号......

- **当读取最后一个字节的时候，主机不应答。**

- 主机向总线发送停止信号。

### 4.A/D转换器：

- A/D转换器利用逐次逼近的转换技术，由一个**D/A转换器**和一个**高增益比较器**和**8bit逐次逼近缓冲寄存器**组成。
  - 逐次逼近的实现方式过程：
    - 首先，将逐次逼近缓冲寄存器各位清零。
    - 转换开始，现将逐次逼近缓冲寄存器的最高位置位1，然后把缓冲寄存器中的值送入D/A转换器，生成模拟信号Vo。
    - 将Vo送入高增益比较器，和输入的模拟信号Vin进行比较，如果Vo < Vin，则该位被保留，否则该位被清0。
    - 接着对缓冲寄存器的次高位置位1，执行相同的操作，直到寄存器的最低位，得到数字量的输出。
    - 数字量被存储在ADC数据寄存器中，等待被读取。

- **重点注意事项：**
  - 第一次读取的值是**0x80**(128)，这个值告诉我们ADC正常运行。
  - 第二次读取的值是第一次模拟信号转换的结果，以此类推。


### 5.蓝桥杯开发板：

- ![image-20230323142019661](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323142019661.png)
  - PCF8591芯片的AIN1引脚与光敏电阻相连接，输入的模拟信号是光敏电阻的电压。
- ![image-20230323142137702](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230323142137702.png)
  - PCF8591芯片的AIN3引脚与滑动变阻器相连接，输入的模拟信号是滑动变阻器的电压。

### 4.问题+实现：

- ADC实验转换：

  - **旋转Rb2电位器(滑动变阻器)，数码管显示数字在0~255之间进行变化。**

- ```c
  #include <reg52.h>
  #include <intrins.h>
  #include <iic.h>
  
  #define READ_DEVICE_ADDRESS 0x91//从PCF8591中读数据，读到的是ADC数据寄存器中的值。
  #define WRITE_DEVICE_ADDRESS 0x90//向PCF8591中写数据，写入控制字节或者数据。
  #define CONTROL_INSTRUCTION 0x03//控制字节，表示输入的模拟信号是单端信号，并且从AIN3输入，从channel3读取。
  
  code unsigned char SMG[] = {0xc0, 0xf9, 0xa4, 0xb0, 0x99, 0x92, 0x82, 0xf8, 0x80, 0x90};
  unsigned char display_num;
  
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
  }//数码管延时函数
  void init_STC(void)
  {
  	P2 = P2 & 0x1f | 0x80;
  	P0 = 0xff;
  	P2 &= 0x1f;
  	
  	P2 = P2 & 0x1f | 0xa0;
  	P0 &= 0xbf;
  	P2 &= 0x1f;
  }//初始化开发板
  unsigned char ADC_PCF8591(void)//PCF8591的ADC转换过程
  {
  	unsigned char dat;
  	IIC_Start();//首先，主机向总线发送开始信号
  	IIC_SendByte(WRITE_DEVICE_ADDRESS);//主机向总线发送设备地址：写控制字节
  	IIC_WaitAck();//等待PCF8591应答
  	IIC_SendByte(CONTROL_INSTRUCTION);//主机向PCF8591发送控制字节
  	IIC_WaitAck();//等待PCF8591应答
  	IIC_Stop();//结束
  	
  	IIC_Start();//开始信号
  	IIC_SendByte(READ_DEVICE_ADDRESS);//主机向总线发送设备地址：读ADC数据寄存器中的值
  	IIC_WaitAck();//等待PCF8591应答
  	dat = IIC_RecByte();//读取ADC寄存器中的值
  	IIC_SendAck(1);//主机不应答
  	IIC_Stop();//结束
  	
  	return dat;
  }
  void Static_Display(unsigned char num , unsigned char pos)
  {
  	P2 = P2 & 0x1f | 0xc0;
  	P0 = 0x01 << (pos - 1);
  	P2 &= 0x1f;
  	
  	P2 = P2 & 0x1f | 0xe0;
  	P0 = num;
  	P2 &= 0x1f;
  }//数码管静态显示
  void Close_SMG(void)
  {
  	P2 = P2 & 0x1f | 0xc0;
  	P0 = 0x00;
  	P2 &= 0x1f;
  }//关闭所有数码管，这个函数能避免数码管最后一个过亮
  void Dynamic_Display(unsigned char display_num)
  {
  	Static_Display(0xff , 1);
  	Delay1ms();
  	Static_Display(0xff , 2);
  	Delay1ms();
  	Static_Display(0xff , 3);
  	Delay1ms();
  	Static_Display(0xff , 4);
  	Delay1ms();
  	Static_Display(0xff , 5);
  	Delay1ms();
  	Static_Display(SMG[display_num / 100] , 6);
  	Delay1ms();
  	Static_Display(SMG[display_num / 10 % 10] , 7);
  	Delay1ms();
  	Static_Display(SMG[display_num % 10] , 8);
  	Delay1ms();
  	Close_SMG();
  	Delay1ms();
  }//动态显示数码管
  void main(void)
  {
  	init_STC();
  	while (1)
  	{
  		display_num = ADC_PCF8591();
  		Dynamic_Display(display_num);
  	}
  }
  ```
  
- DAC实验转换：

  - 按S6、S7按键，实现转换值变化(**转换数值从0开始，按S6增加5，按S7减少5**)，其中前面四位数码管显示数模转换的数字值，后四位显示模拟电压值，单位mV(**使用PCF8591的DAC转换的电压值单位是mV**)，其中参考电压是4.85V。

- ```c
  #include <STC15F2K60S2.H>
  #include <intrins.h>
  #include <iic.h>
  
  #define WRITE_DEVICE_ADDRESS 0x90
  #define READ_DEVICE_ADDRESS 0x91
  #define VREF 4850//标准电压，这里写4850，实际上单位是mV
  #define CONTROL_INSTRUCTION 0x40//控制字节，输出模拟信号
  sbit S6 = P3^1;
  sbit S7 = P3^0;//两个按键按钮
  
  code unsigned char SMG[] = {0xc0, 0xf9, 0xa4, 0xb0, 0x99, 0x92, 0x82, 0xf8, 0x80, 0x90};
  unsigned char Dac_value;
  unsigned int Vout;
  
  void Delay1ms()		//@11.0592MHz
  {
  	unsigned char i, j;
  
  	_nop_();
  	i = 17;
  	j = 31;
  	do
  	{
  		while (--j);
  	} while (--i);
  }//数码管动态显示延迟
  void Close_SMG(void)
  {
  	P2 = P2 & 0x1f | 0xc0;
  	P0 = 0x00;
  	P2 &= 0x1f;
  }//关闭所有数码管
  void init_STC(void)
  {
  	P2 = P2 & 0x1f | 0x80;
  	P0 = 0xff;
  	P2 &= 0x1f;
  	
  	P2 = P2 & 0x1f | 0xa0;
  	P0 &= 0xbf;
  	P2 &= 0x1f;
  }//初始化开发板
  void Static_Display(unsigned char num , unsigned char pos)
  {
  	P2 = P2 & 0x1f | 0xc0;
  	P0 = 0x01 << (pos - 1);
  	P2 &= 0x1f;
  	
  	P2 = P2 & 0x1f | 0xe0;
  	P0 = num;
  	P2 &= 0x1f;
  }//数码管静态显示
  void Update_Vout(void)
  {
  	Vout = VREF / 256 * Dac_value;
  }//这个函数很重要，问题让我们能在数码管上显示电压值，那么我们就得知道电压的计算公式，由于我们使用的是单端的电压转换，因此公式如上。
  void Dynamic_Display(void)
  {
  	Static_Display(SMG[Dac_value / 1000] , 1);
  	Delay1ms();
  	Static_Display(SMG[Dac_value / 100 % 10] , 2);
  	Delay1ms();
  	Static_Display(SMG[Dac_value / 10 % 10] , 3);
  	Delay1ms();
  	Static_Display(SMG[Dac_value % 10] , 4);
  	Delay1ms();
  	Static_Display(SMG[Vout / 1000] , 5);
  	Delay1ms();
  	Static_Display(SMG[Vout / 100 % 10] , 6);
  	Delay1ms();
  	Static_Display(SMG[Vout / 10 % 10] , 7);
  	Delay1ms();
  	Static_Display(SMG[Vout % 10] , 8);
  	Delay1ms();
  	Close_SMG();
  	Delay1ms();
  }//数码管动态显示
  void Eliminate_jetter_delay(unsigned int t)
  {
  	while (t--);
  }//按键消抖，参数是100
  void Key_Scan(void)
  {
  	Dynamic_Display();//进入if之前要有动态显示
  	if (S6 == 0)
  	{
  		Eliminate_jetter_delay(100);
  		if (S6 == 0)//按键消抖
  		{
  			Dac_value += 5;//先更新Dac_value的值，然后在调用Vout更新函数，这样两者的显示才能同步。
  			Update_Vout();
  			while (S6 == 0)
  			{
  				Dynamic_Display();//注意，这里面也要放一个动态显示，要不然按键按下去的时候，会出现熄灭现象。
  			}
  		}
  	}
  	Dynamic_Display();//进入if之前要有动态显示(这个不有也可以)
  	if (S7 == 0)
  	{
  		Eliminate_jetter_delay(100);
  		if (S7 == 0)//按键消抖
  		{
  			Dac_value -= 5;//先更新Dac_value的值，然后在调用Vout更新函数，这样两者的显示才能同步。
  			Update_Vout();
  			while (S7 == 0)
  			{
  				Dynamic_Display();//注意，这里面也要放一个动态显示，要不然按键按下去的时候，会出现熄灭现象。
  			}
  		}
  	}
  }
  void DAC_PCF8591(void)
  {
  	IIC_Start();//首先，主机向总线发送开始信号
  	IIC_SendByte(WRITE_DEVICE_ADDRESS);//向总线发送设备地址：写入控制字节
  	IIC_WaitAck();//等待PCF8591回应
  	IIC_SendByte(CONTROL_INSTRUCTION);//向PCF8591发送控制字节
  	IIC_WaitAck();//等待PCF8591回应
  	
  	
  	IIC_SendByte(Dac_value);//向PCF8591发送DAC待转换的数据
  	IIC_waitAck();//等待PCF8591回应
  	IIC_Stop();//结束
  }
  
  void main(void)
  {
  	init_STC();
  	while (1)
  	{
  		Key_Scan();
  		DAC_PCF8591();
  	}
  }
  ```



