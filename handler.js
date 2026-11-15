// ═══════════════════════════════════════════════════════════════
//  handler.js — معالج الرسائل والأحداث (النسخة المدمجة)
//  دمج: handler.js + handler_1.js
// ═══════════════════════════════════════════════════════════════
import { format } from 'util'
import { fileURLToPath } from 'url'
import path from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import { smsg } from './lib/simple.js'

const opts = global.opts || {}

// ───────────────────────── ثوابت ─────────────────────────
const DEFAULT_AVATAR = 'https://s3.ryzumi.vip/permanent-assets/pp_depresi_1.png'
const WELCOME_BG = 'https://s3.ryzumi.vip/permanent-assets/welcome_1.jpg'
const LEAVE_BG = 'https://s3.ryzumi.vip/permanent-assets/leave_1.jpg'
const GROUP_TTL = 2 * 60 * 1000

const CHAT_BAN_EXEMPT = new Set(['group-unbanchat.js', 'owner-unbanchat.js', 'owner-exec.js', 'owner-exec2.js', 'tool-delete.js'])
const USER_BAN_EXEMPT = new Set(['owner-unbanuser.js'])
const BOT_BAN_EXEMPT = new Set(['owner-unbanbot.js'])

// النصوص الافتراضية (يمكن تخصيصها لكل مجموعة: sWelcome, sBye, ...)
const TXT = {
    welcome: '❖━━━━━━[ أهلاً بك ]━━━━━━❖\n\n👋 مرحباً @user\n🏷️ في مجموعة *@subject*\n\n📝 الوصف:\n@desc',
    bye: '👋 وداعاً @user.. نراك قريباً!',
    promote: '👑 @user أصبح الآن *مشرفاً*!',
    demote: '📉 @user لم يعد *مشرفاً*.',
    desc: '📝 تم تغيير وصف المجموعة إلى:\n@desc',
    subject: '🏷️ تم تغيير اسم المجموعة إلى:\n@subject',
    icon: '🖼️ تم تغيير صورة المجموعة!',
    revoke: '🔗 تم تغيير رابط المجموعة إلى:\n@revoke',
    announceOn: '🔒 تم *إغلاق* المجموعة!\nالآن المشرفون فقط يمكنهم إرسال الرسائل.',
    announceOff: '🔓 تم *فتح* المجموعة!\nالآن يمكن لجميع الأعضاء إرسال الرسائل.',
    restrictOn: '⚙️ تعديل معلومات المجموعة صار لـ *الأدمن فقط*.',
    restrictOff: '⚙️ تعديل معلومات المجموعة صار لـ *جميع الأعضاء*.',
}

// ───────────────────────── قيم قاعدة البيانات الافتراضية ─────────────────────────
const USER_DEFAULTS = {
    exp: 0, limit: 25, premium: false, premiumTime: 0, registered: false, name: '',
    age: -1, regTime: -1, afk: -1, afkReason: '', banned: false, useDocument: false,
    level: 0, bank: 0, role: 'Free user',
}
const CHAT_DEFAULTS = {
    isBanned: false, detect: false, sWelcome: '', sBye: '', sPromote: '', sDemote: '',
    delete: true, antiLink: false, antiToxic: false, viewonce: false, simi: false,
    autoSticker: false, premium: false, premiumTime: false, premnsfw: false,
    nsfw: false, onlyLatinos: false, expired: 0,
}
const SETTINGS_DEFAULTS = { self: false, public: true, autoread: false, restrict: false, anticall: true }

// ───────────────────────── أدوات مساعدة ─────────────────────────
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

/** يستخرج الأرقام فقط من المعرّف (بدون الجهاز :12 وبدون الدومين) */
const idNum = jid => String(jid || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '')

/** تنظيف المعرّف بأي نسخة من simple.js */
function cleanJid(conn, jid) {
    try { if (typeof conn.decodeJid === 'function') return conn.decodeJid(jid) } catch { /* تجاهل */ }
    return String(jid || '').replace(/:\d+@/, '@')
}

/** كل المعرّفات الممكنة للمرسل (رقم حقيقي + LID) */
function getSenderIds(m) {
    const ids = new Set()
    const k = m.key || {}
    const add = v => { const n = idNum(v); if (n) ids.add(n) }
    add(m.sender)
    add(k.senderPn); add(k.participantPn); add(k.participantAlt)
    if (!m.isGroup && !m.fromMe) add(k.remoteJidAlt)
    return ids
}

