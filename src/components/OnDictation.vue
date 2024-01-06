<template>
  <div class="main">
    <div class="page">
      <div class="py cell_py"></div>
      <div class="char cell"></div>
      <canvas ref="write" class="write"></canvas>
    </div>
    <transition name="el-fade-in-linear">
    <div class="btn-wrapper" v-show="showingBtn">
      <div class="btn" @click="prev" v-if="currentCharIndex !== 0">
        <i class="el-icon-back" style="transform: scale(1.5); font-weight: bold;"/>
      </div>
      <div class="btn" @click="clear" v-if="step >= 0">
        <i class="el-icon-delete-solid" />
      </div>
      <div class="btn" @click="redo" v-if="step >= 0">撤销</div>
      <div class="btn" @click="next" v-if="currentCharIndex !== (chars.length - 1)">
        <i class="el-icon-right" style="transform: scale(1.5); font-weight: bold;"/>
      </div>
    </div>
    </transition>

    <transition name="el-fade-in-linear">
    <div class="btn-wrapper-sub" v-show="showingBtn">
      <div class="btn" @click="!audioLoading && playVoice()">
        <i :class="audioLoading ? 'el-icon-loading' : 'el-icon-caret-right'" style="transform: scale(1.5);"/>
      </div>
      <div class="btn">{{ currentCharIndex + 1 }} / {{ chars.length }}</div>
      <div class="btn" @click="finish">检查</div>
    </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      step: -1,
      imgList: [],
      isMobile: false,
      writing: false,
      currentCharIndex: 0,
      charts_writed: [],
      audio: null,
      audioLoading: false,
      showingBtn: true,
      showingTimeout: null
    }
  },
  watch: {
    writing(value) {
      if (value) {
        this.showingTimeout && clearTimeout(this.showingTimeout)
        this.showingBtn = false
      } else {
        this.showingTimeout && clearTimeout(this.showingTimeout)
        this.showingTimeout = setTimeout(() => {
          this.showingBtn = true
          this.showingTimeout = null
        }, 600);
      }
    }
  },
  mounted() {
    if (!this.$route.params.book) {
      this.$router.replace({
        name: 'HomeCenter'
      })
    }

    addEventListener("resize", this.resetWriteSize);
    //判断是否手机端
    try {
      document.createEvent("TouchEvent");
      this.isMobile = true;
    } catch (e) { 
      this.isMobile = false;
    }
    this.initWrite()
      
  },
  destroyed() {
    removeEventListener("resize", this.resetWriteSize);
  },
  methods: {
    resetWriteSize() {
      var c = this.$refs.write;
      c.width = c.offsetWidth;
      c.height = c.offsetHeight;
      this.newestDrawFromHistory();
    },
    initWrite() {
      var c = this.$refs.write;
      var ctx = c.getContext("2d");
      this.resetWriteSize()
      const mousedown = (e) => {
          // let x = e.clientX - this.writeOffset.x;
          // let y = e.clientY - this.writeOffset.y;
          this.writing = true;
          let x = e.offsetX;
          let y = e.offsetY;
          let mousemove = (e) => {
              // var newX = e.clientX - this.writeOffset.x;
              // var newY = e.clientY - this.writeOffset.y;
              var newX = e.offsetX;
              var newY = e.offsetY;
              ctx.moveTo(x, y);
              ctx.lineTo(newX, newY);
              ctx.strokeStyle = '#222222';
              // 线宽设置，必须放在绘制之前
              ctx.lineWidth = 8;
              ctx.stroke();
              x = newX;
              y = newY;
          }
          if (this.isMobile) {
            c.onpointermove = mousemove;
          } else {
            c.onmousemove = mousemove;
          }
      }
      const mouseout = () => {
        if (c.onmousemove) {
          // 保存历史记录
          this.history()
        }
        this.writing = false;
        c.onmousemove = null;
        c.onpointermove = null;
      }
      const mouseup = () => {
        c.onmousemove = null;
        c.onpointermove = null;
        this.writing = false;
        // 节流保存历史记录
        this.history()
      }

      if (this.isMobile) {
        c.onpointerdown = mousedown
        c.onpointerout = mouseout
        c.onpointerup = mouseup
      } else {
        c.onmousedown = mousedown
        c.onmouseout = mouseout
        c.onmouseup = mouseup
      }

      this.playVoice()

    },
    redo() {
      if(this.step >= 0){
        this.step--
        this.$refs.write.width = this.$refs.write.offsetWidth;

        var c = this.$refs.write;
        var ctx = c.getContext("2d");
        var img = new Image()
        img.src = this.imgList[this.step]
        img.onload = ()=>{ ctx.drawImage(img,0,0,this.$refs.write.offsetWidth, this.$refs.write.offsetHeight) }  //从数组中调取历史记录，进行重绘
      }else{
        alert('没有上一步了')
      }
    },
    drawImg(imgSrc) {
      if (!imgSrc) {
        return
      }
      var img = new Image()
      img.width = this.$refs.write.offsetWidth
      img.height = this.$refs.write.offsetHeight
      img.src = imgSrc;
      var c = this.$refs.write;
      var ctx = c.getContext("2d");
      img.onload= ()=>{ctx.drawImage(img,0,0, this.$refs.write.offsetWidth, this.$refs.write.offsetHeight)}
    },
    newestDrawFromHistory() {
      this.drawImg(this.imgList[this.step]);
    },
    clear() {
      this.step = -1
      this.imgList = []
      this.$refs.write.width = this.$refs.write.offsetWidth;
    },
    history(){
      this.step++
      if(this.step < this.imgList.length){
        this.imgList.length = this.step 
      }
      this.imgList.push(this.$refs.write.toDataURL('image/png'))
    },
    playVoice() {
      if(this.audio && !this.audio.paused) {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio = null;
        this.audioLoading = false;
      }
      const voiceUrl = this.chars[this.currentCharIndex] && this.chars[this.currentCharIndex].v;
      if (!voiceUrl) {
        return
      }
      // 播放声音
      this.audio = new Audio('./' + voiceUrl);

      this.audioLoading = true
      this.audio.play().then(() => {
        this.audioLoading = false;
      }).catch(() => {
        // this.audioLoading = false;
      })
      // this.audioLoading = true
      // this.audio.onloadeddata = () => {
      //   this.audioLoading = false;
      // }
    },
    prev() {
      this.saveCurrent();
      this.clear();
      this.currentCharIndex--;
      this.loadCurrentIfExists();
      this.playVoice();
    },
    next() {
      this.saveCurrent();
      this.clear();
      this.currentCharIndex++;
      this.loadCurrentIfExists();
      this.playVoice();
    },
    loadCurrentIfExists() {
      if (!this.charts_writed[this.currentCharIndex]) {
        return;
      }
      this.imgList = this.charts_writed[this.currentCharIndex].imgList
      this.step = this.charts_writed[this.currentCharIndex].step
      this.drawImg(this.charts_writed[this.currentCharIndex].writeImg)
    },
    saveCurrent() {
      const writeImg = this.$refs.write.toDataURL('image/png')
      this.charts_writed[this.currentCharIndex] = {
        char: this.chars[this.currentCharIndex],
        writeImg,
        imgList: this.imgList,
        step: this.step
      }
    },
    finish() {
      this.saveCurrent()
      this.$router.replace({
        name: 'ShowResult',
        params: {
          result: this.charts_writed,
          inErrorMode: this.$route.params.inErrorMode
        }
      })
    }
  },
  computed: {
    chars: function() {
      const resultChars = []
      if (!this.$route.params.units) {
        return []
      }
      for (const unit of this.$route.params.units) {
        resultChars.push(...unit.newChars)
      }
      return resultChars
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
      border-right: dashed 2px var(--line-color);
    }

    &::after {
      width: 100%; /* 线条宽度 */
      height: 50%; /* 线条高度 */
      top: 0px;
      left: 0px;
      // 虚线
      border-bottom: dashed 2px var(--line-color);
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
      border-bottom: dashed 2px var(--line-color);
    }

    &::after {
      width: 100%; /* 线条宽度 */
      height: 70%; /* 线条高度 */
      top: 0px;
      left: 0px;
      // 虚线
      border-bottom: dashed 2px var(--line-color);
    }
}

