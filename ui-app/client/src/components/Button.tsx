import React from 'react';
import { ButtonProps } from '../constants';

export const Button: React.FC<ButtonProps & React.HTMLAttributes<HTMLButtonElement>> = ({children}) => {
    return <button>{children}</button>
}