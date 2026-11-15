export async function before(m) {
  if (!m.message) return

  let selected =
    m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    m.message?.buttonsResponseMessage?.selectedButtonId ||
    (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
      ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id
      : null)

  if (!selected) return

  m.text = selected
  m.message.conversation = selected

  return !0
}