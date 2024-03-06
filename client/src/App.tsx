import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";

interface post {
  title: string;
  photo: File | null;
}
interface imagesObj {
  aws_filename: string;
  id: string;
  modified_at: Date;
  title: string;
  type: string;
  uploaded_at: Date;
  url: string;
}
function App() {
  const [preview, setPreview] = useState<string | null>(null);
  const [msg, setmsg] = useState("");
  const [allImages, setallImages] = useState<[imagesObj] | null>(null);
  const [post, setpost] = useState<post>({
    title: "",
    photo: null,
  });
  const [DragActive, setDragActive] = useState<boolean>(false);

  //set default backend url in axios getting drom env file
  const axiosInstance = axios.create({
    baseURL:import.meta.env.VITE_BACK_URL
  })
  
  const getAllImages = async () => {
   console.log(import.meta.env.VITE_BACK_URL)
    try {
       const res = await axiosInstance.get("/allpost");
   
    if (res && res.status === 200 ){

     res.data.images.length? setallImages(res.data.images) : setallImages(null);
    }
    } catch (error) {
      console.log('get images error',error)
      setallImages(null)
    }
   
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setpost({ ...post, photo: selectedFile });
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submit");
    if (post.title.length && post.photo) {
      setmsg("");
      const formData = new FormData();
      formData.append("title", post.title);
      formData.append("photo", post.photo);
      console.log(post);
      const res = await axiosInstance.post("/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(res);
      if (res.status === 200){
        setmsg("File uploaded");
        setpost({ ...post, title: "", photo: null });
        setPreview(null);
        getAllImages()
      } else {
        setmsg(res.data.message);
      }
    } else {
      setmsg("Title or file missing...");
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const type = e.dataTransfer.files[0].type.slice(-3);
      console.log(e.dataTransfer.files[0]);

      if (
        type === "png" ||
        type === "jpg" ||
        type === "gif" ||
        type === "peg"
      ) {
        setpost({ ...post, photo: e.dataTransfer.files[0] });
        const objectUrl = URL.createObjectURL(e.dataTransfer.files[0]);
        setPreview(objectUrl);
      }
    }
  };
  useEffect(() => {
  
    getAllImages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const HandleDelete = async (id:string)=>{
    const res = await axiosInstance.delete('/delete/'+ id);
    console.log('delete response',res);
    
    if(res.status === 200){
      setmsg('item successfull deleted')
      getAllImages();
    }
  }  

  const ViewDate = (dateStr:Date)=>{
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() <10 ? '0' + (date.getMonth() +1): date.getMonth() +1;
    const day = date.getDate() <10 ? '0' + date.getDate(): date.getDate();
   
    return `${month}/${day}/${year}`
  }
  return (
    <div className="bg-zinc-900 h-full w-full min-h-screen text-white py-10">
      {msg && (
        <div className="text-xs p-2 py-2.5 shadow-sm shadow-white rounded-md z-50 bg-zinc-50 text-black font-semibold fixed top-5 left-0 right-0 w-full max-w-sm border mx-auto flex items-center justify-between">
          {msg}
          <span
            className="cursor-pointer w-5 h-5 border flex items-center justify-center rounded-md shadow-md"
            onClick={() => setmsg("")}
          >
            X
          </span>
        </div>
      )}
      <form
        className="max-w-lg flex flex-col gap-2 mx-auto"
        onSubmit={handleSubmit}
      >
        <label htmlFor="title">Photo title</label>
        <input
          className="p-1 px-2 rounded-lg  bg-gray-800 border border-zinc-800"
          type="text"
          name="title"
          value={post.title}
          onChange={(e) => setpost({ ...post, title: e.target.value })}
          placeholder="type a name here..."
        />
        {preview ? (
          <div className="w-full max-w-lg mx-auto">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full  mb-4 rounded-lg object-cover"
            />
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
            ${DragActive ? "dark:bg-gray-600" : "dark:bg-gray-800"}
            flex items-center justify-center w-full border-dashed rounded-lg cursor-pointer  transition-all dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600`}
          >
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-10 h-10 mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                onDragEnter={handleDrop}
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        <button className="bg-blue-500 font-semibold border-2 border-blue-800 py-1.5  p-1 rounded-md">
          Upload image
        </button>

        {preview && (
          <button
            onClick={() => {
              setpost({ ...post, photo: null });
              setPreview(null);
            }}
            className="bg-red-600 font-semibold border-2 border-red-800 py-1.5  p-1 rounded-md"
          >
            Cancel
          </button>
        )}
      </form>
      <div className="max-h-[600px] border border-zinc-50/10 rounded-xl shadow-inner w-full max-w-lg mx-auto p-1 mt-5 flex flex-wrap justify-between overflow-auto  gap-y-3">
        {allImages ?
          allImages.map((item:imagesObj) => {
          
          return(
          <div key={item.id} className=" object-cover max-w-sm p-1 border border-zinc-50/10 rounded-lg shadow-lg">
            <img 
            className=" w-[200px] h-[200px] object-cover"
            src={item.url} alt="image stored"  />
           <div className="flex flex-col p-1"> 
           <p>{item.title}</p>
           <p> {ViewDate(item.uploaded_at) }</p>
           </div>
           <button 
           onClick={()=>HandleDelete(item.id)}
           className="w-full bg-red-500 rounded-md p-1 font-semibold">Delete file</button>
            </div>
          )  ;
          }) : ''}
      </div>
    </div>
  );
}

export default App;
