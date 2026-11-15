// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_resetwarn.js
// الوظيفة: تصفير تحذيرات عضو.

// أضف كود الأمر هنا.
const handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
  if (!who) return m.reply('⚠️ اعمل منشن للشخص أو رد على رسالته.')

  if (!global.db.data.users[who]) global.db.data.users[who] = {}
  global.db.data.users[who].warn = 0
  m.reply(`✅ تم تصفير تحذيرات @${who.split('@')[0]}.`)
}
handler.command = ['تصفير التحذيرات', 'resetwarn']
handler.group = true
handler.admin = true
export default handler