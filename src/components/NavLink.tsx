import { Link, LinkProps, useResolvedPath, useMatch } from 'react-router-dom';
import { ReactNode } from 'react';

interface NavLinkProps extends LinkProps {
  children: ReactNode;
  activeClassName?: string;
  end?: boolean;
}

export function NavLink({ 
  children, 
  to, 
  className = '', 
  activeClassName = '', 
  end = false,
  ...props 
}: NavLinkProps) {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end });

  const combinedClassName = match 
    ? `${className} ${activeClassName}`.trim()
    : className;

  return (
    <Link to={to} className={combinedClassName} {...props}>
      {children}
    </Link>
  );
}
