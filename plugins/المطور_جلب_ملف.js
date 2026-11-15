import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    // تحديد مسار مجلد الإضافات (plugins)
    const directoryPath = path.join(process.cwd(), 'plugins')
    
    try {
        // قراءة الملفات التي تنتهي بـ .js فقط
        const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.js'))
        
        if (files.length === 0) return m.reply('*❌ مجلد الـ plugins فارغ!*')

        let fileList = `*┃ 📂┊❝ مـلفات أوامـر غـوجـو ❞┊📂┃*\n\n`
        fileList += `*⎔ ───━ •﹝💎﹞• ━─── ⎔*\n`
        fileList += `*│ 📁 الـمـسار: /plugins*\n`
        fileList += `*│ 📄 إجمالي الـملفات: ${files.length}*\n`
        fileList += `*⎔ ───━ •﹝💎﹞• ━─── ⎔*\n\n`
        
        // ترتيب الملفات أبجدياً
        files.sort().forEach((file, i) => {
            fileList += `*${i + 1} -* ${file}\n`
        })

        fileList += `\n*⎔ ───━ •﹝💎﹞• ━─── ⎔*\n`
        fileList += `*💡 استخدم (جلب-ملف [الاسم]) لرؤية الكود.*`

        await m.reply(fileList)

    } catch (e) {
        m.reply('*❌ فشل الوصول لمجلد plugins أو أنه غير موجود.*')
    }
}

handler.help = ['ملفات-الاوامر']
handler.tags = ['owner']
handler.command = /^(الملفات|ملفات|الاسكريبتات|files)$/i
handler.rowner = true // للمطور الأساسي فقط

export default handler