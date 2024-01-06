<template>
  <div class="main">
    <div class="paper" ref="paper">
      <div class="time">结束时间：{{ currentTime }}</div>
      <div ref="content" class="content" :style="`--gap: ${itemGap}px`">
        <div class="char-wrapper" v-for="(item) in result" :key="item.char.newChar"  @click="toggleErr(item)">
          <div class="ori"><span>{{item.char.newChar}}</span></div>
          <div class="dictation" :class="{'err': isError(item)}">
            <div class="py cell_py"></div>
            <div class="char cell"></div>
            <img class="writed-img" :src="item.writeImg" />
            <!-- <img class="writed-img-error" :src="errorTagImg" /> -->
          </div>
        </div>
      </div>
      <div style="height: 2em;"></div>
    </div>
    <div class="float-btn btn-back" @click="back">
      退出
    </div>
    <div class="float-btn" @click="handleDomToImg($refs.paper)">
      下载<br/>试卷
    </div>
  </div>
</template>

<script>
import html2canvas from 'html2canvas';
import { addErrorChar, removeErrorChar } from '@/service/ErrorBookService'
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
export default {
  data() {
    return {
      result: [],
      errs: [],
      currentTime: '',
      itemGap: 0,
      errorTagImg: "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0nODlweCcgaGVpZ2h0PScxMjNweCcgdmlld0JveD0nMCAwIDg5IDEyMycgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz48dGl0bGU+5YiH54mHPC90aXRsZT48ZyBpZD0n6aG16Z2iLTEnIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnPjxwYXRoIGQ9J000My41MDAzMzIxLDExOS41MTYwMTIgQzU0LjM1MTgyNDIsMTE5LjUxNjAxMiA2NC4yODg4ODQ3LDExOS41MTYwMTIgNzUuMTU0MzExNCwxMDguMTQxMjYgQzg2LjAxOTczODEsOTYuNzY2NTExMSA4Ni4wMjI2OTU2LDc3LjU2NTU4NyA4Ni4wMjI2OTU2LDYxLjUgQzg2LjAyMjY5NTYsNDMuOTkxODg1OCA4MS43MDk5NDU0LDE5Ljc1OTEwMjIgNzEuMzAxNDgzNCwxMS4xMDY2NzM5IEM2Ni4wNjE0ODkxLDYuNzUwNzMwMDggNTMuMzE3ODAwMywzLjA1Njc3OTMxIDQzLjUwMDMzMjEsMy4wNTY3NzkzMSBDMzMuNzIxODA2NCwzLjA1Njc3OTMxIDIwLjAyMjI0NTgsNS40NTI5NDA3OCAxMy4wMjM3MjgsMTMuNTAyMjMxOSBDNC4wMTM3NDEyNCwyMy44NjQ5OTg0IDMsNDMuOTM3NTU4NiAzLDYxLjUgQzMsNzcuMjI1ODE1OSA1LjU5MTkyNTQ1LDg4LjE2NDM2MiAxMy4wMjM3MjgsOTguNDA3NDMxNyBDMjAuMzM4NTQ1LDEwOC40ODkyNjMgMzIuNDA1Mjg3MiwxMTkuNTE2MDEyIDQzLjUwMDMzMjEsMTE5LjUxNjAxMiBaJyBpZD0n5qSt5ZyG5b2iJyBzdHJva2U9JyNGRjAwMDAnIHN0cm9rZS13aWR0aD0nNSc+PC9wYXRoPjwvZz48L3N2Zz4="
    }
  },
  mounted() {
    // 获取格式化的当前时间
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    const fillLength = (num) => {
      return num < 10 ? `0${num}` : num;
    }
    this.currentTime = `${year}-${fillLength(month)}-${fillLength(date)} ${fillLength(hour)}:${fillLength(minute)}:${fillLength(second)}`;

    if (!this.$route.params.result) {
      this.$router.replace({
        name: 'HomeCenter'
      })
    } else {
      this.result = this.$route.params.result;
    }
    addResizeListener(this.$refs.content, this.calcContentItemGap);
    this.$nextTick(() => {
      this.calcContentItemGap();
    })

    console.log(this.$route.params, '----');
    // 如果是错题模式，默认加载全错，需要用户自己选择正确的，这时系统将会自动从错题本中剔除
    if (this.$route.params.inErrorMode) {
      this.errs = this.result.map(item => item.char.newChar);
    }
  },
  beforeDestroy() {
    removeResizeListener(this.$refs.content, this.calcContentItemGap);
  },
  methods: {
    calcContentItemGap() {
      const content = this.$refs.content;
      const anyChild = content.querySelector('.char-wrapper');
      if (!content && !anyChild) {
        return;
      }
      const contentWidth = content.offsetWidth;
      const contentItemWidth = anyChild.offsetWidth;
      const contentItemGap = contentWidth % contentItemWidth;
      const contentItemCountEveryRow = parseInt(contentWidth / contentItemWidth)
      let doubleGap = contentItemGap / (contentItemCountEveryRow + 1);
      if (doubleGap < 12) {
        doubleGap += (contentItemWidth / contentItemCountEveryRow);
      }
      

      this.itemGap = parseFloat(doubleGap / 2);

      // const contentItemGap = (contentWidth - contentItemWidth * 5) / 4;
      // const contentItemGapV = (contentHeight - contentItemHeight * 5) / 4;
      // return {
      //   contentItemGap,
      //   contentItemGapV
      // }
    },
    toggleErr(item) {
      if (this.errs.indexOf(item.char.newChar) > -1) {
        this.errs.splice(this.errs.indexOf(item.char.newChar), 1);
        removeErrorChar(item.char.newChar)
      } else {
        this.errs.push(item.char.newChar);
        addErrorChar(item.char.newChar)
      }
    },
    isError(item) {
      return this.errs.indexOf(item.char.newChar) > -1;
    },
    back() {
      this.$router.replace({
        name: 'HomeCenter'
      })
    },
    downloadFile(href, fileName = '下载'){
      const downloadElement = document.createElement('a');
      downloadElement.href = href;
      downloadElement.download = `${fileName}.png`;
      document.body.appendChild(downloadElement);
      downloadElement.click();
      document.body.removeChild(downloadElement);
      window.URL.revokeObjectURL(href);
    },
    async handleDomToImg(dom) {
      // 获取dom元素
      const graphImg = dom;
      // 创建canvas元素
      const canvasdom = document.createElement('canvas');

      // 获取dom宽高
      const width = parseInt(window.getComputedStyle(graphImg).width, 10);
      const height = parseInt(window.getComputedStyle(graphImg).height, 10);
      
      // 设定 canvas 元素属性宽高为 DOM 节点宽高 * 像素比 
      const scaleBy = 2; //也可以用window.devicePixelRatio，
      canvasdom.width = width * scaleBy; 
      canvasdom.height = height * scaleBy;
      
      //scale:2 按比例增加分辨率，将绘制内容放大对应比例
      const canvas = await html2canvas(graphImg, { canvas: canvasdom, scale: scaleBy,useCORS:true });
      
      //将canvas转为base64
      const url = canvas.toDataURL();
      
      //配置下载的文件名
      const fileName = `听写试卷${new Date().valueOf()}`;
      this.downloadFile(url, fileName);

    }
  }
}
</script>

