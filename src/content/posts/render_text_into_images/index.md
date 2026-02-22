---
title: 渲染文字到图片中
published: 2025-03-06
pinned: false
description: 一个嵌字到图片中的简单小教程.
tags: [Scala]
category: 编程
draft: false
image: ./cover.webp
---

导入包：

```scala
import java.awt.image.BufferedImage
import java.awt.*
import java.io.File
import javax.imageio.ImageIO
```

## 创建空白图片并渲染文字

```scala
@main def drawTextOnImage(): Unit = {
  // 创建一个空白图片
  val width = 500
  val height = 500
  val bufferedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB)

  // 获取图片的 Graphics2D 对象
  val g2d: Graphics2D = bufferedImage.createGraphics()

  // 启用抗锯齿
  g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
  g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON)

  // 设置背景颜色并清空图片
  g2d.setColor(Color.WHITE)
  g2d.fillRect(0, 0, width, height)

  // 设置文字颜色和字体
  g2d.setColor(Color.BLACK)
  g2d.setFont(new Font("LXGW WenKai Screen", Font.PLAIN, 28))

  // 在图片上绘制文字
  val text = "你好世界"
  val x = 100
  val y = 100
  g2d.drawString(text, x, y)

  // 释放 Graphics2D 对象
  g2d.dispose()

  // 保存图片到文件
  val outPutFile = new File("src/main/scala/img/output.png")
  ImageIO.write(bufferedImage, "png", outPutFile)

  println("保存成功！")
}
```

## 加载已有图片并渲染文字

```scala
@main def addTextToImage(): Unit = {
  // 读取已有的图片
  val inputFile = new File("src/main/scala/img/input.jpg")
  val bufferedImage = ImageIO.read(inputFile)
  // 获取图片的 Graphics2D 对象
  val g2d: Graphics2D = bufferedImage.createGraphics()

  // 启用抗锯齿
  g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
  g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON)

  // 标题和内容
  // val title = "大凶"
  // val content = "内心丰富多彩的一天"

  val title = "全体運"
  val content = "能用善良的语言让周围的人感到幸福的日子"

  // 获取图片的宽度和高度
  val imgWidth = bufferedImage.getWidth / 2
  val imgHeight = bufferedImage.getHeight

  // 根据百分比计算标题的位置
  val titleX = title.length match
    case length if length == 3 => (imgWidth * 0.39).toInt
    case length if length >= 2 => (imgWidth * 0.46).toInt
    case _ => (imgWidth * 0.525).toInt
  val titleY = 108

  // 设置文字颜色和字体
  // g2d.setColor(Color(255, 255, 255))
  g2d.setFont(new Font("LXGW WenKai Screen", Font.PLAIN, 30))

  // 创建渐变色
  var gradient = GradientPaint(
    // 起始点和颜色
    titleX, titleY, Color.RED,
    // 结束点和颜色
    titleX + 100, titleY, Color.BLUE
  )

  // 设置渐变色为绘图颜色
  g2d.setPaint(gradient)

  g2d.drawString(title, titleX, titleY)

  // 根据百分比计算内容的起始位置
  var contentX = content.length match
    case length if length >= 19 => (imgWidth * 0.39).toInt
    case length if length >= 10 => (imgWidth * 0.47).toInt
    case _ => (imgWidth * 0.54).toInt
  var contentY = (imgHeight * 0.4).toInt

  // g2d.setColor(Color(50, 50, 50))
  g2d.setFont(new Font("LXGW WenKai Screen", Font.PLAIN, 23))

  // 获取行高
  val lineHeight = g2d.getFontMetrics.getHeight

  // 绘制内容（竖着排列并根据内容长度适当换行）
  val colorX = contentX
  val colorY = contentY
  for (char <- content) {
    gradient = GradientPaint(
      colorX, colorY, Color(0, 0, 0),
      contentX, contentY + 200, Color(250, 208, 196)
    )
    g2d.setPaint(gradient)
    g2d.drawString(char.toString, contentX, contentY)
    contentY += lineHeight
    if (contentY >= (imgHeight * 0.9).toInt) {
      contentY = (imgHeight * 0.4).toInt
      contentX += (imgWidth * 0.15).toInt
    }
  }

  // 释放 Graphics2D 对象
  g2d.dispose()

  // 保存图片到文件
  val outPutFile = new File("src/main/scala/img/output.jpg")
  ImageIO.write(bufferedImage, "jpg", outPutFile)

  println("保存成功！")
}
```

![Scala 渲染文字到图片](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/Scala%20%E6%B8%B2%E6%9F%93%E6%96%87%E5%AD%97%E5%88%B0%E5%9B%BE%E7%89%87.jpg)