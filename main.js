// ═══════════════════════════════════════════════════════════════
//  main.js — نقطة التشغيل الرئيسية (النسخة المدمجة المعدلة)
//  دمج: main.js + main_1.js
//  الاعتمادات الأصلية: 𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪  /  YanXiao ♡
// ═══════════════════════════════════════════════════════════════
if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'

import './config.js'
import { createRequire } from 'module'
import path, { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, mkdirSync } from 'fs'
import yargs from 'yargs'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { format } from 'util'
import pino from 'pino'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import lodash from 'lodash'
import readline from 'readline'
import qrcode from 'qrcode-terminal'
import { spawn } from 'child_process'

const {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
} = await import('@whiskeysockets/baileys')

const BOT_NAME = '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'

// ───────────────────────── أدوات مساعدة ─────────────────────────
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const log = {
  info: (...a) => console.log(chalk.cyan('ℹ️ '), ...a),
  ok: (...a) => console.log(chalk.green('✅'), ...a),
  warn: (...a) => console.log(chalk.yellow('⚠️ '), ...a),
  error: (...a) => console.log(chalk.red('❌'), ...a),
}
const statusOf = (lastDisconnect) =>
  lastDisconnect?.error?.output?.statusCode ?? lastDisconnect?.error?.output?.payload?.statusCode

protoType()
serialize()

// ───────────────────────── المتغيرات العامة ─────────────────────────
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? (/file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL) : pathToFileURL(pathURL).toString()
}
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true))
}
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir)
}

global.API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? '?' +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}),
        })
      )
    : '')

global.timestamp = { start: new Date() }

const __dirname = global.__dirname(import.meta.url)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
// البادئات الافتراضية: . ! / # $ % -   (يمكن تغييرها عبر --prefix)
global.prefix = new RegExp(
  '^[' + String(global.opts['prefix'] || './!#$%-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']'
)

// ───────────────────────── قاعدة البيانات ─────────────────────────
const DB_FILE = 'storage/databases/database.json'
mkdirSync(path.dirname(DB_FILE), { recursive: true })
mkdirSync(join(__dirname, './tmp'), { recursive: true })

global.db = new Low(new JSONFile(DB_FILE))
global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    await new Promise((resolve) => {
      const timer = setInterval(() => {
        if (!global.db.READ) {
          clearInterval(timer)
          resolve()
        }
      }, 500)
    })
    return global.db.data == null ? global.loadDatabase() : global.db.data
  }
  if (global.db.data !== null) return global.db.data
  global.db.READ = true
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  }
  global.db.chain = lodash.chain(global.db.data)
  return global.db.data
}
await global.loadDatabase()

async function saveDatabase() {
  if (global.db.data) await global.db.write().catch(console.error)
}

// ───────────────────────── مخزن رسائل خفيف (لإعادة محاولة فك التشفير) ─────────────────────────
function createStore(limit = 3000) {
  const messages = new Map()
  const keyOf = (jid, id) => `${jidNormalizedUser(jid)}|${id}`
  return {
    messages,
    loadMessage: async (jid, id) => messages.get(keyOf(jid, id)) || null,
    bind(ev) {
      ev.on('messages.upsert', ({ messages: list }) => {
        for (const msg of list || []) {
          if (!msg?.key?.id || !msg.key.remoteJid || !msg.message) continue
          messages.set(keyOf(msg.key.remoteJid, msg.key.id), msg)
          if (messages.size > limit) messages.delete(messages.keys().next().value)
        }
      })
    },
  }
}
global.store = global.store?.loadMessage ? global.store : createStore()

// ───────────────────────── إعدادات الاتصال ─────────────────────────
global.authFile = `Taibsessions`
const { state, saveCreds } = await useMultiFileAuthState(global.authFile)

const { version, isLatest } = await fetchLatestBaileysVersion().catch((e) => {
  log.warn('تعذّر جلب أحدث إصدار من واتساب ويب، سيتم استخدام الافتراضي:', e?.message || e)
  return { version: undefined, isLatest: false }
})
if (version) log.info(`إصدار واتساب ويب: v${version.join('.')} (${isLatest ? 'الأحدث' : 'ليس الأحدث'})`)

