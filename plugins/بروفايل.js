const handler = async (m, { conn, usedPrefix, command }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
  
  if (who === conn.user.jid) {
    return m.reply('🤖 ده أنا! أنا البوت اللي بيشتغل عشان أخدمك.')
  }

  const wait = await conn.sendMessage(m.chat, { text: '⏳ جاري جلب البروفايل...' }, { quoted: m })

  try {
    let pp
    try {
      pp = await conn.profilePictureUrl(who, 'image')
    } catch {
      pp = 'https://files.catbox.moe/k9dlno.jpg'
    }

    let status = 'مخفية أو غير متاحة 🔒'
    try {
      const bio = await conn.fetchStatus(who)
      if (bio && bio.status) status = bio.status
    } catch {}

    let accountType = 'عادي 👤'
    try {
      const business = await conn.getBusinessProfile(who)
      if (business) accountType = 'حساب أعمال 💼'
    } catch {}

    const user = global.db.data.users[who]
    const name = user?.name ? user.name : who.split('@')[0]
    const xp = user?.exp ? user.exp : 0
    const mention = `@${who.split('@')[0]}`

    const now = new Date()
    const date = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })

    const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
    const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'
    const canalId = global.idcanal || global.canal || '120363423432465949@newsletter'
    
    let canalName = global.namecanal || 'قناة البوت'
    try {
      if (canalId && conn.newsletterMetadata) {
        const meta = await conn.newsletterMetadata('jid', canalId)
        canalName = meta?.name || canalName
      }
    } catch {}

    const caption = `
╭━━━━━━━━━━━━━━━━━━╮
   👤 *معلومات البروفايل*
╰━━━━━━━━━━━━━━━━━━╯

📛 *الاسم:* ${name}
🔗 *المنشن:* ${mention}
🆔 *الآيدي:* ${who.split('@')[0]}
⚡ *الخبرة (XP):* ${xp}
📝 *الحالة:* ${status}
💼 *نوع الحساب:* ${accountType}
📅 *التاريخ:* ${date}
⏰ *الوقت:* ${time}

╭━━━━━━━━━━━━━━━━━━╮
   🤖 البوت: ${botName}
   👨‍💻 المطور: ${devName}
╰━━━━━━━━━━━━━━━━━━╯
`.trim()

    await conn.sendMessage(m.chat, { delete: wait.key })

    await conn.sendMessage(m.chat, {
      image: { url: pp },
      caption: caption,
      mentions: [who],
      contextInfo: {
        mentionedJid: [who],
        isForwarded: true,
        forwardingScore: 1, // الرقم الصغير ده بيمنع النص المزعج بتاع "مرات عديدة"
        forwardedNewsletterMessageInfo: {
          newsletterJid: canalId,
          serverMessageId: 1,
          newsletterName: canalName
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { delete: wait.key })
    m.reply('❌ حدث خطأ أثناء جلب البروفايل.')
  }
}

handler.command = ['بروفايل', 'profile']
handler.tags = ['tools']
handler.help = ['بروفايل @شخص', 'بروفايل (بالرد على رسالة)']
handler.register = false

export default handler