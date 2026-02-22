---
title: JasperReports-交叉表
published: 2025-08-29
pinned: false
description: 一个在 JasperReports 中使用交叉表的简单小教程.
tags: [Scala, JasperReports, 报表]
category: 编程
draft: false
image: ./cover.png
---

# Scala 整合 Jasper Reports

导入依赖 `build.sbt`：

```scala
libraryDependencies ++= Seq(
  // 需要和使用的 Jaspersoft Studio 版本匹配
  "net.sf.jasperreports" % "jasperreports" % "7.0.1",
  "net.sf.jasperreports" % "jasperreports-pdf" % "7.0.1",
  "net.sf.jasperreports" % "jasperreports-fonts" % "7.0.1"
)
```

在 `项目根目录\src\main\resources` 目录下创建 Jasper Reports 配置文件：

```properties
# jasperreports.properties 文件内容：
net.sf.jasperreports.awt.ignore.missing.font=true

# jasperreports_extension.properties 文件内容：
net.sf.jasperreports.extension.registry.factory.simple.font.families=net.sf.jasperreports.engine.fonts.SimpleFontExtensionsRegistryFactory
net.sf.jasperreports.extension.simple.font.families.lobstertwo=fonts/fonts.xml
```

在 `resources\fonts` 目录下创建 `fonts.xml` 配置文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<!-- 配置报表中文字体，此处使用 LXGWWenKaiGBScreen.TTF 字体 -->
<fontFamilies>
    <fontFamily name="lxgw">
        <normal>fonts/LXGWWenKaiGBScreen.TTF</normal>
        <bold>fonts/LXGWWenKaiGBScreen.TTF</bold>
        <italic>fonts/LXGWWenKaiGBScreen.TTF</italic>
        <boldItalic>fonts/LXGWWenKaiGBScreen.TTF</boldItalic>
        <pdfEncoding>Identity-H</pdfEncoding>
        <pdfEmbedded>true</pdfEmbedded>
    </fontFamily>
</fontFamilies>
```

# 创建交叉表

> - Jasper Reports 官网：https://community.jaspersoft.com/.
> - 使用的 Jaspersoft Studio 版本：7.0.1

打开 Jaspersoft Studio 并新建一份报表，此处示例选择的是 Blank_A4_Landscape 尺寸。

创建样式和参数：

<img src="https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/image-20250829121017595.png" alt="image-20250829121017595" style="zoom: 50%;" />

- `lxgw`：中文字体样式，全局默认的样式。

```xml
<style name="lxgw" default="true" blankWhenNull="true" fontName="lxgw"/>
```

![交叉表2](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A82.png)

- `reportName`、`start`、`end`，用于标题的字符串参数：

```xml
<parameter name="reportName" class="java.lang.String"/>
<parameter name="start" class="java.lang.String"/>
<parameter name="end" class="java.lang.String"/>
```

在 `Title` 中创建两个 `Text Field` 元素：

![交叉表3](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A83.png)

- `sourceData` 列表参数，用于交叉表的数据渲染列表：

```xml
<parameter name="sourceData" class="java.util.List"/>
```

将 `Summary` 区域覆盖 `Page Header`、`Column Header`、`Detail`、`Page Footer` 区域：

```xml
<title height="79" splitType="Stretch">
  <!-- ... -->
</title>
<pageHeader splitType="Stretch"/>
<columnHeader splitType="Stretch"/>
<detail>
  <band splitType="Stretch"/>
</detail>
<columnFooter splitType="Stretch"/>
<pageFooter splitType="Stretch"/>
<!-- 除了 Title 和 Summary 区域外，其他区域去掉 height 属性 -->
<summary height="362" splitType="Stretch"/>
```

## 创建数据源

创建交叉表之前需要先创建一个用于渲染表格数据的子数据源，此处选择空数据源即可：

![交叉表4](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A84.png)

创建表格元素：

![交叉表5](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A85.png)

```xml
<dataset name="CrossTableData" uuid="7e5e0115-2889-4986-9007-5bb95e28cd78">
  <!-- SQL，此处因为通过编程方式传递数据，不需要用到该标签 -->
  <query language="sql"><![CDATA[]]></query>
  <!-- 行名 -->
  <field name="rowName" class="java.lang.String"/>
  <!-- 列名 -->
  <field name="columnName" class="java.lang.String"/>
  <!-- 值，注意：此处使用的是 Long 类型 -->
  <field name="value" class="java.lang.Long"/>
