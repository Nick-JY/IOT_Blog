# 静态点亮数码管
### 1.数码管原理图分析：

- ![image-20230302123405032](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230302123405032.png)
- 上图一共有八个数码管，每个数码管又是由八个显示端控制的。
- 显示端：a1,b1,c1,d1,f1,g1,dp1，这几个端口负责点亮数码管上相应的显示管，比如a1端口控制a这个显示管。
- 公共端(com)：用于选择数码管，com1用于选择第一个数码管，com2用于选择第二个数码管。
- 每个显示管都是一个发光二极管，对于CT107开发板上的数码管，是共阳极的。
  -  ![image-20230302124753367](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230302124753367.png)
  - 例如这个发光二极管，很显然这是一个共阳极的，com端接阳极，因此显示端需要接低电平，这样才能点亮。
- ![image-20230302124939939](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230302124939939.png)
  - 锁存器U7控制数码管的显示端。
- ![image-20230302125024636](https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/image-20230302125024636.png)
  - 锁存器U8控制数码管的公共端。
- 因此在点亮数码管的时候，我们既要使用到U7锁存器，也要使用到U8锁存器。

### 2.code关键字：

- **keil中提供了一个特殊的关键字“code**”，这个关键字在标准C中是没有的。  我们知道，在单片机中一般都有两块存储区域，ROM和RAM，程序代码存储在ROM(只读存储器，相当于硬盘)中，程序要用的变量存储在RAM(随机读取存储器，相当于内存)中。 **“code”**的作用就是将其修饰过的变量存储在ROM中而非RAM。 在单片机中，RAM空间都比较小，是比较宝贵的。 **“code”**的意义就是将一些初始化后值一直保持不变的变量（如固定的常数、表格、常量数组、只读常量等）放置于ROM区，从而节省了RAM空间。
- 在数码管中，控制数字显示的寄存器对应的值应该是常量，因此我们创建常量数组用来显示数字，放在ROM区。

### 3.运行代码：

- 循环点亮各个数码管，并且每个数码管都运行0~9这十个数字。(数码管跳动显示0-9)

- ```c
  #include <STC15F2K60S2.H>
  #include <intrins.h>
  
  code unsigned char SMG[] = {0xc0 , 0xf9 , 0xa4 , 0xb0 , 0x99 , 0x92 , 0x82 , 0xf8 , 0x80 , 0x90};
  //这个数组是共阳极数码管的显示端的数码，SMG[0]用来显示数字0，SMG[1]用来显示数字1。
  void Delay1000ms()		//@11.0592MHz
  {
  	unsigned char i, j, k;
  
  	_nop_();
  	_nop_();
  	i = 43;
  	j = 6;
  	k = 203;
  	do
  	{
  		do
  		{
  			while (--k);
  		} while (--j);
  	} while (--i);
  }
  
  void Display(void)//数码管显示函数
  {
  	unsigned char m , n;
  	for (m = 0 ; m < 8 ; m++)
  	{
  		for (n = 0 ; n < 10 ; n++)//这里要注意，一定要写双重循环，最外层循环用来选择八个数码管。
  		{						  //最内层循环用来选择0~9这九个数字。
  			P2 = P2 & 0x1f | 0xe0;
  			P0 = SMG[n];
  			P2 &= 0x1f;//数码管的显示端控制
  			
              P2 = P2 & 0x1f | 0xc0;
  			P0 = 0x01 << m;
  			P2 &= 0x1f;//数码管的公共端控制，此时数码管已经点亮。
  			Delay1000ms();//闪烁1s
  		}
  	}
  }
  void close_buzz(void)
  {
  	P2 = P2 & 0x1f | 0xa0;
  	P0 &= 0xbf;
  	P2 &= 0x1f;
  }
  void close_LED(void)//点亮数码管的时候，8个LED灯会被点亮，因此我们要先手动关闭LED灯。
  {
  	P2 = P2 & 0x1f | 0x80;
  	P0 = 0xff;
  	P2 &= 0x1f;
  }
  void main(void)
  {
  	close_LED();
  	close_buzz();
  	while (1)
  	{
  		Display();
  	}
  }
  ```

