import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*⚠️ يـرجـى كـتـابـة اسـم الـمـلـف لـحـذفـه مـن الـداخل.*\n*مـثـال:* \`${usedPrefix + command} bank.js\``)

    // المجلدات التي سيتم البحث فيها (يمكنك إضافة المزيد)
    const directories = ['./plugins', './lib', './src', './']
    let deleted = false

    for (const dir of directories) {
        const filePath = path.join(process.cwd(), dir, text)

        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath)
                m.reply(`*🗑️ تـم الـعـثـور عـلـى الـمـلـف فـي [ ${dir} ] وحـذفـه بـنـجـاح!*`)
                deleted = true
                break // التوقف بعد أول حذف ناجح
            } catch (e) {
                m.reply(`*❌ خطأ أثناء الحذف من ${dir}:* ${e.message}`)
            }
        }
    }

    if (!deleted) {
        m.reply('*❌ لـم يـتـم الـعـثـور عـلـى هـذا الـمـلـف فـي أي مـجـلـد داخـلـي.*')
    }
}

handler.help = ['حذف_داخلي']
handler.tags = ['owner']
handler.command = /^(حذف_داخلي|fdel|df)$/i
handler.rowner = true 

export default handler