import { NavLink } from 'react-router-dom';
import logoImage from '../../assets/Logo.webp';

export const Logo = ({ onClick }) => {
  return (
    <NavLink 
      to="/" 
      onClick={onClick}
      className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1"
    >
      <img src={logoImage} alt="Khaleeji Tour" className="h-10 w-auto object-contain" />
    </NavLink>
  );
};
