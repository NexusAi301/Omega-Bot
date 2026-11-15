const handler = async (m, { conn, text, isAdmin, isBotAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')
  if (!isAdmin && !isOwner) return m.reply('❌ هذا الأمر للمشرفين فقط.')
  if (!isBotAdmin) return m.reply('⚠️ لازم أكون مشرف.')
  if (!text) return m.reply('⚠️ اكتب رقم الشخص.')

  const number = text.replace(/[^0-9]/g, '')
  if (number.length < 10) return m.reply('❌ رقم غير صالح.')

  try {
    const code = await conn.groupInviteCode(m.chat)
    const link = `https://chat.whatsapp.com/${code}`
    
    await conn.sendMessage(number + '@s.whatsapp.net', { 
      text: `👋 مرحباً! تمت دعوتك للانضمام إلى الجروب:\n${link}` 
    })
    
    m.reply('✅ تم إرسال الدعوة للشخص في الخاص.')
  } catch (e) {
    m.reply('❌ حدث خطأ أثناء إرسال الدعوة (قد يكون الرقم لا يستقبل رسائل من الغرباء).')
  }
}
handler.command = ['دعوة', 'invite']
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler