// 保存路径: worker.js

/**
 * 城市规划研究平台后端 API 核心服务 (planning-platform-api)
 * 技术栈: Cloudflare Workers + D1 Database + Web Crypto API + Cloudflare KV
 */

// ==========================================
// 1. 通用工具函数与 CORS 处理
// ==========================================

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PATCH,PUT',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Max-Age': '86400'
}

/**
 * 统一构建带 CORS 头信息的 JSON 响应
 */
const jsonResponse = (data, status = 200) =>
  withCors(
    new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  )

/**
 * 统一构建带 CORS 头信息的纯文本响应
 */
const textResponse = (text, status = 200) =>
  withCors(
    new Response(text, {
      status,
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      }
    })
  )

/**
 * 统一构建带标准文件名附件头信息的 CSV 响应
 */
const csvResponse = (csvText, filename) => {
  return withCors(
    new Response(csvText, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=UTF-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  )
}

/**
 * 拦截处理浏览器的 OPTIONS 预检请求并返回 204
 */
const optionsResponse = () =>
  new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  })

/**
 * 响应体动态混入 CORS 首部
 */
const withCors = (response) => {
  const headers = new Headers(response.headers)
  Object.entries(CORS_HEADERS).forEach(([key, value]) => headers.set(key, value))
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}

// ==========================================
// 2. 原生加密与安全工具 (Web Crypto API)
// ==========================================

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()
const JWT_EXPIRE_SECONDS = 7 * 24 * 60 * 60 // JWT 过期时间（7天）

/**
 * 邮箱格式验证
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 规范 Base64URL 编码
 */
const base64UrlEncode = (input) => {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(input)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * 规范 Base64URL 解码
 */
const base64UrlDecode = (input) => {
  const padded = input.padEnd(input.length + ((4 - (input.length % 4)) % 4), '=')
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * 从环境变量动态读取加密密码
 */
const getJwtSecret = (env) => textEncoder.encode(env.JWT_SECRET || 'default_jwt_secret')

/**
 * 原生加密签发 JWT Token
 */
const jwtSign = async (payload, env) => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const base = [
    base64UrlEncode(textEncoder.encode(JSON.stringify(header))),
    base64UrlEncode(textEncoder.encode(JSON.stringify(payload)))
  ].join('.')
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    getJwtSecret(env),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, textEncoder.encode(base))
  return `${base}.${base64UrlEncode(signature)}`
}

/**
 * 高安全级别：动态加盐密码哈希（加入用户专属 Email 混合干扰，防止全网彩虹表）
 */
const hashPassword = async (password, email, env) => {
  const salt = `${email}_urbancopilot`
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    getJwtSecret(env),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, textEncoder.encode(password + salt))
  return base64UrlEncode(signature)
}

/**
 * 原生验证并解密 JWT Token
 */
const jwtVerify = async (token, env) => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerB64, payloadB64, signatureB64] = parts
    const base = `${headerB64}.${payloadB64}`
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      getJwtSecret(env),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      base64UrlDecode(signatureB64),
      textEncoder.encode(base)
    )
    if (!isValid) {
      console.log('JWT 校验未通过：签名不符')
      return null
    }
    const payload = JSON.parse(textDecoder.decode(base64UrlDecode(payloadB64)))
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      console.log('JWT 校验未通过：Token 已过期')
      return null
    }
    return payload
  } catch (e) {
    console.log('JWT 解析期间发生异常：', e.message)
    return null
  }
}

/**
 * 解析请求头中的 Authorization 凭证
 */
const getAuthToken = (request) => {
  const auth = request.headers.get('Authorization') || ''
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  return parts[1]
}

/**
 * 安全获取 D1 数据库绑定对象
 */
const getDb = (env) => env.DB || env.D1

/**
 * SQL 查询单条数据辅助函数
 */
const queryOne = async (db, sql, binds = []) => {
  return db.prepare(sql).bind(...binds).first()
}

/**
 * SQL 查询多条数据辅助函数
 */
const queryAll = async (db, sql, binds = []) => {
  const result = await db.prepare(sql).bind(...binds).all()
  return result.results || []
}

/**
 * 为登录用户封装并签署 JWT Token
 */
const createJwtForUser = async (user, env) => {
  const payload = {
    user_id: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + JWT_EXPIRE_SECONDS
  }
  return jwtSign(payload, env)
}

/**
 * 校验并拦截获取当前用户鉴权信息
 */
const getCurrentUser = async (request, env) => {
  try {
    const token = getAuthToken(request)
    if (!token) {
      console.log('Authorization 请求头中未包含 Bearer Token')
      return null
    }
    return await jwtVerify(token, env)
  } catch (e) {
    console.log('getCurrentUser 内部异常:', e.message)
    return null
  }
}

/**
 * 安全拦截校验管理员权限
 */
const authorizeAdmin = async (request, env) => {
  const user = await getCurrentUser(request, env)
  if (!user || user.role !== 'admin') {
    return null
  }
  return user
}

/**
 * 通用管理员操作日志记录辅助函数
 */
