// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_pin.js
// الوظيفة: تثبيت رسالة أو إرشاد المشرفين إلى طريقة تثبيتها.

// أضف كود الأمر هنا.
const handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')
  if (!m.quoted) return m.reply('⚠️ اعمل ريبلاي على الرسالة اللي عايز تثبتها.')

  try {
    await conn.sendMessage(m.chat, { pin: m.quoted.vM.key, type: 1, time: 86400 })
    m.reply('📌 تم تثبيت الرسالة لمدة 24 ساعة.')
  } catch (e) {
    m.reply('❌ حدث خطأ أثناء التثبيت.')
  }
}
handler.command = ['تثبيت', 'pin']
handler.group = true
handler.admin = true
export default handler