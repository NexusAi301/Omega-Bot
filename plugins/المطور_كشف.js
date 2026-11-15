import { exec } from 'child_process'

let handler = async (m, { text, usedPrefix, command }) => {
    // التأكد من رقم المطور (حسب طلبك السابق)
    const developerNumber = '201205083639@s.whatsapp.net'
    if (m.sender !== developerNumber) {
        return m.reply('*❌ هذا الأمر شديد الحساسية ومخصص للمطور الأساسي فقط.*')
    }

    if (!text) return m.reply(`*⚠️ يـرجى كـتابة ما تـريد الـبحث عـنه*\n*مـثال:* ${usedPrefix + command} 201205083639\n*أو:* ${usedPrefix + command} https://chat.whatsapp.com`)

    await m.reply(`*🔍 جاري الـبحث عـن [ ${text} ] في جـميع الـملفات...*`)

    // الأمر يستخدم grep للبحث العميق مع إظهار رقم السطر واسم الملف
    // يتجاهل مجلد node_modules و .git لتسريع البحث
    const searchCmd = `grep -rIlw "${text}" . --exclude-dir={node_modules,.git,session} || grep -rIn "${text}" . --exclude-dir={node_modules,.git,session} | head -n 20`

    exec(searchCmd, async (err, stdout, stderr) => {
        if (err && !stdout) {
            return m.reply(`*❌ لم يتم العثور على أي نتائج لـ [ ${text} ]*`)
        }

        if (stdout) {
            let result = `*┃ 🔎┊❝ نـتـائـج الـبـحث ❞┊🔎┃*\n\n`
            result += '```' + stdout.trim() + '```\n\n'
            result += `*💡 تم إظهار أول 20 نتيجة فقط لتجنب الرسائل الطويلة.*`
            
            await m.reply(result)
        } else {
            m.reply(`*❌ لم يتم العثور على تطابق.*`)
        }
    })
}

handler.help = ['بحث-شامل']
handler.tags = ['owner']
handler.command = /^(بحث|كشف|search|find)$/i

export default handler