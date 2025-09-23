import { useAppContext } from '../context/AppContext';

export function useModal() {
  const { state, dispatch } = useAppContext();

  const openModal = (modalName) => {
    dispatch({
      type: 'SET_MODAL',
      payload: { modal: modalName, isOpen: true }
    });
  };

  const closeModal = (modalName) => {
    dispatch({
      type: 'SET_MODAL',
      payload: { modal: modalName, isOpen: false }
    });
  };

  const isModalOpen = (modalName) => {
    return state.modals[modalName] || false;
  };

  return { openModal, closeModal, isModalOpen };
}

// Default export
export default useModal;