const logger = pino({ level: 'fatal' })

function buildSocketOptions(authState) {
  return {
    ...(version ? { version } : {}),
    logger,
    printQRInTerminal: false,
    auth: {
      creds: authState.creds,
      keys: makeCacheableSignalKeyStore(authState.keys, logger),
    },
    browser: Browsers.ubuntu('Firefox'),
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
    retryRequestDelayMs: 250,
    maxMsgRetryCount: 15,
    transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
    appStateMacVerification: { patch: false, snapshot: false },
    getMessage: async (key) => {
      try {
        const msg = await global.store.loadMessage(jidNormalizedUser(key.remoteJid), key.id)
        return msg?.message || undefined
      } catch {
        return undefined
      }
    },
    
    // ✅ الحل الجذري لمشكلة rate-overlimit
    // بيخلي Baileys يستخدم الكاش بدل ما يطلب بيانات الجروب من السيرفر كل مرة
    cachedGroupMetadata: async (jid) => {
      // بنجيب البيانات من الكاش بتاع البوت
      const cached = global.db.data?.chats?.[jid]?.metadata
      if (cached && cached.participants) return cached
      
      // لو مفيش كاش، بنجيب من conn.chats (اللي simple.js بيعمره)
      if (global.conn?.chats?.[jid]?.metadata) {
        return global.conn.chats[jid].metadata
      }
      
      // لو مفيش أي كاش، نرجع null عشان Baileys يطلبها من السيرفر مرة واحدة بس
      return null
    },
    
    // دعم رسائل الأزرار والقوائم
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage)
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: { deviceListMetadataVersion: 2, deviceListMetadata: {} },
              ...message,
            },
          },
        }
      }
      return message
    },
  }
}

global.conn = makeWASocket(buildSocketOptions(state))
global.store.bind?.(global.conn.ev)
global.conn.isInit = false
global.conns = global.conns || []
global.subBots = global.subBots || {}

// ───────────────────────── تسجيل الدخول (رمز اقتران / QR) ─────────────────────────
// ───────────────────────── تسجيل الدخول (رمز اقتران / QR) ─────────────────────────

function isValidPhone(n) {
  return n.length >= 8 && n.length <= 15 && !n.startsWith('0')
}

async function askPhone(ask) {
  for (let i = 0; i < 3; i++) {
    const n = String(await ask(chalk.blue('📱 اكتب رقمك مع رمز الدولة بدون + (مثال: 201205083639):\n')))
      .replace(/\D/g, '')
      .replace(/^00/, '')
    if (isValidPhone(n)) return n
    log.error('رقم غير صالح. اكتبه بصيغة دولية بدون + أو أصفار في البداية.')
  }
  return null
}

async function requestPairing(number) {
  if (typeof global.conn.requestPairingCode !== 'function') {
    log.error('إصدار Baileys الخاص بك لا يدعم الاقتران عبر الرمز.')
    return false
  }
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await delay(attempt === 1 ? 3000 : 4000)
      let code = await global.conn.requestPairingCode(number)
      code = code?.match(/.{1,4}/g)?.join('-') || code
      console.log(chalk.black(chalk.bgGreen(' 🔑 رمز الاقتران ')), chalk.bold.white(code))
      return true
    } catch (e) {
      log.warn(`فشل طلب الرمز (محاولة ${attempt}/4): ${e?.message || e}`)
    }
  }
  return false
}