/** الرقم الحقيقي (PN) للمرسل إن وُجد */
function getRealSenderPn(m) {
    const k = m.key || {}
    const candidates = [k.senderPn, k.participantPn, k.participantAlt, (!m.isGroup && !m.fromMe) ? k.remoteJidAlt : null, m.sender].filter(Boolean)
    return candidates.find(v => String(v).endsWith('@s.whatsapp.net')) || m.sender
}

/** هل أي عنصر في القائمة (owner/mods/prems) يطابق أحد معرّفات المرسل؟ */
function inList(list, ids) {
    if (!Array.isArray(list)) return false
    return list.some(entry => {
        const num = idNum(Array.isArray(entry) ? entry[0] : entry)
        return num && ids.has(num)
    })
}

function ensureDefaults(target, defaults) {
    for (const [key, value] of Object.entries(defaults)) {
        if (typeof value === 'number') {
            if (!isNumber(target[key])) target[key] = value
        } else if (!(key in target)) {
            target[key] = value && typeof value === 'object' ? structuredClone(value) : value
        }
    }
    return target
}

/** إخفاء مفاتيح الـ API من أي نص قبل إرساله */
function maskSecrets(text) {
    for (const key of Object.values(global.APIKeys || {})) {
        if (typeof key === 'string' && key.length > 3) text = text.split(key).join('#HIDDEN#')
    }
    return text
}

function parseMentions(text) {
    return [...String(text || '').matchAll(/@(\d{5,16})/g)].map(v => v[1] + '@s.whatsapp.net')
}

const jidOf = p => (typeof p === 'string' ? p : (p?.phoneNumber || p?.id || p?.jid || ''))

const isSelfMode = conn => !!(opts.self || global.db?.data?.settings?.[conn.user?.jid]?.self)

// ───────────────────────── كاش بيانات المجموعات ─────────────────────────
const groupCache = new Map()

async function getGroupMetadata(conn, chatId, fresh = false) {
    const key = `${conn.user?.jid || ''}|${chatId}`
    if (!fresh) {
        const live = conn.chats?.[chatId]?.metadata
        if (live?.participants) return live
        const hit = groupCache.get(key)
        if (hit && Date.now() - hit.ts < GROUP_TTL) return hit.data
    }
    const data = await conn.groupMetadata(chatId).catch(() => null)
    if (data) {
        groupCache.set(key, { data, ts: Date.now() })
        if (groupCache.size > 500) groupCache.delete(groupCache.keys().next().value)
        return data
    }
    return conn.chats?.[chatId]?.metadata || {}
}

const invalidateGroup = (conn, chatId) => groupCache.delete(`${conn.user?.jid || ''}|${chatId}`)

function findParticipant(participants, ids) {
    return participants.find(p => [p?.id, p?.jid, p?.lid, p?.phoneNumber].map(idNum).some(n => n && ids.has(n))) || null
}

// ───────────────────────── تقارير الأخطاء للمطوّرين ─────────────────────────
const reportedErrors = new Map()

async function reportToDevelopers(conn, dedupeKey, report) {
    const devs = (global.owner || []).filter(o => Array.isArray(o) && o[0] && o[2])
    if (!devs.length) return false
    const now = Date.now()
    if (reportedErrors.has(dedupeKey) && now - reportedErrors.get(dedupeKey) < 60_000) return true
    let sent = false
    for (const [number] of devs) {
        try {
            const jid = `${idNum(number)}@s.whatsapp.net`
            const [data] = (await conn.onWhatsApp(jid)) || []
            if (data?.exists) {
                await conn.sendMessage(data.jid, { text: maskSecrets(report) })
                sent = true
            }
        } catch (e) { console.error(e) }
    }
    if (sent) {
        reportedErrors.set(dedupeKey, now)
        if (reportedErrors.size > 200) reportedErrors.delete(reportedErrors.keys().next().value)
    }
    return sent
}

// ───────────────────────── مهلة بين الأوامر (ضد السبام) ─────────────────────────
const cooldowns = new Map()