</dataset>
```

在 `Summary` 中创建交叉表：

![交叉表6](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A86.png)

![交叉表7](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A87.png)

![交叉表8](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A88.png)

![交叉表9](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A89.png)

![交叉表10](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A810.png)

![交叉表11](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A811.png)

### 修改 .jrxml 文件

```xml
<element kind="crosstab" uuid="2a4034b9-45f4-4c0b-9fc6-6a62606a6e74" x="0" y="1" width="800" height="360" printRepeatedValues="false">
  <dataset>
    <datasetRun uuid="70fdf7d2-9553-4f5c-a5ae-1e40fc297380" subDataset="CrossTableData">
      <!-- 此处调整为引入主数据源的 sourceData 参数列表 -->
      <dataSourceExpression><![CDATA[new net.sf.jasperreports.engine.data.JRBeanCollectionDataSource($P{sourceData})]]></dataSourceExpression>
    </datasetRun>
  </dataset>
  <!-- ... -->
</element>
```

## 调整交叉表

双击进入交叉表：

![交叉表12](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A812.png)

![交叉表13](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A813.png)

**注意**：若是在 `.jrxml` 文件中调整宽高，需要同时将单元格外部组件的宽高一起调整；即先调整外部容器的宽高，再调整内部容器的宽高；并且内部容器的总宽高不能超过外部容器的宽高。

![交叉表14](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A814.png)

![交叉表15](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A815.png)

![交叉表17](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A817.png)

### 修改 .jrxml 文件

```xml
<!-- 将 value 字段的统计类型从 Count(统计条数) 改为 Sum(统计值) -->
<measure name="value_MEASURE" calculation="Sum" class="java.lang.Long">
  <expression><![CDATA[$F{value}]]></expression>