.main {
  user-select: none;
  font-size: 18px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  .page {
    --line-color: #38a700;
    margin: auto;
    aspect-ratio: 2 / 3;
    box-sizing: border-box;
    box-shadow: 0 0 10px rgba(0, 0, 0, .5);
    border: solid 10px var(--line-color);
    background-color: #fff;
    position: relative;
    display: flex;
    flex-direction: column;
    user-select: none;
    .py {
      flex: 1;
      border-bottom: solid 4px var(--line-color);
      user-select: none;
    }
    .char {
      flex: 2;
      user-select: none;
    }
    .write {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      touch-action: none;
      user-select: none;
    }
  }
  .btn-wrapper {
    position: fixed;
    bottom: 50%;
    right: 2.5em;
    display: flex;
    flex-direction: column;
    transform: translateY(50%);
    .btn+.btn {
      margin-top: 0.5em;
    }
    .btn {
      height: 1.5em;
      line-height: 1.5em;
      border-radius: calc(infinity * 1px);
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, .2);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1.1em;
      font-weight: bold;
      padding: 0.6em 1.5em;
      color: #ff7e5f;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }
  }
  .btn-wrapper-sub {
    position: fixed;
    top: 50%;
    left: 2.5em;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    .btn+.btn {
      margin-top: 0.5em;
    }
    .btn {
      height: 1.5em;
      line-height: 1.5em;
      border-radius: calc(infinity * 1px);
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, .2);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1.1em;
      font-weight: bold;
      padding: 0.6em 1.5em;
      color: #ff7e5f;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }
  }
}
@media screen and (max-aspect-ratio: 2/3) {
  .page {
    width: calc(100vw - 3em);
  }

  .btn-wrapper-sub.btn-wrapper-sub {
    top: 1.3em;
    left: 50%;
    flex-direction: row;
    .btn+.btn {
      margin-top: 0;
      margin-left: 0.5em;
    }
    .btn {
      transform: translateY(0%);
    }
    transform: translateX(-50%);
  }
  
  .btn-wrapper.btn-wrapper {
    bottom: 1.4em;
    right: 50%;
    flex-direction: row;
    .btn+.btn {
      margin-top: 0;
      margin-left: 0.5em;
    }
    .btn {
      transform: translateY(0%);
    }
    transform: translateX(50%);
  }
}

@media screen and (min-aspect-ratio: 2/3) {
  .page {
    height: calc(100vh - 3em);
  }
}
</style>