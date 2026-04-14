"use client";

import { useEffect, useState } from "react";
import { db, storage } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 🔄 LOAD IMAGES
  async function loadImages() {
    const snapshot = await getDocs(collection(db, "gallery"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setImages(data);
  }

  useEffect(() => {
    loadImages();
  }, []);

  // 📤 UPLOAD IMAGE
  async function uploadImage() {
    if (!file) {
      alert("Select an image first");
      return;
    }

    setUploading(true);

    try {
      const storageRef = ref(storage, `gallery/${Date.now()}-${file.name}`);

      await uploadBytes(storageRef, file);

      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "gallery"), {
        imageUrl: url,
        date: new Date().toISOString().split("T")[0],
      });

      setFile(null);
      await loadImages();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    setUploading(false);
  }

  // ❌ DELETE IMAGE
  async function deleteImage(image) {
    if (!confirm("Delete this image?")) return;

    try {
      await deleteObject(ref(storage, image.imageUrl));
      await deleteDoc(doc(db, "gallery", image.id));
      await loadImages();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  // 📂 GROUP BY DATE
  const grouped = images.reduce((acc, img) => {
    const key = img.date || "Unknown";
    acc[key] = acc[key] || [];
    acc[key].push(img);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[#001f4d] p-6 text-white">
      <h1 className="text-3xl font-bold text-center text-[#f5b800]">
        Gallery
      </h1>

      {/* UPLOAD */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button
          onClick={uploadImage}
          className="rounded bg-[#f5b800] px-4 py-2 text-black"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* IMAGES */}
      <div className="mt-10">
        {Object.entries(grouped).map(([date, imgs]) => (
          <div key={date} className="mb-8">
            <h2 className="text-[#f5b800] font-bold mb-3">{date}</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imgs.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.imageUrl}
                    alt="match"
                    className="rounded-lg"
                  />

                  <button
                    onClick={() => deleteImage(img)}
                    className="absolute top-1 right-1 bg-red-600 text-white px-2 text-xs rounded"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {images.length === 0 && (
          <p className="text-center text-gray-400 mt-6">
            No images uploaded yet.
          </p>
        )}
      </div>
    </main>
  );
}