</measure>
```

## .jrxml 文件源码

```xml
<!-- Created with Jaspersoft Studio version 7.0.1.final using JasperReports Library version 7.0.1-573496633c2b4074e32f433154b543003f7d2498  -->
<jasperReport name="CrossTable" language="java" pageWidth="842" pageHeight="595" orientation="Landscape" columnWidth="802" leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20" uuid="d130f2dc-464a-44d7-98e6-24b504eb5e77">
	<property name="com.jaspersoft.studio.data.defaultdataadapter" value="One Empty Record"/>
	<style name="lxgw" default="true" blankWhenNull="true" fontName="lxgw"/>
	<style name="Crosstab_CH" mode="Opaque" backcolor="#F0F8FF" hTextAlign="Center" vTextAlign="Middle" fontName="lxgw">
		<box>
			<pen lineWidth="0.5" lineColor="#000000"/>
			<topPen lineWidth="0.5" lineColor="#000000"/>
			<leftPen lineWidth="0.5" lineColor="#000000"/>
			<bottomPen lineWidth="0.5" lineColor="#000000"/>
			<rightPen lineWidth="0.5" lineColor="#000000"/>
		</box>
		<paragraph lineSpacing="Single" lineSpacingSize="1.5" rightIndent="0"/>
	</style>
	<style name="Crosstab_CG" mode="Opaque" backcolor="#BFE1FF" hTextAlign="Center" vTextAlign="Middle" fontName="lxgw">
		<box>
			<pen lineWidth="0.5" lineColor="#000000"/>
			<topPen lineWidth="0.5" lineColor="#000000"/>
			<leftPen lineWidth="0.5" lineColor="#000000"/>
			<bottomPen lineWidth="0.5" lineColor="#000000"/>
			<rightPen lineWidth="0.5" lineColor="#000000"/>
		</box>
		<paragraph lineSpacingSize="1.5"/>
	</style>
	<style name="Crosstab_CT" mode="Opaque" backcolor="#005FB3" hTextAlign="Center" vTextAlign="Middle" fontName="lxgw">
		<box>
			<pen lineWidth="0.5" lineColor="#000000"/>
			<topPen lineWidth="0.5" lineColor="#000000"/>
			<leftPen lineWidth="0.5" lineColor="#000000"/>
			<bottomPen lineWidth="0.5" lineColor="#000000"/>
			<rightPen lineWidth="0.5" lineColor="#000000"/>
		</box>
		<paragraph lineSpacingSize="1.5"/>
	</style>
	<style name="Crosstab_CD" mode="Opaque" backcolor="#FFFFFF" hTextAlign="Center" vTextAlign="Middle" fontName="lxgw">
		<box>
			<pen lineWidth="0.5" lineColor="#000000"/>
			<topPen lineWidth="0.5" lineColor="#000000"/>
			<leftPen lineWidth="0.5" lineColor="#000000"/>
			<bottomPen lineWidth="0.5" lineColor="#000000"/>
			<rightPen lineWidth="0.5" lineColor="#000000"/>
		</box>
		<paragraph lineSpacingSize="1.5"/>
	</style>
	<dataset name="CrossTableData" uuid="7e5e0115-2889-4986-9007-5bb95e28cd78">
		<query language="sql"><![CDATA[]]></query>
		<field name="rowName" class="java.lang.String"/>
		<field name="columnName" class="java.lang.String"/>
		<field name="value" class="java.lang.Long"/>
	</dataset>
	<parameter name="reportName" class="java.lang.String"/>
	<parameter name="start" class="java.lang.String"/>
	<parameter name="end" class="java.lang.String"/>
	<parameter name="sourceData" class="java.util.List"/>
	<query language="sql"><![CDATA[]]></query>
	<background splitType="Stretch"/>
	<title height="79" splitType="Stretch">
		<element kind="textField" uuid="f6a598ac-ec98-4f68-91a6-a6cf4fb6786b" x="0" y="0" width="800" height="50" fontSize="29.0" hTextAlign="Left" vTextAlign="Middle">
			<expression><![CDATA[$P{reportName}]]></expression>
		</element>
		<element kind="textField" uuid="8e04cf35-36ef-4263-a61a-bc2617540607" x="0" y="50" width="800" height="29" fontSize="14.0" vTextAlign="Middle">
			<expression><![CDATA["统计周期: " + $P{start} + " 至 " + $P{end}]]></expression>
		</element>
	</title>
	<pageHeader splitType="Stretch"/>
	<columnHeader splitType="Stretch"/>
	<detail>
		<band splitType="Stretch"/>
	</detail>
	<columnFooter splitType="Stretch"/>
	<pageFooter splitType="Stretch"/>
	<summary height="362" splitType="Stretch">
		<element kind="crosstab" uuid="2a4034b9-45f4-4c0b-9fc6-6a62606a6e74" x="0" y="1" width="800" height="360" printRepeatedValues="false">
			<dataset>
				<datasetRun uuid="70fdf7d2-9553-4f5c-a5ae-1e40fc297380" subDataset="CrossTableData">
					<dataSourceExpression><![CDATA[new net.sf.jasperreports.engine.data.JRBeanCollectionDataSource($P{sourceData})]]></dataSourceExpression>
				</datasetRun>
			</dataset>
			<headerCell mode="Opaque" style="lxgw">
				<element kind="staticText" uuid="e2736917-9061-4ef4-a8f7-ffc679d305fa" stretchType="ContainerHeight" x="0" y="0" width="70" height="30" fontName="lxgw" hTextAlign="Center" vTextAlign="Middle">
					<paragraph lineSpacingSize="1.5"/>
					<text><![CDATA[行名/列名]]></text>
					<box>
						<topPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
						<leftPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
						<bottomPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
						<rightPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
					</box>
				</element>
				<box style="lxgw">
					<topPen lineWidth="0.0" lineStyle="Solid" lineColor="#000000"/>
					<leftPen lineWidth="0.0" lineStyle="Solid" lineColor="#000000"/>
					<bottomPen lineWidth="0.0" lineStyle="Solid" lineColor="#000000"/>
					<rightPen lineWidth="0.0" lineStyle="Solid" lineColor="#000000"/>
				</box>
				<property name="com.jaspersoft.studio.layout" value="com.jaspersoft.studio.editor.layout.VerticalRowLayout"/>
			</headerCell>
			<property name="com.jaspersoft.studio.layout" value="com.jaspersoft.studio.editor.layout.FreeLayout"/>
			<property name="com.jaspersoft.studio.crosstab.style.header" value="Crosstab_CH"/>
			<property name="com.jaspersoft.studio.crosstab.style.group" value="Crosstab_CG"/>
			<property name="com.jaspersoft.studio.crosstab.style.total" value="Crosstab_CT"/>
			<property name="com.jaspersoft.studio.crosstab.style.detail" value="Crosstab_CD"/>
			<rowGroup name="rowName" totalPosition="End" width="70">
				<bucket class="java.lang.String">
					<expression><![CDATA[$F{rowName}]]></expression>
				</bucket>
				<header mode="Opaque" style="Crosstab_CH">
					<element kind="textField" uuid="71846532-3b30-4378-b692-4684df295513" stretchType="ContainerHeight" x="0" y="0" width="70" height="30" style="Crosstab_CH">
						<expression><![CDATA[$V{rowName}]]></expression>
						<box style="Crosstab_CH">
							<topPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<leftPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<bottomPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<rightPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
						</box>
					</element>
				</header>
				<totalHeader mode="Opaque" style="Crosstab_CT">
					<element kind="staticText" uuid="fe70ce71-4137-4ae9-aa86-c2364d89c29b" stretchType="ContainerHeight" x="0" y="0" width="70" height="20" forecolor="#FFFFFF" style="Crosstab_CT">
						<text><![CDATA[合计]]></text>
						<box style="Crosstab_CT">
							<topPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<leftPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<bottomPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<rightPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
						</box>
					</element>
				</totalHeader>
			</rowGroup>
			<columnGroup name="columnName" totalPosition="End" height="30">
				<bucket class="java.lang.String">
					<expression><![CDATA[$F{columnName}]]></expression>
				</bucket>
				<header mode="Opaque" style="Crosstab_CH">
					<element kind="textField" uuid="7fc2101a-360b-497a-bc6a-6dd584a686fc" stretchType="ContainerHeight" x="0" y="0" width="90" height="30" textAdjust="ScaleFont" linkType="None" linkTarget="Self" style="Crosstab_CH">
						<paragraph firstLineIndent="0" leftIndent="0" spacingBefore="0" spacingAfter="0"/>
						<expression><![CDATA[$V{columnName}]]></expression>
						<property name="com.jaspersoft.studio.unit.firstLineIndent" value="px"/>
						<property name="com.jaspersoft.studio.unit.leftIndent" value="px"/>
						<property name="com.jaspersoft.studio.unit.spacingBefore" value="px"/>
						<property name="com.jaspersoft.studio.unit.spacingAfter" value="px"/>
						<box style="Crosstab_CH">
							<topPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<leftPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<bottomPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<rightPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
						</box>
					</element>
				</header>
				<totalHeader mode="Opaque" style="Crosstab_CT">
					<element kind="staticText" uuid="49e3a61e-ddfc-4464-aa2c-d7265039aaea" stretchType="ContainerHeight" x="0" y="0" width="60" height="30" forecolor="#FFFFFF" style="Crosstab_CT">
						<text><![CDATA[合计]]></text>
						<box style="Crosstab_CT">
							<topPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<leftPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<bottomPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<rightPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
						</box>
					</element>
				</totalHeader>
			</columnGroup>
			<measure name="value_MEASURE" calculation="Sum" class="java.lang.Long">
				<expression><![CDATA[$F{value}]]></expression>
			</measure>
			<cell width="90" height="30">
				<contents mode="Opaque" style="Crosstab_CD">
					<element kind="textField" uuid="cb813773-2d35-4bb0-bc36-6c05bce4079a" stretchType="ContainerHeight" x="0" y="0" width="90" height="30" style="Crosstab_CD">
						<expression><![CDATA[$V{value_MEASURE}]]></expression>
						<box style="Crosstab_CD">
							<topPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<leftPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<bottomPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<rightPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
						</box>
					</element>
				</contents>
			</cell>
			<cell width="60" height="30" columnTotalGroup="columnName">
				<contents mode="Opaque" style="Crosstab_CT">
					<element kind="textField" uuid="d120cb98-c338-4f72-bfab-5d114bd25ba9" stretchType="ContainerHeight" x="0" y="0" width="60" height="30" forecolor="#FFFFFF" style="Crosstab_CT">
						<expression><![CDATA[$V{value_MEASURE}]]></expression>
						<box style="Crosstab_CT">
							<topPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<leftPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<bottomPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<rightPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
						</box>
					</element>
				</contents>
			</cell>
			<cell width="90" height="20" rowTotalGroup="rowName">
				<contents mode="Opaque" style="Crosstab_CT">
					<element kind="textField" uuid="f153bd1f-bd53-4288-8fdc-24404c84ca89" stretchType="ContainerHeight" x="0" y="0" width="90" height="20" forecolor="#FFFFFF" style="Crosstab_CT">
						<expression><![CDATA[$V{value_MEASURE}]]></expression>
						<box style="Crosstab_CT">
							<topPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<leftPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<bottomPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<rightPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
						</box>
					</element>
				</contents>
			</cell>
			<cell width="60" height="20" rowTotalGroup="rowName" columnTotalGroup="columnName">
				<contents mode="Opaque" style="Crosstab_CT">
					<element kind="textField" uuid="4512b68b-fb03-4b48-a8a8-28581868b0f0" stretchType="ContainerHeight" x="0" y="0" width="60" height="20" forecolor="#FFFFFF" style="Crosstab_CT">
						<expression><![CDATA[$V{value_MEASURE}]]></expression>
						<box style="Crosstab_CT">
							<topPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<leftPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<bottomPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
							<rightPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
						</box>
					</element>
				</contents>
			</cell>
		</element>
	</summary>