async function handleLogin() {
  const c = global.conn
  if (c.authState.creds.registered) {
    console.log(chalk.green(`⚡ ${BOT_NAME} جاهز للعمل...`))
    return
  }

  let latestQr = null
  const captureQr = ({ qr }) => { if (qr) latestQr = qr }
  c.ev.on('connection.update', captureQr)

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const ask = (q) => new Promise((resolve) => rl.question(q, resolve))

  try {
    let method = 'qr'
    let number = String(global.pairing || '').replace(/\D/g, '')
    if (isValidPhone(number)) {
      method = 'code'
    } else {
      method = String(
        await ask(
          chalk.cyanBright(`
  ██████╗ ███╗   ███╗███████╗ ██████╗  █████╗ 
 ██╔═══██╗████╗ ████║██╔════╝██╔════╝ ██╔══██╗
 ██║   ██║██╔████╔██║█████╗  ██║  ███╗███████║
 ██║   ██║██║╚██╔╝██║██╔══╝  ██║   ██║██╔══██║
 ╚██████╔╝██║ ╚═╝ ██║███████╗╚██████╔╝██║  ██║
  ╚═════╝ ╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝
`) + chalk.yellowBright(`
  ╭──────────────────────────────────────────╮
  │    👑 المطورين : 𓆩𝑴𝒐𝒂𝒛𓆪 & 𓆩𝑨𝒍𝒊𓆪    │
  ╰──────────────────────────────────────────╯

  ╭────────( ${BOT_NAME} )────────╮
  │   🔐 كيف تحب تسجيل دخولك؟   │
  ╰──────────────────────────────╯

  🍺 اكتب *qr*   لمسح رمز الاستجابة السريعة.
  🍻 أو اكتب *code* لإدخال رمز مكوّن من 8 أرقام.

> `)
        )
      ).toLowerCase().trim()
      if (method === 'code') number = await askPhone(ask)
    }

    if (method === 'code' && number) {
      const ok = await requestPairing(number)
      if (!ok) log.error('تعذّر الحصول على رمز الاقتران. أعد التشغيل أو استخدم QR.')
    } else {
      global.loginMode = 'qr'
      console.log(chalk.yellow('⏳ جاري إنشاء رمز QR، امسحه بتطبيق واتساب...'))
      if (latestQr) qrcode.generate(latestQr, { small: true })
    }
  } finally {
    rl.close()
    c.ev.off('connection.update', captureQr)
  }
}

await handleLogin()

// ───────────────────────── مهام دورية ─────────────────────────
function clearTmp() {
  const dir = join(__dirname, './tmp')
  try {
    for (const file of readdirSync(dir)) {
      const full = join(dir, file)
      try {
        const stats = statSync(full)
        if (stats.isFile() && Date.now() - stats.mtimeMs >= 1000 * 60 * 3) unlinkSync(full)
      } catch { /* تجاهل */ }
    }
  } catch { /* المجلد غير موجود */ }
}

if (!global.opts['test']) {
  setInterval(saveDatabase, 30 * 1000)
}
setInterval(() => {
  if (global.stopped === 'close' || !global.conn?.user) return
  clearTmp()
}, 3 * 60 * 1000)

async function shutdown(signal) {
  log.warn(`تم استلام ${signal}، جاري حفظ البيانات...`)
  await saveDatabase()
  process.exit(0)
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('uncaughtException', console.error)
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason))

// ───────────────────────── حظر المكالمات ─────────────────────────
const handledCalls = new Set()

function isOwnerNumber(...jids) {
  const owners = (global.owner || []).map((o) => String(Array.isArray(o) ? o[0] : o).replace(/[^0-9]/g, '')).filter(Boolean)
  return jids.filter(Boolean).some((j) => owners.includes(String(j).split('@')[0].split(':')[0].replace(/[^0-9]/g, '')))
}

async function handleCalls(c, calls) {
  try {
    const settings = global.db?.data?.settings?.[c.user?.jid] || {}
    if (settings.anticall === false) return
    for (const call of calls || []) {
      if (!['offer', 'ringing'].includes(call.status) || call.isGroup || handledCalls.has(call.id)) continue
      handledCalls.add(call.id)
      if (handledCalls.size > 200) handledCalls.delete(handledCalls.values().next().value)
      if (isOwnerNumber(call.from, call.callerPn)) continue
      await c.rejectCall(call.id, call.from).catch(console.error)
      await c.sendMessage(call.from, { text: '📵 *المكالمات غير مسموحة*..\nأنا بوت ولا أرد على الاتصالات، راسلني نصياً.' }).catch(() => {})
      log.info(`تم رفض مكالمة من ${call.from}`)
    }
  } catch (e) {
    console.error(e)
  }
}

