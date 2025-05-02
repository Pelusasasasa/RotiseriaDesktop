import axios from 'axios';

const seccionApi = axios.create({
        baseURL: 'http://192.168.0.7:3000/rotiseria/'
});

export default seccionApi;