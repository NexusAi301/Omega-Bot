let handler = async (m, { conn }) => {
    // إرسال رسالة فارغة أو "تنبيه" يجبر التطبيق على فك التشفير
    await conn.sendMessage(m.chat, { 
        text: '🔄 جـاري إصـلاح تـشفـير الـرسائـل فـي هـذا الـجروب...' 
    }, { quoted: m })

    // إرسال كرت اتصال (VCard) - هذه أقوى طريقة لإجبار الواتساب على مزامنة المفاتيح
    const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:Gojo Bot Fix\n' + 'ORG:Gojo Bot;\n' + 'END:VCARD'
    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: 'Gojo Fixer',
            contacts: [{ vcard }]
        }
    })

    m.reply('✅ تـم إرسـال حُـزمة مـزامـنة الـمفاتيـح. انـتظـر ثـواني وسـتظهـر الـرسائـل بـشكل طـبيعي.')
}

handler.help = ['اصلاح-تشفير']
handler.tags = ['owner']
handler.command = /^(اصلاح-تشفير|fixmsg)$/i
handler.rowner = true

export default handler