// ───────────────────────── ربط المعالجات ─────────────────────────
let handlerModule = await import('./handler.js')
global.handler = handlerModule

const HANDLER_EVENTS = [
  ['messages.upsert', 'handler'],
  ['group-participants.update', 'participantsUpdate'],
  ['groups.update', 'groupsUpdate'],
  ['message.delete', 'onDelete'],
  ['call', 'onCall'],
]

function detachHandlers(c) {
  for (const [event, prop] of HANDLER_EVENTS) {
    if (c[prop]) c.ev.off(event, c[prop])
  }
}

function attachHandlers(c) {
  detachHandlers(c)
  c.handler = handlerModule.handler?.bind(c)
  c.participantsUpdate = handlerModule.participantsUpdate?.bind(c)
  c.groupsUpdate = handlerModule.groupsUpdate?.bind(c)
  c.onDelete = handlerModule.deleteUpdate?.bind(c)
  c.onCall = (calls) => handleCalls(c, calls)
  for (const [event, prop] of HANDLER_EVENTS) {
    if (c[prop]) c.ev.on(event, c[prop])
  }
}

// ───────────────────────── البوتات الفرعية ─────────────────────────
function removeSub(name, sub) {
  try { detachHandlers(sub) } catch { /* تجاهل */ }
  try { sub.ev.removeAllListeners() } catch { /* تجاهل */ }
  try { sub.ws?.close() } catch { /* تجاهل */ }
  if (global.subBots[name] === sub) delete global.subBots[name]
  global.conns = global.conns.filter((x) => x !== sub)
}

async function startSubBot(botPath, attempt = 0) {
  const name = path.basename(botPath)
  log.info(`جاري تشغيل البوت الفرعي: ${name}`)
  try {
    const { state: subState, saveCreds: saveSub } = await useMultiFileAuthState(botPath)
    const sub = makeWASocket(buildSocketOptions(subState))
    sub.isInit = false
    global.subBots[name] = sub
    global.store.bind?.(sub.ev)
    sub.ev.on('creds.update', saveSub)

    sub.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection === 'open') {
        attempt = 0
        if (!global.conns.includes(sub)) global.conns.push(sub)
        log.ok(`تم اتصال البوت الفرعي: ${name} (${sub.user?.jid || ''})`)
      } else if (connection === 'close') {
        const reason = statusOf(lastDisconnect)
        removeSub(name, sub)
        const fatal = [DisconnectReason.loggedOut, DisconnectReason.connectionReplaced, DisconnectReason.badSession, 403]
        if (fatal.includes(reason)) {
          log.error(`البوت الفرعي ${name} توقف نهائياً (السبب: ${reason}).`)
          return
        }
        if (attempt >= 8) {
          log.error(`البوت الفرعي ${name}: تجاوز الحد الأقصى لمحاولات الاتصال.`)
          return
        }
        const wait = Math.min(60000, 3000 * 2 ** attempt)
        log.warn(`انقطع البوت الفرعي ${name} (السبب: ${reason ?? 'غير معروف'}). إعادة المحاولة بعد ${wait / 1000} ث`)
        setTimeout(() => startSubBot(botPath, attempt + 1), wait)
      }
    })

    attachHandlers(sub)
  } catch (e) {
    log.error(`خطأ أثناء تشغيل البوت الفرعي ${name}:`, e)
  }
}

let subBotsRestored = false
async function restoreSubBots() {
  const dir = join(__dirname, './JadiBots')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
    log.info(`تم إنشاء المجلد: ${dir}`)
    return
  }
  for (const entry of readdirSync(dir)) {
    const botPath = join(dir, entry)
    try {
      if (!statSync(botPath).isDirectory()) continue
      if (!existsSync(join(botPath, 'creds.json'))) continue
      if (global.subBots[entry]) continue
      await startSubBot(botPath)
    } catch (e) {
      log.error(`تعذّر قراءة البوت الفرعي ${entry}:`, e)
    }
  }
}

// ───────────────────────── تحديث الاتصال وإعادة المحاولة ─────────────────────────
let reconnecting = false
let reconnectAttempts = 0

