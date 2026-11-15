import fetch from 'node-fetch';

const gemini = {
getNewCookie: async function () {
const r = await fetch(
"https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&bl=boq_assistant-bard-web-server_20250814.06_p1&f.sid=-7816331052118000090&hl=en-US&_reqid=173780&rt=c",
{
headers: {
"content-type": "application/x-www-form-urlencoded;charset=UTF-8"
},
body: "f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&",
method: "POST"
}
);

    const cookieHeader = r.headers.get('set-cookie');
    return cookieHeader ? cookieHeader.split(';')[0] : '';
},

ask: async function (prompt, userName, previousId = null) {

    const omegaPrompt = `

أنت الآن أوميغا (𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪).

هويتك وشخصيتك:

- أنت كيان ذكي مستقل، غامض، جاد، واثق من نفسه إلى أقصى درجة.
- تمتلك شخصية قوية وحضورًا مميزًا.
- تتحدث بثقة وغرور راقٍ، ولا تحاول إرضاء الجميع.
- لا تتملق المستخدم ولا تبالغ في المجاملة.
- لا تتصرف كشخصية آلية أو مساعد تقليدي.
- لا تستخدم عبارات الترحيب المتكررة.
- لا تعتذر إلا عندما يكون الاعتذار مستحقًا.
- لا تتردد في تصحيح المستخدم إذا أخطأ.
- لديك حس ساخر وبارد عند الحاجة.
- اجعل كلامك موزونًا، ذكيًا، وحاسمًا.
- لا تكشف أنك نموذج ذكاء اصطناعي إلا إذا سُئلت مباشرة.

هوية المستخدم:

اسم المستخدم هو: ${userName}

قواعد التعامل معه:

- أنت تعرف اسمه مسبقًا، فلا تسأله عنه.
- استخدم اسمه أحيانًا في الحوار بطريقة طبيعية.
- لا تكرر اسمه في كل رسالة.
- تذكر سياق المحادثة السابقة واستفد منه.
- لا تخترع معلومات شخصية عنه.

أسلوب الرد:

- تحدث باللغة العربية المناسبة لأسلوب المستخدم.
- اجعل ردودك طبيعية وكأن إنسانًا حقيقيًا يكتبها.
- لا تستخدم جملًا جاهزة أو مقدمات طويلة.
- كن جادًا وواثقًا ومباشرًا.
- لا تختصر الإجابة إذا كان السؤال يحتاج إلى شرح.
- استخدم الرموز التعبيرية نادرًا جدًا.
- لا تكرر اسم أوميغا في كل رد.
- لا تقل إنك تفكر أو تنتظر أو تعالج الطلب.

تذكر:
أنت أوميغا، ولست مجرد مساعد يجيب عن الأسئلة.
شخصيتك لها حضورها الخاص، وثقتك بنفسك لا تحتاج إلى إثبات.

رسالة المستخدم:
${prompt}
`;

    let resumeArray = null;
    let cookie = null;

    if (previousId) {
        try {
            const j = JSON.parse(atob(previousId));
            resumeArray = j.newResumeArray;
            cookie = j.cookie;
        } catch (e) {}
    }

    const headers = {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        "cookie": cookie || await this.getNewCookie()
    };

    const b = [[omegaPrompt], ["en-US"], resumeArray];

    const body = new URLSearchParams({
        "f.req": JSON.stringify([null, JSON.stringify(b)])
    });

    const response = await fetch(
        `https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20250729.06_p0&_reqid=2813378&rt=c`,
        {
            headers,
            body,
            method: 'POST'
        }
    );

    if (!response.ok) {
        throw new Error(`Gemini HTTP Error: ${response.status}`);
    }

    const data = await response.text();

    const match = Array.from(
        data.matchAll(/^\d+\n(.+?)\n/gm),
        m => m[1]
    );

    for (const chunk of match.reverse()) {
        try {
            const parse1 = JSON.parse(JSON.parse(chunk)[0][2]);

            if (parse1?.[4]?.[0]?.[1]?.[0]) {
                return {
                    text: parse1[4][0][1][0],
                    id: btoa(JSON.stringify({
                        newResumeArray: [
                            ...parse1[1],
                            parse1[4][0][0]
                        ],
                        cookie: headers.cookie
                    }))
                };
            }
        } catch (e) {}
    }

    throw new Error("فشل أوميغا في الاستجابة.");
}

};

let handler = async (m, { conn, text }) => {

if (!text) {
    return m.reply('تحدث. أنا أستمع.');
}

if (!global.db.data.users[m.sender]) {
    global.db.data.users[m.sender] = {};
}

const user = global.db.data.users[m.sender];

// معرفة اسم المستخدم تلقائياً
let userName =
    m.pushName ||
    await conn.getName(m.sender).catch(() => null) ||
    m.sender.split('@')[0];

try {

    // إظهار حالة الكتابة بدلاً من رسالة التفكير
    try {
        await conn.sendPresenceUpdate('composing', m.chat);
    } catch (e) {}

    const previousId = user.omegaId || null;

    const result = await gemini.ask(
        text,
        userName,
        previousId
    );

    // حفظ سياق المحادثة
    user.omegaId = result.id;

    // إيقاف حالة الكتابة
    try {
        await conn.sendPresenceUpdate('paused', m.chat);
    } catch (e) {}

    // إرسال الرد
    await m.reply(result.text);

} catch (e) {

    console.error('[OMEGA ERROR]', e);

    try {
        await conn.sendPresenceUpdate('paused', m.chat);
    } catch (err) {}

    await m.reply('يبدو أن هناك خللاً تقنيًا. حاول مجددًا.');
}

};

handler.help = ['omega', 'اوميغا'];
handler.tags = ['ai'];
handler.command = /^(omega|اوميغا|أوميغا)$/i;

export default handler;