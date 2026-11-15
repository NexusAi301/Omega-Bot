// القسم: الاقتصاد
// Category ID: eco_
// اسم الملف: eco_leaderboard.js
// الوظيفة: عرض قائمة أغنى المستخدمين.

// أضف كود الأمر هنا.
const handler = async (m, { conn }) => {
  const users = Object.entries(global.db.data.users)
    .map(([jid, data]) => ({ jid, ...data }))
    .filter(u => (u.money || 0) + (u.bank || 0) > 0)
    .sort((a, b) => ((b.money || 0) + (b.bank || 0)) - ((a.money || 0) + (a.bank || 0)))
    .slice(0, 10)

  if (users.length === 0) return m.reply('❌ لا يوجد أغنياء في البوت حتى الآن.')

  let text = `🏆 *أغنى 10 أشخاص في البوت:*\n\n`
  users.forEach((u, i) => {
    const total = (u.money || 0) + (u.bank || 0)
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
    text += `${medal} @${u.jid.split('@')[0]} - *${total.toLocaleString()} ${global.moneda || 'ج.م'}*\n`
  })

  const canalId = global.idcanal || global.canal
  const canalName = global.namecanal || 'قناة البوت'
  const botName = global.namebot || '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
  const devName = global.namedev || '𓆩𝑨𝒍𝒊𓆪'

  await conn.sendMessage(m.chat, {
    text: `${text}\n🤖 ${botName} | 👨‍💻 ${devName}`,
    mentions: users.map(u => u.jid),
    contextInfo: {
      mentionedJid: users.map(u => u.jid), isForwarded: true, forwardingScore: 1,
      forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: 1, newsletterName: canalName }
    }
  }, { quoted: m })
}
handler.command = ['توب', 'leaderboard', 'top']
handler.tags = ['economy']
export default handler