const logAdminAction = async (env, admin, action, targetType, targetId, details) => {
  try {
    const db = getDb(env)
    const id = crypto.randomUUID()
    const adminId = admin.user_id || admin.userId
    const adminEmail = admin.email || ''

    let detailsStr = '{}'
    if (details !== undefined && details !== null) {
      detailsStr = typeof details === 'string' ? details : JSON.stringify(details)
    }

    await db.prepare(
      `INSERT INTO admin_logs (id, admin_id, admin_email, action, target_type, target_id, details, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .bind(id, adminId, adminEmail, action, targetType, targetId, detailsStr)
    .run()
  } catch (e) {
    console.log('写入管理员操作审计日志发生异常：', e.message)
  }
}

/**
 * CSV 导出专用安全转义
 */
function escapeCsvField(val) {
  if (val === null || val === undefined) return ''
  let str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

// ==========================================
// 系统全局参数获取辅助函数
// ==========================================
const getSetting = async (db, key) => {
  try {
    const row = await queryOne(db, "SELECT value FROM settings WHERE key = ?", [key])
    return row ? row.value : null
  } catch (e) {
    console.log('读取系统核心配置项异常:', e.message)
    return null
  }
}

// ==========================================
// 3. 核心 API 路由及业务逻辑
// ==========================================

/**
 * 1. POST /api/register - 用户注册控制（已串接系统注册开放度校验）
 */
const handleRegister = async (request, env) => {
  const db = getDb(env)
  
  const regEnabled = await getSetting(db, 'registration_enabled')
  if (regEnabled === 'false') {
    return jsonResponse({ error: '当前暂未开放注册，请稍后再试' }, 403)
  }

  if (env.KV) {
    const ip = request.headers.get('CF-Connecting-IP')
    if (ip) {
      const key = `reg_limit_${ip}`
      const count = parseInt(await env.KV.get(key) || '0')
      if (count >= 5) {
        return jsonResponse(
          { error: '注册太频繁，请 1 小时后再试。' }, 429
        )
      }
      await env.KV.put(key, String(count + 1), { expirationTtl: 3600 })
    }
  }

  const body = await request.json().catch(() => null)
  const email = body?.email?.trim()
  const password = body?.password
  const register_type = body?.register_type 
  
  if (!email || !password || !register_type) {
    return jsonResponse({ error: '邮箱、密码和注册类型不能为空' }, 400)
  }
  if (!isValidEmail(email)) {
    return jsonResponse({ error: '邮箱格式不正确' }, 400)
  }
  if (password.length < 8) {
    return jsonResponse({ error: '密码长度必须至少为 8 位' }, 400)
  }

  const existing = await queryOne(db, 'SELECT id FROM users WHERE email = ?', [email])
  if (existing) {
    return jsonResponse({ error: '用户已存在' }, 400)
  }

  const userId = crypto.randomUUID()
  const passwordHash = await hashPassword(password, email, env)
  const createdAt = new Date().toISOString()

  // 分流 A: 邀请码验证通道
  if (register_type === 'invite') {
    const invite_code = body?.invite_code?.trim()?.toUpperCase()
    if (!invite_code) {
      return jsonResponse({ error: '邀请码不能为空' }, 400)
    }

    const invite = await queryOne(
      db,
      `SELECT id, code, used_count, max_uses FROM invite_codes 
       WHERE code = ? 
       AND used_count < max_uses
       AND (expires_at IS NULL OR expires_at > datetime('now'))`,
      [invite_code]
    )

    if (!invite) {
      return jsonResponse({ error: '邀请码无效或已达到使用上限/已过期' }, 400)
    }

    await db.prepare('UPDATE invite_codes SET used_count = used_count + 1 WHERE id = ?')
      .bind(invite.id)
      .run()

    await db.prepare('INSERT INTO users (id, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(userId, email, passwordHash, 'user', 'active', createdAt)
      .run()

    await db.prepare('INSERT INTO user_quota (user_id, ai_calls_today, ai_reset_date, download_level) VALUES (?, 0, ?, 1)')
      .bind(userId, createdAt.split('T')[0])
      .run()

    console.log('用户通过邀请码核销注册成功：', userId)
    return jsonResponse({ success: true, message: '注册成功，请直接登录' }, 201)

  // 分流 B: 人工审核提交通道
  } else if (register_type === 'apply') {
    const apply_name = body?.apply_name?.trim()
    const apply_org = body?.apply_org?.trim()
    const apply_reason = body?.apply_reason?.trim() || ''

    if (!apply_name || !apply_org) {
      return jsonResponse({ error: '真实姓名和所在单位为必填项' }, 400)
    }

    await db.prepare(
      `INSERT INTO users (id, email, password, role, status, apply_name, apply_org, apply_reason, created_at) 
       VALUES (?, ?, ?, 'user', 'pending', ?, ?, ?, ?)`
    )
    .bind(userId, email, passwordHash, apply_name, apply_org, apply_reason, createdAt)
    .run()

    console.log('用户提交人工注册申请成功，等待审核：', userId)
    return jsonResponse({ success: true, message: '申请提交成功，请等待管理员审核。' }, 201)

  } else {
    return jsonResponse({ error: '无效的注册方式' }, 400)
  }
}

/**
 * 2. POST /api/login - 登录并检查账号状态
 */
const handleLogin = async (request, env) => {
  const body = await request.json().catch(() => null)
  const email = body?.email?.trim()
  const password = body?.password
  if (!email || !password) {
    return jsonResponse({ error: '邮箱和密码不能为空' }, 400)
  }
  const db = getDb(env)
  const user = await queryOne(
    db,
    'SELECT id, email, password, role, status FROM users WHERE email = ?',
    [email]
  )
  if (!user) return jsonResponse({ error: '邮箱或密码错误' }, 401)
  
  const passwordHash = await hashPassword(password, email, env)
  if (passwordHash !== user.password) return jsonResponse({ error: '邮箱或密码错误' }, 401)
  
  const userStatus = user.status || 'active'
  if (userStatus === 'pending') {
    return jsonResponse({ error: '您的账号正在审核中，请耐心等待管理员通过' }, 403)
  }
  if (userStatus === 'rejected') {
    return jsonResponse({ error: '您的申请已被管理员拒绝，如有疑问请联系系统主管' }, 403)
  }
  
  const token = await createJwtForUser(user, env)
  console.log('用户登录验证通过：', email)
  return jsonResponse({ token, user: { id: user.id, email: user.email, role: user.role } })
}

/**
 * 3. GET /api/me - 获取个人详情
 */
const handleGetMe = async (request, env) => {
  const user = await getCurrentUser(request, env)
  if (!user) return jsonResponse({ error: '需要登录' }, 401)
  return jsonResponse({ user })
}

/**
 * 4. GET /api/tool-history - 计算历史
 */
const handleGetToolHistory = async (request, env) => {
  const user = await getCurrentUser(request, env)
  if (!user) return jsonResponse({ error: '需要登录' }, 401)
  const db = getDb(env)
  
  const userId = user.user_id || user.userId
  const historyResult = await queryAll(
    db,
    'SELECT id, tool_name, input_data, result, created_at FROM tool_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
    [userId]
  )
  return jsonResponse({ history: historyResult })
}

/**
 * 5. POST /api/tool-history - 保存历史记录
 */
const handlePostToolHistory = async (request, env) => {
  const user = await getCurrentUser(request, env)
  if (!user) return jsonResponse({ error: '需要登录' }, 401)
  
  const body = await request.json().catch(() => null)
  const toolName = body?.tool_name
  const inputData = body?.input_data
  const result = body?.result
  
  if (!toolName || typeof inputData === 'undefined' || typeof result === 'undefined') {
    return jsonResponse({ error: '参数不完整' }, 400)
  }
  
  const db = getDb(env)
  const createdAt = new Date().toISOString()
  const historyId = crypto.randomUUID()
  const userId = user.user_id || user.userId

  const serializedInput = typeof inputData === 'string' ? inputData : JSON.stringify(inputData)
  const serializedResult = typeof result === 'string' ? result : JSON.stringify(result)

  await db.prepare('INSERT INTO tool_history (id, tool_name, input_data, result, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(historyId, toolName, serializedInput, serializedResult, userId, createdAt)
    .run()

  return jsonResponse({ success: true })
}

/**
 * 查询用户下载等级（已加入物理时效自动逆向降级处理）
 */
const fetchUserQuotaLevel = async (db, userId) => {
  try {
    const quota = await queryOne(
      db, 
      'SELECT download_level, membership_expires_at FROM user_quota WHERE user_id = ?', 
      [userId]
    )
    if (!quota) return 0
    
    if (quota.membership_expires_at) {
      const expireDate = new Date(quota.membership_expires_at)
      if (expireDate < new Date()) {
        await db.prepare('UPDATE user_quota SET download_level = 1, membership_expires_at = NULL WHERE user_id = ?')
          .bind(userId)
          .run()
        return 1
      }
    }
    return quota?.download_level ?? 0
  } catch (e) {
    console.log('fetchUserQuotaLevel 异常:', e.message)
    return 0
  }
}

/**
 * 6. GET /api/tools - 工具库
 */
const handleGetTools = async (request, env) => {
  const url = new URL(request.url)
  const category = url.searchParams.get('category')?.trim()
  const db = getDb(env)
  let result
  if (category) {
    result = await queryAll(
      db,
      'SELECT id, name, description, category, tool_type, url, icon, status, min_level, sort_order, created_at FROM tools WHERE status = ? AND category = ? ORDER BY sort_order ASC',
      ['active', category]
    )
  } else {
    result = await queryAll(
      db,
      'SELECT id, name, description, category, tool_type, url, icon, status, min_level, sort_order, created_at FROM tools WHERE status = ? ORDER BY sort_order ASC',
      ['active']
    )
  }
  return jsonResponse({ tools: result })
}

/**
 * 7. GET /api/tools/:id/access - 权限验证及存根
 */
const handleGetToolAccess = async (request, env, toolId) => {
  console.log('>>> [拦截检测] 开始执行 handleGetToolAccess')
  try {
    const db = getDb(env)
    const user = await getCurrentUser(request, env)
    if (!user) {
      return jsonResponse({ error: '请先登录后使用此工具' }, 401)
    }

    const userId = user.user_id || user.userId
    const tool = await queryOne(
      db,
      'SELECT id, name, description, category, tool_type, url, icon, status, min_level FROM tools WHERE id = ?',
      [toolId]
    )
    if (!tool) {
      return jsonResponse({ error: '规划工具不存在' }, 404)
    }

    const quotaLevel = await fetchUserQuotaLevel(db, userId)
    const allowed = user.role === 'admin' || quotaLevel >= Number(tool.min_level ?? 0)

    if (!allowed) {
      return jsonResponse({ error: '权限不足，请联系系统管理员' }, 403)
    }

    const historyId = crypto.randomUUID()
    await db.prepare(
      `INSERT INTO tool_history (id, tool_name, input_data, result, user_id, created_at) 
       VALUES (?, ?, 'access', 'ok', ?, datetime('now'))`
    )
    .bind(historyId, tool.name, userId)
    .run()

    return jsonResponse({ 
      success: true, 
      url: tool.url, 
      tool_type: tool.tool_type, 
      name: tool.name 
    })

  } catch (e) {
    return jsonResponse({ error: '服务器内部错误', details: e.message }, 500)
  }
}

/**
 * 8. GET /api/stats - 数据大屏公开指标
 */
const handleGetStats = async (request, env) => {
  const db = getDb(env)
  const toolCountRow = await queryOne(db, "SELECT COUNT(*) AS count FROM tools WHERE status = 'active'")
  const userCountRow = await queryOne(db, "SELECT COUNT(*) AS count FROM users")
  return jsonResponse({ tool_count: toolCountRow?.count ?? 0, user_count: userCountRow?.count ?? 0 })
}

// ==========================================
// 通用辅助函数：用户权限获取与资源控制安全拦截
// ==========================================

/**
 * 辅助函数 A: 获取当前用户和计算对应下载等级，无 Token 不报错
 */
const getUserAccessLevel = async (db, request, env) => {
  const user = await getCurrentUser(request, env)
  if (!user) {
    return { level: 0, userId: null, isAdmin: false }
  }
  const userId = user.user_id || user.userId
  const level = await fetchUserQuotaLevel(db, userId)
  return { level, userId, isAdmin: user.role === 'admin' }
}

/**
 * 辅助函数 B: 核心资源交叉权限检测（支持 view / download）
 * 
 * 🆕 修改说明：支持 parent_id 向上归集穿透鉴权判定 [1]
 */
const checkResourceAccess = async (db, request, env, resource, accessType) => {
  const { level, userId, isAdmin } = await getUserAccessLevel(db, request, env)

  // 1. 🆕 解读文章关联逻辑检测：若当前检测资源指定了父政策，则等级/价格/购买记录全部改用它所属的政策原文的数据
  if (resource.parent_id) {
    const parent = await queryOne(db, "SELECT * FROM resources WHERE id = ?", [resource.parent_id])
    if (parent) {
      resource = parent
    }
  }

  // 2. 管理员直接放行
  if (isAdmin) {
    return { allowed: true }
  }

  // 3. 付费会员（会员等级 >= 2 自动放行）
  if (level >= 2) {
    return { allowed: true }
  }

  // 4. 基础角色判定 (未登录/登录未充值)
  const minLevel = Number(resource.min_level ?? 0)
  if (accessType === 'view') {
    if (level >= minLevel) {
      return { allowed: true }
    }
  } else if (accessType === 'download') {
    const downloadPrice = Number(resource.download_price ?? 0)
    if (level >= minLevel && downloadPrice === 0) {
      return { allowed: true }
    }
  }

  // 5. 以上条件不满足，检查 purchases 订单购买存根
  if (userId) {
    let purchase = null
    if (accessType === 'view') {
      purchase = await queryOne(
        db,
        "SELECT id FROM purchases WHERE user_id = ? AND resource_id = ? AND (access_type = 'view' OR access_type = 'download')",
        [userId, resource.id]
      )
    } else if (accessType === 'download') {
      purchase = await queryOne(
        db,
        "SELECT id FROM purchases WHERE user_id = ? AND resource_id = ? AND access_type = 'download'",
        [userId, resource.id]
      )
    }
    if (purchase) {
      return { allowed: true }
    }
  }

  return { allowed: false }
}

// ==========================================
// 【管理端接口】：申请审批及邀请码控制与操作审计
// ==========================================

/**
 * GET /api/admin/applications - 获取人工注册申请列表
 */
const handleGetApplications = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const url = new URL(request.url)
  const status = url.searchParams.get('status')?.trim()
  const db = getDb(env)

  let sql = `SELECT id, email, apply_name, apply_org, apply_reason, status, created_at 
             FROM users WHERE apply_name IS NOT NULL`
  const binds = []
  if (status) {
    sql += ' AND status = ?'
    binds.push(status)
  }
  sql += ' ORDER BY created_at DESC'

  try {
    const result = await queryAll(db, sql, binds)
    return jsonResponse({ applications: result, total: result.length })
  } catch (e) {
    return jsonResponse({ error: '获取申请列表失败', details: e.message }, 500)
  }
}

/**
 * PATCH /api/admin/applications/:id/approve - 一键通过注册审核并授信
 */
const handleApproveApplication = async (request, env, id) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const db = getDb(env)
  try {
    await db.prepare("UPDATE users SET status = 'active' WHERE id = ?").bind(id).run()

    await db.prepare(
      `INSERT OR IGNORE INTO user_quota (user_id, ai_calls_today, ai_reset_date, download_level)
       VALUES (?, 0, date('now'), 1)`
    ).bind(id).run()

    await logAdminAction(env, admin, 'approve_application', 'user', id, null)
    return jsonResponse({ success: true })
  } catch (e) {
    return jsonResponse({ error: '审批操作失败', details: e.message }, 500)
  }
}

/**
 * PATCH /api/admin/applications/:id/reject - 拒绝注册审核
 */
const handleRejectApplication = async (request, env, id) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const body = await request.json().catch(() => null)
  const reason = body?.reason || ''

  const db = getDb(env)
  try {
    await db.prepare("UPDATE users SET status = 'rejected', apply_reason = apply_reason || ' | 驳回原因: ' || ? WHERE id = ?")
      .bind(reason, id)
      .run()

    await logAdminAction(env, admin, 'reject_application', 'user', id, JSON.stringify({ reason }))
    return jsonResponse({ success: true })
  } catch (e) {
    return jsonResponse({ error: '驳回操作失败', details: e.message }, 500)
  }
}

/**
 * GET /api/admin/invite-codes - 获取所有邀请码列表
 */
const handleGetInviteCodes = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const db = getDb(env)
  try {
    const inviteCodesList = await queryAll(db, "SELECT id, code, created_by, max_uses, used_count, expires_at, note, created_at FROM invite_codes ORDER BY created_at DESC")
    return jsonResponse({ invite_codes: inviteCodesList })
  } catch (e) {
    return jsonResponse({ error: '获取邀请码失败', details: e.message }, 500)
  }
}

/**
 * 🆕 GET /api/invite-codes/public - 公开查询有效邀请码（免登录控制）
 */
const handleGetPublicInviteCodes = async (request, env) => {
  try {
    const db = getDb(env)
    const sql = `SELECT code, used_count, max_uses FROM invite_codes 
                 WHERE (expires_at IS NULL OR expires_at > datetime('now')) 
                 ORDER BY created_at DESC LIMIT 50`
    const rows = await queryAll(db, sql)
    
    const codes = rows.map(row => ({
      code: row.code,
      used_count: row.used_count,
      max_uses: row.max_uses,
      status: row.used_count >= row.max_uses ? 'exhausted' : 'available'
    }))
    
    return jsonResponse({ codes })
  } catch (e) {
    return jsonResponse({ error: '查询有效邀请码队列失败', details: e.message }, 500)
  }
}

/**
 * POST /api/admin/invite-codes - 动态生成 8 位专属邀请码
 */
const handleCreateInviteCode = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const body = await request.json().catch(() => null)
  const max_uses = Number(body?.max_uses ?? 1)
  const expires_days = body?.expires_days ? Number(body.expires_days) : null
  const note = body?.note || ''

  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const part = () => Array.from(
      { length: 4 },
      () => chars[Math.floor(crypto.getRandomValues(new Uint8Array(1))[0] / 256 * chars.length)]
    ).join('')
    return `${part()}-${part()}`
  }

  const code = generateCode()
  const db = getDb(env)
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  
  let expiresAt = null
  if (expires_days) {
    const expDate = new Date()
    expDate.setDate(expDate.getDate() + expires_days)
    expiresAt = expDate.toISOString()
  }

  try {
    await db.prepare(
      `INSERT INTO invite_codes (id, code, created_by, max_uses, used_count, expires_at, note, created_at) 
       VALUES (?, ?, ?, ?, 0, ?, ?, ?)`
    )
    .bind(id, code, admin.user_id || admin.userId, max_uses, expiresAt, note, createdAt)
    .run()

    await logAdminAction(env, admin, 'create_invite_code', 'invite_code', id, JSON.stringify({ code, max_uses, expires_days }))
    return jsonResponse({ success: true, code })
  } catch (e) {
    return jsonResponse({ error: '密钥生成故障', details: e.message }, 500)
  }
}

/**
 * DELETE /api/admin/invite-codes/:id - 物理吊销邀请码
 */
const handleDeleteInviteCode = async (request, env, id) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const db = getDb(env)
  try {
    await db.prepare("DELETE FROM invite_codes WHERE id = ?").bind(id).run()
    await logAdminAction(env, admin, 'delete_invite_code', 'invite_code', id, null)
    return jsonResponse({ success: true })
  } catch (e) {
    return jsonResponse({ error: '注销邀请码失败', details: e.message }, 500)
  }
}

/**
 * GET /api/admin/logs - 分页获取系统日志行为
 */
const handleGetAdminLogs = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const url = new URL(request.url)
  let page = parseInt(url.searchParams.get('page') || '1')
  if (isNaN(page) || page < 1) page = 1
  const pageSize = 20
  const offset = (page - 1) * pageSize

  const db = getDb(env)
  try {
    const countRow = await queryOne(db, "SELECT COUNT(*) AS count FROM admin_logs")
    const total = countRow?.count || 0

    const logs = await queryAll(
      db,
      "SELECT id, admin_id, admin_email, action, target_type, target_id, details, created_at FROM admin_logs ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [pageSize, offset]
    )

    return jsonResponse({ logs, total, page, pageSize })
  } catch (e) {
    return jsonResponse({ error: '获取系统日志审计队列失败', details: e.message }, 500)
  }
}

/**
 * GET /api/admin/ai-usage - 汇算系统所有账户的 AI 限额及重置日期
 */
const handleGetAiUsage = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const db = getDb(env)
  try {
    const usage = await queryAll(
      db,
      `SELECT u.email, q.ai_calls_today, q.ai_reset_date, q.download_level 
       FROM user_quota q 
       JOIN users u ON q.user_id = u.id
       ORDER BY q.ai_calls_today DESC`
    )
    return jsonResponse({ usage })
  } catch (e) {
    return jsonResponse({ error: 'AI用量配额拉取失败', details: e.message }, 500)
  }
}

/**
 * GET /api/admin/export - 支持系统核心表物理打包导出为 CSV 文件
 */
const handleExportData = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const url = new URL(request.url)
  const table = url.searchParams.get('table')?.trim()

  const EXPORT_CONFIG = {
    users: { 
      sql: 'SELECT id, email, role, status, apply_name, apply_org, created_at FROM users',
      filename: 'users.csv' 
    },
    tools: { 
      sql: 'SELECT id, name, category, tool_type, url, status, min_level, sort_order, created_at FROM tools',
      filename: 'tools.csv' 
    },
    tool_history: { 
      sql: 'SELECT id, user_id, tool_name, created_at FROM tool_history ORDER BY created_at DESC LIMIT 1000',
      filename: 'tool_history.csv' 
    },
    invite_codes: { 
      sql: 'SELECT id, code, created_by, max_uses, used_count, expires_at, note, created_at FROM invite_codes',
      filename: 'invite_codes.csv' 
    }
  }

  if (!table || !EXPORT_CONFIG[table]) {
    return jsonResponse({ error: '不支持导出该表，已处于白名单拦截安全边界外' }, 400)
  }

  const db = getDb(env)
  try {
    const config = EXPORT_CONFIG[table]
    const rows = await queryAll(db, config.sql)

    let csvText = '\uFEFF' 
    if (rows.length > 0) {
      const headers = Object.keys(rows[0])
      csvText += headers.map(h => escapeCsvField(h)).join(',') + '\r\n'

      for (const row of rows) {
        const line = headers.map(header => escapeCsvField(row[header])).join(',')
        csvText += line + '\r\n'
      }
    }

    await logAdminAction(env, admin, 'export_data', 'table', table, null)
    return csvResponse(csvText, config.filename)
  } catch (e) {
    return jsonResponse({ error: 'CSV打包汇算失败', details: e.message }, 500)
  }
}

/**
 * GET /api/admin/dashboard-stats - 仪表盘大盘数据指标聚合口（已 R2 用量实时统计）
 */
const handleGetDashboardStats = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const db = getDb(env)
  try {
    const [
      totalUsersRow,
      todayRegistrationsRow,
      pendingApprovalsRow,
      totalToolCallsRow,
      activeInviteCodesRow,
      storageRow
    ] = await Promise.all([
      queryOne(db, "SELECT COUNT(*) AS count FROM users"),
      queryOne(db, "SELECT COUNT(*) AS count FROM users WHERE date(created_at) = date('now')"),
      queryOne(db, "SELECT COUNT(*) AS count FROM users WHERE status = 'pending'"),
      queryOne(db, "SELECT COUNT(*) AS count FROM tool_history"),
      queryOne(db, `SELECT COUNT(*) AS count FROM invite_codes 
                    WHERE used_count < max_uses 
                    AND (expires_at IS NULL OR expires_at > datetime('now'))`),
      queryOne(db, "SELECT SUM(file_size) AS total FROM resources")
    ])

    return jsonResponse({
      totalUsers: totalUsersRow?.count || 0,
      todayRegistrations: todayRegistrationsRow?.count || 0,
      pendingApprovals: pendingApprovalsRow?.count || 0,
      totalToolCalls: totalToolCallsRow?.count || 0,
      activeInviteCodes: activeInviteCodesRow?.count || 0,
      totalStorageBytes: storageRow?.total || 0
    })
  } catch (e) {
    return jsonResponse({ error: '获取后台聚合统计失败', details: e.message }, 500)
  }
}

/**
 * GET /api/admin/tools - 管理员视角的完整工具目录列表（含已下架 inactive 状态）
 */
const handleAdminGetTools = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const db = getDb(env)
  try {
    const tools = await queryAll(
      db, 
      "SELECT id, name, description, category, tool_type, url, icon, status, min_level, sort_order, created_at FROM tools ORDER BY sort_order ASC"
    )
    return jsonResponse({ tools })
  } catch (e) {
    return jsonResponse({ error: '管理员工具列表调阅失败', details: e.message }, 500)
  }
}

/**
 * POST /api/admin/tools - 录入新建规划工具卡片
 */
const handleAdminCreateTool = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const body = await request.json().catch(() => null)
  const name = body?.name?.trim()
  const description = body?.description?.trim() || ''
  const category = body?.category?.trim() || '通用规划'
  const tool_type = body?.tool_type?.trim()
  const url = body?.url?.trim()
  const icon = body?.icon?.trim() || '🔧'
  const min_level = parseInt(body?.min_level ?? '0')
  const sort_order = parseInt(body?.sort_order ?? '0')

  if (!name || !tool_type || !url) {
    return jsonResponse({ error: '工具名称、运行类型、URL 地址均为必填项' }, 400)
  }

  const VALID_TYPES = ['iframe', 'iframe_external', 'new_window']
  if (!VALID_TYPES.includes(tool_type)) {
    return jsonResponse({ error: '运行类型不合法，仅限选择内嵌、外部内嵌或新标签页' }, 400)
  }

  const db = getDb(env)
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  try {
    await db.prepare(
      `INSERT INTO tools (id, name, description, category, tool_type, url, icon, status, min_level, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`
    )
    .bind(id, name, description, category, tool_type, url, icon, min_level, sort_order, createdAt)
    .run()

    await logAdminAction(env, admin, 'create_tool', 'tool', id, JSON.stringify({ name, tool_type, category }))
    return jsonResponse({ success: true, id })
  } catch (e) {
    return jsonResponse({ error: 'D1 写入工具卡片失败', details: e.message }, 500)
  }
}

/**
 * PUT /api/admin/tools/:id - 编辑工具
 */
const handleAdminUpdateTool = async (request, env, id) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const body = await request.json().catch(() => null)
  if (!body) return jsonResponse({ error: '未接收到任何修改参数载荷' }, 400)

  const db = getDb(env)
  try {
    const existing = await queryOne(db, "SELECT * FROM tools WHERE id = ?", [id])
    if (!existing) {
      return jsonResponse({ error: '找不到待修改的工具卡片' }, 404)
    }

    const name = body.name !== undefined ? String(body.name).trim() : existing.name
    const description = body.description !== undefined ? String(body.description).trim() : existing.description
    const category = body.category !== undefined ? String(body.category).trim() : existing.category
    const tool_type = body.tool_type !== undefined ? String(body.tool_type).trim() : existing.tool_type
    const url = body.url !== undefined ? String(body.url).trim() : existing.url
    const icon = body.icon !== undefined ? String(body.icon).trim() : existing.icon
    const status = body.status !== undefined ? String(body.status).trim() : existing.status
    const min_level = body.min_level !== undefined ? parseInt(body.min_level) : existing.min_level
    const sort_order = body.sort_order !== undefined ? parseInt(body.sort_order) : existing.sort_order

    if (body.tool_type !== undefined && !['iframe', 'iframe_external', 'new_window'].includes(tool_type)) {
      return jsonResponse({ error: '运行类型不合法' }, 400)
    }

    await db.prepare(
      `UPDATE tools 
       SET name = ?, description = ?, category = ?, tool_type = ?, url = ?, icon = ?, status = ?, min_level = ?, sort_order = ? 
       WHERE id = ?`
    )
    .bind(name, description, category, tool_type, url, icon, status, min_level, sort_order, id)
    .run()

    const modifiedPayload = {}
    for (const key of ['name', 'description', 'category', 'tool_type', 'url', 'icon', 'status', 'min_level', 'sort_order']) {
      if (body[key] !== undefined) {
        modifiedPayload[key] = body[key]
      }
    }

    await logAdminAction(env, admin, 'update_tool', 'tool', id, JSON.stringify(modifiedPayload))
    return jsonResponse({ success: true })
  } catch (e) {
    return jsonResponse({ error: '工具修改操作失败', details: e.message }, 500)
  }
}

/**
 * DELETE /api/admin/tools/:id - 物理删除特定规划工具卡片
 */
const handleAdminDeleteTool = async (request, env, id) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const db = getDb(env)
  try {
    const existing = await queryOne(db, "SELECT name FROM tools WHERE id = ?", [id])
    const toolName = existing?.name || ''

    await db.prepare("DELETE FROM tools WHERE id = ?").bind(id).run()
    await logAdminAction(env, admin, 'delete_tool', 'tool', id, JSON.stringify({ name: toolName }))
    return jsonResponse({ success: true })
  } catch (e) {
    return jsonResponse({ error: 'D1 移除工具卡片失败', details: e.message }, 500)
  }
}

/**
 * GET /api/admin/users - 获取带会员信息的用户大列表
 */
const handleAdminGetUsers = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const db = getDb(env)
  try {
    await db.prepare(
      `UPDATE user_quota 
       SET download_level = 1, membership_expires_at = NULL 
       WHERE membership_expires_at IS NOT NULL 
       AND datetime(membership_expires_at) < datetime('now')`
    ).run()

    const url = new URL(request.url)
    const statusParam = url.searchParams.get('status')?.trim()

    let usersQuery = `
      SELECT u.id, u.email, u.role, u.status, u.apply_name, u.apply_org, u.created_at, 
             q.download_level, q.membership_expires_at, q.membership_note 
      FROM users u 
      LEFT JOIN user_quota q ON u.id = q.user_id
    `
    const binds = []
    if (statusParam) {
      usersQuery += ' WHERE u.status = ?'
      binds.push(statusParam)
    }

    usersQuery += ' ORDER BY u.created_at DESC'

    const users = await queryAll(db, usersQuery, binds)
    return jsonResponse({ users })
  } catch (e) {
    return jsonResponse({ error: '获取用户表失败', details: e.message }, 500)
  }
}

/**
 * PUT /api/admin/users/:id - 编辑用户及配套会员权限
 */
const handleAdminUpdateUser = async (request, env, id) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const body = await request.json().catch(() => null)
  if (!body) return jsonResponse({ error: '未接收到可更新参数' }, 400)

  const db = getDb(env)
  try {
    const existingUser = await queryOne(db, "SELECT role, status FROM users WHERE id = ?", [id])
    if (!existingUser) {
      return jsonResponse({ error: '用户不存在' }, 404)
    }

    if (body.role !== undefined || body.status !== undefined) {
      const role = body.role !== undefined ? String(body.role).trim() : existingUser.role
      const status = body.status !== undefined ? String(body.status).trim() : existingUser.status

      if (body.role !== undefined && !['user', 'admin'].includes(role)) {
        return jsonResponse({ error: '非法的角色类型' }, 400)
      }
      if (body.status !== undefined && !['active', 'pending', 'rejected'].includes(status)) {
        return jsonResponse({ error: '非法的注册审核状态' }, 400)
      }

      await db.prepare("UPDATE users SET role = ?, status = ? WHERE id = ?").bind(role, status, id).run()
    }

    if (body.download_level !== undefined || body.membership_expires_at !== undefined || body.membership_note !== undefined) {
      await db.prepare(
        `INSERT OR IGNORE INTO user_quota (user_id, ai_calls_today, ai_reset_date, download_level)
         VALUES (?, 0, date('now'), 1)`
      )
      .bind(id)
      .run()

      const existingQuota = await queryOne(
        db, 
        "SELECT download_level, membership_expires_at, membership_note FROM user_quota WHERE user_id = ?", 
        [id]
      )

      const download_level = body.download_level !== undefined ? parseInt(body.download_level) : existingQuota.download_level
      const membership_expires_at = body.membership_expires_at !== undefined ? body.membership_expires_at : existingQuota.membership_expires_at
      const membership_note = body.membership_note !== undefined ? body.membership_note : existingQuota.membership_note

      await db.prepare(
        `UPDATE user_quota 
         SET download_level = ?, membership_expires_at = ?, membership_note = ? 
         WHERE user_id = ?`
      )
      .bind(download_level, membership_expires_at, membership_note, id)
      .run()
    }

    await logAdminAction(env, admin, 'update_user', 'user', id, JSON.stringify(body))
    return jsonResponse({ success: true })
  } catch (e) {
    return jsonResponse({ error: '用户级联修改失败', details: e.message }, 500)
  }
}

// ==========================================
// 【管理端/公开路由】：通知公告、全局系统配置
// ==========================================

/**
 * 3. GET /api/notices - 公开调取已发布的公告列表（前台免 token 加速访问）
 */
const handleGetPublicNotices = async (request, env) => {
  const db = getDb(env)
  try {
    const notices = await queryAll(
      db,
      "SELECT id, title, content, created_at FROM notices WHERE status = 'published' ORDER BY created_at DESC LIMIT 10"
    )
    return jsonResponse({ notices })
  } catch (e) {
    return jsonResponse({ error: '服务器内部故障', details: e.message }, 500)
  }
}

/**
 * 4. GET /api/admin/notices - 管理员查看全部公告目录
 */
const handleAdminGetNotices = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const db = getDb(env)
  try {
    const notices = await queryAll(
      db,
      "SELECT id, title, content, status, created_by, created_at, updated_at FROM notices ORDER BY created_at DESC"
    )
    return jsonResponse({ notices })
  } catch (e) {
    return jsonResponse({ error: '公告列表拉取失败', details: e.message }, 500)
  }
}

/**
 * 5. POST /api/admin/notices - 新增公告（默认草稿 draft 状态）
 */
const handleAdminCreateNotice = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const body = await request.json().catch(() => null)
  const title = body?.title?.trim()
  const content = body?.content?.trim()

  if (!title || !content) {
    return jsonResponse({ error: '公告标题及正文内容不能为空' }, 400)
  }

  const db = getDb(env)
  const id = crypto.randomUUID()
  const adminId = admin.user_id || admin.userId
  const now = new Date().toISOString()

  try {
    await db.prepare(
      `INSERT INTO notices (id, title, content, status, created_by, created_at, updated_at)
       VALUES (?, ?, ?, 'draft', ?, ?, ?)`
    )
    .bind(id, title, content, adminId, now, now)
    .run()

    await logAdminAction(env, admin, 'create_notice', 'notice', id, JSON.stringify({ title }))
    return jsonResponse({ success: true, id })
  } catch (e) {
    return jsonResponse({ error: '公告创建失败', details: e.message }, 500)
  }
}

/**
 * 6. PUT /api/admin/notices/:id - 编辑修改公告状态/正文
 */
const handleAdminUpdateNotice = async (request, env, id) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const body = await request.json().catch(() => null)
  if (!body) return jsonResponse({ error: '参数载荷不能为空' }, 400)

  const db = getDb(env)
  try {
    const existing = await queryOne(db, "SELECT * FROM notices WHERE id = ?", [id])
    if (!existing) {
      return jsonResponse({ error: '公告不存在' }, 404)
    }

    const title = body.title !== undefined ? String(body.title).trim() : existing.title
    const content = body.content !== undefined ? String(body.content).trim() : existing.content
    const status = body.status !== undefined ? String(body.status).trim() : existing.status

    if (body.status !== undefined && !['draft', 'published'].includes(status)) {
      return jsonResponse({ error: '非法的状态值，仅限 draft 或 published' }, 400)
    }

    const updatedAt = new Date().toISOString()
    await db.prepare(
      `UPDATE notices 
       SET title = ?, content = ?, status = ?, updated_at = ? 
       WHERE id = ?`
    )
    .bind(title, content, status, updatedAt, id)
    .run()

    const logData = {}
    for (const key of ['title', 'content', 'status']) {
      if (body[key] !== undefined) logData[key] = body[key]
    }

    await logAdminAction(env, admin, 'update_notice', 'notice', id, JSON.stringify(logData))
    return jsonResponse({ success: true })
  } catch (e) {
    return jsonResponse({ error: '公告修改失败', details: e.message }, 500)
  }
}

/**
 * 7. DELETE /api/admin/notices/:id - 物理下架删除公告
 */
const handleAdminDeleteNotice = async (request, env, id) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const db = getDb(env)
  try {
    const existing = await queryOne(db, "SELECT title FROM notices WHERE id = ?", [id])
    const noticeTitle = existing?.title || ''

    await db.prepare("DELETE FROM notices WHERE id = ?").bind(id).run()
    await logAdminAction(env, admin, 'delete_notice', 'notice', id, JSON.stringify({ title: noticeTitle }))
    return jsonResponse({ success: true })
  } catch (e) {
    return jsonResponse({ error: '公告删除失败', details: e.message }, 500)
  }
}

/**
 * 8. GET /api/admin/settings - 系统设置获取（转换为对象输出）
 */
const handleAdminGetSettings = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const db = getDb(env)
  try {
    const rows = await queryAll(db, "SELECT key, value FROM settings")
    const settings = {}
    for (const row of rows) {
      settings[row.key] = row.value
    }
    return jsonResponse({ settings })
  } catch (e) {
    return jsonResponse({ error: '参数大盘调取失败', details: e.message }, 500)
  }
}

/**
 * 9. PUT /api/admin/settings - 批量高可靠性 UPSERT 系统全局配置
 */
const handleAdminUpdateSettings = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return jsonResponse({ error: '配置参数载荷有误' }, 400)
  }

  const db = getDb(env)
  try {
    const keys = Object.keys(body)
    for (const key of keys) {
      const val = String(body[key])
      await db.prepare(
        `INSERT INTO settings (key, value, updated_at) 
         VALUES (?, ?, datetime('now')) 
         ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')`
      )
      .bind(key, val, val)
      .run()
    }

    await logAdminAction(env, admin, 'update_settings', 'settings', null, JSON.stringify(body))
    return jsonResponse({ success: true })
  } catch (e) {
    return jsonResponse({ error: '批量覆盖系统全局参数失败', details: e.message }, 500)
  }
}