async function scheduleReconnect(why, immediate = false) {
  if (reconnecting) return
  reconnecting = true
  try {
    if (reconnectAttempts >= 10) {
      log.error('فشلت 10 محاولات اتصال متتالية. سيتم إنهاء العملية لإعادة تشغيلها.')
      await saveDatabase()
      process.exit(1)
    }
    const wait = immediate ? 500 : Math.min(30000, 2000 * 2 ** Math.min(reconnectAttempts, 4))
    reconnectAttempts++
    log.warn(`${why} — إعادة المحاولة بعد ${wait / 1000} ث (محاولة ${reconnectAttempts})`)
    await delay(wait)
    await global.reloadHandler(true)
  } catch (e) {
    console.error(e)
  } finally {
    reconnecting = false
  }
}

async function connectionUpdate(update) {
  const c = this
  const { connection, lastDisconnect, isNewLogin, qr, receivedPendingNotifications } = update
  global.stopped = connection
  if (isNewLogin) c.isInit = true

  if (qr && global.loginMode === 'qr') {
    console.log(chalk.yellow('📲 امسح الرمز التالي بتطبيق واتساب:'))
    qrcode.generate(qr, { small: true })
  }
  if (connection === 'connecting') log.info(`${BOT_NAME} — جاري الاتصال...`)
  if (receivedPendingNotifications) log.info('بانتظار الرسائل الجديدة...')
  if (global.db.data == null) await global.loadDatabase()

  if (connection === 'open') {
    reconnectAttempts = 0
    global.timestamp.connect = new Date()
    log.ok(`${BOT_NAME} متصل الآن ${c.user?.jid ? '(' + c.user.jid + ')' : ''}`)
    // نمنع رسائل الترحيب الجماعية فور أول تسجيل دخول
    setTimeout(() => { c.isInit = false }, 30 * 1000)
    if (!subBotsRestored) {
      subBotsRestored = true
      log.info('🚀 جاري تجهيز النظام وربط البوتات الفرعية...')
      await restoreSubBots()
    }
  }

  if (connection === 'close') {
    const reason = statusOf(lastDisconnect)
    switch (reason) {
      case DisconnectReason.badSession:
        log.error(`جلسة غير صحيحة، احذف مجلد ${global.authFile} وامسح الرمز مرة أخرى.`)
        break
      case DisconnectReason.loggedOut:
        log.error(`تم تسجيل الخروج، احذف مجلد ${global.authFile} وسجّل الدخول من جديد.`)
        break
      case DisconnectReason.connectionReplaced:
        log.error('تم استبدال الاتصال بجلسة أخرى. أغلق الجلسة الأخرى ثم أعد التشغيل.')
        break
      case 403:
        log.error('تم رفض الاتصال (403): قد يكون الحساب مقيّداً أو محظوراً.')
        break
      case 405:
        // 405 يحدث عادةً عند فشل الاقتران؛ لا نحذف جلسة مسجّلة بالفعل
        if (!c.authState?.creds?.registered && existsSync(`./${global.authFile}/creds.json`)) {
          unlinkSync(`./${global.authFile}/creds.json`)
        }
        log.error('🔄 تم رفض الاتصال (405). جاري إعادة التشغيل...\nإذا ظهرت أخطاء، أعد التشغيل باستخدام: npm start')
        process.send?.('reset')
        break
      case DisconnectReason.restartRequired:
        await scheduleReconnect('مطلوب إعادة تشغيل الاتصال', true)
        break
      case DisconnectReason.connectionClosed:
      case DisconnectReason.connectionLost:
      case DisconnectReason.timedOut:
        await scheduleReconnect('انقطع الاتصال أو أُغلق')
        break
      default:
        await scheduleReconnect(`انقطاع غير معروف: ${reason ?? ''}`)
        break
    }
  }
}

function bindCore(c) {
  if (c.__coreBound) return
  c.connectionUpdate = connectionUpdate.bind(c)
  c.credsUpdate = saveCreds
  c.ev.on('connection.update', c.connectionUpdate)
  c.ev.on('creds.update', c.credsUpdate)
  c.__coreBound = true
}

