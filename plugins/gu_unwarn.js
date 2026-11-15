// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_unwarn.js
// الوظيفة: إزالة تحذير من عضو.

// أضف كود الأمر هنا.
const handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
  if (!who) return m.reply('⚠️ اعمل منشن للشخص أو رد على رسالته.')

  if (!global.db.data.users[who]) global.db.data.users[who] = {}
  const user = global.db.data.users[who]

  if (!user.warn || user.warn === 0) return m.reply('❌ الشخص ليس لديه تحذيرات.')
  
  user.warn -= 1
  m.reply(`✅ تم إزالة تحذير من @${who.split('@')[0]}\nالتحذيرات المتبقية: ${user.warn}/${global.maxwarn || 3}`)
}
handler.command = ['الغاء تحذير', 'unwarn']
handler.group = true
handler.admin = true
export default handler