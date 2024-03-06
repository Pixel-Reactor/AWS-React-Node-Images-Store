import express from 'express';
import fileUpload from 'express-fileupload';
import router from './routes.js' 
import cors from 'cors'
const app = express();

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
   
  }));

app.use(cors({
    origin:'*'
}))

app.use(router);

app.listen(3000);
console.log('server running')