/**
 * 🆕 10. GET /api/public-settings - 获取公开的部分系统配置（免登录）
 */
const handleGetPublicSettings = async (request, env) => {
  try {
    const db = getDb(env)
    const PUBLIC_SETTING_KEYS = ['site_name', 'payment_contact']
    
    const rows = await queryAll(
      db, 
      "SELECT key, value FROM settings WHERE key IN (?, ?)", 
      PUBLIC_SETTING_KEYS
    )
    
    const settings = {}
    for (const row of rows) {
      settings[row.key] = row.value
    }
    return jsonResponse({ settings })
  } catch (e) {
    return jsonResponse({ error: '获取公开设置失败', details: e.message }, 500)
  }
}

// ==========================================
// 【规划资源路由】：规划资源库列表及鉴权流式转发
// ==========================================

/**
 * 1. GET /api/resources - 公开资源列表获取 (已修改：支持 source_type 安全暴露，隐藏链接)
 * 
 * 🆕 SELECT 字段中已包含 parent_id，用于前台解读文章的关联和自适应归类
 */
const handleGetPublicResources = async (request, env) => {
  try {
    const url = new URL(request.url)
    const module = url.searchParams.get('module')?.trim()
    if (!module || !['policy', 'library', 'knowledge'].includes(module)) {
      return jsonResponse({ error: '缺少有效的module参数' }, 400)
    }

    const db = getDb(env)
    const resources = await queryAll(
      db,
      `SELECT id, module, title, description, category, file_name, file_size, min_level, view_price, download_price, source_type, parent_id, created_at 
       FROM resources 
       WHERE module = ? AND status = 'active' 
       ORDER BY created_at DESC`,
      [module]
    )

    return jsonResponse({ resources })
  } catch (e) {
    return jsonResponse({ error: '获取资源列表失败', details: e.message }, 500)
  }
}