function onCooldown(key, ms) {
    const now = Date.now()
    if (now - (cooldowns.get(key) || 0) < ms) return true
    cooldowns.set(key, now)
    if (cooldowns.size > 1000) {
        for (const [k, t] of cooldowns) if (now - t > 60_000) cooldowns.delete(k)
    }
    return false
}

// ───────────────────────── تهيئة قاعدة البيانات ─────────────────────────
function initUser(m, realPn) {
    const users = global.db.data.users
    if (!users[m.sender] || typeof users[m.sender] !== 'object') users[m.sender] = {}
    const user = ensureDefaults(users[m.sender], USER_DEFAULTS)
    if (!user.registered && (!user.name || user.name === 'undefined')) {
        user.name = m.name || m.pushName || idNum(realPn)
    }
    // انتهاء الاشتراك المميز تلقائياً (premiumTime = وقت الانتهاء بالملّي ثانية)
    if (user.premiumTime > 0 && user.premiumTime <= Date.now()) {
        user.premium = false
        user.premiumTime = 0
    }
    return user
}

function initChat(m) {
    const chats = global.db.data.chats
    if (!chats[m.chat] || typeof chats[m.chat] !== 'object') chats[m.chat] = {}
    const chat = chats[m.chat]
    // التوافق مع الحقل القديم bienvenida
    if (!('welcome' in chat)) chat.welcome = 'bienvenida' in chat ? !!chat.bienvenida : true
    return ensureDefaults(chat, CHAT_DEFAULTS)
}

function initSettings(conn) {
    const key = conn.user?.jid
    if (!key) return {}
    const all = global.db.data.settings
    if (!all[key] || typeof all[key] !== 'object') all[key] = {}
    return ensureDefaults(all[key], SETTINGS_DEFAULTS)
}

// ═══════════════════════════════════════════════════════════════
//  معالج الرسائل
// ═══════════════════════════════════════════════════════════════
/**
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['messages.upsert']} chatUpdate
 */
export async function handler(chatUpdate) {
    if (!chatUpdate?.messages?.length) return
    if (global.db.data == null) await global.loadDatabase()
    Promise.resolve(this.pushMessage?.(chatUpdate.messages)).catch(console.error)

    // معالجة كل الرسائل في الدفعة (وليس الأخيرة فقط)
    for (const raw of chatUpdate.messages) {
        try {
            await processMessage(this, chatUpdate, raw)
        } catch (e) {
            console.error(e)
        }
    }
}

