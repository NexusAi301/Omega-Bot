import { exec } from 'child_process'
import fs from 'fs'

let handler = async (m, { conn }) => {
    // التحقق من رقم المطور المحدد
    const developerNumber = '201205083639@s.whatsapp.net'
    if (m.sender !== developerNumber) {
        return m.reply('*❌ عذراً، هذا الأمر مخصص للمطور الأساسي فقط للوصول لملفات النظام.*')
    }

    await m.reply('*⏳ جاري ضغط مجلد البوت وإعداد النسخة الاحتياطية...*')

    const zipName = 'GojoBot_Backup.zip'
    
    // استخدام أمر النظام لضغط الملفات وتجاهل مجلد node_modules لأنه كبير جداً ولا داعي لنسخه
    exec(`zip -r ${zipName} . -x "node_modules/*" "session/*" ".git/*"`, async (err, stdout, stderr) => {
        if (err) {
            return m.reply(`*❌ حدث خطأ أثناء الضغط:*\n${err.message}`)
        }

        try {
            // إرسال الملف المضغوط
            await conn.sendMessage(m.chat, { 
                document: fs.readFileSync(`./${zipName}`), 
                mimetype: 'application/zip', 
                fileName: zipName,
                caption: `*✅ تم تجهيز نسخة البوت بنجاح!*\n\n*📦 الملف:* ${zipName}\n*🛡️ المطور:* 𝗚𝕠𝕛𝕠`
            }, { quoted: m })

            // مسح الملف من التيرمكس بعد الإرسال لتوفير المساحة
            fs.unlinkSync(`./${zipName}`)
        } catch (e) {
            m.reply('*❌ فشل إرسال الملف، تأكد من تثبيت حزمة zip في التيرمكس.*')
        }
    })
}

handler.help = ['backup']
handler.tags = ['owner']
handler.command = /^(نسخ-البوت|نسخه-احتياطية|backup)$/i

export default handler