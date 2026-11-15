// القسم: الجروب
// Category ID: gu_
// اسم الملف: gu_poll.js
// الوظيفة: إنشاء استطلاع رأي للمجموعة.

// أضف كود الأمر هنا.
const handler = async (m, { conn, text, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')
  if (!text) return m.reply('⚠️ اكتب السؤال ثم الخيارات مفصولة بفاصلة.\nمثال: *.poll من أفضل لاعب؟ | ميسي | رونالدو*')

  const [question, ...options] = text.split('|').map(v => v.trim())
  if (!question || options.length < 2) return m.reply('⚠️ لازم سؤال وخيارين على الأقل مفصولين بـ |.')

  const poll = {
    name: question,
    values: options,
    selectableCount: 1
  }

  await conn.sendMessage(m.chat, { poll }, { quoted: m })
}
handler.command = ['استطلاع', 'poll']
handler.group = true
handler.admin = true
export default handler