async function processMessage(conn, chatUpdate, raw) {
    let m = raw
    try {
        m = smsg(conn, raw) || raw
        if (!m) return
        m.exp = 0
        m.limit = 0
        if (!m.sender || /@(broadcast|newsletter)$/.test(m.sender)) return

        // تجاهل الرسائل القديمة جداً (مثلاً بعد انقطاع طويل) لتجنّب الرد الجماعي المتأخر
        const maxAge = Number(global.maxMessageAge ?? 300)
        if (maxAge > 0) {
            const ts = Number(String(raw.messageTimestamp ?? ''))
            if (ts && Date.now() / 1000 - ts > maxAge) return
        }

        const ids = getSenderIds(m)
        const realPn = getRealSenderPn(m)

        // ── تهيئة بيانات المستخدم والدردشة والإعدادات ──
        let userData, chatData, settings
        try {
            userData = initUser(m, realPn)
            chatData = initChat(m)
            settings = initSettings(conn)
        } catch (e) {
            console.error(e)
        }
        userData ||= {}
        chatData ||= {}
        settings ||= {}

        if (typeof m.text !== 'string') m.text = ''

        // ── الصلاحيات (تدعم الرقم الحقيقي و LID) ──
        const botRefs = [conn.user?.jid, conn.user?.lid, global.conn?.user?.jid, global.conn?.user?.lid]
        const isROwner = inList([...(global.owner || []), ...botRefs], ids)
        const isOwner = isROwner || !!m.fromMe
        const isMods = isOwner || inList(global.mods, ids)
        const isPrems = isROwner || userData.premium === true || userData.premiumTime > Date.now()

        // ── أوضاع التشغيل ──
        if (opts.nyimak) return
        if (opts.pconly && m.chat.endsWith('g.us')) return
        if (opts.gconly && !m.chat.endsWith('g.us')) return
        if (opts.swonly && m.chat !== 'status@broadcast') return
        if ((opts.self || settings.self) && !isOwner) return
        if (settings.public === false && !isOwner) return

        if (m.isBaileys) return
        m.exp += Math.ceil(Math.random() * 10)

        // ── بيانات المجموعة ──
        const groupMetadata = (m.isGroup ? await getGroupMetadata(conn, m.chat) : {}) || {}
        const participants = (m.isGroup ? groupMetadata.participants : []) || []
        const botIds = new Set([conn.user?.jid, conn.user?.lid, conn.user?.id].map(idNum).filter(Boolean))
        const participantData = (m.isGroup ? findParticipant(participants, ids) : {}) || {}
        const botData = (m.isGroup ? findParticipant(participants, botIds) : {}) || {}
        const isRAdmin = participantData.admin === 'superadmin'
        const isAdmin = isRAdmin || participantData.admin === 'admin'
        const isBotAdmin = !!botData.admin

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        const baseExtra = {
            conn, participants, groupMetadata, user: participantData, bot: botData,
            isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems,
            chatUpdate, senderPn: realPn,
        }
        const restrictOn = !!(opts.restrict || settings.restrict)
        const cooldownMs = Number(global.commandCooldown ?? (opts.queque ? 5000 : 1500))

        for (const name in global.plugins) {
            const plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue
            const __filename = path.join(___dirname, name)

            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(conn, m, { chatUpdate, __dirname: ___dirname, __filename })
                } catch (e) {
                    console.error(e)
                    await reportToDevelopers(conn, `all:${name}:${e?.message}`,
                        `*🗂️ البلجن:* ${name} (all)\n*👤 المرسل:* ${m.sender}\n*💬 المحادثة:* ${m.chat}\n\n\`\`\`${format(e)}\`\`\``)
                }
            }

            if (!restrictOn && plugin.tags && plugin.tags.includes('admin')) continue

            const _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            const match = (_prefix instanceof RegExp ?
                [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ?
                    _prefix.map(p => {
                        const re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                        return [re.exec(m.text), re]
                    }) :
                    typeof _prefix === 'string' ?
                        [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                        [[[], new RegExp]]
            ).find(p => p[1])

            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(conn, m, { ...baseExtra, match, __dirname: ___dirname, __filename })) continue
            }

            if (typeof plugin !== 'function') continue

            const usedPrefix = (match[0] || '')[0]
            if (!usedPrefix) continue

            const noPrefix = m.text.replace(usedPrefix, '')
            let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
            args = args || []
            const _args = noPrefix.trim().split` `.slice(1)
            const text = _args.join` `
            command = (command || '').toLowerCase()
            const fail = plugin.fail || global.dfail
            const isAccept = plugin.command instanceof RegExp ?
                plugin.command.test(command) :
                Array.isArray(plugin.command) ?
                    plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === 'string' ?
                        plugin.command === command :
                        false
            if (!isAccept) continue

            // مهلة بين الأوامر للمستخدمين العاديين
            if (!isMods && !isPrems && onCooldown(`${conn.user?.jid}|${m.sender}`, cooldownMs)) break

            m.plugin = name

            // ── الحظر ──
            if (!isROwner) {
                if (chatData.isBanned && !CHAT_BAN_EXEMPT.has(name)) return
                if (userData.banned && !USER_BAN_EXEMPT.has(name)) return
                if (settings.banned && !BOT_BAN_EXEMPT.has(name)) return
            }

            // ── فحص الصلاحيات ──
            if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { fail('owner', m, conn); continue }
            if (plugin.rowner && !isROwner) { fail('rowner', m, conn); continue }
            if (plugin.owner && !isOwner) { fail('owner', m, conn); continue }
            if (plugin.mods && !isMods) { fail('mods', m, conn); continue }
            if (plugin.premium && !isPrems) { fail('premium', m, conn); continue }
            if (plugin.group && !m.isGroup) { fail('group', m, conn); continue }
            else if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, conn); continue }
            else if (plugin.admin && !isAdmin) { fail('admin', m, conn); continue }
            if (plugin.private && m.isGroup) { fail('private', m, conn); continue }
            if (plugin.register == true && userData.registered == false) { fail('unreg', m, conn); continue }

            m.isCommand = true
            const xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
            if (xp > 200) m.reply('😒 حاول أن تكون جاداً قليلاً..')
            else m.exp += xp

            // ── الرصيد (limit) ──
            const requiredLimit = !isPrems ? (plugin.limit === true ? 1 : Number(plugin.limit) || 0) : 0
            if (requiredLimit > 0 && Number(userData.limit || 0) < requiredLimit) {
                await conn.reply(m.chat, `نفدت *حصتك* من الاستخدام!\nعد غداً أو اشترك في Premium.. لا أتعامل بالمجان 😏`, m)
                continue
            }

            // ── المستوى ──
            if (plugin.level > userData.level) {
                await conn.reply(m.chat, `📊 *مستواك لا يكفي*..\n\nتحتاج إلى المستوى *${plugin.level}* لاستخدام هذا الأمر.\nمستواك الحالي: *${userData.level}*`, m)
                continue
            }

            const extra = {
                ...baseExtra, match, usedPrefix, noPrefix, _args, args, command, text,
                __dirname: ___dirname, __filename,
            }

            try {
                await plugin.call(conn, m, extra)
                if (!isPrems) {
                    const cost = plugin.limit === true ? 1 : Number(plugin.limit) || 0
                    m.limit = Number(m.limit) || cost
                }
            } catch (e) {
                m.error = e
                console.error(e)
                if (e) {
                    const errText = maskSecrets(format(e))
                    if (typeof e === 'string') {
                        // رسالة مقصودة من البلجن للمستخدم
                        m.reply(errText)
                    } else {
                        const reported = await reportToDevelopers(conn, `${name}:${e?.message}`,
                            `*🗂️ البلجن:* ${m.plugin}\n*👤 المرسل:* ${m.sender}\n*💬 المحادثة:* ${m.chat}\n*💻 الأمر:* ${usedPrefix}${command} ${args.join(' ')}\n📄 *سجل الخطأ:*\n\n\`\`\`${errText}\`\`\``.trim())
                        m.reply(reported ? '⚠️ حدث خطأ أثناء تنفيذ الأمر، وتم إبلاغ المطور بالتفاصيل.' : errText)
                    }
                }
            } finally {
                if (typeof plugin.after === 'function') {
                    try {
                        await plugin.after.call(conn, m, extra)
                    } catch (e) {
                        console.error(e)
                    }
                }
                if (m.limit) await conn.reply(m.chat, `استهلكت *${+m.limit}* من رصيدك ✿\nلا تبذر كثيراً.. فالمال لا يُجنى بسهولة 😌`, m)
            }
            break
        }
    } catch (e) {
        console.error(e)
    } finally {
        const dbData = global.db.data
        const stats = dbData.stats || (dbData.stats = {})
        if (m) {
            const user = m.sender && dbData.users[m.sender]
            if (user) {
                user.exp += Number(m.exp) || 0
                user.limit -= Number(m.limit) || 0
                if (user.limit < 0) user.limit = 0
            }

            if (m.plugin) {
                const now = Date.now()
                const stat = stats[m.plugin] || { total: 0, success: 0, last: 0, lastSuccess: 0 }
                stat.total = (stat.total || 0) + 1
                stat.last = now
                if (m.error == null) {
                    stat.success = (stat.success || 0) + 1
                    stat.lastSuccess = now
                }
                stats[m.plugin] = stat
            }
        }

        try {
            if (!opts.noprint) {
                const print = await import('./lib/print.js')
                await print.default(m, conn)
            }
        } catch (e) {
            console.error(chalk.red('[print]'), e?.message || e)
        }

        try {
            const st = dbData.settings?.[conn.user?.jid] || {}
            if (m?.key && !m.fromMe && (opts.autoread || st.autoread)) await conn.readMessages([m.key])
        } catch { /* تجاهل */ }
    }
}

