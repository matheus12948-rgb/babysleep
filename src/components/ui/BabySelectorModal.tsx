import React from 'react';
import { Modal } from './Modal';
import { Baby, Plus, Check } from 'lucide-react';
import { useBaby } from '@/features/baby/BabyContext';

interface BabySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewBaby: () => void;
}

export const BabySelectorModal: React.FC<BabySelectorModalProps> = ({
  isOpen,
  onClose,
  onAddNewBaby,
}) => {
  const { babies, activeBaby, selectBaby } = useBaby();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecionar Perfil do Bebê">
      <div className="space-y-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Cada bebê possui sua própria rotina, registros de sono e estatísticas isoladas.
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {babies.map(b => {
            const isSelected = activeBaby?.id === b.id;

            return (
              <button
                key={b.id}
                onClick={() => {
                  selectBaby(b.id);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <Baby size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{b.name}</h3>
                    <p className="text-[11px] opacity-75">Nascimento: {b.birthDate}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check size={14} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            onClose();
            onAddNewBaby();
          }}
          className="w-full py-3 px-4 rounded-2xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 font-bold text-xs flex items-center justify-center gap-2 transition"
        >
          <Plus size={16} /> Cadastrar Outro Bebê
        </button>
      </div>
    </Modal>
  );
};