/**
 * 2. GET /api/resources/:id/access - 权限控制 + R2直连或付费中介文件流 (已修改：支持外部链接安全直穿)
 * 
 * 强制约束不论资源的 min_level 等级，调阅预览资源内容的动作本身必须先登录 [1]
 */
const handleGetResourceAccess = async (request, env, resourceId) => {
  try {
    const url = new URL(request.url)
    const typeParam = url.searchParams.get('type')?.trim()
    const accessType = typeParam === 'download' ? 'download' : 'view'

    const db = getDb(env)
    
    // A. 检索资源是否存在 (如果是管理员自己访问，不需要 status === 'active' 也可以直接预览)
    const user = await getCurrentUser(request, env)
    const isAdmin = user && user.role === 'admin'
    
    let resourceQuery = "SELECT * FROM resources WHERE id = ?"
    if (!isAdmin) {
      resourceQuery += " AND status = 'active'"
    }

    const resource = await queryOne(db, resourceQuery, [resourceId])
    if (!resource) {
      return jsonResponse({ error: '资源不存在' }, 404)
    }

    // 强制登录校验：任何资源预览/下载行为必须先校验登录身份
    if (!user) {
      return jsonResponse({ allowed: false, requiresLogin: true, title: resource.title }, 401)
    }

    // B. 进行交叉决策判断 (checkResourceAccess 内部已封装关联解读文章 parent_id 溯源)
    const access = await checkResourceAccess(db, request, env, resource, accessType)

    // C. 无权限：返回价格政策让前端弹窗
    if (!access.allowed) {
      return jsonResponse({
        allowed: false,
        title: resource.title,
        view_price: resource.view_price,
        download_price: resource.download_price
      }, 200)
    }

    // D. 有权限：外部链接与实体文件流分发决策分支
    if (resource.source_type === 'external') {
      return jsonResponse({
        allowed: true,
        external: true,
        url: resource.external_url,
        title: resource.title
      })
    }

    if (!resource.file_key) {
      return jsonResponse({ error: '该资源尚未上传文件' }, 404)
    }

    // 检查并调用绑定的 R2 存储桶
    if (!env.R2) {
      return jsonResponse({ error: 'R2存储服务绑定不可用，请联系管理员核对配置' }, 500)
    }

    const object = await env.R2.get(resource.file_key)
    if (!object) {
      return jsonResponse({ error: '文件未找到，请联系管理员确认文件是否存在' }, 404)
    }

    // 组装 R2 文件输出响应头
    const headers = new Headers()
    const contentType = object.httpMetadata?.contentType || 'application/octet-stream'
    headers.set('Content-Type', contentType)
    
    if (object.size !== undefined && object.size !== null) {
      headers.set('Content-Length', String(object.size))
    }

    const fileNameEncoded = encodeURIComponent(resource.file_name || 'file')
    if (accessType === 'download') {
      headers.set('Content-Disposition', `attachment; filename="${fileNameEncoded}"`)
    } else {
      headers.set('Content-Disposition', `inline; filename="${fileNameEncoded}"`)
    }

    return withCors(new Response(object.body, { status: 200, headers }))

  } catch (e) {
    return jsonResponse({ error: '服务器内部错误', details: e.message }, 500)
  }
}

