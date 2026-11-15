import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

let handler = async (m, { conn, usedPrefix }) => {
    // تحديد مسار مجلد البلجنات (Plugins)
    const pluginsDir = path.join(process.cwd(), 'plugins')
    
    try {
        // قراءة الملفات من المجلد
        let files = fs.readdirSync(pluginsDir)

        // استخراج البيانات: اسم الملف، تاريخ التعديل، ومفتاح التشغيل (إن وجد)
        let fileList = await Promise.all(files.map(async (file) => {
            const filePath = path.join(pluginsDir, file)
            const stats = fs.statSync(filePath)
            
            let commandKey = 'غير محدد'
            
            // محاولة قراءة مفتاح التشغيل (Command) من داخل الملف برمجياً
            try {
                if (file.endsWith('.js')) {
                    const content = fs.readFileSync(filePath, 'utf8')
                    const match = content.match(/handler\.command\s*=\s*\/(\^|\()([^/|\$)]+)/)
                    if (match) {
                        commandKey = match[2].replace(/[()^]/g, '')
                    }
                }
            } catch (err) {
                commandKey = 'خطأ في القراءة'
            }

            return {
                name: file,
                time: stats.mtimeMs, // للترتيب
                date: stats.mtime.toLocaleString('ar-EG'), // للعرض
                command: commandKey
            }
        }))

        // الترتيب: الأحدث (آخر ملف عدلته) يظهر في البداية
        fileList.sort((a, b) => b.time - a.time)

        let response = `*┃ 📂┊❝ إدارة مـلـفـات الـبـوت ❞┊📂┃*\n`
        response += `*✨ إجمالي الملفات:* ${fileList.length}\n`
        response += `*──────────────────*\n\n`
        
        fileList.forEach((file, i) => {
            response += `*${i + 1}.* \`${file.name}\`\n`
            response += `*🔑 المفتاح:* \`${usedPrefix}${file.command}\`\n`
            response += `*🗓️ التعديل:* ${file.date}\n`
            response += `*──────────────────*\n`
        })

        await m.reply(response.trim())

    } catch (e) {
        console.error(e)
        m.reply('*❌ حدث خطأ أثناء فحص ملفات النظام.*')
    }
}

// إعدادات الوصول والتشغيل
handler.help = ['الملفات']
handler.tags = ['owner']
// مفتاح تشغيل هذا الأمر نفسه
handler.command = /^(البلجنات|الملفات|plugins)$/i

// حماية: المطورين والمالك فقط
handler.owner = true 
handler.rowner = true 

export default handler