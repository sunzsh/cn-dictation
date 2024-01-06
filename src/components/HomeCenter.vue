<template>
  <div class="main">
    <!-- 选择教材 -->
    <div class="cur_book" :class="{'open': curBook.opening }" v-clickoutside="closeCurBook">
      <div class="cur_book-title" @click="curBook.opening=!curBook.opening">
        <i class="el-icon-notebook-2" style="margin-right:0.4em"></i>
        <template v-if="!curBook.value">
          请选择教材
        </template>
        <template v-else>
          {{ curBook.value.name }}
        </template>
      </div>
      <div class="booklist">
        <div v-for="(book) in BOOKS" :key="book.name" class="book-item" @click="changeBook(book)">{{ book.name }}</div>
      </div>
    </div>
    <div class="cur_book-mask" :class="{'open': curBook.opening }"></div>
    <div class="unit_wrapper">
      <template v-if="errorCharsInThisBook && errorCharsInThisBook.length > 0">
        <div class="unit_item item_errorbook" @click="selectErrorBook()">
          <div class="unit_item-title">
            <i class="el-icon-check check-icon"></i>
            <span>！！！错题本</span>
          </div>
          <div class="unit_item-subtitle">{{(errorCharsInThisBook||[]).length}}个</div>
        </div>
      </template>
      <template v-if="curBook.value && curBook.value.klasses.length > 1">
        <div v-for="(unit) in curBook.value.klasses" :key="unit.title" class="unit_item" :class="{'selected': isSelectedUnit(unit) }" @click="selectUnit(unit)">
          <div class="unit_item-title">
            <i class="el-icon-check check-icon"></i>
            <span>{{unit.title}}</span>
          </div>
          <div class="unit_item-subtitle">{{unit.newChars.length}}个</div>
        </div>
      </template>
    </div>
    <div class="startbtn" :class="{'showing': selectedUnit.length > 0}" @click="startDictation">
      开始听写<span style="margin-left: 0.8em">{{selectedCharCount}}个生字</span>
    </div>
  </div>
</template>

<script>
import BOOKS from '@/books'
import { getErrorCharsByBook } from '@/service/ErrorBookService'
import Clickoutside from 'element-ui/src/utils/clickoutside'
export default {
  directives: { Clickoutside },
  data() {
    return {
      curBook: {
        opening: false,
        value: null
      },
      selectedUnit: [],
      BOOKS
    }
  },
  mounted() {
    if (BOOKS.length === 1) {
      this.changeBook(BOOKS[0])
    }
  },
  methods: {
    changeBook(book) {
      this.curBook.value = book
      this.curBook.opening = false
    },
    closeCurBook() {
      this.curBook.opening = false
    },
    selectUnit(unit) {
      const index = this.selectedUnit.findIndex(item => item.title === unit.title)
      if (index > -1) {
        this.selectedUnit.splice(index, 1)
      } else {
        this.selectedUnit.push(unit)
      }
    },
    isSelectedUnit(unit) {
      return this.selectedUnit.findIndex(item => item.title === unit.title) > -1
    },
    selectErrorBook() {
      this.$router.replace({
        name: 'OnDictation',
        params: {
          book: this.curBook.value,
          units: [{ 'title': '错题本', 'newChars': this.errorCharsInThisBook }],
          inErrorMode: true
        }
      })
    },
    startDictation() {
      if (this.selectedUnit.length === 0) {
        this.$message({
          message: '请选择单元',
          type: 'warning'
        })
        return
      }
      this.$router.replace({
        name: 'OnDictation',
        params: {
          book: this.curBook.value,
          units: this.selectedUnit,
          inErrorMode: false
        }
      })
    
    }
  },
  computed: {
    selectedCharCount() {
      return this.selectedUnit.reduce((total, unit) => {
        return total + unit.newChars.length
      }, 0)
    },
    errorCharsInThisBook() {
      return getErrorCharsByBook(this.curBook.value);
    }
  }
}
</script>

<style scoped lang="scss">
.main {
  font-size: 18px;
  height: 100%;
  box-sizing: border-box;
  padding-top: 4.9em;
  padding-left: 2em;
  padding-right: 2em;
  display: flex;
  flex-direction: column;

  .cur_book-mask {
    position: fixed;
    z-index: 99;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgb(0,0,0);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    pointer-events: none;
    &.open {
      opacity: 0.7;
      pointer-events: all;
    }
  }
  .cur_book {
    --titleHeight: 3.4em;
    flex-shrink: 0;
    background-color: #ffffff;
    border-radius: 0.5em;
    box-shadow: 0 0.5em 1em rgba(0, 0, 0, 0.2);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: var(--titleHeight);
    transition: height 0.2s ease-in-out;
    position: fixed;
    z-index: 100;
    top: 1.5em;
    width: calc(100% - 4em);
    .booklist {
      width: 100%;
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      overflow: auto;
      .book-item {
        -webkit-tap-highlight-color: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50%;
        cursor: pointer;
        user-select: none;
        height: 5em;
        &:hover {
          background-color: #f5f5f5;
        }
      }
    }
    .cur_book-title {
      -webkit-tap-highlight-color: transparent;
      height: var(--titleHeight);
      flex-shrink: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      user-select: none;
    }
    &.open {
      height: 40vh;
    }

  }
  .unit_wrapper {
    flex: 1;
    margin-top: 1.5em;
    margin-bottom: 1.5em;
    background-color: #fff;
    border-radius: 0.5em;
    box-shadow: 0 0.5em 1em rgba(0, 0, 0, 0.2);
    overflow: auto;
    display: flex;
    flex-direction: column;
    user-select: none;
    .unit_item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0.9em 0.8em;
      border-bottom: 1px solid #ececec;
      justify-content: space-between;
      cursor: pointer;
      &.selected {
        background-color: #ff7f5f66;
        border-bottom-color: #ff7f5f66;
        .unit_item-title .check-icon {
          display: inline-block;
        }
      }
      .unit_item-title {
        // 不换行，超出省略号
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: .5em;
        .check-icon {
          color: #ff3300;
          font-weight: 500;
          margin-right: 0.8em;
          transform: scale(1.5);
          display: none;
        }
      }
      .unit_item-subtitle {
        color: #999999;
        white-space: nowrap;
        overflow: hidden;
        flex-shrink: 0;
      }
      &.item_errorbook {
        color: #ff0000;
        font-weight: bold;
        .unit_item-subtitle {
          color: #ff0000;
        }
      }
    }
  }
  .startbtn {
    position: fixed;
    bottom: -3em;
    left: 50%;
    transform: translateX(-50%);
    background-color: #ff7f5f;
    color: #fff;
    font-size: 1.2em;
    padding: 0.8em 1.5em;
    border-radius: 1.5em;
    box-shadow: 0 0.5em 1em rgba(0, 0, 0, 0.2);
    cursor: pointer;
    user-select: none;
    transition: bottom 0.1s ease-in-out, opacity 0.1s ease-in-out;
    // 不换行
    white-space: nowrap;
    opacity: 0;

    &:hover {
      background-color: #f9633d;
    }
    &.showing {
      bottom: 2em;
      opacity: 1;
    }
  }
}
</style>