// ═══════════════════════════════════════════════════════════════
//  أحداث المجموعات: انضمام / مغادرة / ترقية / تنزيل
// ═══════════════════════════════════════════════════════════════
async function uploadAvatar(buffer, fallback) {
    try {
        const mod = await import('./lib/uploadImage.js')
        const up = mod.uploadPomf || mod.default
        if (typeof up === 'function') return (await up(buffer)) || fallback
    } catch { /* الملف غير موجود أو فشل الرفع */ }
    return fallback
}

/**
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['group-participants.update']} update
 */
export async function participantsUpdate({ id, participants, action, simulate = false }) {
    const conn = this
    if (isSelfMode(conn)) return
    if (conn.isInit && !simulate) return
    if (global.db.data == null) await global.loadDatabase()

    invalidateGroup(conn, id)
    const chat = global.db.data.chats[id] || {}
    const list = (participants || []).map(jidOf).filter(Boolean)
    if (!list.length) return

    switch (action) {
        case 'add':
        case 'remove': {
            if (!(chat.welcome ?? chat.bienvenida)) break
            const groupMetadata = await getGroupMetadata(conn, id, true)
            const gcname = groupMetadata.subject || 'Unknown'
            const gcMem = groupMetadata.participants?.length || 0

            for (const jid of list) {
                if (action === 'add') await delay(1000)
                const userJid = cleanJid(conn, jid)
                const num = idNum(userJid)

                let realAvatar = null
                try { realAvatar = await conn.profilePictureUrl(userJid, 'image') } catch { /* لا توجد صورة */ }

                let username = num
                try {
                    const nm = await Promise.resolve(conn.getName?.(userJid))
                    if (nm && String(nm).trim()) username = String(nm).trim()
                } catch { /* تجاهل */ }

                const template = action === 'add'
                    ? (chat.sWelcome || conn.welcome || TXT.welcome)
                    : (chat.sBye || conn.bye || TXT.bye)
                const text = template
                    .replace(/@subject/g, () => gcname)
                    .replace(/@desc/g, () => groupMetadata.desc || '')
                    .replace(/@user/g, () => '@' + num)

                // صورة ترحيب مولَّدة عبر API إن توفر، وإلا صورة العضو، وإلا نص فقط
                let image = realAvatar
                const api = global.APIs?.ryzumi
                if (api) {
                    let pp = realAvatar || DEFAULT_AVATAR
                    try {
                        const res = await fetch(pp, { signal: AbortSignal.timeout(8000) })
                        const buf = Buffer.from(await res.arrayBuffer())
                        if (buf.length) pp = await uploadAvatar(buf, pp)
                    } catch { /* نكمل بالصورة الأصلية */ }
                    const kind = action === 'add' ? 'welcome' : 'leave'
                    const bg = action === 'add' ? WELCOME_BG : LEAVE_BG
                    image = `${api}/api/image/${kind}?username=${encodeURIComponent(username)}&group=${encodeURIComponent(gcname)}&avatar=${encodeURIComponent(pp)}&bg=${encodeURIComponent(bg)}&member=${gcMem}`
                }

                try {
                    if (image) await conn.sendMessage(id, { image: { url: image }, caption: text, mentions: [userJid] })
                    else await conn.sendMessage(id, { text, mentions: [userJid] })
                } catch {
                    await conn.sendMessage(id, { text, mentions: [userJid] }).catch(console.error)
                }
            }
            break
        }
        case 'promote':
        case 'demote': {
            if (!chat.detect) break
            const template = action === 'promote'
                ? (chat.sPromote || conn.spromote || TXT.promote)
                : (chat.sDemote || conn.sdemote || TXT.demote)
            for (const jid of list) {
                const text = template.replace(/@user/g, () => '@' + idNum(jid))
                await conn.sendMessage(id, { text, mentions: [jid] }).catch(console.error)
            }
            break
        }
    }
}