// ==========================================
// 【管理端追加资源逻辑 C】：资源库后台管理、文件直传、购买分配
// ==========================================

const MAX_RESOURCE_FILE_SIZE = 30 * 1024 * 1024  // 30MB 单文件大小上限

/**
 * 1. GET /api/admin/resources - 管理员获取指定模块的全部资源列表 (已修改：支持 source_type & external_url 反馈展示)
 * 
 * 🆕 修改说明：增加对解读文章 parent_id 单点查询过滤的支持；若常规加载模块主列表，则排除子解读文章防止穿透混乱展示
 */
const handleAdminGetResources = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  try {
    const url = new URL(request.url)
    const parentIdParam = url.searchParams.get('parent_id')?.trim()
    const db = getDb(env)

    let resources
    if (parentIdParam) {
      // 模式 1：查询某篇顶层资源（如政策）下属的所有解读文章
      resources = await queryAll(
        db,
        `SELECT id, module, title, description, category, file_key, file_name, file_size, min_level, view_price, download_price, status, source_type, external_url, parent_id, created_at 
         FROM resources 
         WHERE parent_id = ? 
         ORDER BY created_at DESC`,
        [parentIdParam]
      )
    } else {
      // 模式 2：主大盘列表，返回该 module 下 parent_id 为空的顶层主资源
      const module = url.searchParams.get('module')?.trim()
      if (!module || !['policy', 'library', 'knowledge'].includes(module)) {
        return jsonResponse({ error: '缺少有效或不合法的 module 参数' }, 400)
      }

      resources = await queryAll(
        db,
        `SELECT id, module, title, description, category, file_key, file_name, file_size, min_level, view_price, download_price, status, source_type, external_url, parent_id, created_at 
         FROM resources 
         WHERE module = ? AND (parent_id IS NULL OR parent_id = '') 
         ORDER BY created_at DESC`,
        [module]
      )
    }

    return jsonResponse({ resources })
  } catch (e) {
    return jsonResponse({ error: '管理员拉取资源大盘失败', details: e.message }, 500)
  }
}

