import { initOSC2 } from "../utils/oscmanager";

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    
    initOSC2(body)

    return { success: true, message: "OSC Bridge Started/Updated" }
});