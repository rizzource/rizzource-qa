import { useNavigate } from 'react-router-dom';

export const useNavigateWithScroll = () => {
  const navigate = useNavigate();

  const navigateWithScroll = (path, options = {}) => {
    navigate(path, options);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return navigateWithScroll;
};