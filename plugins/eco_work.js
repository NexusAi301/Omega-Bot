// القسم: الاقتصاد
// Category ID: eco_
// اسم الملف: eco_work.js
// الوظيفة: كسب المال من العمل.

// أضف كود الأمر هنا.
const handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  if (!user.registered) return m.reply('❌ لازم تسجل الأول.')

  const now = new Date()
  const lastWork = user.lastWork || 0
  const cooldown = 60 * 60 * 1000 // ساعة

  if (now - lastWork < cooldown) {
    const remaining = cooldown - (now - lastWork)
    const minutes = Math.floor(remaining / (1000 * 60))
    return m.reply(`⏳ أنت متعب! استرح قليلاً قبل العمل مرة أخرى.\n⏰ متبقي: ${minutes} دقيقة.`)
  }

  const jobs = [
    'مبرمج', 'طبيب', 'مهندس', 'نجار', 'سائق', 'مزارع', 
    'معلم', 'طباخ', 'رسام', 'تاجر', 'حارس أمن', 'ميكانيكي'
  ]
  const job = jobs[Math.floor(Math.random() * jobs.length)]
  const reward = Math.floor(Math.random() * 300) + 100 // من 100 إلى 400

  user.money = (user.money || 0) + reward
  user.lastWork = now.getTime()

  const canalId = global.idcanal || global.canal
  const canalName = global.namecanal || 'قناة البوت'
  const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
  const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

  await conn.sendMessage(m.chat, {
    text: `💼 *عملت كـ ${job} اليوم!*\n\n💵 حصلت على: *${reward.toLocaleString()} ${global.moneda || 'ج.م'}*\n💳 رصيدك الآن: *${user.money.toLocaleString()} ${global.moneda || 'ج.م'}*\n\n🤖 ${botName} | 👨‍💻 ${devName}`,
    contextInfo: {
      isForwarded: true, forwardingScore: 1,
      forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
    }
  }, { quoted: m })
}
handler.command = ['عمل', 'work']
handler.tags = ['economy']
handler.register = true
export default handler