</jasperReport>
```

# 渲染交叉表

将 `CrossTable.jrxml` 文件复制到 Scala 项目的 `src\main\resources\report` 目录中。

Scala 代码：

```scala
import net.sf.jasperreports.`export`.SimpleExporterInput
import net.sf.jasperreports.`export`.SimpleOutputStreamExporterOutput
import net.sf.jasperreports.engine.*
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource
import net.sf.jasperreports.engine.util.JRLoader
import net.sf.jasperreports.engine.xml.JRXmlLoader
import net.sf.jasperreports.pdf.JRPdfExporter
import java.io.InputStream
import scala.collection.immutable.HashMap
import scala.collection.mutable
import scala.collection.mutable.ListBuffer
import scala.jdk.CollectionConverters.*
import scala.util.Random

object CrossTable:
  // 填充报表的方法
  def createPTF(
    // 报表文件的名称
    reportName: String,
    // 需要填充的参数映射
    parameters: Map[String, Any],
    // 此处默认值为空的数据源
    dataSource: JRDataSource = new JREmptyDataSource()
  ): JasperPrint = {
    // 获取 .jrxml 模板文件，通过 src\main\resources 目录进行定位
    val inputStream: InputStream = getClass().getClassLoader().getResourceAsStream(reportName)

    if inputStream == null then println("文件不存在")

    // 用 JRXmlLoader 将 XML 流加载为 JasperDesign
    val jasperDesign = JRXmlLoader.load(inputStream)
    // 编译 JasperDesign 为 JasperReport（内存中编译，不生成文件）
    val jasperReport = JasperCompileManager.compileReport(jasperDesign)
    // 编译 .jrxml 为 .jasper 并保存到本地文件
    // JasperCompileManager.compileReportToFile(jasperDesign, "./xxx.jasper")

    // 若是传递的是 .jasper 文件，则直接加载 inputStream 流即可
    // val jasperReport = JRLoader.loadObject(inputStream).asInstanceOf[JasperReport]

    // JasperReports 需要的是 Java 可变的 HaspMap，此处将不可变 Map 转为可变 Map
    // 直接将不可变 Map 执行 asJava 方法会导致报错：java.lang.UnsupportedOperationException，
    // 因为 JasperReports 在填充报表时会尝试向这个 Map 中添加一些内部参数
    val javaParams = new java.util.HashMap[String, AnyRef]()
    parameters.foreach { case (k, v) =>
      javaParams.put(k, v.asInstanceOf[AnyRef])
    }

    // 填充报表
    JasperFillManager.fillReport(jasperReport, javaParams, dataSource)
  }

  // 导出渲染后的 PDF 文件到本地
  def exportToPdf(jasperPrint: JasperPrint, outputPath: String): Unit = {
    val exporter = new JRPdfExporter()
    exporter.setExporterInput(new SimpleExporterInput(jasperPrint))
    exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(outputPath))
    exporter.exportReport()
  }

  // 交叉表数据结构
  case class CrossTabData(
    rowName: String,
    columnName: String,
    value: Long = 0L
  ) {
    // 显式指定 get 方法
    // 报表中需要使用类的 getXxx 方法才能获取数据，例如：.getRowName()
    // 而 Scala 的 case class 默认生成的 get 方法是直接的属性名，例如：.rowName()
    def getRowName: String = rowName
    def getColumnName: String = columnName
    def getValue: Long = value
  }

  def main(args: Array[String]): Unit = {
    // 创建数据
    val (buffer, random) = (ListBuffer[CrossTabData](), new Random())
    for {
      rowIndex <- 1 to 6
      columnIndex <- 1 to 6
    } do
      buffer += CrossTabData(
        s"行$rowIndex",
        s"列$columnIndex",
        random.nextLong(1000)
      )

    // 填充数据并渲染
    val pdf = createPTF(
      // 相对于 src\main\resources\ 路径
      "report/CrossTable.jrxml",
      Map(
        "reportName" -> "交叉报表的食用方式",
        "start" -> "2099-01-01",
        "end" -> "2099-01-31",
        "sourceData" -> buffer.toList.asJava
      )
    )

    // 导出渲染后的 PDF 到项目根目录下的 CrossTable.pdf
    exportToPdf(pdf, "./CrossTable.pdf")
  }
