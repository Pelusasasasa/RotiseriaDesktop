import axios from 'axios';

const seccionApi = axios.create({
        baseURL: 'http://192.168.3.102:3000/rotiseria/'
});

export default seccionApi;