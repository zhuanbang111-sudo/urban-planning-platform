-- ============================================================
-- 城市基础设施规划研究平台 - D1 数据库结构存档
-- ============================================================
-- 说明：
-- 1. 这份文件是当前数据库结构的"存档记录"，不是用来重复执行的脚本。
--    如果要在新环境从零搭建数据库，按从上到下的顺序执行一次即可。
-- 2. 如果不确定某张表/某个字段在生产环境是否已经存在，先用
--    SELECT name FROM sqlite_master WHERE type='table'; 
--    或 PRAGMA table_info(表名);  查一下，不要盲目重复执行，
--    CREATE TABLE 对已存在的表会报错（这是正常的，说明已经建过了）。
-- 3. 每次执行新的建表/改表 SQL 后，记得把对应语句追加进这份文件，
--    保持它和生产环境数据库结构同步。
-- ============================================================


-- ----------------------------------------------------------
-- 【项目交接时既有】users 表（含后续追加的审批相关字段）
-- ----------------------------------------------------------
-- 原始字段：id, email, password, role, status, created_at
-- 后续追加：apply_name, apply_org, apply_reason（人工审核注册用）
-- 注：password 字段名以此为准，交接文档中提到的 password_hash
--     命名冲突问题已统一修复为 password。
--
-- CREATE TABLE users (
--   id TEXT PRIMARY KEY,
--   email TEXT UNIQUE NOT NULL,
--   password TEXT NOT NULL,
--   role TEXT DEFAULT 'user',
--   status TEXT DEFAULT 'active',
--   apply_name TEXT,
--   apply_org TEXT,
--   apply_reason TEXT,
--   created_at TEXT DEFAULT (datetime('now'))
-- );


-- ----------------------------------------------------------
-- 【项目交接时既有】user_quota 表 + 会员订阅相关字段（本次对话新增）
-- ----------------------------------------------------------
-- CREATE TABLE user_quota (
--   user_id TEXT PRIMARY KEY REFERENCES users(id),
--   ai_calls_today INTEGER DEFAULT 0,
--   ai_reset_date TEXT DEFAULT (date('now')),
--   download_level INTEGER DEFAULT 1
-- );

-- download_level 含义（本次对话重新定义）：
--   1 = 免费用户
--   2 = 付费会员（已付费且未到期）

ALTER TABLE user_quota ADD COLUMN membership_expires_at TEXT;
ALTER TABLE user_quota ADD COLUMN membership_note TEXT;
-- membership_expires_at：会员到期时间（ISO格式），NULL代表免费用户或永久有效
-- membership_note：管理员手动标记会员时的备注（因目前是手动收款，无自动支付记账）


-- ----------------------------------------------------------
-- 【项目交接时既有】tool_history 表（无改动）
-- ----------------------------------------------------------
-- CREATE TABLE tool_history (
--   id TEXT PRIMARY KEY,
--   user_id TEXT REFERENCES users(id),
--   tool_name TEXT,
--   input_data TEXT,
--   result TEXT,
--   created_at TEXT DEFAULT (datetime('now'))
-- );


-- ----------------------------------------------------------
-- 【项目交接时既有】tools 表（无改动）
-- ----------------------------------------------------------
-- CREATE TABLE tools (
--   id TEXT PRIMARY KEY,
--   name TEXT NOT NULL,
--   description TEXT,
--   category TEXT DEFAULT '计算工具',
--   tool_type TEXT DEFAULT 'iframe',   -- iframe / iframe_external / new_window
--   url TEXT NOT NULL,
--   icon TEXT DEFAULT '🔧',
--   status TEXT DEFAULT 'active',
--   min_level INTEGER DEFAULT 0,        -- 0公开/1需登录/2会员专享
--   sort_order INTEGER DEFAULT 0,
--   created_at TEXT DEFAULT (datetime('now'))
-- );


-- ----------------------------------------------------------
-- 【项目交接时既有】invite_codes 表（无改动）
-- ----------------------------------------------------------
-- CREATE TABLE invite_codes (
--   id TEXT PRIMARY KEY,
--   code TEXT,
--   created_by TEXT,
--   max_uses INTEGER,
--   used_count INTEGER DEFAULT 0,
--   expires_at TEXT,
--   note TEXT,
--   created_at TEXT DEFAULT (datetime('now'))
-- );


-- ----------------------------------------------------------
-- 【本次对话新增】admin_logs 表 - 操作审计日志
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT,
  admin_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);


-- ----------------------------------------------------------
-- 【本次对话新增】notices 表 - 通知公告
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft',          -- draft / published
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);


-- ----------------------------------------------------------
-- 【本次对话新增】settings 表 - 系统全局设置（key-value）
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 初始预置设置项
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('site_name', '城市基础设施规划研究平台'),
  ('registration_enabled', 'true'),
  ('maintenance_mode', 'false'),
  ('maintenance_message', '系统维护中，请稍后再访问'),
  ('payment_contact', '请扫码付款后，添加微信/发送邮件联系管理员开通权限，并备注您的注册邮箱和所购买的资料标题'),
  ('resource_payment_enabled', 'false');

-- 各设置项用途说明：
--   site_name               站点名称
--   registration_enabled    'true'/'false'，控制是否开放新用户注册（真实生效）
--   maintenance_mode        'true'/'false'，目前仅作状态记录，未接入实际拦截逻辑
--   maintenance_message     维护模式提示文案（预留，配合上面字段使用）
--   payment_contact         资料付费引导弹窗里展示的联系方式说明文字
--   resource_payment_enabled 'true'/'false'，资源付费总开关（kill switch）。
--                            false时所有资源访问跳过等级/价格/购买记录判断，
--                            只要求登录即可查看下载；true时恢复完整付费机制


-- ----------------------------------------------------------
-- 【本次对话新增】resources 表 - 政策库/资料库/知识库统一资源表
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  module TEXT NOT NULL,                 -- 'policy' / 'library' / 'knowledge'
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_key TEXT,                        -- R2对象key（仅source_type='upload'时有值）
  file_name TEXT,                       -- 原始文件名
  file_size INTEGER,                    -- 文件大小（字节）
  min_level INTEGER DEFAULT 2,          -- 0=公开 / 1=免费用户可看 / 2=仅会员免费
  view_price INTEGER DEFAULT 0,         -- 单位：分，查看价格
  download_price INTEGER DEFAULT 0,     -- 单位：分，下载/买断价格
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 内容来源扩展（支持外部链接，免去R2存储）
ALTER TABLE resources ADD COLUMN source_type TEXT DEFAULT 'upload';
-- source_type: 'upload'（文件存于R2） / 'external'（外部链接）
ALTER TABLE resources ADD COLUMN external_url TEXT;
-- external_url: 仅source_type='external'时有值。
-- 注意：此字段绝不能出现在公开列表接口(GET /api/resources)的返回中，
-- 只能在权限检测通过后，通过 GET /api/resources/:id/access 单独返回，
-- 否则会让"必须登录才能查看"这道门槛失效。


-- ----------------------------------------------------------
-- 【本次对话新增】purchases 表 - 资源购买/授权记录（手动开通）
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  access_type TEXT NOT NULL,            -- 'view' / 'download'（download天然包含view）
  amount INTEGER,                       -- 实付金额（分），手动标记阶段可填0+靠note备注
  note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);


-- ----------------------------------------------------------
-- 【本次对话新增】feedback 表 - 用户优化建议反馈
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'new',            -- new / reviewed / closed
  admin_note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);


-- ============================================================
-- 文档结束。下次新增/修改表结构后，记得把新的SQL追加到这份文件末尾。
-- ============================================================