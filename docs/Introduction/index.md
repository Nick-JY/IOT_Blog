---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const members = [
    {
    avatar: '/yaohuaxiong.png',
    name: '姚华雄教授',
    title: '华中师范大学物联网协会指导老师、物联网工程系主任、物联网工程系党支部书记、物联网实验室主任',
    links: [
    ]
  },
    {
    avatar: 'https://github.com/jdccccc.png',
    name: 'jdccccc',
    title: '前物联网协会会长，现中科院计算所23级智能处理器研究生',
    links: [
      { icon: 'github', link: 'https://github.com/jdccccc' },
    ]
  },
  {
    avatar: 'https://github.com/Nick-JY.png',
    name: 'Nickal JY',
    title: '现物联网协会会长，华中师范大学计算机学院2021级物联网工程系',
    links: [
      { icon: 'github', link: 'https://github.com/Nick-JY' },
    ]
  },
  {
    avatar: 'https://github.com/fuxiaoiii.png',
    name: 'fuxiaoiii',
    title: '华中师范大学计算机学院2021级华为基地班',
    links: [
      { icon: 'github', link: 'https://github.com/fuxiaoiii' },
    ]
  },
  {
    avatar: 'https://github.com/chengkhen.png',
    name: 'chengkhen',
    title: '华中师范大学计算机学院2021级计算机科学与技术系',
    links: [
      { icon: 'github', link: 'https://github.com/chengkhen' },
    ]
  },
  {
    avatar: 'https://github.com/sandeulllll.png',
    name: 'sandeulllll',
    title: '华中师范大学计算机学院2021级计算机科学与技术系',
    links: [
      { icon: 'github', link: 'https://github.com/sandeulllll' },
    ]
  },
  {
    avatar: 'https://github.com/LSJZXY.png',
    name: 'LSJZXY',
    title: '华中师范大学计算机学院2021级计算机科学与技术系',
    links: [
      { icon: 'github', link: 'https://github.com/LSJZXY' },
    ]
  },
  {
    avatar: 'https://github.com/Ycsir510.png',
    name: 'Ycsir510',
    title: '华中师范大学计算机学院2021级计算机科学与技术系',
    links: [
      { icon: 'github', link: 'https://github.com/Ycsir510' },
    ]
  },
  {
    avatar: 'https://github.com/Nutcra-yu.png',
    name: 'Nutcra-yu',
    title: '华中师范大学计算机学院2021级计算机科学与技术系、木犀团队安卓组组长',
    links: [
      { icon: 'github', link: 'https://github.com/Nutcra-yu' },
    ]
  },
  {
    avatar: 'https://github.com/Eazinqi.png',
    name: 'Eazinqi',
    title: '华中师范大学计算机学院2021级计算机科学与技术系',
    links: [
      { icon: 'github', link: 'https://github.com/Eazinqi' },
    ]
  },
  {
    avatar: 'https://github.com/fograinwater.png',
    name: 'fograinwater',
    title: '华中师范大学计算机学院2021级华为基地班',
    links: [
      { icon: 'github', link: 'https://github.com/fograinwater' },
    ]
  },
  {
    avatar: 'https://github.com/RuthlessZhang.png',
    name: 'RuthlessZhang',
    title: '华中师范大学计算机学院2021级计算机科学与技术系',
    links: [
      { icon: 'github', link: 'https://github.com/RuthlessZhang' },
    ]
  },
  {
    avatar: 'https://github.com/patataaaaaaaaa.png',
    name: 'patataaaaaaaaa',
    title: '华中师范大学计算机学院2021级计算机科学与技术系',
    links: [
      { icon: 'github', link: 'https://github.com/RuthlessZhang' },
    ]
  },
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      IOT Members
    </template>
    <template #lead>
        物联网协会成员
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    size="small"
    :members="members"
  />
</VPTeamPage>
