---
title: Scala.JS 学习记录（一）
published: 2025-08-04
pinned: false
description: 一个创建 Scala.JS 项目的简单小教程.
tags: [Scala.JS, JavaScript]
category: 编程
draft: false
image: ./cover.png
---

> 官方文档：[Scala.js](https://www.scala-js.org/).

## 创建项目

创建 Vanilla 模板：

```bash
npm create vite@4.1.0
```

```bash
◇  Select a framework:
│  Vanilla
│
◇  Select a variant:
│  JavaScript
```

## Vite 配置

安装 `@scala-js/vite-plugin-scalajs` 插件：

```bash
npm install -D @scala-js/vite-plugin-scalajs@1.0.0
```

在项目根目录中创建 `vite.config.js` 文件：

```js
import { defineConfig } from "vite";
import scalaJSPlugin from "@scala-js/vite-plugin-scalajs";

export default defineConfig({
  // 注册 Scala.js 插件
  plugins: [scalaJSPlugin()]
});
```

修改 `main.js` 文件：

```js
// 引入 scalajs:main.js
import 'scalajs:main.js'
// 引入样式
import './style.css'
```

初始化项目：

```bash
npm install
```

## SBT 配置

在项目根目录中创建 `project` 文件夹，并在该文件夹下创建 `build.properties`、`metals.sbt`、`plugins.sbt` 文件。

`build.properties` 文件：

```properties
# 设置 SBT 版本
sbt.version=1.10.11
```

`metals.sbt` 文件：

```scala
// 导入 bloop 插件
addSbtPlugin("ch.epfl.scala" % "sbt-bloop" % "2.0.10")
```

`plugins.sbt` 文件：

```scala
// 导入 scala.js 插件
addSbtPlugin("org.scala-js" % "sbt-scalajs" % "1.19.0")
```

在项目根目录中 `build.sbt` 文件：

```scala
import org.scalajs.linker.interface.ModuleSplitStyle

lazy val root = project.in(file("."))
  //
  .enablePlugins(ScalaJSPlugin) 
  .settings(
    // 设置 Scala 项目名称与版本
    // Scala.js 1.19.0 支持的最高 Scala 版本是 3.3.3
    name := "scala_js_test",
    scalaVersion := "3.3.3",

    // 不指定主类
    scalaJSUseMainModuleInitializer := true,

    // 设置热更新
    // List("test")：表示 test 包下的 .scala 文件需要热更新
    scalaJSLinkerConfig ~= {
      _.withModuleKind(ModuleKind.ESModule)
        .withModuleSplitStyle(ModuleSplitStyle.SmallModulesFor(List("test")))
    },

    // 引入 scala.js dom 与 laminar（响应式框架） 依赖
    libraryDependencies += "org.scala-js" %%% "scalajs-dom" % "2.8.0",
    libraryDependencies += "com.raquo" %%% "laminar" % "17.0.0",
  )
```

通过 VsCode 的 Metals 插件初始化 Sbt 项目。

## 使用

在 `src` 目录中创建 `main/scala` 目录，用于存放 Scala 代码文件。

创建 `src/main/scala/Main.scala` 文件，即项目主入口（在 `index.html` 中调用）：

```scala
import scala.scalajs.js
import scala.scalajs.js.annotation.*
import com.raquo.laminar.api.L.{*, given}
import org.scalajs.dom

import test.MainApp

// 通过 npm run dev 启动项目会从标注了 @main 注解的 Main 方法开始加载
@main
def Main(): Unit = renderOnDomContentLoaded(
  dom.document.getElementById("app"),
  MainApp.appElement()
)
```

创建 `src/main/scala/test/MainApp.scala` 文件：

> 此处的 `test` 目录即是在 `build.sbt` 文件中定义的需要热更新的目录。

```scala
import com.raquo.laminar.api.L.{*, given}
import com.raquo.laminar.nodes.ReactiveHtmlElement
import org.scalajs.dom.HTMLDivElement
import scala.scalajs.js
import scala.scalajs.js.annotation.*

object MainApp {
  // 引入静态图片资源
  @js.native @JSImport("/src/javascript.svg", JSImport.Default)
  val javascriptLogo: String = js.native

  def appElement(): ReactiveHtmlElement[HTMLDivElement] = {
    div(
      img(src := javascriptLogo, className := "logo vanilla"),
      h1("Hello Scala.JS~!")
    )
  }
}
```

### 启动项目

在 VsCode 中创建两个终端，一个用于 SBT 热更新，一个用于启动 Vite 项目。

终端一：设置热更新。

```bash
sbt ~fastLinkJS
```

当最后一行出现 `[info] Press <enter> to interrupt or '?' for more options.` 时，表示热更新功能正常运行；此时不需要再按 `Enter` 或 `Crtl + C`，因为这个功能是用来监视 Scala 代码文件的，不是生成一次性文件的。

终端二：

```bash
npm run dev
```

此时再修改 `src/main/scala/test/MainApp.scala` 文件即可看到页面自动更新。
![Image_1754227277352.gif](./Image_1754227277352.gif)