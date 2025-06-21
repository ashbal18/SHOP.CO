"use client";
import { AiOutlineClose, AiOutlineCheck } from "react-icons/ai";
import { BsPersonPlusFill } from "react-icons/bs";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  newUser: { name: string; email: string };
  setNewUser: (value: { name: string; email: string }) => void;
};

export default function AddUserModal({ isOpen, onClose, onSave, newUser, setNewUser }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition">
          <AiOutlineClose size={24} />
        </button>
        <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
          <BsPersonPlusFill />Tambah Store Admin
        </h2>
        <input type="text" placeholder="Nama lengkap" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full border border-gray-300 p-3 rounded mb-4" />
        <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full border border-gray-300 p-3 rounded mb-6" />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded bg-gray-300 hover:bg-gray-400 transition">Batal</button>
          <button onClick={onSave} className="px-5 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-2">Simpan <AiOutlineCheck /></button>
        </div>
      </div>
    </div>
  );
}
