// components/EditProfilePicture.tsx
"use client";
import { ChangeEvent } from "react";
import Image from "next/image";

interface EditProfilePictureProps {
  avatarPreview: string | null;
  onAvatarChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const EditProfilePicture: React.FC<EditProfilePictureProps> = ({ avatarPreview, onAvatarChange }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {avatarPreview ? (
        <Image
          src={avatarPreview}
          alt="Foto Profil"
          width={150}
          height={150}
          className="rounded-full object-cover border-4 border-blue-500"
          priority
        />
      ) : (
        <div className="w-36 h-36 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
          No Image
        </div>
      )}
      <div>
        <label className="block mb-1 font-semibold">Foto Profil</label>
        <input type="file" accept="image/*" onChange={onAvatarChange} />
      </div>
    </div>
  );
};

export default EditProfilePicture;
