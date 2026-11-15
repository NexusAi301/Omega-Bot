const handler = async (m, { conn, args, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]

  // سحب البيانات من الكونفيج
  const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
  const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'
  const canalId = global.idcanal || global.canal || '120363423432465949@newsletter'

  if (user.registered) {
    return m.reply(`✅ أنت مسجل بالفعل!\n\n📛 الاسم: *${user.name}*\n🎂 العمر: *${user.age}*`)
  }

  const name = args[0]
  const age = parseInt(args[1])

  if (!name || !age) {
    return m.reply(`🌟 للتسجيل استخدم:\n*${usedPrefix + command} الاسم العمر*\n\nمثال:\n*${usedPrefix + command} علي 18*`)
  }

  if (name.length > 20) return m.reply('❌ الاسم طويل جداً (الحد الأقصى 20 حرف).')
  if (isNaN(age) || age < 10 || age > 80) return m.reply('❌ العمر غير صالح (من 10 إلى 80).')

  user.name = name
  user.age = age
  user.registered = true
  user.regTime = +new Date()

  // جلب صورة البروفايل
  let profilePic
  try {
    profilePic = await conn.profilePictureUrl(m.sender, 'image')
  } catch {
    profilePic = 'https://files.catbox.moe/k9dlno.jpg'
  }

  // محاولة جلب اسم القناة من الآيدي
  let canalName = global.namecanal || 'قناة البوت'
  try {
    if (canalId && conn.newsletterMetadata) {
      const meta = await conn.newsletterMetadata('jid', canalId)
      canalName = meta?.name || canalName
    }
  } catch (e) {
    console.error('فشل جلب اسم القناة:', e?.message || e)
  }

  // الوقت والتاريخ والخبرة
  const now = new Date()
  const date = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
  const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  const xp = user.exp || 0

  const caption = `
╭━━━━━━━━━━━━━━━━━━╮
   ✅ *تم التسجيل بنجاح*
╰━━━━━━━━━━━━━━━━━━╯

👤 *المستخدم:* @${m.sender.split('@')[0]}
📛 *الاسم:* ${name}
🎂 *العمر:* ${age}
⚡ *الخبرة (XP):* ${xp}
⏰ *الوقت:* ${time}
📅 *التاريخ:* ${date}

╭━━━━━━━━━━━━━━━━━━╮
   🤖 البوت: ${botName}
   👨‍💻 المطور: ${devName}
╰━━━━━━━━━━━━━━━━━━╯
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: profilePic },
    caption,
    mentions: [m.sender],
    contextInfo: {
      mentionedJid: [m.sender],
      // هنا السر: شيلنا isForwarded و forwardingScore
      forwardedNewsletterMessageInfo: {
        newsletterJid: canalId,
        serverMessageId: 1,
        newsletterName: canalName
      }
    }
  }, { quoted: m })
}

handler.command = ['تسجيل', 'register']
handler.tags = ['main']
handler.help = ['تسجيل الاسم العمر']
handler.register = false

export default handler