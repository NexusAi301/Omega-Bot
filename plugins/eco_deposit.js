// القسم: الاقتصاد
// Category ID: eco_
// اسم الملف: eco_deposit.js
// الوظيفة: إيداع المال في البنك.

// أضف كود الأمر هنا.
const handler = async (m, { conn, args, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]
  if (!args[0]) return m.reply(`⚠️ الصيغة: *${usedPrefix + command} المبلغ*\nأو اكتب *all* عشان تودع كل فلوسك.`)

  let amount = args[0].toLowerCase() === 'all' ? (user.money || 0) : parseInt(args[0].replace(/[^0-9]/g, ''))
  if (isNaN(amount) || amount <= 0) return m.reply('❌ مبلغ غير صالح.')
  if ((user.money || 0) < amount) return m.reply('❌ رصيدك في المحفظة لا يكفي.')

  user.money -= amount
  user.bank = (user.bank || 0) + amount

  m.reply(`🏦 *تم الإيداع بنجاح!*\n\n💵 أودعت: *${amount.toLocaleString()} ${global.moneda || 'ج.م'}*\n🏦 رصيد البنك: *${user.bank.toLocaleString()} ${global.moneda || 'ج.م'}*`)
}
handler.command = ['ايداع', 'deposit', 'dep']
handler.tags = ['economy']
handler.register = true
export default handler