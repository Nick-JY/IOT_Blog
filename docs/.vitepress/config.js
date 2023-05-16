
export default {
    // base: 'TdBlogs',

    title: 'CCNU物联网协会', // 所有文档的浏览器标签title
    description: '华中师范大学物联网协会', // 会渲染成<meta>标签，SEO用

    themeConfig: {

        siteTitle: 'CCNU物联网协会',


        nav: [
            { text: '协会成员', link: '/Introduction/', activeMatch: '/Introduction/' },
            { text: '硬件组', link: '/hardware_group/', activeMatch: '/hardware_group/' },
            { text: '软件组', link: '/software_group/', activeMatch: '/software_group/' },
            { text: 'APP组', link: '/app_group/', activeMatch: '/app_group/' },
        ],

        sidebar: {
                // 当用户在 `指南` 目录页面下将会展示这个侧边栏
                '/hardware_group/': [
                  {
                    text: '硬件组培训',
                    collapsible: true,
                    collapsed: false,
                    items: [
                      { text: 'Linux虚拟机的安装和卸载', link: '/hardware_group/第一次培训/Linux虚拟机的安装和卸载.md' },
                      { text: 'Git快速入门', link: '/hardware_group/第一次培训/Git快速入门.md' },
                    ]
                  },
                  {
                    text: '计算机组成与设计:硬软接口',
                    collapsible: true,
                    collapsed: false,
                    items: [
                      { text: '计算机硬件概要', link: '/hardware_group/计算机组成与设计/计算机硬件概要.md' }, 
                      { text: '计算机的语言:指令', link: '/hardware_group/计算机组成与设计/计算机的语言.md' },
                      { text: '计算机的算术运算', link: '/hardware_group/计算机组成与设计/计算机的算术运算.md' } 
                    ]
                  },
                  {
                    text: '51单片机',
                    collapsible: true,
                    collapsed: false,
                    items: [
                      { text: '开发板注意事项', link: '/hardware_group/51单片机/开发板注意事项.md' }, 
                      { text: '开发板原理图', link: '/hardware_group/51单片机/开发板原理图.md' }, 
                      { text: 'LED灯点亮以及延时', link: '/hardware_group/51单片机/b.LED灯点亮以及延时.md' }, 
                      { text: '独立按键操控LED灯和蜂鸣器', link: '/hardware_group/51单片机/c.独立按键操控LED开关和蜂鸣器开关.md' }, 
                      { text: '独立按键控制LED流水灯', link: '/hardware_group/51单片机/d.独立按键控制LED流水灯.md' }, 
                      { text: '静态点亮数码管', link: '/hardware_group/51单片机/e.静态点亮数码管.md' }, 
                      { text: '动态点亮数码管', link: '/hardware_group/51单片机/f.动态点亮数码管.md' }, 
                      { text: '矩阵键盘', link: '/hardware_group/51单片机/g.矩阵键盘.md' }, 
                      { text: '外部中断', link: '/hardware_group/51单片机/h.中断系统.md' }, 
                      { text: '定时器', link: '/hardware_group/51单片机/i.定时器与计数器.md' }, 
                      { text: 'PWM脉宽调制信号', link: '/hardware_group/51单片机/j.PWM脉宽调制信号的发生与控制.md' }, 
                      { text: 'UART串口通信', link: '/hardware_group/51单片机/k.串口通信的原理与应用.md' }, 
                      { text: 'DS18B20数字温度计', link: '/hardware_group/51单片机/l.DS18B20数字温度计.md' }, 
                      { text: 'DS1302实时时钟', link: '/hardware_group/51单片机/m.DS1302实时时钟.md' }, 
                      { text: 'AT24C02-EEPROM', link: '/hardware_group/51单片机/n.AT24C02.md' }, 
                      { text: 'PCF8591-ADC/DAC', link: '/hardware_group/51单片机/o.PCF8591.md' },
                      { text: '超声波测距模块', link: '/hardware_group/51单片机/p.超声波测距模块.md' }
                    ]
                  },
                ],  
                '/software_group/': [
                    {
                      text: '软件组培训',
                      collapsible: true,
                      collapsed: false,
                      items: [
                      ]
                    },
                    {
                        text: '算法和数据结构',
                        collapsible: true,
                        collapsed: false,
                        items: [
                            { text: '单链表', link: '/software_group/算法和数据结构/单链表.md' }, 
                        ]
                      },
                ], 
                '/app_group/': [
                    {
                      text: 'App组培训',
                      collapsible: true,
                      collapsed: false,
                      items: [
                      ]
                    },
                    {
                        text: 'Java快速入门',
                        collapsible: true,
                        collapsed: false,
                        items: [

                        ]
                      },
                ],         
        },


        socialLinks: [
            { icon: 'github', link: 'https://github.com/Nick-JY' },
        ],


        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2023-present CCNU-IOT'
        },
    }
}