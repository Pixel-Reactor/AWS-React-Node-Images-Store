
## About this project

This is a simple project to show how to implement a AWS s3 file storage, and manage how to get files, upload or delete them.
Please note that this project is just a simple example an does not manage any user autentication or multiple user managment (soon there will be other projects for that).

## Front End

The front end is based on React, Vite and TailWind CSS , with a file handler and server api calls.


## Back End

The backend is a Node and Express server wich will hanlde AWS commands and store file data on a MySQL database.

### API 
#### GET  /all post 
get all images stored in the database and provide a temporary link to be able to show them in the front

#### POST  /uploads
will retrieve the image sent
- add a random id to store in the AWS bucket
- upload in the bucket
- store the details and title provided to the database 

#### DELETE  /delete/:id
This call will delete from both AWS and database the image and details

Database sql create schema is available on the server/db_schema/aws_store.sql

### PLEASE NOTE!

An AWS account and bucket creation is required before lanching this project.

You can check the official documentation here : 

https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html


