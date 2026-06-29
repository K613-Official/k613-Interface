import { ModalPropsMap, ModalType } from 'src/components/Modals/types';
import { create } from 'zustand';

type ActiveModal = {
  [K in ModalType]: { type: K; props: ModalPropsMap[K] };
}[ModalType];

interface ModalStore {
  activeModal: ActiveModal | null;
  openModal: <T extends ModalType>(type: T, props: ModalPropsMap[T]) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  activeModal: null,
  openModal: (type, props) => set({ activeModal: { type, props } as ActiveModal }),
  closeModal: () => set({ activeModal: null }),
}));