/**
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['groups.update']} updates
 */
export async function groupsUpdate(updates) {
    const conn = this
    if (isSelfMode(conn)) return
    for (const update of updates || []) {
        const id = update.id
        if (!id) continue
        invalidateGroup(conn, id)
        const chat = global.db.data?.chats?.[id]
        if (!chat?.detect) continue

        const lines = []
        if (update.desc) lines.push((chat.sDesc || conn.sDesc || TXT.desc).replace(/@desc/g, () => update.desc))
        if (update.subject) lines.push((chat.sSubject || conn.sSubject || TXT.subject).replace(/@subject/g, () => update.subject))
        if (update.icon) lines.push((chat.sIcon || conn.sIcon || TXT.icon).replace(/@icon/g, () => update.icon))
        if (update.revoke) lines.push((chat.sRevoke || conn.sRevoke || TXT.revoke).replace(/@revoke/g, () => update.revoke))
        if (update.announce === true) lines.push(chat.sAnnounceOn || conn.sAnnounceOn || TXT.announceOn)
        if (update.announce === false) lines.push(chat.sAnnounceOff || conn.sAnnounceOff || TXT.announceOff)
        if (update.restrict === true) lines.push(chat.sRestrictOn || conn.sRestrictOn || TXT.restrictOn)
        if (update.restrict === false) lines.push(chat.sRestrictOff || conn.sRestrictOff || TXT.restrictOff)
        if (!lines.length) continue

        const text = lines.join('\n\n').trim()
        await conn.sendMessage(id, { text, mentions: parseMentions(text) }).catch(console.error)
    }
}