global.reloadHandler = async function (restartConn) {
  try {
    const mod = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
    if (mod && Object.keys(mod).length) {
      handlerModule = mod
      global.handler = mod
    }
  } catch (e) {
    console.error(e)
  }

  if (restartConn) {
    const oldChats = global.conn.chats
    try { global.conn.ws.close() } catch { /* تجاهل */ }
    global.conn.ev.removeAllListeners()
    global.conn = makeWASocket(buildSocketOptions(state), { chats: oldChats })
    global.store.bind?.(global.conn.ev)
    global.conn.isInit = false
  }

  const c = global.conn
  bindCore(c)
  attachHandlers(c)
  // تحديث معالجات البوتات الفرعية مع كل إعادة تحميل
  for (const sub of Object.values(global.subBots)) attachHandlers(sub)
  return true
}

// ───────────────────────── البلجنز ─────────────────────────
const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}
mkdirSync(pluginFolder, { recursive: true })

async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename))
      const module = await import(file)
      global.plugins[filename] = module.default || module
    } catch (e) {
      log.error(`فشل تحميل البلجن ${filename}:`, e?.message || e)
      delete global.plugins[filename]
    }
  }
}
await filesInit()
log.ok(`تم تحميل ${Object.keys(global.plugins).length} بلجن`)

global.reload = async (_ev, filename) => {
  if (!filename || !pluginFilter(filename)) return
  const dir = global.__filename(join(pluginFolder, filename), true)
  if (filename in global.plugins) {
    if (existsSync(dir)) log.info(`✅ تم تحديث البلجن - '${filename}'`)
    else {
      log.warn(`🗑️ تم حذف البلجن - '${filename}'`)
      return delete global.plugins[filename]
    }
  } else {
    if (!existsSync(dir)) return
    log.info(`✨ بلجن جديد - '${filename}'`)
  }

  const err = syntaxerror(readFileSync(dir), filename, {
    sourceType: 'module',
    allowAwaitOutsideFunction: true,
  })
  if (err) log.error(`خطأ في الصياغة أثناء تحميل '${filename}':\n${format(err)}`)
  else {
    try {
      const module = await import(`${global.__filename(dir)}?update=${Date.now()}`)
      global.plugins[filename] = module.default || module
    } catch (e) {
      log.error(`خطأ أثناء استدعاء البلجن '${filename}':\n${format(e)}`)
    } finally {
      global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
    }
  }
}
Object.freeze(global.reload)

watch(pluginFolder, global.reload)
await global.reloadHandler()

// ───────────────────────── فحص الأدوات المطلوبة ─────────────────────────
function probe(cmd, args = [], okWhen = (code) => code !== 127) {
  return new Promise((resolve) => {
    let done = false
    const finish = (v) => { if (!done) { done = true; resolve(v) } }
    try {
      const p = spawn(cmd, args, { stdio: 'ignore' })
      const timer = setTimeout(() => { try { p.kill() } catch { /* تجاهل */ } finish(false) }, 8000)
      p.on('close', (code) => { clearTimeout(timer); finish(okWhen(code)) })
      p.on('error', () => { clearTimeout(timer); finish(false) })
    } catch {
      finish(false)
    }
  })
}

async function quickTest() {
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = await Promise.all([
    probe('ffmpeg'),
    probe('ffprobe'),
    probe('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-'], (code) => code === 0),
    probe('convert'),
    probe('magick'),
    probe('gm'),
    probe('find', ['--version']),
  ])
  const s = (global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find })
  Object.freeze(global.support)

  if (!s.ffmpeg) log.warn('ثبّت ffmpeg أولاً حتى تتمكن من إرسال الفيديو.')
  if (s.ffmpeg && !s.ffmpegWebp) log.warn('الملصقات المتحركة قد لا تعمل بدون libwebp في ffmpeg.')
  if (!s.convert && !s.magick && !s.gm) log.warn('ميزة الملصقات قد لا تعمل بدون imagemagick (pkg install imagemagick).')
}

quickTest()
  .then(() => log.info('☑️ اكتمل الفحص السريع — ملف الجلسة: creds.json'))
  .catch(console.error)