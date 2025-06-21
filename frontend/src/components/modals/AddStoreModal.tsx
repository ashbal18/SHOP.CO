"use client";
import { AiOutlineClose, AiOutlineCheck } from "react-icons/ai";
import { FaStoreAlt } from "react-icons/fa";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  newStore: { name: string; address: string; latitude: number; longitude: number };
  setNewStore: (value: { name: string; address: string; latitude: number; longitude: number }) => void;
};

export default function AddStoreModal({ isOpen, onClose, onSave, newStore, setNewStore }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition">
          <AiOutlineClose size={24} />
        </button>
        <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
          <FaStoreAlt />Tambah Toko
        </h2>
        <input type="text" placeholder="Nama Toko" value={newStore.name} onChange={e => setNewStore({ ...newStore, name: e.target.value })} className="w-full border border-gray-300 p-3 rounded mb-3" />
        <input type="text" placeholder="Alamat" value={newStore.address} onChange={e => setNewStore({ ...newStore, address: e.target.value })} className="w-full border border-gray-300 p-3 rounded mb-3" />
        <div className="flex gap-4 mb-5">
          <input type="number" placeholder="Latitude" value={newStore.latitude || ""} onChange={e => setNewStore({ ...newStore, latitude: parseFloat(e.target.value) || 0 })} className="flex-1 border border-gray-300 p-3 rounded" step="any" />
          <input type="number" placeholder="Longitude" value={newStore.longitude || ""} onChange={e => setNewStore({ ...newStore, longitude: parseFloat(e.target.value) || 0 })} className="flex-1 border border-gray-300 p-3 rounded" step="any" />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded bg-gray-300 hover:bg-gray-400 transition">Batal</button>
          <button onClick={onSave} className="px-5 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2">Simpan <AiOutlineCheck /></button>
        </div>
      </div>
    </div>
  );
}