end CrossTable
```

最终渲染的报表示例：

![交叉表18](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A818.png)

# 父子组件通信

现在的交叉表的 `CrossTab Header` 的值固定为 `行名/列名`，可以从主数据源中将参数传递给 `CrossTab Header`，从而实现动态修改 `CrossTab Header` 。

首先在主报表中添加参数 `header`：

```xml
<parameter name="reportName" class="java.lang.String"/>
<parameter name="start" class="java.lang.String"/>
<parameter name="end" class="java.lang.String"/>
<parameter name="sourceData" class="java.util.List"/>
<!-- 添加 header 参数，表示 `CrossTab Header` 的值 -->
<parameter name="header" class="java.lang.String"/>
```

在交叉表组件中定义一个 `crossTabHeader` 参数，用于引用 `header` 参数：

```xml
<element kind="crosstab" uuid="2a4034b9-45f4-4c0b-9fc6-6a62606a6e74" x="0" y="1" width="800" height="360" printRepeatedValues="false">
  <!-- 定义 `crossTabHeader` 参数 -->
  <parameter name="crossTabHeader">
    <!-- 在表达式中引用 `header` 参数 -->
    <expression><![CDATA[$P{header}]]></expression>
  </parameter>
  <dataset>...</dataset>
  <!-- ... -->
