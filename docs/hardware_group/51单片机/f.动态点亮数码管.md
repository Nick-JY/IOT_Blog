# 动态点亮数码管
### 1.动态点亮和静态点亮的区别：

- 静态点亮：
  - 由于开发板上所有的数码管都是由共用端和显示端连通的，显示端由某一个寄存器控制。
  - 假设我们让第一个数码管显示1，之后我们还想让第二个数码管显示2，但是当第二个数码管显示2的时候，第一个数码管也会变成2，因为每个数码管的显示端都是由同一个寄存器控制的。
  - 对于静态显示，不管有多少数码管被点亮，这些数码管显示的数值都是一样的。
- 动态点亮：
  - 假设我们要让前四个数码管显示2024，因此我们就不能采用上面的静态点亮的方式，那样永远不可能显示2024，因为同时点亮4个数码管，这四个数码管只能显示相同的值。
  - 因此我们可以这样考虑，一次只点亮一个数码管，显示对应的值，点亮之后写一个延迟函数，这个延迟函数在1~2ms之间(1ms即可)。**（延迟函数时间太长，就会变成静态效果，延迟函数时间太短，又会由于运行过快，没有稳定点亮就去执行下一语句而产生鬼影。）**
  - 由于人的视觉暂留现象及发光二极管的余辉效应，尽管实际上各位数码管并非同时点亮，但只要扫描的速度足够快，给人的印象就是一组稳定的显示数据，不会有闪烁感。
  - 延迟时间必须相同，并且这些延迟时间不能过长，过长的话人眼会识别出来(过长的话人眼只认为第一个数码管点亮)。

### 2.问题描述：

- 在CT107D单片机综合训练平台上，实现数码管的动态显示，在8位数码管中，前面4位显示年份“2023”，接着位是分隔符“_”，最后两位是月份，从1月份开始，每隔一段时间加1个月，到12月之后又从1月开始递增，如此往复。

### 3.代码：

- ```c
  #include <STC15F2K60S2.H>
  #include <intrins.h>
  
  code unsigned char SMG[] = {0xc0 , 0xf9 , 0xa4 , 0xb0 , 0x99 , 0x92 , 0x82 , 0xf8 , 0x80 , 0x90};
  unsigned char Mon = 1;
  
  void Delay1000us()		//@11.0592MHz
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
  }//这个延迟是数码管动态显示的
  
  void close_buzz(void)
  {
  	P2 = P2 & 0x1f | 0xa0;
  	P0 &= 0xbf;
  	P2 &= 0x1f;
  }
  void close_LED(void)
  {
  	P2 = P2 & 0x1f | 0x80;
  	P0 = 0xff;
  	P2 &= 0x1f;
  }
  void Static_Display(unsigned char num , unsigned char i)//num是要显示的数字的编码，i是选择具体的数码管。
  {
  	P2 = P2 & 0x1f | 0xc0;
  	P0 = 0x01 << (i-1);
  	P2 &= 0x1f;
  	
  	P2 = P2 & 0x1f | 0xe0;
  	P0 = num;
  	P2 &= 0x1f;
  }//这里的静态显示函数用来给一个数码管显示。
  void Dynamic_Display(void)
  {
  	Static_Display(SMG[2] , 1);
  	Delay1000us();
  	Static_Display(SMG[0] , 2);
  	Delay1000us();
  	Static_Display(SMG[2] , 3);
  	Delay1000us();
  	Static_Display(SMG[3] , 4);
  	Delay1000us();
  	Static_Display(0xbf , 5); 
  	Delay1000us();
  	Static_Display(0xbf , 6);
  	Delay1000us();
  	
  	Static_Display(SMG[Mon / 10] , 7);
  	Delay1000us();
  	Static_Display(SMG[Mon % 10] , 8);
  	Delay1000us();
  }
  void Delay(unsigned int t)
  {
  	while (t--)
  		Dynamic_Display();
  }//这个delay函数是重点，由于我们要为月份的更换做延迟，因此在这个延迟中也需要使用动态显示，要不然同样会出现视觉差异。
  void main(void)
  {
  	close_LED();
  	close_buzz();
  	while (1)
  	{
  		Dynamic_Display();
  		Mon++;
  		if (Mon > 12)
  			Mon = 1;
  		Delay(200);
  	}
  }
  ```

- 实现结果：
  - https://nickaljy-pictures.oss-cn-hangzhou.aliyuncs.com/IMG_6047.MP4