/**
 * 2. POST /api/admin/resources - 录入上架新资源 (已修改：支持源类型分流与外部链接格式校验)
 * 
 * 🆕 修改说明：支持 parent_id 传值；当 module === 'policy' 时强制重置参数写入 0（政策库全免规则）
 */
const handleAdminCreateResource = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  let fileUploaded = false
  let fileKey = ''

  try {
    const formData = await request.formData()
    const module = formData.get('module')?.trim()
    const title = formData.get('title')?.trim()
    const description = formData.get('description')?.trim() || ''
    const category = formData.get('category')?.trim() || ''
    const source_type = formData.get('source_type')?.trim() || 'upload'
    const parent_id = formData.get('parent_id')?.trim() || null

    if (!module || !['policy', 'library', 'knowledge'].includes(module)) {
      return jsonResponse({ error: 'module参数缺失或分类非法' }, 400)
    }
    if (!title) {
      return jsonResponse({ error: '资源标题不能为空' }, 400)
    }

    // 政策库永久全免规则判定：若属政策库，强制设为 0
    let min_level, view_price, download_price
    if (module === 'policy') {
      min_level = 0
      view_price = 0
      download_price = 0
    } else {
      min_level = parseInt(formData.get('min_level') ?? '2')
      view_price = parseFloat(formData.get('view_price') ?? '0')
      download_price = parseFloat(formData.get('download_price') ?? '0')
    }

    let finalFileKey = null
    let finalFileName = null
    let finalFileSize = null
    let finalExternalUrl = null

    // 外部链接录入分支
    if (source_type === 'external') {
      const external_url = formData.get('external_url')?.trim()
      if (!external_url || (!external_url.startsWith('http://') && !external_url.startsWith('https://'))) {
        return jsonResponse({ error: '请填写有效的外部链接地址（需以http://或https://开头）' }, 400)
      }
      finalExternalUrl = external_url
    } 
    // 实体文件直传分支
    else {
      const file = formData.get('file')
      if (!file || typeof file === 'string' || !file.size) {
        return jsonResponse({ error: '请上传资源对应的实体文件' }, 400)
      }
      if (file.size > MAX_RESOURCE_FILE_SIZE) {
        return jsonResponse({ error: '文件大小超过 30MB 硬件限制' }, 400)
      }

      if (!env.R2) {
        return jsonResponse({ error: 'R2存储服务绑定不可用，请联系管理员确认配置' }, 500)
      }

      // 命名混淆防止文件名碰撞重叠
      fileKey = `${module}/${crypto.randomUUID()}-${file.name}`
      
      // 写入 R2
      await env.R2.put(fileKey, file, {
        httpMetadata: { contentType: file.type || 'application/octet-stream' }
      })
      fileUploaded = true

      finalFileKey = fileKey
      finalFileName = file.name
      finalFileSize = file.size
    }

    // D1 物理插入
    const db = getDb(env)
    const id = crypto.randomUUID()

    await db.prepare(
      `INSERT INTO resources (id, module, title, description, category, file_key, file_name, file_size, min_level, view_price, download_price, status, source_type, external_url, parent_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, datetime('now'))`
    )
    .bind(id, module, title, description, category, finalFileKey, finalFileName, finalFileSize, min_level, view_price, download_price, source_type, finalExternalUrl, parent_id)
    .run()

    // 写入审计日志
    await logAdminAction(env, admin, 'create_resource', 'resource', id, JSON.stringify({ title, module }))

    return jsonResponse({ success: true, id }, 201)

  } catch (e) {
    if (fileUploaded && fileKey && env.R2) {
      console.log('>>> [安全回滚拦截] D1 写入故障，清理 R2 残余文件: ', fileKey)
      await env.R2.delete(fileKey).catch(err => console.log('R2回滚清除失败:', err.message))
    }
    return jsonResponse({ error: '资源创建失败', details: e.message }, 500)
  }
}

/**
 * 3. PUT /api/admin/resources/:id - 编辑修改资源属性及配套文件 (已修改：支持源类型转换、外部链动态校验)
 * 
 * 🆕 修改说明：支持 parent_id 更新；政策库资源修改时防穿改校验强制其各项限制与价格保持 0
 */
const handleAdminUpdateResource = async (request, env, id) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  try {
    const db = getDb(env)
    const existing = await queryOne(db, "SELECT * FROM resources WHERE id = ?", [id])
    if (!existing) {
      return jsonResponse({ error: '资源不存在' }, 404)
    }

    const formData = await request.formData()
    const title = formData.has('title') ? formData.get('title')?.trim() : existing.title
    const description = formData.has('description') ? formData.get('description')?.trim() : existing.description
    const category = formData.has('category') ? formData.get('category')?.trim() : existing.category
    const status = formData.has('status') ? formData.get('status')?.trim() : existing.status
    const source_type = formData.has('source_type') ? formData.get('source_type')?.trim() : (existing.source_type || 'upload')
    const document_date = formData.get('document_date')
    const normalized_document_date = formData.has('document_date') ? (document_date?.trim() ? document_date.trim() : null) : existing.document_date
    const parent_id = formData.has('parent_id') ? (formData.get('parent_id')?.trim() || null) : existing.parent_id

    const module = existing.module

    // 政策库安全限制机制：防刷付费或提权。若为政策库，数值强制归 0
    let min_level, view_price, download_price
    if (module === 'policy') {
      min_level = 0
      view_price = 0
      download_price = 0
    } else {
      min_level = formData.has('min_level') ? parseInt(formData.get('min_level') ?? '2') : existing.min_level
      view_price = formData.has('view_price') ? parseFloat(formData.get('view_price') ?? '0') : existing.view_price
      download_price = formData.has('download_price') ? parseFloat(formData.get('download_price') ?? '0') : existing.download_price
    }

    let fileKey = existing.file_key
    let fileName = existing.file_name
    let fileSize = existing.file_size
    let external_url = existing.external_url

    // 分流处理：判定最终的 source_type 结果
    if (source_type === 'external') {
      if (formData.has('external_url')) {
        const urlVal = formData.get('external_url')?.trim()
        if (!urlVal || (!urlVal.startsWith('http://') && !urlVal.startsWith('https://'))) {
          return jsonResponse({ error: '请填写有效的外部链接地址（需以http://或https://开头）' }, 400)
        }
        external_url = urlVal
      }
      // 切换为外部链接时，清空原本关联的本地 file_key 属性
      fileKey = null
      fileName = null
      fileSize = null
    } else {
      // 保持 upload 属性，重置外部链接为空
      external_url = null
      
      // 检查是否有替换文件
      const file = formData.get('file')
      if (file && typeof file !== 'string' && file.size > 0) {
        if (file.size > MAX_RESOURCE_FILE_SIZE) {
          return jsonResponse({ error: '文件大小超过 30MB 硬件限制' }, 400)
        }

        if (!env.R2) {
          return jsonResponse({ error: 'R2存储服务未绑定，无法上传新文件' }, 500)
        }

        // 先删除旧 R2 对象
        if (existing.file_key) {
          await env.R2.delete(existing.file_key).catch(err => console.log('旧文件物理剔除异常: ', err.message))
        }

        // 覆盖全新 R2 存根
        fileKey = `${existing.module}/${crypto.randomUUID()}-${file.name}`
        await env.R2.put(fileKey, file, {
          httpMetadata: { contentType: file.type || 'application/octet-stream' }
        })
        fileName = file.name
        fileSize = file.size
      }
    }

    // 整体更新 D1
    await db.prepare(
      `UPDATE resources 
       SET title = ?, description = ?, category = ?, min_level = ?, view_price = ?, download_price = ?, status = ?, file_key = ?, file_name = ?, file_size = ?, source_type = ?, external_url = ?, document_date = ?, parent_id = ? 
       WHERE id = ?`
    )
    .bind(title, description, category, min_level, view_price, download_price, status, fileKey, fileName, fileSize, source_type, external_url, normalized_document_date, parent_id, id)
    .run()

    await logAdminAction(env, admin, 'update_resource', 'resource', id, JSON.stringify({ title }))

    return jsonResponse({ success: true })

  } catch (e) {
    return jsonResponse({ error: '资源库修改更新失败', details: e.message }, 500)
  }
}

