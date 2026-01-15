import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
/*
const healthcheck = (req, res) => {
    try {
        res.status(200).json(new ApiResponse(200, 'OK', null, true));
    } catch (error) {
        console.error("Error in healthcheck:", error);
    }
}
*/

const healthcheck = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, 'Server is running', null, true));
});

export { healthcheck };