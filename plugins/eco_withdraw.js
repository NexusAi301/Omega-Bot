// القسم: الاقتصاد
// Category ID: eco_
// اسم الملف: eco_withdraw.js
// الوظيفة: سحب المال من البنك.

// أضف كود الأمر هنا.
const handler = async (m, { conn, args, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]
  if (!args[0]) return m.reply(`⚠️ الصيغة: *${usedPrefix + command} المبلغ*\nأو اكتب *all* عشان تسحب كل فلوسك.`)

  let amount = args[0].toLowerCase() === 'all' ? (user.bank || 0) : parseInt(args[0].replace(/[^0-9]/g, ''))
  if (isNaN(amount) || amount <= 0) return m.reply('❌ مبلغ غير صالح.')
  if ((user.bank || 0) < amount) return m.reply('❌ رصيد البنك لا يكفي.')

  user.bank -= amount
  user.money = (user.money || 0) + amount

  m.reply(`🏦 *تم السحب بنجاح!*\n\n💵 سحبت: *${amount.toLocaleString()} ${global.moneda || 'ج.م'}*\n💳 رصيد المحفظة: *${user.money.toLocaleString()} ${global.moneda || 'ج.م'}*`)
}
handler.command = ['سحب', 'withdraw', 'with']
handler.tags = ['economy']
handler.register = true
export default handler