</element>
```

将 `CrossTab Header` 单元格的 `kind` 属性从 `staticText` 改为 `textField`，并将静态值改为表达式：

```xml
<!-- 将 kind="staticText" 改为 kind="textField" -->
<element kind="textField" uuid="e2736917-9061-4ef4-a8f7-ffc679d305fa" stretchType="ContainerHeight" x="0" y="0" width="70" height="30" fontName="lxgw" hTextAlign="Center" vTextAlign="Middle">
  <paragraph lineSpacingSize="1.5"/>
  <!-- 在表达式中引用 `crossTabHeader` 参数 -->
  <expression><![CDATA[$P{crossTabHeader}]]></expression>
  <box>...</box>
</element>
```

最后在 Scala 代码中填充 `header` 参数：

```scala
val pdf = createPTF(
  "report/CrossTable.jrxml",
  Map(
    "reportName" -> "交叉报表的食用方式",
    "start" -> "2099-01-01",
    "end" -> "2099-01-31",
    "sourceData" -> buffer.toList.asJava,
    // 填充 header 参数
    "header" -> "喵呜～♡"
  )
)
```

最终渲染的报表示例：

![交叉表19](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A819.png)

# 数据预处理

Jasper Reports 默认会对传入的数据源进行正序排序，而不管数据源的原本顺序是正序或降序；解决方案是启用数据源的预先处理（此处针对的是从代码中传入数据源，连接数据库的方式可以直接在 SQL 中进行排序）：

![交叉表20](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A820.png)

此时的 `dataset` 标签中多出一个 `dataPreSorted` 属性：

```xml
<!-- dataPreSorted="true"：启用数据预先处理，即 Jasper Reports 不处理数据源 -->
<dataset dataPreSorted="true">
  <datasetRun uuid="70fdf7d2-9553-4f5c-a5ae-1e40fc297380" subDataset="CrossTableData">
    <dataSourceExpression><![CDATA[new net.sf.jasperreports.engine.data.JRBeanCollectionDataSource($P{sourceData})]]></dataSourceExpression>
  </datasetRun>
</dataset>
```

最后在 Scala 代码中对 `sourceData` 数据集进行降序排序：

```scala
val pdf = createPTF(
  "report/CrossTable.jrxml",
  Map(
    "reportName" -> "交叉报表的食用方式",
    "start" -> "2099-01-01",
    "end" -> "2099-01-31",
    // 对数据集进行降序排序
    "sourceData" -> buffer.reverse.toList.asJava,
    "header" -> "喵呜～♡"
  )
)
```

最终渲染的报表示例：

![交叉表21](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/%E4%BA%A4%E5%8F%89%E8%A1%A821.png)