<style scoped lang="scss">

.cell {
    position: relative;
    &::before, &::after {
      content: '';
      position: absolute;
    }

    &::before {
      width: 50%; /* 线条宽度 */
      height: 100%; /* 线条高度 */
      top: 0px;
      left: 0px;
      // 虚线
      border-right: dashed 2px var(--line-color-inner);
    }

    &::after {
      width: 100%; /* 线条宽度 */
      height: 50%; /* 线条高度 */
      top: 0px;
      left: 0px;
      // 虚线
      border-bottom: dashed 2px var(--line-color-inner);
    }
}

.cell_py {
    position: relative;
    &::before, &::after {
      content: '';
      position: absolute;
    }

    &::before {
      width: 100%; /* 线条宽度 */
      height: 33%; /* 线条高度 */
      top: 0px;
      left: 0px;
      // 虚线
      border-bottom: dashed 2px var(--line-color-inner);
    }

    &::after {
      width: 100%; /* 线条宽度 */
      height: 70%; /* 线条高度 */
      top: 0px;
      left: 0px;
      // 虚线
      border-bottom: dashed 2px var(--line-color-inner);
    }
}

.main {
  font-size: 18px;
  overflow: auto;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  .float-btn {
    -webkit-tap-highlight-color:rgba(0,0,0,0); 
    user-select: none;
    width: 4em;
    height: 4em;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    position: fixed;
    bottom: 2em;
    right: 2em;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    color: #343434;
    cursor: pointer;
    &.btn-back {
      bottom: 7em;
    }
  }
  .paper {
    width: calc(100% - 3em);
    min-width: 380px;
    min-height: 20em;
    display: flex;
    flex-direction: column;
    margin: 2em auto;
    background: #fff;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
    position: relative;
    padding-bottom: 3em;
    padding-top: 0.5em;
    .time {
      width: 100%;
      color: #343434;
      text-align: center;
      margin: 0.5em 0;
    }
    .content {
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      padding: 0 var(--gap);
      // justify-content: space-around;
      .char-wrapper {
        display: flex;
        margin: var(--gap);
        --line-color: #38a700;
        --line-color-inner: #38a70048;
        .ori {
          width: 2em;
          font-size: 36px;
          aspect-ratio: 2/3;
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--line-color);
          border-bottom: solid 2px var(--line-color);
          border-top: solid 2px var(--line-color);
          border-left: solid 2px var(--line-color);
          font-family: 'KaiTi', '楷体', 'STKaiti', '华文楷体', 'Microsoft YaHei', '微软雅黑', 'STXihei', '华文细黑', 'STHeiti', '华文黑体', 'SimHei', '黑体', 'sans-serif';
          span {
            transform: scale(1.4);
          }
        }
        .dictation {
          width: 2em;
          font-size: 36px;
          aspect-ratio: 2/3;
          // background-color: red;
          display: flex;
          flex-direction: column;
          position: relative;
          border: solid 2px var(--line-color);
          .py {
            flex: 1;
            border-bottom: solid 2px var(--line-color);
          }
          .char {
            flex: 2;
          }
          .writed-img {
            position: absolute;
            top: 0px;
            left: 0px;
            width: 100%;
            height: 100%;
          }
          .writed-img-error {
            display: none;
            position: absolute;
            top: 0px;
            left: 0px;
            width: 100%;
            height: 100%;
            transform: scale(1.2);
          }
          &.err {
            .writed-img {
              background-color: rgba(255, 0, 0, 0.175);
            }
            .writed-img-error {
              display: block;
            }
          }
        }
      }
    }
  }
}
</style>