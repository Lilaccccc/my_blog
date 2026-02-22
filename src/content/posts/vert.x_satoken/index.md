---
title: 在 Vert.x 中集成 SaToken
published: 2025-03-22
pinned: false
tags: [Vert.x, SaToken, Scala]
category: 编程
draft: false
image: ./cover.jpg
---

-   官方文档：[Sa-Token](https://sa-token.cc/doc.html#/).
-   参考教程：[自定义 SaTokenContext 指南](https://sa-token.cc/doc.html#/fun/sa-token-context).

Vert.x 提供的 Request 对象不基于 ServletAPI 规范，所以需要手动实现 SaToken 依赖的 Servlet 容器。

导入依赖 `build.sbt`：

```scala
// SaToken 核心依赖，注意：此处的依赖版本是 1.40.0 ！！
libraryDependencies += "cn.dev33" % "sa-token-core" % "1.40.0"
// Hutool 的 JSON 工具依赖
libraryDependencies += "cn.hutool" % "hutool-json" % "5.8.36"
// Redis4jCats 依赖
libraryDependencies += "dev.profunktor" %% "redis4cats-effects" % "1.7.2"
// 提供 IO 异步支持依赖
libraryDependencies += "org.typelevel" %% "cats-effect" % "3.6-623178c"
// Vert.x 依赖
libraryDependencies ++= Seq(
  // Vert.x 核心库
  "io.vertx" % "vertx-core" % "4.5.13",
  // Vert.x 的 Web 支持
  "io.vertx" % "vertx-web" % "4.5.13",
  // Vert.x 的 Scala 支持
  "io.vertx" % "vertx-lang-scala_3" % "4.5.11",
  // Vert.x 的客户端支持
  "io.vertx" % "vertx-web-client" % "4.5.13"
)
```

## 实现 SaRequest 接口

```scala
import cn.dev33.satoken.context.model.SaRequest
import io.vertx.core.http.HttpServerRequest
import io.vertx.ext.web.RoutingContext
import java.util
import scala.jdk.CollectionConverters.*

// 请求对象，携带着一次请求的所有参数数据
class VertxRequest(ctx: RoutingContext) extends SaRequest {
  val request: HttpServerRequest = ctx.request()
  override def getSource: HttpServerRequest = request

  override def getParam(name: String): String = Option(request.getParam(name)).getOrElse("")

  override def getParamNames: util.Collection[String] = request.params().names()

  override def getParamMap: util.Map[String, String] = request.params().asScala.map(entry => entry.getKey -> entry.getValue).toMap.asJava

  override def getHeader(name: String): String = Option(request.getHeader(name)).getOrElse("")

  override def getCookieValue(name: String): String = Option(request.getCookie(name).getValue).getOrElse("")

  override def getCookieFirstValue(name: String): String = Option(request.cookies(name).asScala.head.getValue).getOrElse("")

  override def getCookieLastValue(name: String): String = Option(request.cookies(name).asScala.last.getValue).getOrElse("")

  override def getRequestPath: String = Option(request.uri()).getOrElse("")

  override def getUrl: String = Option(request.absoluteURI()).getOrElse("")

  override def getMethod: String = Option(request.method().name()).getOrElse("")
  
  // SaToken 1.41.0 需要新增实现以下方法
  // override def getHost: String = request.authority().host()

  // 请求转发
  override def forward(path: String): AnyRef = {
    ctx.reroute(path)
    null
  }
}
```

## 实现 SaResponse 接口

```scala
import cn.dev33.satoken.context.model.SaResponse
import io.vertx.core.http.HttpServerResponse
import io.vertx.ext.web.RoutingContext

// 响应对象，携带着对客户端一次响应的所有数据
class VertxResponse(ctx: RoutingContext) extends SaResponse {
  val response: HttpServerResponse = ctx.response()
  override def getSource: HttpServerResponse = response

  override def setStatus(sc: Int): SaResponse = {
    response.setStatusCode(sc)
    this
  }

  override def setHeader(name: String, value: String): SaResponse = {
    response.putHeader(name, value)
    this
  }

  override def addHeader(name: String, value: String): SaResponse = {
    response.putHeader(name, value)
    this
  }

  // 重定向
  override def redirect(url: String): AnyRef = ctx.redirect(url)
}
```

## 实现 SaStorage 接口

```scala
import cn.dev33.satoken.context.model.SaStorage
import io.vertx.ext.web.RoutingContext
import java.util

// 请求上下文对象，提供 [一次请求范围内] 的上下文数据读写
class VertxStorage(ctx: RoutingContext) extends SaStorage {
  val storage: util.Map[String, AnyRef] = ctx.data()
  override def getSource: util.Map[String, AnyRef] = storage

  override def get(key: String): AnyRef = Option(storage.get(key)).orNull

  override def set(key: String, value: AnyRef): SaStorage = {
    storage.put(key, value)
    this
  }

  override def delete(key: String): SaStorage = {
    storage.remove(key)
    this
  }
}
```

## 实现请求上下文对象

```scala
import cn.dev33.satoken.context.SaTokenContext
import cn.dev33.satoken.context.model.{SaRequest, SaResponse, SaStorage}
import io.vertx.ext.web.RoutingContext
import scala.compiletime.uninitialized

// 单例对象
object VertxTokenContext {
  // 懒加载创建单例实例
  private lazy val instance: VertxTokenContext = new VertxTokenContext()

  // 获取单例实例
  def apply(ctx: RoutingContext): VertxTokenContext = {
    // 设置当前请求的 RoutingContext
    instance.SetRoutingContext(ctx) 
    instance
  }
}

// SaToken 上下文处理器
class VertxTokenContext private extends SaTokenContext {
  // uninitialized 表示变量未初始化，访问未初始化的变量会抛出 UninitializedFieldError
  // 与 `= _` 不同，uninitialized 不会将变量初始化为默认值（如 null、0 等）
  // `= _` 是 Scala 2 中表示变量未初始化的方式
  private var ctx: RoutingContext = uninitialized

  // 设置当前请求的 RoutingContext
  def SetRoutingContext(ctx: RoutingContext): Unit = this.ctx = ctx

  // 获取当前请求的 [Request] 对象
  override def getRequest: SaRequest = VertxRequest(ctx)

  // 获取当前请求的 [Response] 对象
  override def getResponse: SaResponse = VertxResponse(ctx)

  // 获取当前请求的 [存储器] 对象
  override def getStorage: SaStorage = VertxStorage(ctx)

  // 校验指定路由匹配符是否可以匹配成功指定路径
  override def matchPath(pattern: String, path: String): Boolean = PathMatcher.MatchPath(pattern, path)
}
```

### 路由匹配工具类

```scala
object PathMatcher {
  /** 判断：指定路由匹配符是否可以匹配成功指定路径
   *
   * @param pattern 路由匹配符（被匹配的路径）
   * @param path 要匹配的路径
   * @return 是否匹配成功
   */
  def MatchPath(pattern: String, path: String): Boolean = {
    // 去除查询参数
    val patternWithoutQuery = RemoveQueryParams(pattern)
    val pathWithoutQuery = RemoveQueryParams(path)
    // 将 Spring 风格的路径模式转换为正则表达式
    val regex = ConvertPatternToRegex(patternWithoutQuery)
    // 使用正则表达式匹配路径
    pathWithoutQuery.matches(regex)
  }

  // 使用 ? 分割字符串并取第一部分，从而移除查询参数
  private def RemoveQueryParams(str: String): String = str.split("\\?").head 

  /** 将 Spring 风格的路径模式转换为正则表达式
   *
   * @param pattern Spring 风格的路径模式
   * @return 正则表达式
   */
  private def ConvertPatternToRegex(pattern: String): String = {
    // 替换特殊字符
    val regex = pattern
      .replace("/**", "/.*") // 支持多级路径通配符
      .replace("/*", "/[^/]*") // * 匹配任意非斜杠字符
      .replace("?", ".") // ? 匹配单个字符
      .replaceAll(":([^/]*)", "([^/]+)") // 处理 :id 形式的变量，不允许后续出现斜杠，Vert.x HTTP 路径参数的方式
      // .replaceAll("\\{[^}]+}", "([^/]+)") // 处理 {id} 形式的变量，不允许后续出现斜杠，Spring 路径参数的方式
      .replace("/", "\\/") // 转义斜杠
    "^" + regex + "$" // 添加起始和结束锚点
  }

  def main(args: Array[String]): Unit = {
    // 测试示例
    println(MatchPath("/test/test?id=1&pid=2", "/test/test")) // true
    println(MatchPath("/test/test", "/test/test/")) // false
    println(MatchPath("/test/test", "/test/test/extra")) // false
    println(MatchPath("/test/*", "/test/123")) // true
    println(MatchPath("/test/*", "/test/123/")) // false
    println(MatchPath("/test/:id", "/test/123")) // true
    println(MatchPath("/test/:pid", "/test/123/")) // false
    println(MatchPath("/test/:id/:pid", "/test/123/456")) // true
  }
}
```

## 集成 Redis

需要实现 SaToken 的存储层接口：

```scala
import redis.RedisExample // 自定义 Redis 实例
import cats.effect.IO
import cats.effect.kernel.Resource
import cats.effect.unsafe.implicits.global
import cn.dev33.satoken.dao.SaTokenDao
import cn.dev33.satoken.session.SaSession
import cn.dev33.satoken.util.SaFoxUtil
import cn.hutool.json.JSONUtil
import dev.profunktor.redis4cats.RedisCommands
import dev.profunktor.redis4cats.effects.{KeyScanArgs, RedisType}
import java.util
import scala.concurrent.duration.*
import scala.jdk.CollectionConverters.*

// 若是 SaToken 1.41.0，可以继承 SaTokenDaoDefaultImpl 类而不是实现 SaTokenDao 接口
class RedisTokenDao extends SaTokenDao {
  // 此处引入自定义的 Redis 实例（Redis4jCats），此处的 Redis 实例是短连接，
  // 也可以使用 Jedis 连接池创建长连接实例
  val redis: Resource[IO, RedisCommands[IO, String, String]] = RedisExample.api

  override def update(key: String, value: String): Unit = {
    val expire = getTimeout(key)
    if (expire == SaTokenDao.NOT_VALUE_EXPIRE) return
    set(key, value, expire)
  }

  override def getTimeout(key: String): Long = {
    redis
      .use { r =>
        r.ttl(key).flatMap {
          case Some(duration) => IO.pure(duration.toSeconds)
          case None           => IO.pure(0L)
        }
      }
      .unsafeRunSync()
  }

  override def set(key: String, value: String, timeout: Long): Unit = {
    if (timeout == 0 || timeout <= SaTokenDao.NOT_VALUE_EXPIRE) return
    // 判断是否为永不过期// 判断是否为永不过期
    if (timeout == SaTokenDao.NEVER_EXPIRE)
      redis.use(r => r.set(key, value)).unsafeRunSync()
    else redis.use(r => r.setEx(key, value, timeout.seconds)).unsafeRunSync()
  }

  override def getObject(key: String): AnyRef = {
    redis
      .use { r =>
        r.get(key).flatMap {
          case Some(value) =>
            IO.pure(SaSessionUtil.GetSession(JSONUtil.parse(value)))
          case None => IO.pure(null)
        }
      }
      .unsafeRunSync()
  }

  override def updateObject(key: String, `object`: Any): Unit = {
    val expire = getTimeout(key)
    if (expire == SaTokenDao.NOT_VALUE_EXPIRE) return
    setObject(key, `object`, expire)
  }

  // 此处的 `object` 即是 SaSession 对象，直接使用 Hutool JSON 序列化成字符串存入 Redis
  override def setObject(key: String, `object`: Any, timeout: Long): Unit = {
    if (timeout == 0 || timeout <= SaTokenDao.NOT_VALUE_EXPIRE) return
    if (timeout == SaTokenDao.NEVER_EXPIRE)
      redis
        .use(r => r.set(key, JSONUtil.toJsonPrettyStr(`object`)))
        .unsafeRunSync()
    else
      redis
        .use(r =>
          r.setEx(key, JSONUtil.toJsonPrettyStr(`object`), timeout.seconds)
        )
        .unsafeRunSync()
  }

  override def deleteObject(key: String): Unit = delete(key)

  override def delete(key: String): Unit =
    redis.use(r => r.del(key)).unsafeRunSync()

  override def getObjectTimeout(key: String): Long = getTimeout(key)

  override def updateObjectTimeout(key: String, timeout: Long): Unit =
    updateTimeout(key, timeout)

  override def updateTimeout(key: String, timeout: Long): Unit = {
    // 判断是否想要设置为永久
    if (timeout == SaTokenDao.NEVER_EXPIRE) {
      val expire = getTimeout(key)
      if (expire != SaTokenDao.NEVER_EXPIRE) {
        // 如果尚未被设置为永久，那么再次set一次
        this.set(key, this.get(key), timeout)
      }
      return
    }
    redis.use(r => r.expire(key, timeout.seconds)).unsafeRunSync()
  }

  override def get(key: String): String = {
    redis
      .use { r =>
        r.get(key).flatMap {
          case Some(value) => IO.pure(value)
          case None        => IO.pure(null)
        }
      }
      .unsafeRunSync()
  }

  /** 搜索数据，获取所有匹配的键，不是键值对
   *
   * @param prefix 前缀
   * @param keyword 关键字
   * @param start 开始处索引
   * @param size 获取数量 (-1代表从 start 处一直取到末尾)
   * @param sortType 排序类型（true=正序，false=反序）
   * @return 查询到的数据集合
   */
  override def searchData(
      prefix: String,
      keyword: String,
      start: Int,
      size: Int,
      sortType: Boolean
  ): util.List[String] = {
    val list: List[String] = redis
      .use { cmd =>
        // s"$prefix*$keyword*"：表示匹配前缀为 prefix，并且包含 keyword 的所有键
        val pattern = s"$prefix*$keyword*"
        val keyScanArgs = KeyScanArgs(RedisType.String, pattern, 30)
        cmd.scan(keyScanArgs).map(cursor => cursor.keys)
      }
      .unsafeRunSync()
    SaFoxUtil.searchList(list.asJava, start, size, sortType)
  }

  // 优先执行下面的方法而不是 getObject/setObject... 等方法
  override def setSession(session: SaSession, timeout: Long): Unit = setObject(session.getId, session, timeout)
  override def updateSession(session: SaSession): Unit = updateObject(session.getId, session)
  override def deleteSession(sessionId: String): Unit = deleteObject(sessionId)
  override def getSessionTimeout(sessionId: String): Long = getObjectTimeout(sessionId)
  override def updateSessionTimeout(sessionId: String, timeout: Long): Unit = updateObjectTimeout(sessionId, timeout)
  
  // SaToken 1.41.0 需要实现以下方法，可以通过直接继承 SaTokenDaoDefaultImpl 类重写调用父类方法，
  // 只有 1.41.0 的 SaTokenDaoDefaultImpl 才实现了 getObject[T](key: String, classType: Class[T]): T 方法
  // override def getObject[T](key: String, classType: Class[T]): T = super.getObject(key, classType)
}
```

此处需要序列化/反序列化 SaSession 对象，但是 SaSession 对象是 Java 类，而不是 Scala 类，为了方便起见，直接使用 Hutool 的 JSON 工具实现：

```java
import cn.dev33.satoken.session.SaSession;
import cn.dev33.satoken.session.TokenSign; // SaToken 1.41.0 没有该类！！
import cn.hutool.json.JSON;
import cn.hutool.json.JSONUtil;

public class SaSessionUtil {
  public static SaSession GetSession(JSON source) {
    return new SaSession() {{
      setId(source.getByPath("id").toString());
      setType(source.getByPath("type").toString());
      setLoginType(source.getByPath("loginType").toString());
      setLoginId(source.getByPath("loginId"));
      setCreateTime(Long.parseLong(source.getByPath("createTime").toString()));
      setDataMap(JSONUtil.parseObj(source.getByPath("dataMap")));
      // SaToken 1.41.0 没有该属性！！ 
      setTokenSignList(JSONUtil.parseArray(source.getByPath("tokenSignList")).toList(TokenSign.class));
    }};
  }
}
```

### Redis4jCats 实例

```scala
import cats.effect.kernel.Resource
import cats.effect.IO
import dev.profunktor.redis4cats.effect.Log
import dev.profunktor.redis4cats.effect.Log.NoOp.*
import dev.profunktor.redis4cats.{Redis, RedisCommands}

object RedisExample:
  val api: Resource[IO, RedisCommands[IO, String, String]] = Redis[IO].utf8("redis://localhost:6379")
```

## 创建 Vert.x HTTP 服务

```scala
import cn.dev33.satoken.SaManager
import cn.dev33.satoken.stp.StpUtil
import io.vertx.core.Vertx
import io.vertx.ext.web.Router
import io.vertx.ext.web.handler.BodyHandler
import vertx.User

// https://sa-token.cc/doc.html#/fun/sa-token-context
object Application extends App {
  val vertx = Vertx.vertx() // 创建 Vert.x 实例
  val router: Router = Router.router(vertx) // 创建路由
  router.route().handler(BodyHandler.create()) // 启用请求体解析
  
  // 设置 SaToken 的存储层为 Redis
  SaManager.setSaTokenDao(RedisTokenDao())

  router.route().handler(ctx => {
    // 设置 SaToken 上下文实例，经过测试每一次调用请求都需要设置上下文，
    // 此处的上下文对象使用单例确保全局只创建一次
    SaManager.setSaTokenContext(VertxTokenContext(ctx))
    ctx.next()
  })

  router.get("/login").handler { ctx =>
    // 会话登录
    StpUtil.login("Dorothy", "PC")
    val user = User("Dorothy", 16)
    StpUtil.getSession().set("user", user.toString)
    ctx.response()
      .putHeader("Content-Type", "application/json")
      .end(s"""{"msg": "Hello, ${user.name}!"}""")
  }

  router.get("/info").handler { ctx =>
    // 判断是否登录
    if StpUtil.isLogin then {
      val userStr = StpUtil.getSession().get("user").asInstanceOf[String]
      val user = userStr match {
        case s"User($name,$age)" => User(name, age.toByte)
        case _ => throw new IllegalArgumentException("转换失败！")
      }
      ctx.response()
        .putHeader("Content-Type", "application/json")
        .end(
          s"""{
             |"name": "${user.name}",
             |"age": "${user.age}"
             |}""".stripMargin)
    } else ctx.response().putHeader("Content-Type", "application/json").end("""{"msg": "未登录"}""")
  }

  // 启动服务器并监听 2234 端口
  vertx.createHttpServer()
    .requestHandler(router)
    .listen(2234, "0.0.0.0", { result =>
      if result.succeeded() then println("Server is now listening on http://127.0.0.1:2234!")
      else println(s"Failed to start server: ${result.cause()}")
    })
}
```

Redis 中的数据示例：

```json
{
  "id": "satoken:login:session:Dorothy",
  "type": "Account-Session",
  "loginType": "login",
  "loginId": "Dorothy",
  "createTime": 1742651367502,
  "dataMap": {
    "user": "User(Dorothy,16)"
  },
  "tokenSignList": [
    {
      "value": "94f2c820-8a8a-4ecd-ba55-5c9e513bcc3f",
      "device": "PC"
    },
    {
      "value": "38cfce02-dc79-45fe-a50d-79f427a846a8",
      "device": "PE"
    }
  ]
}
```