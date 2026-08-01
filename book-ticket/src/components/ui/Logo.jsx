import { NavLink } from 'react-router-dom';
import logoImage from '../../assets/Logo.webp';
import AppImage from '../common/AppImage';

export const Logo = ({ onClick }) => {
  return (
    <NavLink 
      to="/" 
      onClick={onClick}
      className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1"
    >
      <AppImage src={logoImage} alt="Khaleeji Tour" priority={true} className="h-10 w-auto object-contain" />
    </NavLink>
  );
};
