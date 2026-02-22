---
title: 在 Spring Boot 中集成 JasperReports
published: 2025-04-20
pinned: false
description: 一个在 Spring Boot 项目中使用 JasperReports 的简单小教程.
tags: [Java, Spring Boot, JasperReports, 报表]
category: 编程
draft: false
image: ./cover.jpg
---

> JasperReports 官网：[https://community.jaspersoft.com/](https://community.jaspersoft.com/).

导入依赖 `pom.xml`：

```xml
<!-- JasperReports 核心库 -->
<dependency>
  <groupId>net.sf.jasperreports</groupId>
  <artifactId>jasperreports</artifactId>
  <version>7.0.1</version>
  <exclusions>
    <exclusion>
      <groupId>com.lowagie</groupId>
      <artifactId>itext</artifactId>
    </exclusion>
  </exclusions>
</dependency>
<!-- JasperReports PDF 扩展库 -->
<dependency>
  <groupId>net.sf.jasperreports</groupId>
  <artifactId>jasperreports-pdf</artifactId>
  <version>7.0.1</version> <!-- 与 JasperReports 核心版本保持一致 -->
</dependency>
<!-- JasperReports 字体扩展库，用于解决中文不能识别的问题 -->
<dependency>
  <groupId>net.sf.jasperreports</groupId>
  <artifactId>jasperreports-fonts</artifactId>
  <version>7.0.1</version>
</dependency>
```

## 基础设施

接口：

```java
import net.sf.jasperreports.engine.JRDataSource;
import net.sf.jasperreports.engine.JRException;
import org.springframework.http.ResponseEntity;
import java.sql.SQLException;
import java.util.Map;

public interface JasperService {
  /**
   * 输出 PDF 二进制流响应
   * @param fileName 输出文件名
   * @param parameters 渲染参数
   * @param dataSource 自定义渲染数据源，传递 null 表示使用数据库的数据源
   * @return 二进制流
   * @throws JRException Jasper 操作异常
   * @throws SQLException 数据库异常
   */
  ResponseEntity<byte[]> PDF(String fileName, Map<String, Object> parameters,
                             JRDataSource dataSource) throws JRException, SQLException;
}
```

实现：

```java
import cn.hutool.core.lang.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.util.JRLoader;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;
import javax.sql.DataSource;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class JasperServiceImpl implements JasperService {
  // 注入项目默认数据源，需在配置文件 application.properties 中进行配置
  private final DataSource systemDataSource;

  @Override
  public ResponseEntity<byte[]> PDF(String fileName, Map<String, Object> parameters, JRDataSource dataSource) throws JRException, SQLException {
    JasperPrint jasperPrint = FillData(fileName, parameters, dataSource);
    // 生成 PDF 二进制字节
    byte[] bytes = JasperExportManager.exportReportToPdf(jasperPrint);
    // 创建一个新的 HTTP 头集合对象，用于设置响应头信息
    HttpHeaders header = new HttpHeaders();
    // 指定响应内容类型为 PDF（application/pdf）
    header.setContentType(MediaType.APPLICATION_PDF);
    // 设置缓存控制头
    // maxAge()：即 max-age=600，表示资源可以被缓存 10 分钟
    // mustRevalidate()：即 must-revalidate，表示资源过期后必须重新验证
    header.setCacheControl(CacheControl
      .maxAge(10, TimeUnit.MINUTES)
      .mustRevalidate());
    // 设置内容处置
    header.setContentDisposition(
      // inline：指示浏览器应尝试在页面内显示PDF（而不是下载）
      ContentDisposition.builder("inline")
        // 设置导出文件名
        .filename("report_" + UUID.fastUUID() + ".pdf")
        .build()
    );
    // 构建响应实体，创建 HTTP 200 OK 响应
    return ResponseEntity.ok()
      // 添加上面设置的所有头信息
      .headers(header)
      // 设置响应体为 PDF 文件的字节数组
      .body(bytes);
  }

  private JasperPrint FillData(String fileName, Map<String, Object> parameters, JRDataSource dataSource) throws JRException, SQLException {
    // 获取 Jasper 模板文件
    InputStream inputStream = getClass().getClassLoader().getResourceAsStream(fileName);
    if (ObjectUtils.isEmpty(inputStream)) log.error("Error loading file {}", fileName);

    // 合并请求参数和系统参数
    JasperReport jasperReport = (JasperReport) JRLoader.loadObject(inputStream);

    JasperPrint jasperPrint;
    if (!ObjectUtils.isEmpty(dataSource))
      // 使用自定义的数据源进行数据渲染
      jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
    else
      // 使用项目配置数据源，.jrxml 中可以根据 SQL 从数据库中拉取数据并渲染
      jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, systemDataSource.getConnection());
    return jasperPrint;
  }
}
```

> **注意**：设置缓存只针对 Jasper Reports 使用 SQL 数据源的情况；如果是从程序中传递参数给到报表渲染，这时缓存是不生效的！！

## 配置文件

在 `resources` 目录下创建字体目录 `fonts`。

`fonts/fonts.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<!-- 注册字体，根元素 <fontFamilies> 包含所有字体定义 -->
<fontFamilies>
    <!-- <fontFamily> 定义了一个名为"华文宋体"的字体族，.jrxml 中引用的字体名称 -->
    <fontFamily name="华文宋体">
        <!-- 字体文件路径，需放在 /resources 目录下 -->
        <!-- 指定了四种字体样式的文件路径（都是同一个 TTF 文件） -->
        <!-- 虽然华文宋体可能没有真正的粗体或斜体变体，但这里都指向同一文件 -->
        <normal>fonts/STSONG.TTF</normal>
        <bold>fonts/STSONG.TTF</bold>
        <italic>fonts/STSONG.TTF</italic>
        <boldItalic>fonts/STSONG.TTF</boldItalic>
        <!-- pdfEncoding：指定PDF编码为 Identity-H (Unicode 水平书写) -->
        <pdfEncoding>Identity-H</pdfEncoding>
        <!-- pdfEmbedded：设置为 true 表示将字体嵌入 PDF 文件中 -->
        <pdfEmbedded>true</pdfEmbedded>
        <!-- 定义 HTML 和 XHTML 导出时的字体回退链 -->
        <exportFonts>
            <!-- 如果"华文宋体"不可用，会依次尝试 Arial、Helvetica 和 sans-serif 字体 -->
            <export key="net.sf.jasperreports.html">'华文宋体', Arial, Helvetica, sans-serif</export>
            <export key="net.sf.jasperreports.xhtml">'华文宋体', Arial, Helvetica, sans-serif</export>
        </exportFonts>
    </fontFamily>
</fontFamilies>
```

### 注册字体

创建配置文件，必须定义为 `jasperreports.properties`：

```properties
# 强制 JasperReports 忽略缺失的字体（避免 JRFontNotFoundException）
# JasperReports 遇到未安装的字体时不会报错，而是使用默认字体替换
net.sf.jasperreports.awt.ignore.missing.font=true
```

创建配置文件，必须定义为 `jasperreports_extension.properties`：

```properties
# 注册字体扩展工厂
net.sf.jasperreports.extension.registry.factory.simple.font.families=net.sf.jasperreports.engine.fonts.SimpleFontExtensionsRegistryFactory
# 指定字体定义文件路径（需在 classpath 下），fonts/fonts.xml：字体注册文件
net.sf.jasperreports.extension.simple.font.families.lobstertwo=fonts/fonts.xml
```

> **注意**：以上两个配置文件不能合成一个配置文件！！

## 创建 PDF 模板

`xxx.jrxml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://jasperreports.sourceforge.net/jasperreports http://jasperreports.sourceforge.net/xsd/jasperreport.xsd"
              name="lq_item"
              language="java"
              pageWidth="842"
              pageHeight="595"
              orientation="Landscape"
              columnWidth="802"
              leftMargin="20"
              rightMargin="20"
              topMargin="20"
              bottomMargin="20"
              uuid="d231d38f-0c4c-456f-8a9a-6418352f4484"
              whenNoDataType="AllSectionsNoDetail"
              isIgnorePagination="false">

    <!-- 若是需要显示中文，则必须配置字体文件！！ -->
    <!-- fontName：设置字体样式，若系统中找不到对应字体会报错！！ -->
    <!-- 这里使用自行导入的字体，字体引用名称为：华文宋体 -->
    <style name="Title" fontName="华文宋体" fontSize="30" isBold="true" hTextAlign="Center" vTextAlign="Middle"/>
    <style name="SubTitle" fontName="华文宋体" fontSize="16" hTextAlign="Center" vTextAlign="Middle"/>
    <style name="ColumnHeader" fontName="华文宋体" fontSize="14" isBold="true" hTextAlign="Center" vTextAlign="Middle"/>
    <style name="Detail" fontName="华文宋体" fontSize="14" hTextAlign="Center" vTextAlign="Middle"/>

    <!-- 设置普通参数 -->
    <parameter name="title" class="java.lang.String"/>
    <parameter name="time" class="java.lang.String"/>
    <!-- 设置列表参数，需要循环渲染的参数 -->
    <field name="id" class="java.lang.Integer"/>
    <field name="account" class="java.lang.String"/>
    <field name="name" class="java.lang.String"/>
    <field name="memo" class="java.lang.String"/>
    <field name="ghInfo" class="java.lang.String"/>

    <background>
        <band splitType="Stretch"/>
    </background>

    <title>
        <band height="100">
            <textField>
                <reportElement x="0" y="10" width="802" height="40" style="Title"/>
                <!-- $P{xxx}：对应上面设置的 <parameter> 普通参数 -->
                <textFieldExpression><![CDATA[$P{title}]]></textFieldExpression>
            </textField>
            <textField>
                <reportElement x="0" y="60" width="802" height="30" style="SubTitle"/>
                <textFieldExpression><![CDATA["时间：" + $P{time}]]></textFieldExpression>
            </textField>
        </band>
    </title>

    <pageHeader>
        <band height="0"/>
    </pageHeader>

    <columnHeader>
        <band height="40">
            <staticText>
                <reportElement x="17" y="0" width="121" height="40" style="ColumnHeader"/>
                <box>
                    <topPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
                    <leftPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
                    <bottomPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
                    <rightPen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
                </box>
                <text><![CDATA[序号]]></text>
            </staticText>
            <staticText>
                <reportElement x="138" y="0" width="121" height="40" style="ColumnHeader"/>
                <box>
                    <pen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
                </box>
                <text><![CDATA[账号/联系电话]]></text>
            </staticText>
            <staticText>
                <reportElement x="259" y="0" width="121" height="40" style="ColumnHeader"/>
                <box>
                    <pen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
                </box>
                <text><![CDATA[姓名]]></text>
            </staticText>
            <staticText>
                <reportElement x="380" y="0" width="151" height="40" style="ColumnHeader"/>
                <box>
                    <pen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
                </box>
                <text><![CDATA[人员备注]]></text>
            </staticText>
            <staticText>
                <reportElement x="531" y="0" width="240" height="40" style="ColumnHeader"/>
                <box>
                    <pen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
                </box>
                <text><![CDATA[衣物信息]]></text>
            </staticText>
        </band>
    </columnHeader>

    <detail>
        <band height="30">
            <textField>
                <reportElement x="17" y="0" width="121" height="30" style="Detail"/>
                <box>
                    <pen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
                </box>
                <!-- $F{xxx}：对应上面设置的 <field> 列表参数 -->
                <textFieldExpression><![CDATA[$F{id}]]></textFieldExpression>
            </textField>
            <textField>
                <reportElement x="138" y="0" width="121" height="30" style="Detail"/>
                <box>
                    <pen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
                </box>
                <textFieldExpression><![CDATA[$F{account}]]></textFieldExpression>
            </textField>
            <textField>
                <reportElement x="259" y="0" width="121" height="30" style="Detail"/>
                <box>
                    <pen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
                </box>
                <textFieldExpression><![CDATA[$F{name}]]></textFieldExpression>
            </textField>
            <textField>
                <reportElement x="380" y="0" width="151" height="30" style="Detail"/>
                <box>
                    <pen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
                </box>
                <textFieldExpression><![CDATA[$F{memo}]]></textFieldExpression>
            </textField>
            <textField>
                <reportElement x="531" y="0" width="240" height="30" style="Detail"/>
                <box>
                    <pen lineWidth="1.0" lineStyle="Solid" lineColor="#000000"/>
                </box>
                <textFieldExpression><![CDATA[$F{ghInfo}]]></textFieldExpression>
            </textField>
        </band>
    </detail>

    <columnFooter>
        <band height="0"/>
    </columnFooter>

    <pageFooter>
        <band height="0">
        </band>
    </pageFooter>

    <summary>
        <band height="0"/>
    </summary>
</jasperReport>
```

![Spring Boot 集成 JasperReports1](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/Spring%20Boot%20%E9%9B%86%E6%88%90%20JasperReports1.png)

将 `.jrxml` 文件复制到 Jaspersoft Studio 中并编译成 `.jasper` 文件，然后将 `.jasper` 文件拖入到 `resources` 目录中。

## Resources 目录层级结构

![Spring Boot 集成 JasperReports2](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/Spring%20Boot%20%E9%9B%86%E6%88%90%20JasperReports2.png)

## 渲染数据并导出

```java
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/jasper")
public class JasperController {
  private final JasperService jasperService;

  @GetMapping("/pdf")
  public ResponseEntity<byte[]> PDF() throws JRException, SQLException {
    // 模板文件相对位置，需要放在 resources 目录下！！
    String template = "jasper/xxx.jasper";
    // 填充普通参数 $P{xxx}
    Map<String, Object> parameters = new HashMap<>();
    parameters.put("title", "Test Table");
    parameters.put("time", "2999-10-12");
    // 填充元素/列表参数 $F{xxx}
    List<Map<String, Object>> data = Arrays.asList(
      new HashMap<>() {{
        put("id", 1);
        put("account", "001");
        put("name", "name1");
        put("memo", "memo1");
        put("ghInfo", "info1");
      }},
      new HashMap<>() {{
        put("id", 2);
        put("account", "002");
        put("name", "name2");
        put("memo", "memo2");
        put("ghInfo", "info2");
      }}
    );
    // 将自定义数据源转换成 Jasper 支持的类型
    JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(data);
    return jasperService.PDF(template, parameters, dataSource);
  }
}
```

![Spring Boot 集成 JasperReports3](https://atriii.oss-cn-guangzhou.aliyuncs.com/MDImg/Spring%20Boot%20%E9%9B%86%E6%88%90%20JasperReports3.png)