/**
 * 4. DELETE /api/admin/resources/:id - 彻底删除单条资源并回收 R2 存储
 * 
 * 🆕 修改说明：支持级联清理子项解读文章。删除当前主卡片（如规范原文）之前，主动寻找并同步彻底销毁挂在它底下的全部子解读文章与其 R2 实体，不留孤儿数据。
 */
const handleAdminDeleteResource = async (request, env, id) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  try {
    const db = getDb(env)

    // A. 🆕 级联清理名下挂载的所有子解读文章及其实体 R2 存储文件
    const children = await queryAll(db, "SELECT id, file_key FROM resources WHERE parent_id = ?", [id])
    for (const child of children) {
      if (child.file_key && env.R2) {
        try { 
          await env.R2.delete(child.file_key) 
        } catch (e) {
          console.log('级联清理子文件异常:', e.message)
        }
      }
      await db.prepare("DELETE FROM resources WHERE id = ?").bind(child.id).run()
    }

    // B. 进行父资源自身的清理工作
    const existing = await queryOne(db, "SELECT title, file_key FROM resources WHERE id = ?", [id])
    if (!existing) {
      return jsonResponse({ error: '目标资源已被物理清除' }, 404)
    }

    // 物理回收清除主资源 R2 空间
    if (existing.file_key && env.R2) {
      await env.R2.delete(existing.file_key).catch(err => console.log('R2资源回收失败:', err.message))
    }

    // 剔除 D1 主资源记录
    await db.prepare("DELETE FROM resources WHERE id = ?").bind(id).run()

    await logAdminAction(env, admin, 'delete_resource', 'resource', id, JSON.stringify({ title: existing.title }))

    return jsonResponse({ success: true })

  } catch (e) {
    return jsonResponse({ error: '物理删除资源发生错误', details: e.message }, 500)
  }
}

/**
 * 5. GET /api/admin/purchases - 管理员获取购买记录列表
 */
const handleAdminGetPurchases = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  try {
    const url = new URL(request.url)
    const resourceId = url.searchParams.get('resource_id')?.trim()

    const db = getDb(env)
    let sql = `
      SELECT p.id, p.user_id, u.email, p.resource_id, r.title AS resource_title, p.access_type, p.amount, p.note, p.created_at 
      FROM purchases p 
      JOIN users u ON p.user_id = u.id 
      JOIN resources r ON p.resource_id = r.id
    `
    const binds = []
    if (resourceId) {
      sql += ' WHERE p.resource_id = ?'
      binds.push(resourceId)
    }

    sql += ' ORDER BY p.created_at DESC'

    const purchases = await queryAll(db, sql, binds)
    return jsonResponse({ purchases })

  } catch (e) {
    return jsonResponse({ error: '调取手动开通授权订单日志失败', details: e.message }, 500)
  }
}

/**
 * 6. POST /api/admin/purchases - 手动开通特定用户权限
 */
