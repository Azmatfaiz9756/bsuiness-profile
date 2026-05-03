import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, X, Check, Loader2, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageUploadCropProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  id?: string;
  aspectRatio?: number;
  circular?: boolean;
  disabled?: boolean;
}

export const ImageUploadCrop: React.FC<ImageUploadCropProps> = ({ 
  value, 
  onChange, 
  folder = 'profiles', 
  id = 'profile-photo',
  aspectRatio = 1,
  circular = true,
  disabled = false
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCropper, setShowCropper] = useState(false);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImage(reader.result as string);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Set canvas size to the cropped size or a max size to save bandwidth
    const MAX_SIZE = 320; // 320px is perfect for profile/avatars and very fast to upload
    let targetWidth = pixelCrop.width;
    let targetHeight = pixelCrop.height;

    if (targetWidth > MAX_SIZE) {
      const ratio = MAX_SIZE / targetWidth;
      targetWidth = MAX_SIZE;
      targetHeight = targetHeight * ratio;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetWidth,
      targetHeight
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.7); // 0.7 quality is sufficient for small screens and much faster
    });
  };

  const handleUpload = async () => {
    if (!image || !croppedAreaPixels) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      if (!croppedBlob) throw new Error('Failed to crop image');

      const fileName = `${id}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      console.log(`Starting upload to ${folder}/${fileName}...`);
      
      // Use uploadBytes for a simpler promise-based approach
      const uploadResult = await uploadBytes(storageRef, croppedBlob);
      console.log("Upload successful, getting download URL...");
      
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      onChange(downloadURL);
      setUploading(false);
      setShowCropper(false);
      setImage(null);
    } catch (error: any) {
      console.error("Upload/Processing error:", error);
      setUploading(false);
      let msg = "Upload failed.";
      if (error.code === 'storage/unauthorized') {
        msg = "Permission denied. Please ensure Firebase Storage is enabled in your console and rules allow writes.";
      } else if (error.message.includes('network')) {
        msg = "Network error. Please check your connection.";
      }
      alert(msg + " (" + (error.code || error.message) + ")");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className={`flex items-center gap-4 ${disabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <div className={`relative w-20 h-20 group bg-slate-100 border border-slate-200 overflow-hidden ${circular ? 'rounded-full' : 'rounded-2xl'}`}>
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Camera size={24} />
            </div>
          )}
          {!disabled && (
            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <UploadCloud size={20} className="text-white" />
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700">Profile Picture</span>
          <span className="text-[10px] text-slate-500 font-medium whitespace-normal md:w-48 leading-relaxed">
            {disabled ? 'Upgrade to unlock image uploads' : 'Upload a clear photo. JPG or PNG. Max 5MB.'}
          </span>
          {!disabled && (
            <label className="mt-2 text-[10px] font-black text-blue-600 uppercase tracking-widest cursor-pointer hover:text-blue-700">
              Choose File
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCropper && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Adjust Your Photo</h3>
                <button onClick={() => setShowCropper(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="relative flex-1 bg-slate-900 min-h-[300px]">
                {image && (
                  <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    cropShape={circular ? 'round' : 'rect'}
                    showGrid={true}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                )}
              </div>

              <div className="p-6 bg-white space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Zoom</span>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e: any) => setZoom(e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowCropper(false)}
                    className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase text-[11px] tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors uppercase text-[11px] tracking-widest flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Check size={16} />
                        Apply & Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
