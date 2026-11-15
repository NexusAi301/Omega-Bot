// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_delete.js
// الوظيفة: حذف رسالة في المجموعة إذا كانت صلاحيات واتساب تسمح بذلك.

// أضف كود الأمر هنا.
const handler = async (m, { conn, isAdmin, isBotAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')
  if (!isBotAdmin) return m.reply('⚠️ لازم أكون مشرف عشان أحذف الرسائل.')
  
  if (!m.quoted) return m.reply('⚠️ اعمل ريبلاي على الرسالة اللي عايز تحذفها واكتب الأمر.')

  try {
    await conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
  } catch (e) {
    m.reply('❌ حدث خطأ أثناء حذف الرسالة.')
  }
}
handler.command = ['حذف', 'delete']
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler