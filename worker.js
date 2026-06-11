// 保存路径: worker.js

/**
 * 城市规划研究平台后端 API 核心服务 (planning-platform-api)
 * 技术栈: Cloudflare Workers + D1 Database + Web Crypto API
 */

// ==========================================
// 1. 通用工具函数与 CORS 处理
// ==========================================

/**
 * 统一构建带 CORS 头信息的 JSON 响应
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // 练手阶段，允许任意跨域
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}

/**
 * 拦截处理浏览器的 OPTIONS 预检请求
 */
function handleCorsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    }
  });
}

// ==========================================
// 2. 原生加密与安全工具 (Web Crypto API)
// ==========================================

/**
 * 生成 16 进制随机盐值 (Salt)
 */
function generateSalt() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 使用 SHA-256 对密码和盐值进行哈希计算
 */
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Base64URL 编码工具 (JWT 规范需要)
 */
function base64urlEncode(str) {
  const base64 = btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/**
 * Base64URL 解码工具
 */
function base64urlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

/**
 * 原生 HMAC-SHA256 签发 JWT
 */
async function signJWT(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));

  const tokenString = `${encodedHeader}.${encodedPayload}`;
  const encoder = new TextEncoder();
  
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(tokenString)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${tokenString}.${encodedSignature}`;
}

/**
 * 原生验证并解析 JWT
 */
async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;

    const encoder = new TextEncoder();
    const tokenString = `${header}.${payload}`;

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = new Uint8Array(
      atob(signature.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map(c => c.charCodeAt(0))
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(tokenString)
    );

    if (!isValid) return null;

    const decodedPayload = JSON.parse(base64urlDecode(payload));

    // 检查 Token 是否过期 (exp 单位是秒)
    if (decodedPayload.exp && Date.now() / 1000 > decodedPayload.exp) {
      return null;
    }

    return decodedPayload;
  } catch (e) {
    return null;
  }
}

/**
 * 校验邮箱的基本格式
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 提取并校验请求头中的 Bearer Token
 */
async function authorizeUser(request, jwtSecret) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  return await verifyJWT(token, jwtSecret);
}

// ==========================================
// 3. 核心 API 路由及业务逻辑
// ==========================================

export default {
  async fetch(request, env, ctx) {
    // 拦截跨域预检请求
    if (request.method === "OPTIONS") {
      return handleCorsPreflight();
    }

    // 确认 JWT_SECRET 在环境变量中已配置
    if (!env.JWT_SECRET) {
      return jsonResponse({ error: "服务器环境未配置 JWT_SECRET" }, 500);
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // ------------------------------------------
      // 1. POST /api/register - 用户注册
      // ------------------------------------------
      if (path === "/api/register" && method === "POST") {
        const { email, password } = await request.json();

        // 基本入参校验
        if (!email || !password) {
          return jsonResponse({ success: false, message: "邮箱和密码不能为空" }, 400);
        }
        if (!isValidEmail(email)) {
          return jsonResponse({ success: false, message: "邮箱格式不正确" }, 400);
        }
        if (password.length < 8) {
          return jsonResponse({ success: false, message: "密码长度必须至少为 8 位" }, 400);
        }

        // 检查数据库中邮箱是否已经被注册
        const existingUser = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
          .bind(email)
          .first();

        if (existingUser) {
          return jsonResponse({ success: false, message: "该邮箱已被注册" }, 400);
        }

        // 密码加密处理（加盐哈希：格式为 salt$hash）
        const salt = generateSalt();
        const hashedPassword = await hashPassword(password, salt);
        const passwordStorage = `${salt}$${hashedPassword}`;

        // 生成用户唯一 UUID 与时间戳
        const userId = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        // 在 users 表及 user_quota 表中写入初始化记录 (使用 D1 batch 执行事务)
        await env.DB.batch([
          env.DB.prepare(
            "INSERT INTO users (id, email, password, role, verified, created_at) VALUES (?, ?, ?, 'user', 0, ?)"
          ).bind(userId, email, passwordStorage, createdAt),
          env.DB.prepare(
            "INSERT INTO user_quota (user_id, ai_calls_today, ai_reset_date, download_level) VALUES (?, 0, ?, 1)"
          ).bind(userId, createdAt.split('T')[0])
        ]);

        return jsonResponse({ success: true, message: "注册成功" }, 201);
      }

      // ------------------------------------------
      // 2. POST /api/login - 用户登录
      // ------------------------------------------
      if (path === "/api/login" && method === "POST") {
        const { email, password } = await request.json();

        if (!email || !password) {
          return jsonResponse({ success: false, message: "邮箱和密码不能为空" }, 400);
        }

        // 查询用户
        const user = await env.DB.prepare("SELECT id, password, role FROM users WHERE email = ?")
          .bind(email)
          .first();

        if (!user) {
          return jsonResponse({ success: false, message: "账户不存在或密码错误" }, 401);
        }

        // 提取盐值并校验哈希密码
        const [salt, storedHash] = user.password.split("$");
        const inputHash = await hashPassword(password, salt);

        if (inputHash !== storedHash) {
          return jsonResponse({ success: false, message: "账户不存在或密码错误" }, 401);
        }

        // 生成 JWT Token（有效期为 7 天）
        const payload = {
          userId: user.id,
          email: email,
          role: user.role,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 当前时间加 7 天的秒数
        };

        const token = await signJWT(payload, env.JWT_SECRET);

        return jsonResponse({
          success: true,
          token: token,
          user: {
            email: email,
            role: user.role
          }
        }, 200);
      }

      // ------------------------------------------
      // 3. GET /api/me - 获取当前登录用户信息
      // ------------------------------------------
      if (path === "/api/me" && method === "GET") {
        const decoded = await authorizeUser(request, env.JWT_SECRET);
        if (!decoded) {
          return jsonResponse({ error: "未授权，登录已失效" }, 401);
        }

        // 关联查询用户信息及其对应的调用额度与下载等级
        const userData = await env.DB.prepare(
          `SELECT u.id, u.email, u.role, q.download_level, q.ai_calls_today 
           FROM users u 
           LEFT JOIN user_quota q ON u.id = q.user_id 
           WHERE u.id = ?`
        )
        .bind(decoded.userId)
        .first();

        if (!userData) {
          return jsonResponse({ error: "用户不存在" }, 404);
        }

        return jsonResponse(userData, 200);
      }

      // ------------------------------------------
      // 4. POST /api/tool-history - 保存规划工具计算历史记录
      // ------------------------------------------
      if (path === "/api/tool-history" && method === "POST") {
        const decoded = await authorizeUser(request, env.JWT_SECRET);
        if (!decoded) {
          return jsonResponse({ error: "未授权，登录已失效" }, 401);
        }

        const { tool_name, input_data, result } = await request.json();

        if (!tool_name || !input_data || !result) {
          return jsonResponse({ success: false, message: "必填参数缺失" }, 400);
        }

        const historyId = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        // 插入计算历史数据
        await env.DB.prepare(
          "INSERT INTO tool_history (id, user_id, tool_name, input_data, result, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(historyId, decoded.userId, tool_name, JSON.stringify(input_data), JSON.stringify(result), createdAt)
        .run();

        return jsonResponse({ success: true }, 201);
      }

      // ------------------------------------------
      // 5. GET /api/tool-history - 获取最近20条计算历史记录
      // ------------------------------------------
      if (path === "/api/tool-history" && method === "GET") {
        const decoded = await authorizeUser(request, env.JWT_SECRET);
        if (!decoded) {
          return jsonResponse({ error: "未授权，登录已失效" }, 401);
        }

        const { results } = await env.DB.prepare(
          "SELECT id, tool_name, input_data, result, created_at FROM tool_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
        )
        .bind(decoded.userId)
        .all();

        // 恢复 input_data 与 result 的 JSON 格式后返回
        const parsedHistory = results.map(row => {
          try {
            return {
              ...row,
              input_data: JSON.parse(row.input_data),
              result: JSON.parse(row.result)
            };
          } catch (e) {
            return row;
          }
        });

        return jsonResponse({ history: parsedHistory }, 200);
      }

      // 未命中任何路由，返回 404 错误
      return jsonResponse({ error: "未找到请求的接口路径" }, 404);

    } catch (err) {
      // 全局服务器内部捕获异常处理
      return jsonResponse({ error: "服务器内部故障", details: err.message }, 500);
    }
  }
};