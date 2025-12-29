export default defineEventHandler(() => {
    try {
        stopOSC(); // utils에 있는 함수 호출
        return { success: true, message: "Bridge stopped successfully" };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to stop OSC bridge",
        });
    }
});