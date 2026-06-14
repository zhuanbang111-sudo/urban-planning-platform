const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Max-Age': '86400'
}

const jsonResponse = (data, status = 200) =>
  withCors(
    new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  )

const textResponse = (text, status = 200) =>
  withCors(
    new Response(text, {
      status,
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      }
    })
  )

const optionsResponse = () =>
  new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  })

const withCors = (response) => {
  const headers = new Headers(response.headers)
  Object.entries(CORS_HEADERS).forEach(([key, value]) => headers.set(key, value))
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()
const JWT_EXPIRE_SECONDS = 7 * 24 * 60 * 60

const base64UrlEncode = (input) => {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(input)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

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

const getJwtSecret = (env) => textEncoder.encode(env.JWT_SECRET || 'default_jwt_secret')

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

const jwtVerify = async (token, env) => {
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
  if (!isValid) return null
  const payload = JSON.parse(textDecoder.decode(base64UrlDecode(payloadB64)))
  if (payload.exp && Date.now() / 1000 > payload.exp) return null
  return payload
}

const getAuthToken = (request) => {
  const auth = request.headers.get('Authorization') || ''
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  return parts[1]
}

const getDb = (env) => env.DB || env.D1

const queryOne = async (db, sql, binds = []) => {
  const stmt = db.prepare(sql)
  binds.forEach((value) => stmt.bind(value))
  return stmt.first()
}

const queryAll = async (db, sql, binds = []) => {
  const stmt = db.prepare(sql)
  binds.forEach((value) => stmt.bind(value))
  return stmt.all()
}

const createJwtForUser = async (user, env) => {
  const payload = {
    user_id: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + JWT_EXPIRE_SECONDS
  }
  return jwtSign(payload, env)
}

const getCurrentUser = async (request, env) => {
  const token = getAuthToken(request)
  if (!token) return null
  return jwtVerify(token, env)
}

const handleRegister = async (request, env) => {
  const body = await request.json().catch(() => null)
  const email = body?.email?.trim()
  const password = body?.password
  if (!email || !password) {
    return jsonResponse({ error: '邮箱和密码不能为空' }, 400)
  }
  const db = getDb(env)
  const existing = await queryOne(db, 'SELECT id FROM users WHERE email = ?', [email])
  if (existing) {
    return jsonResponse({ error: '用户已存在' }, 400)
  }
  const passwordHash = await jwtSign({ password }, env) // 简化密码哈希，可改为 crypto.subtle.digest
  const createdAt = new Date().toISOString()
  await db.prepare('INSERT INTO users (email, password_hash, role, created_at) VALUES (?, ?, ?, ?)')
    .bind(email, passwordHash, 'user', createdAt)
    .run()
  return jsonResponse({ success: true })
}

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
    'SELECT id, email, password_hash, role FROM users WHERE email = ?',
    [email]
  )
  if (!user) return jsonResponse({ error: '邮箱或密码错误' }, 401)
  const passwordHash = await jwtSign({ password }, env)
  if (passwordHash !== user.password_hash) return jsonResponse({ error: '邮箱或密码错误' }, 401)
  const token = await createJwtForUser(user, env)
  return jsonResponse({ token, user: { id: user.id, email: user.email, role: user.role } })
}

const handleGetMe = async (request, env) => {
  const user = await getCurrentUser(request, env)
  if (!user) return jsonResponse({ error: '需要登录' }, 401)
  return jsonResponse({ user })
}

const handleGetToolHistory = async (request, env) => {
  const user = await getCurrentUser(request, env)
  if (!user) return jsonResponse({ error: '需要登录' }, 401)
  const db = getDb(env)
  const history = await queryAll(
    db,
    'SELECT id, tool_name, input_data, result, created_at FROM tool_history WHERE user_id = ? ORDER BY created_at DESC',
    [user.user_id]
  )
  return jsonResponse({ history })
}

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
  await db.prepare('INSERT INTO tool_history (tool_name, input_data, result, user_id, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(toolName, inputData, result, user.user_id, createdAt)
    .run()
  return jsonResponse({ success: true })
}

