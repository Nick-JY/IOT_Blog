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
    avatar: 'https://github.com/Nick-JY.png',
    name: 'Nickal JY',
    title: '华中师范大学计算机学院2021级物联网工程系',
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
    title: '华中师范大学计算机学院2021级软件工程系',
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
    title: '华中师范大学计算机学院2021级计算机科学与技术',
    links: [
      { icon: 'github', link: 'https://github.com/RuthlessZhang' },
    ]
  },
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      IOT Member
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
