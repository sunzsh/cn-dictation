# 「生字听写」小工具
> 一个普通程序员写给孩子们「学习生字」的小工具

## 体验地址：
* https://superb-alpaca-bd830f.netlify.app/
* https://sunzsh.github.io/dictation/


## 补充完善生字步骤：
1. 每个生字都需要写在 `/books` 目录下对应的 `年级.学期.txt`，命名规则：
   * `1、2、3、4、5、6` 分别代表6个年级
   * `a`：上册、`b`：下册
2. 生字书写规则：
   * 生字：组词1、组词2
   * 如遇到特殊多音字，参考 [SSML语法](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-ssml-phonetic-sets#zh-cn) 加入`<phoneme alphabet="sapi" ph="...">x</phoneme>`
3. 编译环境中需要安装[ffmpeg](https://ffmpeg.org/)，主要用来压缩合成后的语音
4. 自己注册微软提供的免费的[Speech Studio](https://speech.microsoft.com/portal)（注册key的时候，区域选择eastasia）
5. 将拿到的 **Speech Studio Key** 写到项目根目录中，文件名：`.voice_key`
6. 项目中执行 `npm run build_voice`

## 说明：
每次构建声音文件时，系统会：
1. 仅重新构建`/books`中源文件里，生字or组词发生变化的字
2. 自动清除不再被引用的声音文件

