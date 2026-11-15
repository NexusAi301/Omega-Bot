// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_warn.js
// الوظيفة: إعطاء عضو تحذيرًا وتسجيله.

// أضف كود الأمر هنا.
const handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
  if (!who) return m.reply('⚠️ اعمل منشن للشخص أو رد على رسالته.')

  if (!global.db.data.users[who]) global.db.data.users[who] = {}
  const user = global.db.data.users[who]
  user.warn = (user.warn || 0) + 1

  const maxWarn = global.maxwarn || 3
  if (user.warn >= maxWarn) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
      m.reply(`🚫 تم طرد @${who.split('@')[0]} لتجاوزه الحد الأقصى من التحذيرات (${maxWarn}).`)
    } catch { m.reply('⚠️ وصل للحد الأقصى لكن لم أتمكن من طرده.') }
  } else {
    m.reply(`⚠️ تم تحذير @${who.split('@')[0]}\nالتحذيرات: ${user.warn}/${maxWarn}`)
  }
}
handler.command = ['تحذير', 'warn']
handler.group = true
handler.admin = true
export default handler