// القسم: الاقتصاد
// Category ID: eco_
// اسم الملف: eco_daily.js
// الوظيفة: استلام المكافأة اليومية.

// أضف كود الأمر هنا.
const handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  if (!user.registered) return m.reply('❌ لازم تسجل الأول عشان تقدر تستلم اليومي. اكتب *.تسجيل اسمك عمرك*')

  const now = new Date()
  const lastDaily = user.lastDaily || 0
  const cooldown = 24 * 60 * 60 * 1000 // 24 ساعة

  if (now - lastDaily < cooldown) {
    const remaining = cooldown - (now - lastDaily)
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    return m.reply(`⏳ لقد استلمت مكافأتك اليومية بالفعل!\n⏰ متبقي: ${hours} ساعة و ${minutes} دقيقة.`)
  }

  const reward = Math.floor(Math.random() * 500) + 500 // من 500 إلى 1000
  user.money = (user.money || 0) + reward
  user.lastDaily = now.getTime()

  const canalId = global.idcanal || global.canal
  const canalName = global.namecanal || 'قناة البوت'
  const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
  const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

  await conn.sendMessage(m.chat, {
    text: `🎁 *تم استلام المكافأة اليومية بنجاح!*\n\n💰 حصلت على: *${reward.toLocaleString()} ${global.moneda || 'ج.م'}*\n💳 رصيدك الآن: *${user.money.toLocaleString()} ${global.moneda || 'ج.م'}*\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
    contextInfo: {
      isForwarded: true, forwardingScore: 1,
      forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
    }
  }, { quoted: m })
}
handler.command = ['يومي', 'daily']
handler.tags = ['economy']
handler.register = true
export default handler