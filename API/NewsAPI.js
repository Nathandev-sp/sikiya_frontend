//API Key: "e968158d1d7246348a734345debb3238"

import axios from "axios";

export default axios.create({
    baseURL: "https://newsapi.org/v2",
    headers: {
        Authorization: 'Bearer e968158d1d7246348a734345debb3238'
    }
});