/** كشف الرسائل المحذوفة (يعمل عند تفعيل antiDelete أو تعطيل الحقل القديم delete) */
export async function deleteUpdate(message) {
    const conn = this
    try {
        const items = Array.isArray(message?.keys) ? message.keys : [message]
        for (const item of items) {
            const { fromMe, id, remoteJid } = item || {}
            if (!id || fromMe) continue

            let loaded = null
            if (typeof conn.loadMessage === 'function') loaded = conn.loadMessage(id)
            if (!loaded && remoteJid && global.store?.loadMessage) loaded = await global.store.loadMessage(remoteJid, id)
            const msg = loaded && typeof conn.serializeM === 'function' ? conn.serializeM(loaded) : loaded
            if (!msg?.chat) continue

            const chat = global.db.data?.chats?.[msg.chat] || {}
            const active = chat.antiDelete === true || chat.delete === false
            if (!active) continue

            const who = idNum(item.participant || msg.sender)
            await conn.reply(msg.chat, `\nتم اكتشاف أن @${who} قام بحذف رسالة.\n\nلا تقلق، لقد قمنا بتوثيقها للأجيال القادمة! 😹`, msg)
            if (typeof conn.copyNForward === 'function') conn.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
        }
    } catch (e) {
        console.error(e)
    }
}

// ═══════════════════════════════════════════════════════════════
//  👑 ردود الرفض (الفخمة المتكبرة)
// ═══════════════════════════════════════════════════════════════
const FAIL_MESSAGES = {
    rowner: '👑 *اسمع يا هذا*..\n\nهذا الأمر خاص بـ *صاحب البوت* فقط!\nلا تحاول مجدداً، فأنت لست في مستواي 😏',
    owner: '🔱 *توقف عن العبث*..\n\nهذا الأمر لا يجرؤ عليه سوى *المالك* و*نوابه*!\nاذهب والعب بعيداً يا صغيري 😌',
    mods: '🛡️ *هممم*..\n\nأنت لست من *المشرفين* المختارين!\nهذه المنطقة محظورة على أمثالك 😏',
    premium: '💎 *يا للأسف*..\n\nهذا الأمر حكرٌ على *النخبة* من مشتركي Premium!\nعد عندما تصبح جديراً بي 😌',
    group: '👥 *غريب أمرك*..\n\nهذا الأمر لا يعمل إلا داخل *المجموعات*!\nهل فقدت طريقك في الخاص؟ 😏',
    private: '🔒 *اخفض صوتك*..\n\nهذا الأمر لا يُنفَّذ إلا في *الخاص*!\nلا تزعج المجموعة بتفاهاتك 😌',
    admin: '⚔️ *اعرف قدرك*..\n\nأنت لست *أدمن* هنا!\nلا تتطاول على من هم أعلى منك مقاماً 😏',
    botAdmin: '🤖 *يا مسكين*..\n\nالبوت نفسه ليس *أدمن*!\nارفع مكانته أولاً ثم تعال نتكلم 😌',
    unreg: '📝 *لحظة*..\n\nأنت لم تسجل نفسك بعد!\nسجّل أولاً ثم ارجع، فنحن لا نتعامل مع المجهولين 😏',
    restrict: '⛔ *مغلق*..\n\nهذه الميزة *معطلة* بأوامر عليا!\nلا تحاول إقناعي، فأنا لا أستمع لأحد 😌',
}

global.dfail = async (type, m, conn) => {
    const msg = FAIL_MESSAGES[type]
    if (!msg) return
    try {
        await conn.reply(m.chat, msg, m)
        await m.react?.('👑')
    } catch (e) {
        console.error(e)
    }
}

// ───────────────────────── إعادة التحميل التلقائي ─────────────────────────
const file = fileURLToPath(import.meta.url)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("🔄 تم تحديث 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})

