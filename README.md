## vite-sloppy-mode

一些很老的库采用宽松模式的写法，`vite`不兼容宽松模式，从而报错

```js
import { glob } from "glob"

var a;
a = 7;
b = 9;
function f() {
  a = 10;
  b = 7;
  c = 12;
}
```

该插件转换后代码如下：

```js
import { glob } from "glob";
var b, c;
var a;
a = 7;
b = 9;
function f() {
  a = 10;
  b = 7;
  c = 12;
}
```



### 用法

```typescript
import { defineConfig } from "vite";
import viteSloppyMode from "vite-sloppy-mode";

const config = defineConfig({
  plugins: [
    viteSloppyMode({
      // 假设只针对node_modules下的xxx库
      // include、exclude传入格式为: RegExp[]
      include: [/node_modules(.+?)xxx/],
      exclude: []
    })
  ]
})

export default config;

```

