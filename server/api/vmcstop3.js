import { stopOSC3 } from "../utils/oscmanager";

export default defineEventHandler(() => {
    try {
        stopOSC3() // utils에 있는 함수 호출
        return { success: true, message: "Bridge stopped successfully" };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to stop OSC bridge",
        });
    }
});