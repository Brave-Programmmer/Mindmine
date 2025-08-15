import React from "react";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

const NavLink = React.memo(({ href, children, onClick, className = "" }: NavLinkProps) => (
  <a
    href={href}
    onClick={onClick}
    className={`text-rosewood font-medium hover:text-sienna transition-colors duration-200 ${className}`}
  >
    {children}
  </a>
));

export default NavLink;
