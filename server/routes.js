import { Router } from 'express';
import { S3Client, PutObjectCommand, GetObjectCommand,DeleteObjectCommand } from "@aws-sdk/client-s3";
import { extname } from 'path'; // Importa la función 'extname' de la biblioteca 'path'
import { v4 as uuidv4 } from 'uuid';
import { getConnection } from './ConnectionDB.js';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv'
dotenv.config();






const bucket_name = process.env.BUCKET_NAME;
const bucket_region = process.env.BUCKET_REGION;
const access_key = process.env.ACCESS_KEY;
const secret_access_key = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
    credentials: {
        accessKeyId: access_key,
        secretAccessKey: secret_access_key
    },
    region: bucket_region
})

const router = Router();

router.get('/', (req, res) => { res.send({ message: 'recibido!' }) })

router.get('/allpost', async (req, res) => {
    let connection
    try {
        connection = await getConnection();
        const [getAll] = await connection.query(`SELECT * FROM aws_store ORDER BY uploaded_at DESC `);

        if (!getAll.length) {
            res.status(200).send({images:[], message: 'There are no images stored' });
            return
        }
        const Images = await Promise.all(getAll.map(async (image) => {
            const getObjectParams = {
                Bucket: bucket_name,
                Key: image.aws_filename
            }
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            image.url = url
            return image

        }));
        if (Images && Images.length) {
            res.status(200).send({images:Images})
        } else {
            res.status(403).send({ message: 'There are no images stored' })
        }

    } catch (error) {
        console.log(error)
        res.status(403).send({ message: 'something went wrong' })
    } finally {
        if (connection) {
            connection.release();
        }
    }

})

router.delete('/delete/:id',async(req,res)=>{
  
    const id = req.params.id
    let connection
    try {
        connection = await getConnection();
        const [getFileName] = await connection.query(`SELECT aws_filename FROM aws_store WHERE id = ?`,[id]);
              
        if(!getFileName.length){
            return
        }
        const aws_filename = getFileName[0].aws_filename
      
        const params = {
            Bucket : bucket_name,
            Key:aws_filename
        }
        const command = new DeleteObjectCommand(params);
        const s3res =await s3.send(command);
   
        if (s3res.$metadata.httpStatusCode === 204) {
            const [deleteItem]= await connection.query(`DELETE FROM aws_store WHERE id=?`,[id])
            res.status(200).send({message:'successfull deleted'})
        }else{
            res.status(403).send({ message: 'something went wrong' })
        }
    } catch (error) {
        console.log(error);
        res.status(403).send({ message: 'something went wrong' })
    }
    

})
router.post('/uploads', async (req, res) => {
    let connection
    try {
        const buffer = req.files.photo.data;

        const title = req.body.title;

        const extension = extname(req.files.photo.name);

        const uniqueId = uuidv4()
        const name = uniqueId + extension;

        const type = req.files.photo.mimetype;

        const params = {
            Bucket: bucket_name,
            Key: name,
            Body: buffer,
            ContentType: type,
        }

        const command = new PutObjectCommand(params);

        const s3res = await s3.send(command);
    
        if (s3res.$metadata.httpStatusCode === 200) {
            connection = await getConnection();
            const [insertData] = await connection.query(`INSERT INTO aws_store(id,title,type,aws_filename) values(?,?,?,?)`,
                [uniqueId, title, type, name])

            res.status(200).send({ message: 'file uploaded' })
        } else {
            res.status(403).send({ message: 'something went wrong' })
        }
    } catch (error) {
        console.log(error);
        res.status(403).send({ message: 'something went wrong' })
    } finally {
        if (connection) { connection.release() }
    }

})

export default router 