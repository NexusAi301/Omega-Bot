const handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
  if (!who) return m.reply('⚠️ اعمل منشن للشخص اللي عايز تسرقه أو رد على رسالته.')
  if (who === m.sender) return m.reply('❌ مش هتسرق نفسك!')

  const sender = global.db.data.users[m.sender]
  const target = global.db.data.users[who]

  if (!target || (target.money || 0) < 500) return m.reply('❌ الشخص ده مفلس أو مش عنده حساب.')

  const now = new Date()
  const lastRob = sender.lastRob || 0
  const cooldown = 30 * 60 * 1000

  if (now - lastRob < cooldown) {
    const remaining = cooldown - (now - lastRob)
    const minutes = Math.floor(remaining / (1000 * 60))
    return m.reply(`⏳ الشرطة بتبصلك! استنى ${minutes} دقيقة.`)
  }

  // حساب قوة السارق والضحية بناءً على الأدوات
  const senderInv = sender.inventory || {}
  const targetInv = target.inventory || {}

  let attackerPower = 0
  if (senderInv['سيف'] > 0) attackerPower += 0.25

  let defenderPower = 0
  if (targetInv['درع'] > 0) defenderPower += 0.3
  if (targetInv['كلب'] > 0) defenderPower += 0.2

  // المعادلة النهائية: نسبة نجاح = 60% + قوة السارق - قوة الضحية
  let successRate = 0.6 + attackerPower - defenderPower
  successRate = Math.max(0.05, Math.min(0.95, successRate)) // بنخليها بين 5% و 95%

  const success = Math.random() < successRate
  sender.lastRob = now.getTime()

  if (success) {
    const amount = Math.floor(Math.random() * 300) + 100
    const stolen = Math.min(amount, target.money)
    target.money -= stolen
    sender.money = (sender.money || 0) + stolen
    m.reply(`🦹‍♂️ *نجحت السرقة!*\n\n💵 سرقت من @${who.split('@')[0]}: *${stolen.toLocaleString()} ${global.moneda || 'ج.م'}*${attackerPower > 0 ? '\n🗡️ استخدمت السيف لزيادة فرصك!' : ''}`, null, { mentions: [who] })
  } else {
    const penalty = Math.floor(Math.random() * 200) + 100
    const actualPenalty = Math.min(penalty, sender.money || 0)
    sender.money -= actualPenalty
    m.reply(`🚓 *فشلت السرقة وتم القبض عليك!*\n\n💸 غرامة: *${actualPenalty.toLocaleString()} ${global.moneda || 'ج.م'}*${defenderPower > 0 ? '\n🛡️ الضحية كان عنده حماية فاشلة!' : ''}`, null, { mentions: [who] })
  }
}
handler.command = ['سرقة', 'rob']
handler.tags = ['economy']
handler.register = true
export default handler