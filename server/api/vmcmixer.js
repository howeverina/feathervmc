export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    
    initOSC(body)

    return { success: true, message: "OSC Bridge Started/Updated" }
});