const handleAdminCreatePurchase = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  try {
    const body = await request.json().catch(() => null)
    const user_email = body?.user_email?.trim()
    const resource_id = body?.resource_id?.trim()
    const access_type = body?.access_type?.trim()
    const amount = parseFloat(body?.amount ?? '0')
    const note = body?.note?.trim() || ''

    if (!user_email || !resource_id || !access_type) {
      return jsonResponse({ error: '必填项 user_email、resource_id、access_type 缺失' }, 400)
    }
    if (!['view', 'download'].includes(access_type)) {
      return jsonResponse({ error: '非法的权限开通类型，仅支持 view 或 download' }, 400)
    }

    const db = getDb(env)
    // A. 安全检测邮箱用户是否在系统中存在
    const user = await queryOne(db, "SELECT id FROM users WHERE email = ?", [user_email])
    if (!user) {
      return jsonResponse({ error: '找不到该邮箱对应的用户' }, 404)
    }

    // B. 安全检测资源卡片是否存在
    const resource = await queryOne(db, "SELECT id FROM resources WHERE id = ?", [resource_id])
    if (!resource) {
      return jsonResponse({ error: '指定的规划资源在库中不存在' }, 404)
    }

    const purchaseId = crypto.randomUUID()

    // C. 写入购买分配记录表
    await db.prepare(
      `INSERT INTO purchases (id, user_id, resource_id, access_type, amount, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .bind(purchaseId, user.id, resource_id, access_type, amount, note)
    .run()

    // 记录管理员授权日志
    await logAdminAction(env, admin, 'grant_purchase', 'purchase', purchaseId, JSON.stringify({ user_email, resource_id, access_type }))

    return jsonResponse({ success: true, id: purchaseId }, 201)

  } catch (e) {
    return jsonResponse({ error: '手动开通资源卡片购买权限失败', details: e.message }, 500)
  }
}

/**
 * 7. DELETE /api/admin/purchases/:id - 撤销开通的权限
 */
const handleAdminDeletePurchase = async (request, env, id) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  try {
    const db = getDb(env)
    await db.prepare("DELETE FROM purchases WHERE id = ?").bind(id).run()

    await logAdminAction(env, admin, 'revoke_purchase', 'purchase', id, null)

    return jsonResponse({ success: true })

  } catch (e) {
    return jsonResponse({ error: '撤回开通失败', details: e.message }, 500)
  }
}

// ==========================================
// 🆕 【新增业务逻辑区 E】：优化建议与反馈系统
// ==========================================

/**
 * 1. POST /api/feedback - 用户提交优化建议（需登录认证）
 */
const handlePostFeedback = async (request, env) => {
  try {
    const user = await getCurrentUser(request, env)
    if (!user) {
      return jsonResponse({ error: '请先登录后提交建议' }, 401)
    }

    const body = await request.json().catch(() => null)
    const content = body?.content?.trim()

    if (!content) {
      return jsonResponse({ error: '建议内容不能为空' }, 400)
    }
    if (content.length > 500) {
      return jsonResponse({ error: '建议内容过长，请控制在500字以内' }, 400)
    }

    const db = getDb(env)
    const id = crypto.randomUUID()
    const userId = user.user_id || user.userId
    const userEmail = user.email

    await db.prepare(
      `INSERT INTO feedback (id, user_id, user_email, content, status, created_at) 
       VALUES (?, ?, ?, ?, 'new', datetime('now'))`
    )
    .bind(id, userId, userEmail, content)
    .run()

    return jsonResponse({ success: true })

  } catch (e) {
    return jsonResponse({ error: '建议提交失败', details: e.message }, 500)
  }
}

/**
 * 2. GET /api/admin/feedback - 管理员调阅建议反馈列表
 */
const handleAdminGetFeedback = async (request, env) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  try {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')?.trim()
    const db = getDb(env)

    let sql = `SELECT id, user_id, user_email, content, status, admin_note, created_at FROM feedback`
    const binds = []
    
    if (status) {
      sql += ' WHERE status = ?'
      binds.push(status)
    }
    sql += ' ORDER BY created_at DESC'

    const feedbackList = await queryAll(db, sql, binds)
    return jsonResponse({ feedback: feedbackList })

  } catch (e) {
    return jsonResponse({ error: '调阅建议反馈失败', details: e.message }, 500)
  }
}

/**
 * 3. PUT /api/admin/feedback/:id - 管理员更新建议审核状态/反馈备注
 */
const handleAdminUpdateFeedback = async (request, env, id) => {
  const admin = await authorizeAdmin(request, env)
  if (!admin) return jsonResponse({ error: '无管理员访问权限' }, 403)

  try {
    const body = await request.json().catch(() => null)
    if (!body) return jsonResponse({ error: '未接收到可更新参数负载' }, 400)

    const db = getDb(env)
    const existing = await queryOne(db, "SELECT * FROM feedback WHERE id = ?", [id])
    if (!existing) {
      return jsonResponse({ error: '找不到该条建议反馈记录' }, 404)
    }

    const status = body.status !== undefined ? String(body.status).trim() : existing.status
    const admin_note = body.admin_note !== undefined ? String(body.admin_note).trim() : existing.admin_note

    const VALID_STATUSES = ['new', 'reviewed', 'closed']
    if (body.status !== undefined && !VALID_STATUSES.includes(status)) {
      return jsonResponse({ error: '非法的反馈审核状态，限定 new, reviewed, closed' }, 400)
    }

    await db.prepare(
      `UPDATE feedback SET status = ?, admin_note = ? WHERE id = ?`
    )
    .bind(status, admin_note, id)
    .run()

    // 组装并写入审计日志
    const modifiedPayload = {}
    if (body.status !== undefined) modifiedPayload.status = status
    if (body.admin_note !== undefined) modifiedPayload.admin_note = admin_note

    await logAdminAction(env, admin, 'update_feedback', 'feedback', id, JSON.stringify(modifiedPayload))

    return jsonResponse({ success: true })

  } catch (e) {
    return jsonResponse({ error: '更新建议状态失败', details: e.message }, 500)
  }
}

// ==========================================
// 4. 请求路由分配与统一执行器
// ==========================================

const handleRequest = async (request, env) => {
  const url = new URL(request.url)
  const pathname = url.pathname
  const method = request.method

  if (method === 'OPTIONS') {
    return optionsResponse()
  }

  // 1. 注册
  if (pathname === '/api/register' && method === 'POST') {
    return handleRegister(request, env)
  }

  // 2. 登录
  if (pathname === '/api/login' && method === 'POST') {
    return handleLogin(request, env)
  }

  // 3. 用户主档资料
  if (pathname === '/api/me' && method === 'GET') {
    return handleGetMe(request, env)
  }

  // 4. 获取历史计算记录
  if (pathname === '/api/tool-history' && method === 'GET') {
    return handleGetToolHistory(request, env)
  }

  // 5. 新增历史记录
  if (pathname === '/api/tool-history' && method === 'POST') {
    return handlePostToolHistory(request, env)
  }

  // 🆕 5.1 用户提交反馈建议（需登录）
  if (pathname === '/api/feedback' && method === 'POST') {
    return handlePostFeedback(request, env)
  }

  // 6. 获取工具清单
  if (pathname === '/api/tools' && method === 'GET') {
    return handleGetTools(request, env)
  }

  // 7. 正则动态匹配 /api/tools/:id/access
  const toolAccessMatch = pathname.match(/^\/api\/tools\/([^/]+)\/access$/)
  if (toolAccessMatch && method === 'GET') {
    return handleGetToolAccess(request, env, toolAccessMatch[1])
  }

  // 8. 数据大屏公开统计
  if (pathname === '/api/stats' && method === 'GET') {
    return handleGetStats(request, env)
  }

  // 8.1 公开公告调取路由
  if (pathname === '/api/notices' && method === 'GET') {
    return handleGetPublicNotices(request, env)
  }

  // 🆕 8.1.5 公开查询邀请码（免登录）
  if (pathname === '/api/invite-codes/public' && method === 'GET') {
    return handleGetPublicInviteCodes(request, env)
  }

  // 🆕 8.1.6 获取部分公开系统设置（免登录）
  if (pathname === '/api/public-settings' && method === 'GET') {
    return handleGetPublicSettings(request, env)
  }

  // 8.2 获取公开资源列表 (GET /api/resources)
  if (pathname === '/api/resources' && method === 'GET') {
    return handleGetPublicResources(request, env)
  }

  /// 8.3 资源权限交叉检测与 R2 流式直穿网关 (GET /api/resources/:id/access)
  const resourceAccessMatch = pathname.match(/^\/api\/resources\/([^/]+)\/access$/)
  if (resourceAccessMatch && method === 'GET') {
    return handleGetResourceAccess(request, env, resourceAccessMatch[1])
  }

  // 9. 获取注册审核列表
  if (pathname === '/api/admin/applications' && method === 'GET') {
    return handleGetApplications(request, env)
  }

  // 10. 审核通过一键授信
  const appApproveMatch = pathname.match(/^\/api\/admin\/applications\/([^/]+)\/approve$/)
  if (appApproveMatch && method === 'PATCH') {
    return handleApproveApplication(request, env, appApproveMatch[1])
  }

  // 11. 审核驳回
  const appRejectMatch = pathname.match(/^\/api\/admin\/applications\/([^/]+)\/reject$/)
  if (appRejectMatch && method === 'PATCH') {
    return handleRejectApplication(request, env, appRejectMatch[1])
  }

  // 12. 获取所有核发邀请码
  if (pathname === '/api/admin/invite-codes' && method === 'GET') {
    return handleGetInviteCodes(request, env)
  }

  // 13. 创建生成 8 位邀请码
  if (pathname === '/api/admin/invite-codes' && method === 'POST') {
    return handleCreateInviteCode(request, env)
  }

  // 14. 吊销/物理删除邀请码
  const inviteDeleteMatch = pathname.match(/^\/api\/admin\/invite-codes\/([^/]+)$/)
  if (inviteDeleteMatch && method === 'DELETE') {
    return handleDeleteInviteCode(request, env, inviteDeleteMatch[1])
  }

  // 15. 获取管理员审计日志列表
  if (pathname === '/api/admin/logs' && method === 'GET') {
    return handleGetAdminLogs(request, env)
  }

  // 16. 获取AI调用用量分配表
  if (pathname === '/api/admin/ai-usage' && method === 'GET') {
    return handleGetAiUsage(request, env)
  }

  // 17. 物理CSV表格安全审计打包导出网关
  if (pathname === '/api/admin/export' && method === 'GET') {
    return handleExportData(request, env)
  }

  // 18. 后台仪表大屏聚合接口
  if (pathname === '/api/admin/dashboard-stats' && method === 'GET') {
    return handleGetDashboardStats(request, env)
  }

  // 19. 后台工具管理：获取所有状态列表
  if (pathname === '/api/admin/tools' && method === 'GET') {
    return handleAdminGetTools(request, env)
  }

  // 20. 后台工具管理：安全上架录入卡片
  if (pathname === '/api/admin/tools' && method === 'POST') {
    return handleAdminCreateTool(request, env)
  }

  // 21. 后台工具管理：编辑工具卡片
  const toolUpdateMatch = pathname.match(/^\/api\/admin\/tools\/([^/]+)$/)
  if (toolUpdateMatch && method === 'PUT') {
    return handleAdminUpdateTool(request, env, toolUpdateMatch[1])
  }

  // 22. 后台工具管理：物理吊销工具卡片
  const toolDeleteMatch = pathname.match(/^\/api\/admin\/tools\/([^/]+)$/)
  if (toolDeleteMatch && method === 'DELETE') {
    return handleAdminDeleteTool(request, env, toolDeleteMatch[1])
  }

  // 23. 后台用户管理：获取带会员信息的完整用户表 (GET)
  if (pathname === '/api/admin/users' && method === 'GET') {
    return handleAdminGetUsers(request, env)
  }

  // 24. 后台用户管理：安全编辑用户及会员权限 (PUT)
  const userUpdateMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)$/)
  if (userUpdateMatch && method === 'PUT') {
    return handleAdminUpdateUser(request, env, userUpdateMatch[1])
  }

  // 25. 获取后台公告列表 (GET)
  if (pathname === '/api/admin/notices' && method === 'GET') {
    return handleAdminGetNotices(request, env)
  }

  // 26. 后台新建公告 (POST)
  if (pathname === '/api/admin/notices' && method === 'POST') {
    return handleAdminCreateNotice(request, env)
  }

  // 27. 后台修改/发布公告状态 (PUT)
  const noticeUpdateMatch = pathname.match(/^\/api\/admin\/notices\/([^/]+)$/)
  if (noticeUpdateMatch && method === 'PUT') {
    return handleAdminUpdateNotice(request, env, noticeUpdateMatch[1])
  }

  // 28. 后台物理删除公告 (DELETE)
  const noticeDeleteMatch = pathname.match(/^\/api\/admin\/notices\/([^/]+)$/)
  if (noticeDeleteMatch && method === 'DELETE') {
    return handleAdminDeleteNotice(request, env, noticeDeleteMatch[1])
  }

  // 29. 获取系统全局设置 (GET)
  if (pathname === '/api/admin/settings' && method === 'GET') {
    return handleAdminGetSettings(request, env)
  }

  // 30. 批量更新系统全局设置 (PUT)
  if (pathname === '/api/admin/settings' && method === 'PUT') {
    return handleAdminUpdateSettings(request, env)
  }

  // 31. 管理员获取指定模块资源列表 (GET /api/admin/resources)
  if (pathname === '/api/admin/resources' && method === 'GET') {
    return handleAdminGetResources(request, env)
  }

  // 32. 管理员新建资源含文件直传 (POST /api/admin/resources)
  if (pathname === '/api/admin/resources' && method === 'POST') {
    return handleAdminCreateResource(request, env)
  }

  // 33. 管理员编辑资源按需替换文件 (PUT /api/admin/resources/:id)
  const adminResourceMatch = pathname.match(/^\/api\/admin\/resources\/([^/]+)$/)
  if (adminResourceMatch && method === 'PUT') {
    return handleAdminUpdateResource(request, env, adminResourceMatch[1])
  }

  // 34. 管理员级联删除资源卡片及 R2 对象 (DELETE /api/admin/resources/:id)
  if (adminResourceMatch && method === 'DELETE') {
    return handleAdminDeleteResource(request, env, adminResourceMatch[1])
  }

  // 35. 查看全部手动开通或购买记录 (GET /api/admin/purchases)
  if (pathname === '/api/admin/purchases' && method === 'GET') {
    return handleAdminGetPurchases(request, env)
  }

  // 36. 手动授信开通特定资源购买权限 (POST /api/admin/purchases)
  if (pathname === '/api/admin/purchases' && method === 'POST') {
    return handleAdminCreatePurchase(request, env)
  }

  // 37. 撤销/删除指定开通权限 (DELETE /api/admin/purchases/:id)
  const adminPurchaseMatch = pathname.match(/^\/api\/admin\/purchases\/([^/]+)$/)
  if (adminPurchaseMatch && method === 'DELETE') {
    return handleAdminDeletePurchase(request, env, adminPurchaseMatch[1])
  }

  // 38. 管理端查看优化建议反馈列表 (GET)
  if (pathname === '/api/admin/feedback' && method === 'GET') {
    return handleAdminGetFeedback(request, env)
  }

  // 39. 管理端修改优化建议反馈状态和备注 (PUT)
  const adminFeedbackMatch = pathname.match(/^\/api\/admin\/feedback\/([^/]+)$/)
  if (adminFeedbackMatch && method === 'PUT') {
    return handleAdminUpdateFeedback(request, env, adminFeedbackMatch[1])
  }

  // 统一 404 兜底
  return jsonResponse({ error: '接口未找到' }, 404)
}

export default {
  async fetch(request, env) {
    try {
      const response = await handleRequest(request, env)
      return withCors(response)
    } catch (err) {
      console.log('Fetch 全局未捕获异常：', err.message)
      return jsonResponse({ error: '服务器内部故障', details: err.message }, 500)
    }
  }
}