const fetchUserQuotaLevel = async (db, userId) => {
  const quota = await queryOne(db, 'SELECT download_level FROM user_quota WHERE user_id = ?', [userId])
  return quota?.download_level ?? 0
}

const handleGetTools = async (request, env) => {
  const url = new URL(request.url)
  const category = url.searchParams.get('category')?.trim()
  const db = getDb(env)
  let tools
  if (category) {
    tools = await queryAll(
      db,
      'SELECT id, name, description, category, tool_type, url, icon, status, min_level, sort_order, created_at FROM tools WHERE status = ? AND category = ? ORDER BY sort_order ASC',
      ['active', category]
    )
  } else {
    tools = await queryAll(
      db,
      'SELECT id, name, description, category, tool_type, url, icon, status, min_level, sort_order, created_at FROM tools WHERE status = ? ORDER BY sort_order ASC',
      ['active']
    )
  }
  return jsonResponse({ tools })
}

const handleGetToolAccess = async (request, env, toolId) => {
  const user = await getCurrentUser(request, env)
  if (!user) return jsonResponse({ error: '请登录后使用此工具' }, 403)
  const db = getDb(env)
  const tool = await queryOne(
    db,
    'SELECT id, name, description, category, tool_type, url, icon, status, min_level FROM tools WHERE id = ?',
    [toolId]
  )
  if (!tool) return jsonResponse({ error: '工具不存在' }, 404)
  const quotaLevel = await fetchUserQuotaLevel(db, user.user_id)
  const allowed = user.role === 'admin' || quotaLevel >= Number(tool.min_level ?? 0)
  if (!allowed) return jsonResponse({ error: '请登录后使用此工具' }, 403)
  await db.prepare('INSERT INTO tool_history (tool_name, input_data, result, user_id, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(tool.name, 'access', 'ok', user.user_id, new Date().toISOString())
    .run()
  return jsonResponse({ success: true, url: tool.url, tool_type: tool.tool_type, name: tool.name })
}

const handleGetStats = async (request, env) => {
  const db = getDb(env)
  const toolCountRow = await queryOne(db, "SELECT COUNT(*) AS count FROM tools WHERE status = 'active'")
  const userCountRow = await queryOne(db, "SELECT COUNT(*) AS count FROM users")
  return jsonResponse({ tool_count: toolCountRow?.count ?? 0, user_count: userCountRow?.count ?? 0 })
}

const handleRequest = async (request, env) => {
  const url = new URL(request.url)
  const pathname = url.pathname

  if (request.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (pathname === '/api/register' && request.method === 'POST') {
    return handleRegister(request, env)
  }

  if (pathname === '/api/login' && request.method === 'POST') {
    return handleLogin(request, env)
  }

  if (pathname === '/api/me' && request.method === 'GET') {
    return handleGetMe(request, env)
  }

  if (pathname === '/api/tool-history' && request.method === 'GET') {
    return handleGetToolHistory(request, env)
  }

  if (pathname === '/api/tool-history' && request.method === 'POST') {
    return handlePostToolHistory(request, env)
  }

  if (pathname === '/api/tools' && request.method === 'GET') {
    return handleGetTools(request, env)
  }

  const toolAccessMatch = pathname.match(/^\/api\/tools\/([^/]+)\/access$/)
  if (toolAccessMatch && request.method === 'GET') {
    return handleGetToolAccess(request, env, toolAccessMatch[1])
  }

  if (pathname === '/api/stats' && request.method === 'GET') {
    return handleGetStats(request, env)
  }

  return jsonResponse({ error: '接口未找到' }, 404)
}

export async function fetch(request, env) {
  const response = await handleRequest(request, env)
  return withCors(response)
}

