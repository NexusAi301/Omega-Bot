// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_warns.js
// الوظيفة: عرض تحذيرات عضو.

// أضف كود الأمر هنا.
const handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
  const user = global.db.data.users[who] || {}
  m.reply(`📊 *التحذيرات:* ${user.warn || 0}/${global.maxwarn || 3}\n👤 للمستخدم: @${who.split('@')[0]}`, null, { mentions: [who] })
}
handler.command = ['التحذيرات', 'warns']
handler.group = true
export default handler