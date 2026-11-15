import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const currentBotFolder = path.basename(process.cwd())
    const basePath = path.join('/storage/emulated/0/Download', currentBotFolder, 'save')
    
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true })
    }

    // --- [ أمر حفظ ] ---
    if (command === 'حفظ') {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        
        // التحقق من وجود اسم للملف
        if (!text && !m.quoted) return m.reply(`*⚠️ يرجى كتابة اسم للملف أو الرد على شيء لحفظه!*\n*مثال:* ${usedPrefix + command} سكريبت`)
        
        let fileName = text ? text.replace(/\s+/g, '_') : `ملف_${Date.now()}`
        let fullPath = ''

        try {
            if (/image/.test(mime)) {
                fullPath = path.join(basePath, `${fileName}.jpg`)
                let img = await q.download()
                await fs.promises.writeFile(fullPath, img)
            } else if (/audio/.test(mime)) {
                fullPath = path.join(basePath, `${fileName}.m4a`)
                let audio = await q.download()
                await fs.promises.writeFile(fullPath, audio)
            } else if (/video/.test(mime)) {
                fullPath = path.join(basePath, `${fileName}.mp4`)
                let video = await q.download()
                await fs.promises.writeFile(fullPath, video)
            } else if (text || m.quoted?.text) {
                fullPath = path.join(basePath, `${fileName}.js`)
                let txt = text || m.quoted.text
                await fs.promises.writeFile(fullPath, txt)
            } else {
                return m.reply('*⚠️ لم أتعرف على نوع الملف (صورة/صوت/فيديو/نص)!*')
            }

            return m.reply(`*✅ تم الحفظ بنجاح!*\n*📄 الاسم:* ${path.basename(fullPath)}\n*📍 المسار:* Download/${currentBotFolder}/save/`)
        } catch (e) {
            return m.reply(`*❌ خطأ أثناء الحفظ:* ${e.message}`)
        }
    }

    // --- [ أمر هات ] ---
    if (command === 'هات') {
        if (!text) return m.reply(`*⚠️ ما هو اسم الملف الذي تبحث عنه؟*\n*مثال:* ${usedPrefix + command} سكريبت`)
        
        // مصفوفة الصيغ التي يدعمها البوت حسب ترتيب الأهمية
        let extensions = ['.js', '.jpg', '.mp4', '.m4a']
        let targetFile = ''
        let foundExt = ''
        
        // البحث عن الملف بالصيغ المتاحة
        for (let ext of extensions) {
            let p = path.join(basePath, text + ext)
            if (fs.existsSync(p)) {
                targetFile = p
                foundExt = ext
                break
            }
        }

        if (!targetFile) return m.reply(`*❌ لا يوجد ملف باسم [ ${text} ] في خزنة ${currentBotFolder}.*`)

        try {
            if (foundExt === '.jpg') {
                await conn.sendFile(m.chat, targetFile, 'file.jpg', `*تم جلب الصورة ✅*`, m)
            } else if (foundExt === '.m4a') {
                await conn.sendMessage(m.chat, { audio: { url: targetFile }, mimetype: 'audio/mp4', ptt: true }, { quoted: m })
            } else if (foundExt === '.mp4') {
                await conn.sendFile(m.chat, targetFile, 'file.mp4', `*تم جلب الفيديو ✅*`, m)
            } else if (foundExt === '.js') {
                let content = fs.readFileSync(targetFile, 'utf-8')
                await m.reply(content)
            }
        } catch (e) {
            m.reply(`*❌ خطأ أثناء إرسال الملف:* ${e.message}`)
        }
    }
}

handler.help = ['حفظ', 'هات']
handler.tags = ['owner']
handler.command = /^(حفظ|هات)$/i
handler.rowner = true 

export default handler